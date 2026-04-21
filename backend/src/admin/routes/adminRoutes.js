// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    createAdmin,
    getDashboardStats,
    adjustBalance,
    resetUserPassword,
    getKyCSubmissions,
    processKYC,
    getFundingRequests,
    processFunding,
    getTrades,
    cancelTrade,
    getSettings,
    updateSettings,
    getGrowthStats,
    getAdminLogs,
    getAdminProfile
} = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../../middleware/authMiddleware');

// All admin routes are protected
router.use(protect, admin);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/balance', adjustBalance);
router.post('/users/:id/reset-password', resetUserPassword);
router.post('/users/admin', superAdmin, createAdmin);

// Dashboard & Stats
router.get('/stats', getDashboardStats);
router.get('/profile', getAdminProfile);

// KYC Management
router.get('/kyc', getKyCSubmissions);
router.post('/kyc/:id/process', processKYC);

// Funding Management
router.get('/funding', getFundingRequests);
router.post('/funding/:id/process', processFunding);

// Trades Management
router.get('/trades', getTrades);
router.post('/trades/:id/cancel', cancelTrade);

// Platform Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/growth-stats', getGrowthStats);

// Audit Logs
router.get('/logs', getAdminLogs);

module.exports = router;