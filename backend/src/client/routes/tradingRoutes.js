// backend/src/routes/tradingRoutes.js
const express = require('express');
const router = express.Router();
const { 
    executeTrade, 
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
    deleteAlert
} = require('../controllers/tradingController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

// Trades and Positions
router.post('/execute', executeTrade);
router.get('/orders', getOpenOrders);
router.delete('/orders/:orderId', cancelOrder);
router.patch('/orders/:orderId', modifyOrder);
router.get('/positions', getOpenPositions);
router.get('/positions/history', getClosedTradeHistory);
router.get('/risk', getRiskSnapshot);
router.patch('/positions/:positionId', modifyPosition);
router.post('/positions/:positionId/close', closePosition);

// Price Alerts
router.get('/alerts', getAlerts);
router.post('/alerts', createAlert);
router.delete('/alerts/:id', deleteAlert);

module.exports = router;
