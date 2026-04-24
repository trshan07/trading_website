// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const {
    getUsers,
    createUser,
    getUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    createAdmin,
    getDashboardStats,
    adjustBalance,
    resetUserPassword,
    getKyCSubmissions,
    processKYC,
    getFundingRequests,
    exportFundingRequests,
    processFunding,
    getTrades,
    getTradeStats,
    cancelTrade,
    getTransactions,
    getTransactionStats,
    exportTransactions,
    getSettings,
    updateSettings,
    getGrowthStats,
    getAdminLogs,
    exportAdminLogs,
    getAdminProfile
} = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../../middleware/authMiddleware');

// All admin routes are protected
router.use(protect, admin);

// User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', updateUserStatus);
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
router.get('/funding/export', exportFundingRequests);
router.post('/funding/:id/process', processFunding);

// Trades Management
router.get('/trades', getTrades);
router.get('/trades/stats', getTradeStats);
router.post('/trades/:id/cancel', cancelTrade);

// Transactions
router.get('/transactions', getTransactions);
router.get('/transactions/stats', getTransactionStats);
router.get('/transactions/export', exportTransactions);

// Platform Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/growth-stats', getGrowthStats);

// Audit Logs
router.get('/logs', getAdminLogs);
router.get('/logs/export', exportAdminLogs);

module.exports = router;
