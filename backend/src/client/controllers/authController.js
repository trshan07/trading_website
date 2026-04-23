// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const Account = require('../../models/Account');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register new client
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, country } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // Check if user exists
        const userExists = await User.findByEmail(email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user as client
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
            // Generate accounts automatically for client
            await Account.create(user.id, 'demo');
            await Account.create(user.id, 'real');

            // Fetch the newly created accounts
            const accounts = await Account.findByUserId(user.id);

            res.status(201).json({
                success: true,
                data: {
                    _id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    accounts: accounts,
                    token: generateToken(user.id, user.role),
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Register new admin (protected route)
// @route   POST /api/auth/register-admin
// @access  Private/Admin
const registerAdmin = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, country } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // Check if user exists in either table
        const userExists = await User.findByEmail(email);
        const adminExists = await Admin.findByEmail(email);

        if (userExists || adminExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user as admin in the admins table
        const user = await Admin.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            country,
            role: 'admin'
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    token: generateToken(user.id, user.role),
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during admin registration' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
// backend/src/controllers/authController.js
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN] Attempt for: ${email}`);

        // Check for user in clients table first, then admins
        let user = await User.findByEmail(email);
        let isAdmin = false;

        if (!user) {
            user = await Admin.findByEmail(email);
            if (user) {
                isAdmin = true;
                console.log(`[LOGIN] Found in admins table: ${email}`);
            }
        } else {
            console.log(`[LOGIN] Found in users table: ${email}`);
        }

        if (!user) {
            console.log(`[LOGIN] User not found in either table: ${email}`);
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ 
                success: false,
                message: 'Account is deactivated. Please contact admin.' 
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        console.log(`[LOGIN] Password valid: ${isValidPassword}`);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Get accounts only for clients
        let accounts = [];
        if (user.role === 'client') {
            await Account.ensureAccounts(user.id); // Auto-repair missing accounts
            accounts = await Account.findByUserId(user.id);
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        res.json({
            success: true,
            data: {
                _id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                accounts: accounts,
                token: token,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login' 
        });
    }
};
// @desc    Demo login (creates temporary client)
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res) => {
    try {
        // Create a temporary guest user as client
        const guestId = Math.floor(100000 + Math.random() * 900000);
        const guestEmail = `guest_${guestId}@rizalstrade.demo`;
        const guestPassword = `guest_${guestId}`;

        const user = await User.create({
            email: guestEmail,
            password: guestPassword,
            firstName: 'Guest',
            lastName: `User #${guestId}`,
            phone: '0000000000',
            country: 'Demo',
            role: 'client',
            is_active: true
        });

        if (user) {
            await Account.create(user.id, 'demo');
            await Account.create(user.id, 'real');

            const accounts = await Account.findByUserId(user.id);

            res.status(201).json({
                success: true,
                data: {
                    _id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role,
                    accounts: accounts,
                    token: generateToken(user.id, user.role),
                    isGuest: true
                }
            });
        }
    } catch (error) {
        console.error('Demo Login Error:', error);
        res.status(500).json({ message: 'Failed to establish demo connection' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // In production, send email with reset link
        const resetToken = jwt.sign(
            { id: user.id, purpose: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);

        res.json({ 
            success: true,
            message: 'Password reset instructions sent to your email',
            resetToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.purpose !== 'password-reset') {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        await User.updatePassword(decoded.id, newPassword);

        res.json({ 
            success: true,
            message: 'Password has been reset successfully' 
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid reset token' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    registerAdmin,
    login,
    demoLogin,
    forgotPassword,
    resetPassword,
};
