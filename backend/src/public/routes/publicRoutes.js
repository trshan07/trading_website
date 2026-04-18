// backend/src/public/routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const {
    getMarkets,
    getMarketsByCategory,
    submitContactForm,
    getPromotions,
    getAccountTypes
} = require('../controllers/publicController');

// All routes are prefixed with /api/public in server.js
router.get('/markets', getMarkets);
router.get('/markets/:category', getMarketsByCategory);
router.post('/contact', submitContactForm);
router.get('/promotions', getPromotions);
router.get('/account-types', getAccountTypes);

module.exports = router;
