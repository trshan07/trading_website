const db = require('../config/database');
const Account = require('../models/Account');
const Order = require('../models/Order');
const Position = require('../models/Position');
const Transaction = require('../models/Transaction');
const { isMissingColumnError, getMissingColumnName } = require('../utils/dbCompat');
const { createActivityLog } = require('../client/controllers/activityController');
const { createNotification } = require('../client/controllers/notificationController');
const {
    fetchMarketQuotes,
    getExecutionPriceForSide,
    getMarkPriceForSide,
    normalizeSymbol,
    getMergedInstrumentConfig,
} = require('./marketDataService');
const {
    calculateMarginRequired,
    calculateProjectedPnl,
    calculateQuantityFromLots,
    getInstrumentTradingMeta,
} = require('../utils/calculators');

const MARGIN_CALL_LEVEL = Number.parseFloat(process.env.MARGIN_CALL_LEVEL ?? '100') || 100;
const STOP_OUT_LEVEL = Number.parseFloat(process.env.STOP_OUT_LEVEL ?? '50') || 50;
const ENGINE_INTERVAL_MS = Number.parseInt(process.env.TRADING_ENGINE_INTERVAL_MS ?? '5000', 10) || 5000;

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
    const leverage = Number.parseFloat(payload.leverage) || 100;
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

const getOrderMargin = (order = {}) => {
    const amount = Number.parseFloat(order.amount) || 0;
    const leverage = Number.parseFloat(order.leverage) || 100;
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
    const availableFunds = accountBalance + accountCredit;

    if (availableFunds < requiredMargin) {
        throw new Error(`Insufficient funds for margin ($${requiredMargin.toFixed(2)} required, $${availableFunds.toFixed(2)} available)`);
    }

    let newBalance = accountBalance;
    let newCredit = accountCredit;
    let remaining = requiredMargin;

    if (newCredit >= remaining) {
        newCredit -= remaining;
        remaining = 0;
    } else {
        remaining -= newCredit;
        newCredit = 0;
        newBalance -= remaining;
        remaining = 0;
    }

    await Account.updateCredit(accountId, newCredit);
    await Account.updateBalance(accountId, newBalance);

    return {
        accountBalance,
        accountCredit,
        newBalance,
        newCredit,
    };
};

const creditMarginAndPnlToAccount = async ({ accountId, userId, realizedMargin, pnl }) => {
    const currentAccount = await Account.findById(accountId);
    if (!currentAccount) {
        throw new Error('Account not found while closing position');
    }

    const currentBalance = Number.parseFloat(currentAccount.balance) || 0;
    const currentCredit = Number.parseFloat(currentAccount.credit) || 0;

    let newCredit = currentCredit + realizedMargin;
    let newBalance = currentBalance;

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

    await Account.updateCredit(accountId, newCredit);
    await Account.updateBalance(accountId, newBalance);

    return {
        currentBalance,
        currentCredit,
        newBalance,
        newCredit,
    };
};

const createExecutedPosition = async ({ userId, accountId, symbol, side, amount, quantity, entryPrice, leverage, takeProfit, stopLoss, margin, orderType = 'market', existingOrderId = null }) => {
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
        margin,
        leverage,
        takeProfit,
        stopLoss,
    });

    await Transaction.create(userId, {
        account_id: accountId,
        type: 'Trade',
        amount: -margin,
        balance_before: funds.accountBalance,
        balance_after: funds.newBalance,
        reference_id: order?.id || position.id,
        description: `Margin for ${side.toUpperCase()} ${symbol}`,
    });

    await createActivityLog(userId, 'EXECUTION', `Opened ${side.toUpperCase()} ${symbol} Position`);
    await createNotification(userId, 'success', `Order Executed: ${side.toUpperCase()} ${symbol} at ${entryPrice}`);

    return { order, position };
};

const placeTrade = async ({ userId, accountId, payload }) => {
    const trade = await parseTradeInputs(payload);
    const pendingType = getTriggerKind(trade.type);

    if (pendingType !== 'market') {
        const accounts = await Account.findByUserId(userId);
        const account = accounts.find((item) => item.id == accountId);
        if (!account) {
            throw new Error('Account not found for this user');
        }

        if (getAccountAvailableFunds(account) < trade.margin) {
            throw new Error(`Insufficient funds for margin ($${trade.margin.toFixed(2)} required, ${getAccountAvailableFunds(account).toFixed(2)} available)`);
        }

        const order = await Order.create(userId, {
            accountId,
            symbol: trade.symbol,
            side: trade.side,
            type: trade.type,
            amount: trade.amount,
            quantity: trade.quantity,
            entryPrice: trade.entryPrice,
            leverage: trade.leverage,
            takeProfit: trade.takeProfit,
            stopLoss: trade.stopLoss,
            status: 'pending',
        });

        await createActivityLog(userId, 'EXECUTION', `Placed ${trade.type.toUpperCase()} ${trade.symbol} order`);
        await createNotification(userId, 'info', `Pending ${trade.type.replace('_', ' ')} order placed for ${trade.symbol}`);

        return {
            mode: 'pending',
            order,
            requiredMargin: trade.margin,
        };
    }

    const result = await createExecutedPosition({
        userId,
        accountId,
        symbol: trade.symbol,
        side: trade.side,
        amount: trade.amount,
        quantity: trade.quantity,
        entryPrice: trade.entryPrice,
        leverage: trade.leverage,
        takeProfit: trade.takeProfit,
        stopLoss: trade.stopLoss,
        margin: trade.margin,
        orderType: trade.type,
    });

    return {
        mode: 'market',
        ...result,
        requiredMargin: trade.margin,
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

const processPendingOrders = async ({ accountId = null, userId = null, symbols = [] } = {}) => {
    const pendingOrders = await listPendingOrders({ accountId, userId });
    if (pendingOrders.length === 0) {
        return [];
    }

    const requestedSymbols = symbols.length > 0
        ? symbols.map(normalizeSymbol)
        : pendingOrders.map((order) => order.symbol);
    const uniqueSymbols = Array.from(new Set(requestedSymbols));
    const quotes = await fetchMarketQuotes(uniqueSymbols);
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

    const closePrice = Number.parseFloat(exitPrice);
    if (!Number.isFinite(closePrice) || closePrice <= 0) {
        throw new Error('Invalid exit price');
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
    const pnl = calculatePositionPnl({
        side: position.side,
        entryPrice,
        exitPrice: closePrice,
        quantity: closeQuantity,
    });

    const funds = await creditMarginAndPnlToAccount({
        accountId: position.account_id,
        userId,
        realizedMargin,
        pnl,
    });

    let updatedPosition;
    let mode = 'full';
    if (closeQuantity === positionQuantity) {
        updatedPosition = await Position.close(positionId, closePrice, pnl);
    } else {
        updatedPosition = await Position.reduce(positionId, {
            quantity: positionQuantity - closeQuantity,
            amount: positionAmount - realizedAmount,
            margin: positionMargin - realizedMargin,
            currentPrice: closePrice,
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
    const { rows } = await db.query(
        `
        SELECT *
        FROM positions
        WHERE account_id = $1 AND status = 'closed'
        ORDER BY closed_at DESC NULLS LAST, updated_at DESC NULLS LAST, created_at DESC
        `,
        [accountId]
    );
    return rows;
};

const calculateAccountRisk = ({ account = {}, positions = [], quotes = {} }) => {
    const balance = Number.parseFloat(account.balance) || 0;
    const credit = Number.parseFloat(account.credit) || 0;
    const cash = balance + credit;

    let usedMargin = 0;
    let unrealizedPnl = 0;

    for (const position of positions) {
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
    const quotes = await fetchMarketQuotes(symbols);
    const risk = calculateAccountRisk({ account, positions, quotes });
    const liquidations = [];

    if (!risk.stopOut) {
        if (risk.marginCall && userId) {
            await createNotification(userId, 'warning', `Margin call on account ${account.account_number || accountId}. Margin level: ${risk.marginLevel.toFixed(2)}%`);
        }
        return { accountId, risk, liquidations };
    }

    const sortedPositions = [...positions].sort((left, right) => {
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
        const executed = await processPendingOrders();
        const accountIds = Array.from(new Set(executed.map((item) => item.accountId).filter(Boolean)));

        if (accountIds.length > 0) {
            await Promise.all(accountIds.map((accountId) => evaluateAccountRisk(accountId).catch(() => null)));
        }
    } finally {
        engineRunning = false;
    }
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
    updatePositionProtection,
    updateOrderProtection,
    closePosition,
    getClosedPositions,
    evaluateAccountRisk,
    startTradingEngine,
};
