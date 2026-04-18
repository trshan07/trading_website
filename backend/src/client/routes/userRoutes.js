// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getProfile, 
    updateProfile, 
    changePassword,
    getSettings,
    updateSettings
} = require('../controllers/userController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
