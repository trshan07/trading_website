// backend/src/controllers/tradingController.js
const Trade = require('../models/Trade');
const Account = require('../models/Account');

const tradingController = {
    // Execute a market order
    executeTrade: async (req, res) => {
        const { accountId, symbol, side, amount, entryPrice, type = 'market', leverage = 1 } = req.body;
        const userId = req.user.id;

        console.log(`[Trading] Executing trade for user ${userId} on account ${accountId}: ${side} $${amount} USD of ${symbol} at ${entryPrice || 'market'}`);

        try {
            // Verify account belongs to user
            const accounts = await Account.findByUserId(userId);
            const account = accounts.find(a => a.id === parseInt(accountId));

            if (!account) {
                console.error(`[Trading] Account ${accountId} not found for user ${userId}`);
                return res.status(404).json({ success: false, message: 'Trading account not found or access denied' });
            }

            // amount = USD investment from frontend
            const usdAmount = parseFloat(amount);
            const price = parseFloat(entryPrice) || 43000;
            const lev = parseFloat(leverage) || 1;

            // Required margin = usdAmount / leverage
            const requiredMargin = usdAmount / lev;
            // Unit quantity for this trade
            const quantity = usdAmount / price;

            console.log(`[Trading] Balance: $${account.balance}, Required margin: $${requiredMargin.toFixed(2)}, Quantity: ${quantity}`);

            if (parseFloat(account.balance) < requiredMargin && side === 'buy') {
                const msg = `Insufficient margin: Required $${requiredMargin.toFixed(2)}, Available $${parseFloat(account.balance).toFixed(2)}`;
                console.warn(`[Trading] ${msg}`);
                return res.status(400).json({ success: false, message: msg });
            }

            // Create the trade record using unit quantity
            const trade = await Trade.create({
                userId,
                accountId,
                symbol,
                side,
                type,
                amount: quantity,       // stored as asset units (e.g. 0.002 BTC)
                entryPrice: price
            });

            // Deduct required margin from balance
            const newBalance = parseFloat(account.balance) - requiredMargin;
            await Account.updateBalance(accountId, newBalance);

            res.status(201).json({
                success: true,
                message: 'Order executed successfully',
                data: trade
            });
        } catch (error) {
            console.error('[Trading Error] Execution Failed:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error during trade execution', 
                error: error.message 
            });
        }
    },

    // Get open positions
    getOpenPositions: async (req, res) => {
        const rawAccountId = req.query.accountId;
        const accountId = parseInt(rawAccountId, 10);
        const userId = req.user.id;

        if (!Number.isInteger(accountId) || accountId <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid accountId' });
        }

        try {
            const accounts = await Account.findByUserId(userId);
            const account = accounts.find(a => a.id === accountId);

            if (!account) {
                return res.status(404).json({ success: false, message: 'Trading account not found or access denied' });
            }

            const positions = await Trade.findActiveByUserId(userId, accountId);
            res.json({
                success: true,
                data: positions
            });
        } catch (error) {
            console.error('Fetch Error:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch positions' });
        }
    },

    // Close a position
    closePosition: async (req, res) => {
        const { tradeId } = req.params;
        const { exitPrice } = req.body;
        const userId = req.user.id;

        try {
            // 1. Find the trade
            const trade = await Trade.findById(tradeId);
            if (!trade || trade.user_id !== userId || trade.status !== 'open') {
                return res.status(404).json({ success: false, message: 'Active position not found' });
            }

            // 2. Calculate PNL
            const amount = parseFloat(trade.amount);
            const entryPrice = parseFloat(trade.entry_price);
            const exitPriceNum = parseFloat(exitPrice);
            
            let pnl = 0;
            if (trade.side === 'buy') {
                pnl = (exitPriceNum - entryPrice) * amount;
            } else {
                pnl = (entryPrice - exitPriceNum) * amount;
            }

            // 3. Close the trade
            const closedTrade = await Trade.close(tradeId, exitPriceNum, pnl);

            // 4. Update balance (Return the initial cost + PNL)
            const initialCost = amount * entryPrice;
            const accounts = await Account.findByUserId(userId);
            const account = accounts.find(a => a.id === trade.account_id);
            
            if (account) {
                const newBalance = parseFloat(account.balance) + initialCost + pnl;
                await Account.updateBalance(account.id, newBalance);
            }

            res.json({
                success: true,
                message: 'Position closed successfully',
                data: closedTrade
            });
        } catch (error) {
            console.error('Close Error:', error);
            res.status(500).json({ success: false, message: 'Failed to close position' });
        }
    }
};

module.exports = tradingController;
