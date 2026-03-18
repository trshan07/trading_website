// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
    register,
    registerAdmin,
    login,
    demoLogin,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected admin route
router.post('/register-admin', protect, admin, registerAdmin);

module.exports = router;