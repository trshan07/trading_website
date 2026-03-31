// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Get current user profile
router.get('/profile', protect, getProfile);

// Update user profile
router.put('/profile', protect, updateProfile);

// Change user password
router.put('/change-password', protect, changePassword);

module.exports = router;
