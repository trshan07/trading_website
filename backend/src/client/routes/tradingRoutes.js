// backend/src/routes/tradingRoutes.js
const express = require('express');
const router = express.Router();
const { 
    executeTrade, 
    getOpenOrders,
    getOpenPositions, 
    closePosition,
    cancelOrder,
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
router.get('/positions', getOpenPositions);
router.post('/positions/:positionId/close', closePosition);

// Price Alerts
router.get('/alerts', getAlerts);
router.post('/alerts', createAlert);
router.delete('/alerts/:id', deleteAlert);

module.exports = router;
