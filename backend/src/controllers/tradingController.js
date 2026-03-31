// backend/src/controllers/tradingController.js
const Trade = require('../models/Trade');
const Account = require('../models/Account');

const tradingController = {
    // Execute a market order
    executeTrade: async (req, res) => {
        const { accountId, symbol, side, amount, entryPrice, type = 'market' } = req.body;
        const userId = req.user.id;

        console.log(`[Trading] Executing trade for user ${userId} on account ${accountId}: ${side} ${amount} units of ${symbol} at ${entryPrice || 'market'}`);

        try {
            // 1. Verify account belongs to user and check balance
            const accounts = await Account.findByUserId(userId);
            const account = accounts.find(a => a.id === parseInt(accountId));

            if (!account) {
                console.error(`[Trading] Account ${accountId} not found for user ${userId}`);
                return res.status(404).json({ success: false, message: 'Trading account not found or access denied' });
            }

            // Calculation: The 'amount' from frontend is currently the USD investment.
            // We need to ensure we calculate the cost correctly.
            // If the frontend sends 'amount' as quantity, we multiply by price.
            // If the frontend sends 'amount' as USD total, we use it directly.
            const totalCost = parseFloat(amount) * parseFloat(entryPrice || 1);

            console.log(`[Trading] Account balance: ${account.balance}, Total trade cost: ${totalCost}`);

            // In demo mode, we just check if they have enough balance. 
            // In real mode, we might do stricter margin checks.
            if (parseFloat(account.balance) < totalCost && side === 'buy') {
                const msg = `Insufficient funds: Required $${totalCost.toFixed(2)}, Available $${parseFloat(account.balance).toFixed(2)}`;
                console.warn(`[Trading] ${msg}`);
                return res.status(400).json({ success: false, message: msg });
            }

            // 2. Create the trade
            const trade = await Trade.create({
                userId,
                accountId,
                symbol,
                side,
                type,
                amount,
                entryPrice: entryPrice || 0
            });


            // 3. Update account balance (Deduct the cost)
            const newBalance = parseFloat(account.balance) - totalCost;
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
        const { accountId } = req.query;
        const userId = req.user.id;

        try {
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
