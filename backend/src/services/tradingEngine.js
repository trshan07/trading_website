const db = require('../config/database');
const Account = require('../models/Account');
const Order = require('../models/Order');
const Position = require('../models/Position');
const PriceAlert = require('../models/PriceAlert');
const Transaction = require('../models/Transaction');
const { isMissingColumnError, getMissingColumnName } = require('../utils/dbCompat');
const { createActivityLog } = require('../client/controllers/activityController');
const { createNotification } = require('../client/controllers/notificationController');
const {
    getExecutionPriceForSide,
    getMarkPriceForSide,
    normalizeSymbol,
    getMergedInstrumentConfig,
} = require('./marketDataService');
const marketStreamService = require('./marketStreamService');
const { getCanonicalMarketQuotes, getCanonicalQuote } = require('./marketSnapshotService');
const {
    calculateMarginRequired,
    calculatePipValue,
    calculateProjectedPnl,
    calculateQuantityFromLots,
    calculateMovementValue,
    getInstrumentTradingMeta,
} = require('../utils/calculators');
const {
    calculateNetPositionPnl,
    calculatePositionFees,
    calculatePositionNetState,
} = require('../utils/tradingFees');

const MARGIN_CALL_LEVEL = Number.parseFloat(process.env.MARGIN_CALL_LEVEL ?? '100') || 100;
const STOP_OUT_LEVEL = Number.parseFloat(process.env.STOP_OUT_LEVEL ?? '50') || 50;
const ENGINE_INTERVAL_MS = Number.parseInt(process.env.TRADING_ENGINE_INTERVAL_MS ?? '5000', 10) || 5000;

const parseLeverageValue = (value, fallback = 100) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return value;
    }

    const raw = String(value ?? '').trim();
    if (!raw) {
        return fallback;
    }

    if (raw.includes(':')) {
        const [, rhs] = raw.split(':');
        const parsedRatio = Number.parseFloat(rhs);
        return Number.isFinite(parsedRatio) && parsedRatio > 0 ? parsedRatio : fallback;
    }

    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeSide = (side = '') => {
    const value = String(side).toLowerCase();
    return value === 'sell' ? 'sell' : 'buy';
};

const normalizeOrderType = (type = '', side = 'buy') => {
    const normalizedSide = normalizeSide(side);
    const value = String(type).toLowerCase().trim();

    if (!value || value === 'market') {
        return 'market';
    }

    if (value === 'limit') {
        return normalizedSide === 'buy' ? 'buy_limit' : 'sell_limit';
    }

    if (value === 'stop') {
        return normalizedSide === 'buy' ? 'buy_stop' : 'sell_stop';
    }

    if (['buy_limit', 'sell_limit', 'buy_stop', 'sell_stop'].includes(value)) {
        return value;
    }

    return 'market';
};

const getTriggerKind = (orderType = '') => {
    switch (orderType) {
        case 'buy_limit':
        case 'sell_limit':
            return 'limit';
        case 'buy_stop':
        case 'sell_stop':
            return 'stop';
        default:
            return 'market';
    }
};

const validatePendingEntry = ({ type, side, entryPrice, marketPrice }) => {
    const orderType = normalizeOrderType(type, side);
    const triggerKind = getTriggerKind(orderType);

    if (triggerKind === 'market') {
        return;
    }

    if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
        throw new Error('Trigger price is required for pending orders');
    }

    if (!Number.isFinite(marketPrice) || marketPrice <= 0) {
        throw new Error('Live market price is unavailable for this pending order');
    }

    switch (orderType) {
        case 'buy_limit':
            if (entryPrice > marketPrice) {
                throw new Error('Buy limit trigger must be at or below the current market price');
            }
            break;
        case 'sell_limit':
            if (entryPrice < marketPrice) {
                throw new Error('Sell limit trigger must be at or above the current market price');
            }
            break;
        case 'buy_stop':
            if (entryPrice < marketPrice) {
                throw new Error('Buy stop trigger must be at or above the current market price');
            }
            break;
        case 'sell_stop':
            if (entryPrice > marketPrice) {
                throw new Error('Sell stop trigger must be at or below the current market price');
            }
            break;
        default:
            break;
    }
};

const validateStops = ({ side, entryPrice, takeProfit, stopLoss }) => {
    const normalizedSide = normalizeSide(side);
    const price = Number.parseFloat(entryPrice) || 0;
    const tp = takeProfit == null ? null : Number.parseFloat(takeProfit);
    const sl = stopLoss == null ? null : Number.parseFloat(stopLoss);

    if ((tp !== null && !Number.isFinite(tp)) || (sl !== null && !Number.isFinite(sl))) {
        throw new Error('Invalid take profit or stop loss value');
    }

    if (!price) {
        return;
    }

    if (normalizedSide === 'buy') {
        if (tp !== null && tp <= price) {
            throw new Error('Take profit must be above the entry price for buy orders');
        }
        if (sl !== null && sl >= price) {
            throw new Error('Stop loss must be below the entry price for buy orders');
        }
    } else {
        if (tp !== null && tp >= price) {
            throw new Error('Take profit must be below the entry price for sell orders');
        }
        if (sl !== null && sl <= price) {
            throw new Error('Stop loss must be above the entry price for sell orders');
        }
    }
};

const parseTradeInputs = async (payload = {}) => {
    const side = normalizeSide(payload.side);
    const type = normalizeOrderType(payload.type, side);
    const symbol = normalizeSymbol(payload.symbol || '');
    const leverage = parseLeverageValue(payload.leverage, 100);
    const entryPrice = Number.parseFloat(payload.entryPrice ?? payload.price) || 0;
    const lotsInput = Number.parseFloat(payload.lots);
    const quantityInput = Number.parseFloat(payload.quantity);
    const amountInput = Number.parseFloat(payload.amount);
    const instrumentConfig = await getMergedInstrumentConfig(symbol);
    const category = payload.category || instrumentConfig.category || '';
    const meta = getInstrumentTradingMeta({ symbol, category, instrument: instrumentConfig });
    const notionalPerLot = calculateMarginRequired({
        symbol,
        category,
        instrument: instrumentConfig,
        quantity: meta.contractSize,
        price: entryPrice,
        leverage: 1,
    });
    const derivedLotsFromAmount = Number.isFinite(amountInput) && amountInput > 0 && notionalPerLot > 0
        ? amountInput / notionalPerLot
        : 0;
    const quantity = Number.isFinite(quantityInput) && quantityInput > 0
        ? quantityInput
        : (Number.isFinite(lotsInput) && lotsInput > 0
            ? calculateQuantityFromLots(lotsInput, symbol, category, instrumentConfig)
            : (derivedLotsFromAmount > 0 ? calculateQuantityFromLots(derivedLotsFromAmount, symbol, category, instrumentConfig) : 0));
    const lots = Number.isFinite(lotsInput) && lotsInput > 0
        ? lotsInput
        : (meta.contractSize > 0 ? quantity / meta.contractSize : 0);
    const amount = Number.isFinite(amountInput) && amountInput > 0
        ? amountInput
        : calculateMarginRequired({
            symbol,
            category,
            instrument: instrumentConfig,
            quantity,
            price: entryPrice,
            leverage: 1,
        });
    const takeProfit = payload.takeProfit == null ? null : Number.parseFloat(payload.takeProfit);
    const stopLoss = payload.stopLoss == null ? null : Number.parseFloat(payload.stopLoss);

    if (!symbol || !entryPrice || !amount || !quantity || leverage <= 0) {
        throw new Error('Missing required trade parameters');
    }

    if (lots > 0 && lots < meta.minLot) {
        throw new Error(`Minimum order size is ${meta.minLot} lots`);
    }

    validateStops({ side, entryPrice, takeProfit, stopLoss });

    return {
        symbol,
        category,
        side,
        type,
        entryPrice,
        leverage,
        lots,
        quantity,
        amount,
        takeProfit,
        stopLoss,
        margin: calculateMarginRequired({
            symbol,
            category,
            instrument: instrumentConfig,
            quantity,
            lots,
            price: entryPrice,
            leverage,
        }),
    };
};

const fetchPreferredQuote = async (symbol = '') => {
    const normalized = normalizeSymbol(symbol);
    if (!normalized) {
        return null;
    }

    const streamQuote = marketStreamService.getLatestQuote(normalized);
    if (streamQuote?.price) {
        return streamQuote;
    }

    return getCanonicalQuote(normalized, {
        preferChartAligned: true,
        refresh: true,
    }).catch(() => null);
};

const getMarketExecutionContext = async ({ symbol, side }) => {
    const normalizedSymbol = normalizeSymbol(symbol);
    const instrumentConfig = await getMergedInstrumentConfig(normalizedSymbol);
    const quote = await fetchPreferredQuote(normalizedSymbol);
    const executionPrice = getExecutionPriceForSide(quote || {}, side);
    const markPrice = getMarkPriceForSide(quote || {}, side);

    if (!Number.isFinite(executionPrice) || executionPrice <= 0) {
        throw new Error(`Live market price is unavailable for ${normalizedSymbol}`);
    }

    return {
        symbol: normalizedSymbol,
        instrumentConfig,
        quote,
        executionPrice,
        markPrice: Number.isFinite(markPrice) && markPrice > 0 ? markPrice : executionPrice,
    };
};

const buildTradePreview = async ({ account = null, payload = {}, side = null }) => {
    const normalizedSide = normalizeSide(side || payload.side);
    const requestedType = normalizeOrderType(payload.type, normalizedSide);
    const triggerKind = getTriggerKind(requestedType);
    const marketContext = await getMarketExecutionContext({
        symbol: payload.symbol,
        side: normalizedSide,
    });
    const requestedEntryPrice = Number.parseFloat(payload.entryPrice ?? payload.price);
    const previewEntryPrice = triggerKind === 'market'
        ? marketContext.executionPrice
        : requestedEntryPrice;

    validatePendingEntry({
        type: requestedType,
        side: normalizedSide,
        entryPrice: previewEntryPrice,
        marketPrice: marketContext.executionPrice,
    });

    const trade = await parseTradeInputs({
        ...payload,
        side: normalizedSide,
        type: requestedType,
        entryPrice: previewEntryPrice,
        price: previewEntryPrice,
    });
    const meta = getInstrumentTradingMeta({
        symbol: trade.symbol,
        category: trade.category,
        instrument: marketContext.instrumentConfig,
    });
    const pipValue = calculatePipValue({
        symbol: trade.symbol,
        category: trade.category,
        instrument: marketContext.instrumentConfig,
        quantity: trade.quantity,
        price: marketContext.executionPrice,
    });
    const tpPnl = trade.takeProfit == null ? null : calculateProjectedPnl({
        symbol: trade.symbol,
        category: trade.category,
        instrument: marketContext.instrumentConfig,
        side: trade.side,
        entryPrice: previewEntryPrice,
        exitPrice: trade.takeProfit,
        quantity: trade.quantity,
    });
    const slPnl = trade.stopLoss == null ? null : calculateProjectedPnl({
        symbol: trade.symbol,
        category: trade.category,
        instrument: marketContext.instrumentConfig,
        side: trade.side,
        entryPrice: previewEntryPrice,
        exitPrice: trade.stopLoss,
        quantity: trade.quantity,
    });
    const feeSnapshot = calculatePositionFees({
        symbol: trade.symbol,
        category: trade.category,
        instrument: marketContext.instrumentConfig,
        side: trade.side,
        lots: trade.lots,
        quantity: trade.quantity,
        entryPrice: previewEntryPrice,
        accountType: account?.account_type || 'real',
        openedAt: new Date(),
    });
    const risk = account ? await evaluateAccountRisk(account.id) : null;
    const freeMargin = risk ? risk.risk.freeMargin : (account ? (Number.parseFloat(account.balance) + Number.parseFloat(account.credit)) : null);
    const tradeSide = String(trade.side).toLowerCase();
    const pnlFormula = meta.categoryKey === 'forex'
        ? 'profit = movement * pip_value'
        : 'profit = price_difference * quantity';
    const marginFormula = 'margin = notional / leverage';
    const tpMovement = trade.takeProfit == null ? null : calculateMovementValue({
        symbol: trade.symbol,
        category: trade.category,
        instrument: marketContext.instrumentConfig,
        entryPrice: previewEntryPrice,
        exitPrice: trade.takeProfit,
    });
    const slMovement = trade.stopLoss == null ? null : calculateMovementValue({
        symbol: trade.symbol,
        category: trade.category,
        instrument: marketContext.instrumentConfig,
        entryPrice: previewEntryPrice,
        exitPrice: trade.stopLoss,
    });
    const priceDeltaToTp = trade.takeProfit == null
        ? null
        : (tradeSide === 'sell'
            ? previewEntryPrice - trade.takeProfit
            : trade.takeProfit - previewEntryPrice);
    const priceDeltaToSl = trade.stopLoss == null
        ? null
        : (tradeSide === 'sell'
            ? previewEntryPrice - trade.stopLoss
            : trade.stopLoss - previewEntryPrice);

    return {
        symbol: trade.symbol,
        side: trade.side,
        type: requestedType,
        category: trade.category,
        executionPrice: previewEntryPrice,
        markPrice: marketContext.markPrice,
        bid: Number.parseFloat(marketContext.quote?.bid) || null,
        ask: Number.parseFloat(marketContext.quote?.ask) || null,
        quoteSource: marketContext.quote?.source || null,
        instrumentConfig: marketContext.instrumentConfig,
        lots: trade.lots,
        quantity: trade.quantity,
        amount: trade.amount,
        requiredMargin: trade.margin,
        freeMargin,
        hasEnoughMargin: freeMargin == null ? true : trade.margin <= freeMargin,
        contractSize: meta.contractSize,
        lotStep: meta.lotStep,
        minLot: meta.minLot,
        quantityLabel: meta.quantityLabel,
        pricePrecision: meta.precision,
        movementLabel: meta.movementLabel,
        movementValueLabel: meta.movementValueLabel,
        movementSize: meta.movementSize,
        movementCountPerUnit: calculateMovementValue({
            symbol: trade.symbol,
            category: trade.category,
            instrument: marketContext.instrumentConfig,
            entryPrice: previewEntryPrice,
            exitPrice: previewEntryPrice + meta.movementSize,
        }),
        calculationMode: meta.calculationMode,
        calculationVerified: meta.calculationVerified,
        pipValue,
        projectedCommission: feeSnapshot.commission,
        projectedSwap: feeSnapshot.swap,
        projectedFeeTotal: feeSnapshot.feeTotal,
        takeProfit: trade.takeProfit,
        stopLoss: trade.stopLoss,
        projectedTakeProfitPnl: tpPnl,
        projectedStopLossPnl: slPnl,
        projectedTakeProfitMovement: tpMovement,
        projectedStopLossMovement: slMovement,
        audit: {
            symbol: trade.symbol,
            category: trade.category,
            side: trade.side,
            accountCurrency: 'USD',
            calculationMode: meta.calculationMode,
            calculationVerified: meta.calculationVerified,
            formulas: {
                margin: marginFormula,
                pnl: pnlFormula,
            },
            contract: {
                lots: trade.lots,
                quantity: trade.quantity,
                contractSize: meta.contractSize,
                quantityLabel: meta.quantityLabel,
                lotStep: meta.lotStep,
                minLot: meta.minLot,
                leverage: trade.leverage,
            },
            pricing: {
                executionPrice: previewEntryPrice,
                markPrice: marketContext.markPrice,
                bid: Number.parseFloat(marketContext.quote?.bid) || null,
                ask: Number.parseFloat(marketContext.quote?.ask) || null,
                source: marketContext.quote?.source || null,
                precision: meta.precision,
            },
            movement: {
                label: meta.movementLabel,
                valueLabel: meta.movementValueLabel,
                size: meta.movementSize,
                valuePerMovement: pipValue,
            },
            fees: {
                commission: feeSnapshot.commission,
                swap: feeSnapshot.swap,
                total: feeSnapshot.feeTotal,
                daysHeld: feeSnapshot.daysHeld,
            },
            margin: {
                notional: trade.amount,
                required: trade.margin,
                freeMargin,
                hasEnoughMargin: freeMargin == null ? true : trade.margin <= freeMargin,
            },
            takeProfit: trade.takeProfit == null ? null : {
                targetPrice: trade.takeProfit,
                priceDelta: priceDeltaToTp,
                movement: tpMovement,
                projectedPnl: tpPnl,
            },
            stopLoss: trade.stopLoss == null ? null : {
                targetPrice: trade.stopLoss,
                priceDelta: priceDeltaToSl,
                movement: slMovement,
                projectedPnl: slPnl,
            },
        },
    };
};

const getOrderMargin = (order = {}) => {
    const amount = Number.parseFloat(order.amount) || 0;
    const leverage = parseLeverageValue(order.leverage, 100);
    if (!amount || !leverage) {
        return 0;
    }
    return amount / leverage;
};

const getAccountAvailableFunds = (account = {}) =>
    (Number.parseFloat(account.balance) || 0) + (Number.parseFloat(account.credit) || 0);

const deductMarginFromAccount = async ({ accountId, account, requiredMargin }) => {
    const accountBalance = Number.parseFloat(account.balance) || 0;
    const accountCredit = Number.parseFloat(account.credit) || 0;
    
    // We check against Equity/Free Margin for a more accurate check
    const riskData = await evaluateAccountRisk(accountId);
    const availableToMargin = riskData ? riskData.risk.freeMargin : (accountBalance + accountCredit);

    if (availableToMargin < requiredMargin) {
        throw new Error(`Insufficient free margin ($${requiredMargin.toFixed(2)} required, $${availableToMargin.toFixed(2)} available)`);
    }

    // Margin is NOT deducted from balance. We only verify availability.
    // Balance only changes when trades are closed (Realized P&L).
    return {
        accountBalance,
        accountCredit,
        newBalance: accountBalance,
        newCredit: accountCredit,
    };
};

const creditMarginAndPnlToAccount = async ({ accountId, userId, realizedMargin, pnl }) => {
    const currentAccount = await Account.findById(accountId);
    if (!currentAccount) {
        throw new Error('Account not found while closing position');
    }

    const currentBalance = Number.parseFloat(currentAccount.balance) || 0;
    const currentCredit = Number.parseFloat(currentAccount.credit) || 0;

    // Realized P&L updates balance. Margin is simply unlocked (not credited back as it was never deducted).
    let newBalance = currentBalance;
    let newCredit = currentCredit;

    if (pnl >= 0) {
        newBalance += pnl;
    } else {
        const loss = Math.abs(pnl);
        if (newBalance >= loss) {
            newBalance -= loss;
        } else {
            const remainingLoss = loss - newBalance;
            newBalance = 0;
            newCredit = Math.max(0, newCredit - remainingLoss);
        }
    }

    if (newCredit !== currentCredit) await Account.updateCredit(accountId, newCredit);
    if (newBalance !== currentBalance) await Account.updateBalance(accountId, newBalance);

    return {
        currentBalance,
        currentCredit,
        newBalance,
        newCredit,
    };
};

const createExecutedPosition = async ({
    userId,
    accountId,
    symbol,
    side,
    amount,
    quantity,
    entryPrice,
    leverage,
    takeProfit,
    stopLoss,
    margin,
    orderType = 'market',
    existingOrderId = null,
    instrumentConfig = null,
}) => {
    const accounts = await Account.findByUserId(userId);
    const account = accounts.find((item) => item.id == accountId);
    if (!account) {
        throw new Error('Account not found for this user');
    }

    const funds = await deductMarginFromAccount({
        accountId,
        account,
        requiredMargin: margin,
    });
    const feeSnapshot = calculatePositionFees({
        symbol,
        instrument: instrumentConfig || {},
        side,
        quantity,
        entryPrice,
        accountType: account.account_type || 'real',
        openedAt: new Date(),
    });

    let order = null;
    if (existingOrderId) {
        order = await Order.updateExecution(existingOrderId, {
            entryPrice,
            amount,
            quantity,
            status: 'executed',
        });
    } else {
        order = await Order.create(userId, {
            accountId,
            symbol,
            side,
            type: orderType,
            amount,
            quantity,
            entryPrice,
            leverage,
            takeProfit,
            stopLoss,
            status: 'executed',
        });
    }

    const position = await Position.create(userId, {
        accountId,
        symbol,
        side,
        amount,
        quantity,
        entryPrice,
        grossPnl: 0,
        commission: feeSnapshot.commission,
        swap: feeSnapshot.swap,
        pnl: feeSnapshot.commission + feeSnapshot.swap,
        margin,
        leverage,
        takeProfit,
        stopLoss,
    });

    await Transaction.create(userId, {
        account_id: accountId,
        type: 'Trade',
        amount: 0, // No balance deduction for margin
        balance_before: funds.accountBalance,
        balance_after: funds.newBalance,
        reference_id: order?.id || position.id,
        description: `Allocated margin for ${side.toUpperCase()} ${symbol}`,
    });

    await createActivityLog(userId, 'EXECUTION', `Opened ${side.toUpperCase()} ${symbol} Position`);
    await createNotification(userId, 'success', `Order Executed: ${side.toUpperCase()} ${symbol} at ${entryPrice}`);

    return { order, position };
};

const placeTrade = async ({ userId, accountId, payload }) => {
    const normalizedSide = normalizeSide(payload.side);
    const requestedType = normalizeOrderType(payload.type, normalizedSide);

    const accounts = await Account.findByUserId(userId);
    const account = accounts.find((item) => item.id == accountId);
    if (!account) {
        throw new Error('Account not found for this user');
    }

    const preview = await buildTradePreview({
        account,
        payload: {
            ...payload,
            side: normalizedSide,
            type: requestedType,
        },
        side: normalizedSide,
    });

    if (!preview.hasEnoughMargin) {
        throw new Error('Insufficient free margin for this order');
    }

    if (getTriggerKind(requestedType) !== 'market') {
        const pendingOrder = await Order.create(userId, {
            accountId,
            symbol: preview.symbol,
            side: preview.side,
            type: requestedType,
            amount: preview.amount,
            quantity: preview.quantity,
            entryPrice: preview.executionPrice,
            leverage: parseLeverageValue(payload.leverage, 100),
            takeProfit: preview.takeProfit,
            stopLoss: preview.stopLoss,
            status: 'pending',
        });

        await createActivityLog(userId, 'EXECUTION', `Placed ${requestedType.replace('_', ' ').toUpperCase()} ${preview.symbol} pending order`);
        await createNotification(userId, 'success', `Pending order placed: ${preview.side.toUpperCase()} ${preview.symbol} at ${preview.executionPrice}`);

        return {
            mode: 'pending',
            order: pendingOrder,
            requiredMargin: preview.requiredMargin,
            preview,
        };
    }

    const result = await createExecutedPosition({
        userId,
        accountId,
        symbol: preview.symbol,
        side: preview.side,
        amount: preview.amount,
        quantity: preview.quantity,
        entryPrice: preview.executionPrice,
        leverage: parseLeverageValue(payload.leverage, 100),
        takeProfit: preview.takeProfit,
        stopLoss: preview.stopLoss,
        margin: preview.requiredMargin,
        orderType: 'market',
        instrumentConfig: preview.instrumentConfig,
    });

    return {
        mode: 'market',
        ...result,
        requiredMargin: preview.requiredMargin,
        preview,
    };
};

const shouldTriggerOrder = (order = {}, quote = {}) => {
    const orderType = normalizeOrderType(order.type, order.side);
    const entryPrice = Number.parseFloat(order.entry_price ?? order.entryPrice) || 0;
    const marketPrice = Number.parseFloat(quote.price) || 0;

    if (!entryPrice || !marketPrice) {
        return false;
    }

    switch (orderType) {
        case 'buy_limit':
            return marketPrice <= entryPrice;
        case 'sell_limit':
            return marketPrice >= entryPrice;
        case 'buy_stop':
            return marketPrice >= entryPrice;
        case 'sell_stop':
            return marketPrice <= entryPrice;
        default:
            return false;
    }
};

const listPendingOrders = async ({ accountId = null, userId = null } = {}) => {
    const values = [];
    const clauses = [`status = 'pending'`];

    if (accountId != null) {
        values.push(accountId);
        clauses.push(`account_id = $${values.length}`);
    }

    if (userId != null) {
        values.push(userId);
        clauses.push(`user_id = $${values.length}`);
    }

    const query = `
        SELECT *
        FROM orders
        WHERE ${clauses.join(' AND ')}
        ORDER BY created_at ASC
    `;

    try {
        const { rows } = await db.query(query, values);
        return rows;
    } catch (error) {
        if (isMissingColumnError(error) && getMissingColumnName(error) === 'created_at') {
            const legacyQuery = `
                SELECT *
                FROM orders
                WHERE ${clauses.join(' AND ')}
                ORDER BY id ASC
            `;
            const { rows } = await db.query(legacyQuery, values);
            return rows;
        }
        throw error;
    }
};

const listOpenPositions = async () => {
    const query = `
        SELECT *
        FROM positions
        WHERE status = 'open'
        ORDER BY created_at ASC
    `;

    try {
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        if (isMissingColumnError(error) && getMissingColumnName(error) === 'created_at') {
            const { rows } = await db.query(`
                SELECT *
                FROM positions
                WHERE status = 'open'
                ORDER BY id ASC
            `);
            return rows;
        }
        throw error;
    }
};

const shouldAutoClosePosition = ({ position = {}, markPrice = 0 }) => {
    const normalizedSide = normalizeSide(position.side);
    const takeProfit = position.take_profit != null ? Number.parseFloat(position.take_profit) : null;
    const stopLoss = position.stop_loss != null ? Number.parseFloat(position.stop_loss) : null;
    const price = Number.parseFloat(markPrice) || 0;

    if (!price) {
        return null;
    }

    if (normalizedSide === 'buy') {
        if (takeProfit !== null && price >= takeProfit) {
            return { reason: 'take_profit', exitPrice: takeProfit };
        }
        if (stopLoss !== null && price <= stopLoss) {
            return { reason: 'stop_loss', exitPrice: stopLoss };
        }
        return null;
    }

    if (takeProfit !== null && price <= takeProfit) {
        return { reason: 'take_profit', exitPrice: takeProfit };
    }
    if (stopLoss !== null && price >= stopLoss) {
        return { reason: 'stop_loss', exitPrice: stopLoss };
    }

    return null;
};

const syncOpenPositionsWithMarket = async () => {
    const positions = await listOpenPositions();
    if (positions.length === 0) {
        return {
            updatedPositions: [],
            autoClosed: [],
            accountIds: [],
        };
    }

    const symbols = Array.from(new Set(positions.map((position) => position.symbol).filter(Boolean)));
    const quotes = await getCanonicalMarketQuotes(symbols, {
        preferChartAligned: true,
        refresh: true,
    });
    const accountIds = Array.from(new Set(positions.map((position) => position.account_id).filter(Boolean)));
    const accountPairs = await Promise.all(
        accountIds.map(async (accountId) => [accountId, await Account.findById(accountId)])
    );
    const accountById = new Map(accountPairs);
    const instrumentConfigs = await Promise.all(
        symbols.map(async (symbol) => [symbol, await getMergedInstrumentConfig(symbol)])
    );
    const instrumentConfigBySymbol = new Map(instrumentConfigs);

    const priceUpdates = [];
    const autoClosed = [];

    for (const position of positions) {
        const instrumentConfig = instrumentConfigBySymbol.get(position.symbol) || {};
        const account = accountById.get(position.account_id) || {};
        const quote = quotes[normalizeSymbol(position.symbol)] || quotes[position.symbol] || {};
        const markPrice = getMarkPriceForSide(quote, position.side)
            || Number.parseFloat(position.current_price)
            || Number.parseFloat(position.entry_price)
            || 0;
        const netState = calculatePositionNetState({
            symbol: position.symbol,
            category: instrumentConfig.category || position.category || '',
            instrument: instrumentConfig,
            side: position.side,
            entryPrice: Number.parseFloat(position.entry_price) || 0,
            exitPrice: markPrice,
            quantity: Number.parseFloat(position.quantity) || 0,
            lots: Number.parseFloat(position.quantity) && instrumentConfig.contractSize
                ? (Number.parseFloat(position.quantity) / instrumentConfig.contractSize)
                : null,
            accountType: account.account_type || 'real',
            openedAt: position.created_at || position.opened_at,
            commission: position.commission,
            swap: position.swap,
        });

        priceUpdates.push({
            id: position.id,
            current_price: markPrice,
            grossPnl: netState.grossPnl,
            commission: netState.commission,
            swap: netState.swap,
            pnl: netState.pnl,
        });

        const autoClose = shouldAutoClosePosition({ position, markPrice });
        if (!autoClose) {
            continue;
        }

        try {
            const result = await closePosition({
                positionId: position.id,
                userId: position.user_id,
                exitPrice: autoClose.exitPrice,
            });

            autoClosed.push({
                positionId: position.id,
                accountId: position.account_id,
                userId: position.user_id,
                symbol: position.symbol,
                reason: autoClose.reason,
                pnl: result.pnl,
            });
        } catch (error) {
            console.error(`[TradingEngine] Failed to auto-close ${position.symbol} position ${position.id}:`, error.message);
        }
    }

    const updatedPositions = await Position.updatePrices(priceUpdates).catch((error) => {
        console.error('[TradingEngine] Failed to sync open position prices:', error.message);
        return [];
    });

    return {
        updatedPositions,
        autoClosed,
        accountIds: Array.from(new Set([
            ...positions.map((position) => position.account_id),
            ...autoClosed.map((item) => item.accountId),
        ].filter(Boolean))),
    };
};

const processPendingOrders = async ({ accountId = null, userId = null, symbols = [] } = {}) => {
    const pendingOrders = await listPendingOrders({ accountId, userId });
    if (pendingOrders.length === 0) {
        return [];
    }

    const requestedSymbols = symbols.length > 0
        ? symbols.map(normalizeSymbol)
        : pendingOrders.map((order) => order.symbol);
    const uniqueSymbols = Array.from(new Set(requestedSymbols));
    const quotes = await getCanonicalMarketQuotes(uniqueSymbols, {
        preferChartAligned: true,
        refresh: true,
    });
    const executed = [];

    for (const order of pendingOrders) {
        const quote = quotes[normalizeSymbol(order.symbol)] || quotes[order.symbol];
        if (!quote || !shouldTriggerOrder(order, quote)) {
            continue;
        }

        const executionPrice = getExecutionPriceForSide(quote, order.side);
        const amount = Number.parseFloat(order.amount) || 0;
        const quantity = Number.parseFloat(order.quantity) || 0;
        const leverage = Number.parseFloat(order.leverage) || 100;
        const margin = getOrderMargin(order);
        const takeProfit = order.take_profit != null ? Number.parseFloat(order.take_profit) : null;
        const stopLoss = order.stop_loss != null ? Number.parseFloat(order.stop_loss) : null;

        try {
            const result = await createExecutedPosition({
                userId: order.user_id,
                accountId: order.account_id,
                symbol: order.symbol,
                side: order.side,
                amount,
                quantity,
                entryPrice: executionPrice || Number.parseFloat(order.entry_price) || 0,
                leverage,
                takeProfit,
                stopLoss,
                margin,
                orderType: normalizeOrderType(order.type, order.side),
                existingOrderId: order.id,
                instrumentConfig: await getMergedInstrumentConfig(order.symbol),
            });

            executed.push({
                orderId: order.id,
                positionId: result.position.id,
                symbol: order.symbol,
                accountId: order.account_id,
            });
        } catch (error) {
            await Order.updateStatus(order.id, 'rejected');
            await createNotification(order.user_id, 'warning', `Pending order for ${order.symbol} could not execute: ${error.message}`);
        }
    }

    return executed;
};

const calculatePositionPnl = ({ side, entryPrice, exitPrice, quantity }) => {
    return calculateProjectedPnl({
        side: normalizeSide(side),
        entryPrice,
        exitPrice,
        quantity,
    });
};

const updatePositionProtection = async ({ positionId, userId, takeProfit = null, stopLoss = null }) => {
    const position = await Position.findById(positionId);
    if (!position || position.user_id !== userId || position.status !== 'open') {
        throw new Error('Open position not found');
    }

    const tp = takeProfit == null || takeProfit === '' ? null : Number.parseFloat(takeProfit);
    const sl = stopLoss == null || stopLoss === '' ? null : Number.parseFloat(stopLoss);
    validateStops({
        side: position.side,
        entryPrice: Number.parseFloat(position.entry_price) || 0,
        takeProfit: tp,
        stopLoss: sl,
    });

    const updated = await Position.updateProtection(positionId, tp, sl);
    await createActivityLog(userId, 'EXECUTION', `Updated protection for ${position.symbol}`);
    return updated;
};

const updateOrderProtection = async ({ orderId, userId, takeProfit = null, stopLoss = null, entryPrice = null }) => {
    const order = await Order.findById(orderId);
    if (!order || order.user_id !== userId || order.status !== 'pending') {
        throw new Error('Pending order not found');
    }

    const nextEntryPrice = entryPrice == null || entryPrice === '' ? Number.parseFloat(order.entry_price) || 0 : Number.parseFloat(entryPrice);
    const tp = takeProfit == null || takeProfit === '' ? null : Number.parseFloat(takeProfit);
    const sl = stopLoss == null || stopLoss === '' ? null : Number.parseFloat(stopLoss);

    validateStops({
        side: order.side,
        entryPrice: nextEntryPrice,
        takeProfit: tp,
        stopLoss: sl,
    });

    const updated = await Order.updatePending(orderId, {
        entryPrice: nextEntryPrice,
        takeProfit: tp,
        stopLoss: sl,
    });
    await createActivityLog(userId, 'EXECUTION', `Updated pending order for ${order.symbol}`);
    return updated;
};

const closePosition = async ({ positionId, userId, exitPrice, quantity = null }) => {
    const position = await Position.findById(positionId);
    if (!position || position.user_id !== userId || position.status !== 'open') {
        throw new Error('Open position not found');
    }

    const account = await Account.findById(position.account_id);

    let closePrice = Number.parseFloat(exitPrice);
    if (!Number.isFinite(closePrice) || closePrice <= 0) {
        const quote = await fetchPreferredQuote(position.symbol);
        closePrice = getExecutionPriceForSide(quote || {}, position.side === 'buy' ? 'sell' : 'buy');
    }
    if (!Number.isFinite(closePrice) || closePrice <= 0) {
        throw new Error('Live exit price is unavailable');
    }

    const positionQuantity = Number.parseFloat(position.quantity) || 0;
    const closeQuantity = quantity == null ? positionQuantity : Number.parseFloat(quantity);
    if (!Number.isFinite(closeQuantity) || closeQuantity <= 0 || closeQuantity > positionQuantity) {
        throw new Error('Invalid close quantity');
    }

    const entryPrice = Number.parseFloat(position.entry_price) || 0;
    const positionAmount = Number.parseFloat(position.amount) || (positionQuantity * entryPrice);
    const positionMargin = Number.parseFloat(position.margin) || 0;
    const ratio = closeQuantity / positionQuantity;
    const realizedAmount = positionAmount * ratio;
    const realizedMargin = positionMargin * ratio;
    const instrumentConfig = await getMergedInstrumentConfig(position.symbol);
    const netState = calculatePositionNetState({
        symbol: position.symbol,
        category: instrumentConfig.category || position.category || '',
        instrument: instrumentConfig,
        side: position.side,
        entryPrice,
        exitPrice: closePrice,
        quantity: positionQuantity,
        lots: position.lots != null ? Number.parseFloat(position.lots) || null : null,
        accountType: account?.account_type || 'real',
        openedAt: position.created_at || position.opened_at,
        commission: position.commission,
        swap: position.swap,
    });
    const pnl = netState.pnl * ratio;
    const grossPnl = netState.grossPnl * ratio;
    const commission = netState.commission * ratio;
    const swap = netState.swap * ratio;

    const funds = await creditMarginAndPnlToAccount({
        accountId: position.account_id,
        userId,
        realizedMargin,
        pnl,
    });

    let updatedPosition;
    let mode = 'full';
    if (closeQuantity === positionQuantity) {
        updatedPosition = await Position.close(positionId, closePrice, pnl, grossPnl, commission, swap);
    } else {
        updatedPosition = await Position.reduce(positionId, {
            quantity: positionQuantity - closeQuantity,
            amount: positionAmount - realizedAmount,
            margin: positionMargin - realizedMargin,
            currentPrice: closePrice,
            grossPnl: netState.grossPnl - grossPnl,
            commission: netState.commission - commission,
            swap: netState.swap - swap,
            pnl: netState.pnl - pnl,
        });
        mode = 'partial';
    }

    await Transaction.create(userId, {
        account_id: position.account_id,
        type: 'Trade',
        amount: realizedMargin + pnl,
        balance_before: funds.currentBalance,
        balance_after: funds.newBalance,
        reference_id: positionId,
        description: `${mode === 'partial' ? 'Partially closed' : 'Closed'} ${position.symbol} | P&L: ${pnl.toFixed(2)}`,
    });

    await createActivityLog(userId, 'EXECUTION', `${mode === 'partial' ? 'Partially closed' : 'Closed'} ${position.symbol} position`);
    await createNotification(userId, pnl >= 0 ? 'success' : 'info', `${mode === 'partial' ? 'Partial' : 'Position'} close: ${position.symbol} | P&L: $${pnl.toFixed(2)}`);

    return {
        mode,
        position: updatedPosition,
        pnl,
        closedQuantity: closeQuantity,
        remainingQuantity: Math.max(0, positionQuantity - closeQuantity),
    };
};

const getClosedPositions = async (accountId) => {
    const accountValue = [accountId];

    try {
        const { rows } = await db.query(
            `
            SELECT *
            FROM positions
            WHERE account_id = $1 AND status IN ('closed', 'cancelled')
            ORDER BY closed_at DESC NULLS LAST, updated_at DESC NULLS LAST, created_at DESC
            `,
            accountValue
        );
        return rows;
    } catch (error) {
        if (isMissingRelationError(error)) {
            return [];
        }

        if (isMissingColumnError(error)) {
            const { rows } = await db.query(
                `
                SELECT *
                FROM positions
                WHERE account_id = $1 AND status IN ('closed', 'cancelled')
                ORDER BY id DESC
                `,
                accountValue
            );
            return rows;
        }

        throw error;
    }
};

const calculateAccountRisk = ({ account = {}, positions = [], quotes = {} }) => {
    const balance = Number.parseFloat(account.balance) || 0;
    const credit = Number.parseFloat(account.credit) || 0;
    const cash = balance + credit;

    let usedMargin = 0;
    let unrealizedPnl = 0;

    for (const position of positions) {
        const storedPnl = Number.parseFloat(position.pnl);
        if (Number.isFinite(storedPnl)) {
            usedMargin += Number.parseFloat(position.margin) || 0;
            unrealizedPnl += storedPnl;
            continue;
        }

        const side = position.side;
        const entryPrice = Number.parseFloat(position.entry_price) || 0;
        const quantity = Number.parseFloat(position.quantity) || 0;
        const margin = Number.parseFloat(position.margin) || 0;
        const quote = quotes[normalizeSymbol(position.symbol)] || quotes[position.symbol] || {};
        const markPrice = getMarkPriceForSide(quote, side) || Number.parseFloat(position.current_price) || entryPrice;
        usedMargin += margin;
        unrealizedPnl += calculatePositionPnl({ side, entryPrice, exitPrice: markPrice, quantity });
    }

    const equity = cash + unrealizedPnl;
    const freeMargin = equity - usedMargin;
    const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;

    return {
        balance,
        credit,
        equity,
        freeMargin,
        usedMargin,
        unrealizedPnl,
        marginLevel,
        marginCall: usedMargin > 0 && marginLevel <= MARGIN_CALL_LEVEL,
        stopOut: usedMargin > 0 && marginLevel <= STOP_OUT_LEVEL,
    };
};

const evaluateAccountRisk = async (accountId, userId = null) => {
    const account = await Account.findById(accountId);
    if (!account) {
        return null;
    }

    const positions = await Position.findByAccountId(accountId, 'open');
    if (positions.length === 0) {
        return {
            accountId,
            risk: calculateAccountRisk({ account, positions, quotes: {} }),
            liquidations: [],
        };
    }

    const symbols = Array.from(new Set(positions.map((position) => position.symbol)));
    const quotes = await getCanonicalMarketQuotes(symbols, {
        preferChartAligned: true,
        refresh: true,
    });
    const risk = calculateAccountRisk({ account, positions, quotes });
    const liquidations = [];

    if (!risk.stopOut) {
        if (risk.marginCall && userId) {
            await createNotification(userId, 'warning', `Margin call on account ${account.account_number || accountId}. Margin level: ${risk.marginLevel.toFixed(2)}%`);
        }
        return { accountId, risk, liquidations };
    }

    const sortedPositions = [...positions].sort((left, right) => {
        const leftStoredPnl = Number.parseFloat(left.pnl);
        const rightStoredPnl = Number.parseFloat(right.pnl);
        if (Number.isFinite(leftStoredPnl) && Number.isFinite(rightStoredPnl)) {
            return leftStoredPnl - rightStoredPnl;
        }

        const leftQuote = quotes[normalizeSymbol(left.symbol)] || quotes[left.symbol] || {};
        const rightQuote = quotes[normalizeSymbol(right.symbol)] || quotes[right.symbol] || {};
        const leftPnl = calculatePositionPnl({
            side: left.side,
            entryPrice: Number.parseFloat(left.entry_price) || 0,
            exitPrice: getMarkPriceForSide(leftQuote, left.side) || Number.parseFloat(left.current_price) || Number.parseFloat(left.entry_price) || 0,
            quantity: Number.parseFloat(left.quantity) || 0,
        });
        const rightPnl = calculatePositionPnl({
            side: right.side,
            entryPrice: Number.parseFloat(right.entry_price) || 0,
            exitPrice: getMarkPriceForSide(rightQuote, right.side) || Number.parseFloat(right.current_price) || Number.parseFloat(right.entry_price) || 0,
            quantity: Number.parseFloat(right.quantity) || 0,
        });
        return leftPnl - rightPnl;
    });

    for (const position of sortedPositions) {
        const quote = quotes[normalizeSymbol(position.symbol)] || quotes[position.symbol] || {};
        const markPrice = getMarkPriceForSide(quote, position.side) || Number.parseFloat(position.current_price) || Number.parseFloat(position.entry_price) || 0;
        const result = await closePosition({
            positionId: position.id,
            userId: position.user_id,
            exitPrice: markPrice,
        });
        liquidations.push({
            positionId: position.id,
            symbol: position.symbol,
            pnl: result.pnl,
        });

        const nextAccount = await Account.findById(accountId);
        const nextPositions = await Position.findByAccountId(accountId, 'open');
        const nextRisk = calculateAccountRisk({ account: nextAccount, positions: nextPositions, quotes });
        if (!nextRisk.stopOut) {
            break;
        }
    }

    if (userId) {
        await createNotification(userId, 'warning', `Stop-out triggered on account ${account.account_number || accountId}. ${liquidations.length} position(s) liquidated.`);
    }

    const refreshedAccount = await Account.findById(accountId);
    const refreshedPositions = await Position.findByAccountId(accountId, 'open');
    const refreshedRisk = calculateAccountRisk({ account: refreshedAccount, positions: refreshedPositions, quotes });

    return {
        accountId,
        risk: refreshedRisk,
        liquidations,
    };
};

let engineTimer = null;
let engineRunning = false;

const runTradingEngineCycle = async () => {
    if (engineRunning) {
        return;
    }

    engineRunning = true;
    try {
        await processPriceAlerts().catch((error) => {
            if (error?.code !== '42P01') {
                console.error('Price alert processing failed:', error.message);
            }
        });
        const executed = await processPendingOrders();
        const syncResult = await syncOpenPositionsWithMarket().catch((error) => {
            console.error('Open position sync failed:', error.message);
            return { accountIds: [] };
        });
        const accountIds = Array.from(new Set([
            ...executed.map((item) => item.accountId),
            ...(syncResult.accountIds || []),
        ].filter(Boolean)));

        if (accountIds.length > 0) {
            await Promise.all(accountIds.map((accountId) => evaluateAccountRisk(accountId).catch(() => null)));
        }
    } finally {
        engineRunning = false;
    }
};

const processPriceAlerts = async () => {
    const alerts = await PriceAlert.findActive();
    if (alerts.length === 0) {
        return [];
    }

    const symbols = Array.from(new Set(alerts.map((alert) => normalizeSymbol(alert.symbol)).filter(Boolean)));
    const quotes = await getCanonicalMarketQuotes(symbols, {
        preferChartAligned: true,
        refresh: true,
    });
    const triggered = [];

    for (const alert of alerts) {
        const symbol = normalizeSymbol(alert.symbol);
        const currentPrice = Number.parseFloat(quotes[symbol]?.price);
        const targetPrice = Number.parseFloat(alert.price);
        if (!Number.isFinite(currentPrice) || !Number.isFinite(targetPrice)) {
            continue;
        }

        const reached = alert.condition === 'above'
            ? currentPrice >= targetPrice
            : alert.condition === 'below' && currentPrice <= targetPrice;
        if (!reached) {
            continue;
        }

        // The conditional update prevents duplicate notifications when cycles overlap.
        const updated = await PriceAlert.markTriggered(alert.id);
        if (!updated) {
            continue;
        }

        await createNotification(
            alert.user_id,
            'success',
            `${symbol} price alert triggered at ${currentPrice}. Target was ${alert.condition} ${targetPrice}.`
        );
        triggered.push(updated);
    }

    return triggered;
};

const startTradingEngine = () => {
    if (engineTimer) {
        return;
    }

    runTradingEngineCycle().catch((error) => {
        console.error('Initial trading engine cycle failed:', error.message);
    });

    engineTimer = setInterval(() => {
        runTradingEngineCycle().catch((error) => {
            console.error('Trading engine cycle failed:', error.message);
        });
    }, ENGINE_INTERVAL_MS);
};

module.exports = {
    MARGIN_CALL_LEVEL,
    STOP_OUT_LEVEL,
    normalizeOrderType,
    parseTradeInputs,
    placeTrade,
    processPendingOrders,
    processPriceAlerts,
    updatePositionProtection,
    updateOrderProtection,
    closePosition,
    getClosedPositions,
    evaluateAccountRisk,
    startTradingEngine,
    buildTradePreview,
};
