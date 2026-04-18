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
    getKyCSubmissions,
    processKYC,
    getFundingRequests,
    processFunding,
    getAdminLogs
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
router.post('/users/admin', superAdmin, createAdmin);

// Dashboard & Stats
router.get('/stats', getDashboardStats);

// KYC Management
router.get('/kyc', getKyCSubmissions);
router.post('/kyc/:id/process', processKYC);

// Funding Management
router.get('/funding', getFundingRequests);
router.post('/funding/:id/process', processFunding);

// Audit Logs
router.get('/logs', getAdminLogs);

module.exports = router;