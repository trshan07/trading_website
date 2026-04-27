const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const instrumentController = require('../controllers/instrumentController');
const notificationController = require('../controllers/notificationController');
const activityController = require('../controllers/activityController');
const marketDataController = require('../controllers/marketDataController');

// All routes here are protected
router.use(protect);

// --- Market Data Proxy ---
router.get('/market-data/quotes', marketDataController.getMarketQuotes);
router.get('/market-data/history', marketDataController.getMarketHistory);

// --- Instruments ---
router.get('/instruments', instrumentController.getAllInstruments);
router.get('/instruments/categories', instrumentController.getCategories);

// --- Notifications ---
router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/mark-all-read', notificationController.markAllRead);

// --- Activity & Favorites ---
router.get('/activity/logs', activityController.getActivityLogs);
router.get('/favorites', activityController.getFavorites);
router.post('/favorites/toggle', activityController.toggleFavorite);

module.exports = router;
