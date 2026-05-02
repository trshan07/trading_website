const Order = require('../../models/Order');
const Position = require('../../models/Position');
const PriceAlert = require('../../models/PriceAlert');
const { isMissingRelationError } = require('../../utils/dbCompat');
const {
    placeTrade,
    buildTradePreview,
    processPendingOrders,
    updatePositionProtection,
    updateOrderProtection,
    closePosition: closePositionThroughEngine,
    getClosedPositions,
    evaluateAccountRisk,
} = require('../../services/tradingEngine');
const Account = require('../../models/Account');

const executeTrade = async (req, res) => {
    const { accountId } = req.body;
    const userId = req.user.id;

    if (!accountId) {
        return res.status(400).json({ success: false, message: 'Account is required' });
    }

    try {
        const result = await placeTrade({
            userId,
            accountId,
            payload: req.body,
        });

        if (result.mode === 'pending') {
            return res.status(201).json({
                success: true,
                message: 'Pending order placed successfully',
                data: {
                    order: result.order,
                    requiredMargin: result.requiredMargin,
                },
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Order executed and position opened',
            data: {
                order: result.order,
                position: result.position,
                requiredMargin: result.requiredMargin,
            },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Execution failed',
        });
    }
};

const previewTrade = async (req, res) => {
    const { accountId } = req.body;
    const userId = req.user.id;

    if (!accountId) {
        return res.status(400).json({ success: false, message: 'Account is required' });
    }

    try {
        const accounts = await Account.findByUserId(userId);
        const account = accounts.find((item) => item.id == accountId);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found for this user' });
        }

        const preview = await buildTradePreview({
            account,
            payload: req.body,
            side: req.body.side,
        });

        return res.json({
            success: true,
            data: preview,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Preview failed',
        });
    }
};

const getOpenPositions = async (req, res) => {
    const { accountId } = req.query;
    if (!accountId) {
        return res.status(400).json({ success: false, message: 'Account is required' });
    }

    try {
        let risk = null;

        try {
            await processPendingOrders({ accountId, userId: req.user.id });
        } catch (error) {
            console.error('[Trading] Pending order processing failed during getOpenPositions:', error.message);
        }

        const positions = await Position.findByAccountId(accountId, 'open');

        try {
            risk = await evaluateAccountRisk(accountId, req.user.id);
        } catch (error) {
            console.error('[Trading] Risk evaluation failed during getOpenPositions:', error.message);
        }

        return res.json({ success: true, data: positions, risk });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.json({ success: true, data: [], risk: null });
        }
        console.error('[Trading] Failed to fetch positions:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch positions' });
    }
};

const getOpenOrders = async (req, res) => {
    try {
        const { accountId } = req.query;
        await processPendingOrders({ accountId, userId: req.user.id });
        const orders = await Order.findByAccountId(accountId, 'pending');
        res.json({ success: true, data: orders });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.json({ success: true, data: [] });
        }
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

const getClosedTradeHistory = async (req, res) => {
    try {
        const { accountId } = req.query;
        const history = await getClosedPositions(accountId);
        res.json({ success: true, data: history });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.json({ success: true, data: [] });
        }
        res.status(500).json({ success: false, message: 'Failed to fetch closed trades' });
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

const modifyOrder = async (req, res) => {
    try {
        const updated = await updateOrderProtection({
            orderId: req.params.orderId,
            userId: req.user.id,
            takeProfit: req.body.takeProfit,
            stopLoss: req.body.stopLoss,
            entryPrice: req.body.entryPrice,
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Pending order not found' });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to modify order' });
    }
};

const modifyPosition = async (req, res) => {
    try {
        const updated = await updatePositionProtection({
            positionId: req.params.positionId,
            userId: req.user.id,
            takeProfit: req.body.takeProfit,
            stopLoss: req.body.stopLoss,
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Open position not found' });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to modify position' });
    }
};

const closePosition = async (req, res) => {
    try {
        const result = await closePositionThroughEngine({
            positionId: req.params.positionId,
            userId: req.user.id,
            exitPrice: req.body.exitPrice,
            quantity: req.body.quantity,
        });

        res.json({ success: true, data: result.position, pnl: result.pnl, meta: result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to close position' });
    }
};

const getRiskSnapshot = async (req, res) => {
    try {
        const { accountId } = req.query;
        const risk = await evaluateAccountRisk(accountId, req.user.id);
        res.json({ success: true, data: risk });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to evaluate account risk' });
    }
};

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
    previewTrade,
    getOpenOrders,
    getOpenPositions,
    getClosedTradeHistory,
    closePosition,
    cancelOrder,
    modifyOrder,
    modifyPosition,
    getRiskSnapshot,
    getAlerts,
    createAlert,
    deleteAlert,
};
