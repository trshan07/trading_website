// backend/src/controllers/tradingController.js
const Order = require('../../models/Order');
const Position = require('../../models/Position');
const PriceAlert = require('../../models/PriceAlert');
const Account = require('../../models/Account');
const Transaction = require('../../models/Transaction');
const { createNotification } = require('./notificationController');
const { createActivityLog } = require('./activityController');
const { isMissingRelationError } = require('../../utils/dbCompat');

const executeTrade = async (req, res) => {
    const {
        accountId,
        symbol,
        side,
        amount,
        entryPrice,
        type = 'market',
        leverage = 100,
        takeProfit = null,
        stopLoss = null
    } = req.body;
    const userId = req.user.id;

    if (!accountId || !symbol || !side || !amount || !entryPrice) {
        return res.status(400).json({ success: false, message: 'Missing required trade parameters' });
    }

    try {
        const accounts = await Account.findByUserId(userId);
        const account = accounts.find(a => a.id == accountId);

        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found for this user' });
        }

        const usdAmount = parseFloat(amount);
        const price = parseFloat(entryPrice);
        const lev = parseFloat(leverage) || 100;
        const tp = takeProfit == null ? null : parseFloat(takeProfit);
        const sl = stopLoss == null ? null : parseFloat(stopLoss);
        
        if (isNaN(usdAmount) || isNaN(price) || usdAmount <= 0 || isNaN(lev) || lev <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid trade amount or price' });
        }

        if ((tp !== null && isNaN(tp)) || (sl !== null && isNaN(sl))) {
            return res.status(400).json({ success: false, message: 'Invalid take profit or stop loss value' });
        }

        const requiredMargin = usdAmount / lev;
        const quantity = usdAmount / price;

        const accountBalance = parseFloat(account.balance) || 0;
        const accountCredit = parseFloat(account.credit) || 0;
        const availableFunds = accountBalance + accountCredit;

        if (availableFunds < requiredMargin) {
            return res.status(400).json({
                success: false,
                message: `Insufficient funds for margin ($${requiredMargin.toFixed(2)} required, $${availableFunds.toFixed(2)} available)`
            });
        }

        const lowerType = String(type).toLowerCase();
        if (lowerType === 'limit' || lowerType === 'stop') {
            const order = await Order.create(userId, {
                accountId,
                symbol,
                side,
                type: lowerType,
                amount: usdAmount,
                quantity,
                entryPrice: price,
                leverage: lev,
                takeProfit: tp,
                stopLoss: sl,
                status: 'pending'
            });

            await createActivityLog(userId, 'EXECUTION', `Placed ${lowerType.toUpperCase()} ${side.toUpperCase()} ${symbol} Order`);
            await createNotification(userId, 'info', `Pending ${lowerType} order placed: ${side.toUpperCase()} ${symbol} at ${price}`);

            return res.status(201).json({
                success: true,
                message: `${lowerType.charAt(0).toUpperCase() + lowerType.slice(1)} order placed successfully`,
                data: { order }
            });
        }

        // 1. Create Order (executed)
        const order = await Order.create(userId, {
            accountId,
            symbol,
            side,
            type,
            amount: usdAmount,
            quantity,
            entryPrice: price,
            leverage: lev,
            takeProfit: tp,
            stopLoss: sl,
            status: 'executed'
        });

        // 2. Create Position
        const position = await Position.create(userId, {
            accountId,
            symbol,
            side,
            amount: usdAmount,
            quantity,
            entryPrice: price,
            margin: requiredMargin,
            leverage: lev,
            takeProfit: tp,
            stopLoss: sl
        });

        // 3. Deduct Margin from Credit first, then Balance
        //    This prevents balance going negative when client only has credits.
        let newAccountBalance = accountBalance;
        let newAccountCredit = accountCredit;
        let marginRemaining = requiredMargin;

        if (newAccountCredit >= marginRemaining) {
            // Credit covers full margin
            newAccountCredit -= marginRemaining;
            marginRemaining = 0;
        } else {
            // Use all credit first, then rest from balance
            marginRemaining -= newAccountCredit;
            newAccountCredit = 0;
            newAccountBalance -= marginRemaining;
            marginRemaining = 0;
        }

        await Account.updateCredit(accountId, newAccountCredit);
        await Account.updateBalance(accountId, newAccountBalance);

        // 4. Record Transaction
        await Transaction.create(userId, {
            account_id: accountId,
            type: 'Trade',
            amount: -requiredMargin,
            balance_before: accountBalance,
            balance_after: newAccountBalance,
            reference_id: order.id,
            description: `Margin for ${side.toUpperCase()} ${symbol}`
        });

        // 5. Dynamic Infrastructure Updates
        await createActivityLog(userId, 'EXECUTION', `Opened ${side.toUpperCase()} ${symbol} Position`);
        await createNotification(userId, 'success', `Order Executed: ${side.toUpperCase()} ${symbol} at ${price}`);

        res.status(201).json({
            success: true,
            message: 'Order executed and position opened',
            data: { order, position }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Execution failed', error: error.message });
    }
};

const getOpenPositions = async (req, res) => {
    try {
        const { accountId } = req.query;
        const positions = await Position.findByAccountId(accountId, 'open');
        res.json({ success: true, data: positions });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.json({ success: true, data: [] });
        }
        res.status(500).json({ success: false, message: 'Failed to fetch positions' });
    }
};

const getOpenOrders = async (req, res) => {
    try {
        const { accountId } = req.query;
        const orders = await Order.findByAccountId(accountId, 'pending');
        res.json({ success: true, data: orders });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.json({ success: true, data: [] });
        }
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.delete(req.params.orderId, req.user.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, message: 'Order cancelled' });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.status(503).json({ success: false, message: 'Orders are unavailable until database migrations are applied' });
        }
        res.status(500).json({ success: false, message: 'Failed to cancel order' });
    }
};

const closePosition = async (req, res) => {
    try {
        const { positionId } = req.params;
        const { exitPrice } = req.body;
        const userId = req.user.id;

        const position = await Position.findById(positionId);
        if (!position || position.user_id !== userId || position.status !== 'open') {
            return res.status(404).json({ success: false, message: 'Open position not found' });
        }

        const exitPriceNum = parseFloat(exitPrice);
        const amount = parseFloat(position.amount); // total trade size in USD
        const qty = parseFloat(position.quantity);
        const entryPrice = parseFloat(position.entry_price);
        
        let pnl = 0;
        if (position.side === 'buy') {
            pnl = (exitPriceNum - entryPrice) * qty;
        } else {
            pnl = (entryPrice - exitPriceNum) * qty;
        }

        // 1. Close position in DB
        const closedPosition = await Position.close(positionId, exitPriceNum, pnl);

        // 2. Return margin + PNL to account
        //    Restore credit first (up to its original held amount), rest to balance
        const accountId = position.account_id;
        const currentAccount = (await Account.findByUserId(userId)).find(a => a.id == accountId);
        let currentBalance = parseFloat(currentAccount.balance) || 0;
        let currentCredit = parseFloat(currentAccount.credit) || 0;
        const margin = parseFloat(position.margin) || 0;
        const totalReturn = margin + pnl;

        // Logic:
        // 1. Restore the margin to credit first (since it was deducted from credit first in executeTrade)
        let newCredit = currentCredit + margin;
        let newBalance = currentBalance;

        // 2. Apply PNL
        if (pnl >= 0) {
            // Profits always go to cash balance
            newBalance += pnl;
        } else {
            // Losses (negative PNL)
            const loss = Math.abs(pnl);
            if (newBalance >= loss) {
                // Balance covers the loss
                newBalance -= loss;
            } else {
                // Use all balance, then rest from credit
                const remainingLoss = loss - newBalance;
                newBalance = 0;
                newCredit = Math.max(0, newCredit - remainingLoss);
            }
        }

        await Account.updateCredit(accountId, newCredit);
        await Account.updateBalance(accountId, newBalance);

        // 3. Record Transaction
        await Transaction.create(userId, {
            account_id: accountId,
            type: 'Trade',
            amount: totalReturn,
            balance_before: currentBalance,
            balance_after: newBalance,
            reference_id: positionId,
            description: `Closed ${position.symbol} | P&L: ${pnl.toFixed(2)}`
        });

        // 4. Dynamic Infrastructure Updates
        await createActivityLog(userId, 'EXECUTION', `Closed ${position.symbol} Position | P&L: ${pnl.toFixed(2)}`);
        await createNotification(userId, pnl >= 0 ? 'success' : 'info', `Position Closed: ${position.symbol} | P&L: $${pnl.toFixed(2)}`);

        res.json({ success: true, data: closedPosition, pnl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to close position' });
    }
};

// --- Alert Methods ---

const getAlerts = async (req, res) => {
    try {
        const alerts = await PriceAlert.findByUserId(req.user.id);
        res.json({ success: true, data: alerts });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.json({ success: true, data: [] });
        }
        res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
};

const createAlert = async (req, res) => {
    try {
        const alert = await PriceAlert.create(req.user.id, req.body);
        res.status(201).json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create alert' });
    }
};

const deleteAlert = async (req, res) => {
    try {
        await PriceAlert.delete(req.params.id, req.user.id);
        res.json({ success: true, message: 'Alert deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete alert' });
    }
};

module.exports = {
    executeTrade,
    getOpenOrders,
    getOpenPositions,
    closePosition,
    cancelOrder,
    getAlerts,
    createAlert,
    deleteAlert
};
