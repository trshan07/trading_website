const express = require('express');
const router = express.Router();
const {
    register,
    login,
    demoLogin,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
