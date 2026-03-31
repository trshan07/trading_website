// backend/src/routes/tradingRoutes.js
const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/tradingController');
const { protect } = require('../middleware/authMiddleware');

// All trading routes are protected
router.use(protect);

// Execute a trade
router.post('/execute', tradingController.executeTrade);

// Get open positions
router.get('/positions', tradingController.getOpenPositions);

// Close a position
router.put('/close/:tradeId', tradingController.closePosition);

module.exports = router;
