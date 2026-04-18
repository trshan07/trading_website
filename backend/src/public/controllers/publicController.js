// backend/src/public/controllers/publicController.js
const ContactMessage = require('../models/ContactMessage');
const Promotion = require('../models/Promotion');
const AccountTypeInfo = require('../models/AccountTypeInfo');

// @desc    Get all market assets
// @route   GET /api/public/markets
// @access  Public
// NOTE: Market data is now served directly from TradingView API on the frontend.
const getMarkets = async (req, res) => {
    res.json({ success: true, data: [], message: 'Market data is served via TradingView API on the client.' });
};

// @desc    Get assets by category
// @route   GET /api/public/markets/:category
// @access  Public
const getMarketsByCategory = async (req, res) => {
    res.json({ success: true, data: [], message: 'Market data is served via TradingView API on the client.' });
};

// @desc    Submit contact message
// @route   POST /api/public/contact
// @access  Public
const submitContactForm = async (req, res) => {
    try {
        const { fullName, email, subject, message } = req.body;

        if (!fullName || !email || !message) {
            return res.status(400).json({ message: 'Please provide name, email and message' });
        }

        const newMessage = await ContactMessage.create({
            fullName,
            email,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Support request initiated successfully',
            data: newMessage
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ message: 'Failed to process support request' });
    }
};

// @desc    Get all active promotions
// @route   GET /api/public/promotions
// @access  Public
const getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.findAllActive();
        res.json({
            success: true,
            data: promotions
        });
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({ message: 'Error retrieving promotions' });
    }
};

// @desc    Get all active account types
// @route   GET /api/public/account-types
// @access  Public
const getAccountTypes = async (req, res) => {
    try {
        const accountTypes = await AccountTypeInfo.findAllActive();
        res.json({
            success: true,
            data: accountTypes
        });
    } catch (error) {
        console.error('Error fetching account types:', error);
        res.status(500).json({ message: 'Error retrieving account specifications' });
    }
};

module.exports = {
    getMarkets,
    getMarketsByCategory,
    submitContactForm,
    getPromotions,
    getAccountTypes
};
