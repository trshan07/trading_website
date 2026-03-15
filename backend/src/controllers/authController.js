const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Account = require('../models/Account');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register new client
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, country } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findByEmail(email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            country,
            role: 'client'
        });

        if (user) {
            // Generate accounts automatically
            await Account.create(user.id, 'demo');
            await Account.create(user.id, 'real');

            // Fetch the newly created accounts to return them
            const accounts = await Account.findByUserId(user.id);

            res.status(201).json({
                _id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                accounts: accounts,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const accounts = await Account.findByUserId(user.id);

            res.json({
                _id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                accounts: accounts,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Simulate Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // In a real app we'd save a resetToken to the DB and email it
        // For now, we simulate success and return a dummy token in DEV mode
        const dummyToken = `reset_${user.id}_${Date.now()}`;
        console.log(`[DEV ONLY] Password reset token for ${email}: ${dummyToken}`);

        res.json({ message: 'Password reset instructions sent (check console in Dev)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Simulate Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        // In reality, this would use the resetToken to find the user.
        // For the scoped requirement, we'll find by email and set new password directly
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.updatePassword(user.id, newPassword);

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    One-click Demo Login
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res) => {
    try {
        // Create a temporary guest user
        const guestId = Math.floor(100000 + Math.random() * 900000);
        const guestEmail = `guest_${guestId}@rizalstrade.demo`;
        const guestPassword = `guest_${guestId}`; // Not strictly needed for the session but keeps model happy

        const user = await User.create({
            email: guestEmail,
            password: guestPassword,
            firstName: 'Guest',
            lastName: `User #${guestId}`,
            phone: '0000000000',
            country: 'Demo',
            role: 'client'
        });

        if (user) {
            await Account.create(user.id, 'demo');
            await Account.create(user.id, 'real');

            const accounts = await Account.findByUserId(user.id);

            res.status(201).json({
                _id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                accounts: accounts,
                token: generateToken(user.id),
                isGuest: true
            });
        }
    } catch (error) {
        console.error('Demo Login Error:', error);
        res.status(500).json({ message: 'Failed to establish demo connection' });
    }
};

module.exports = {
    register,
    login,
    demoLogin,
    forgotPassword,
    resetPassword,
};
