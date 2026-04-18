// backend/src/controllers/userController.js
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const Account = require('../../models/Account');
const Settings = require('../../models/Settings');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        // Use the user already attached to the request by the protect middleware
        const user = req.user;
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get user accounts/settings only for clients
        let accounts = [];
        let settings = null;
        
        if (user.role === 'client') {
            // Auto-repair missing accounts if needed
            await Account.ensureAccounts(user.id);
            accounts = await Account.findByUserId(user.id);
            // Get user settings
            settings = await Settings.findByUserId(user.id);
        }

        res.json({
            success: true,
            data: {
                ...user,
                accounts,
                settings
            }
        });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, country } = req.body;
        
        let updatedUser;
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            updatedUser = await Admin.update(req.user.id, { firstName, lastName, phone, country });
        } else {
            updatedUser = await User.update(req.user.id, { firstName, lastName, phone, country });
        }

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
        }

        let user;
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            user = await Admin.findByEmail(req.user.email);
        } else {
            user = await User.findByEmail(req.user.email);
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            await Admin.updatePassword(req.user.id, newPassword);
        } else {
            await User.updatePassword(req.user.id, newPassword);
        }

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
const getSettings = async (req, res) => {
    try {
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            return res.json({ success: true, data: null });
        }
        const settings = await Settings.findByUserId(req.user.id);
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
    try {
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Admins do not have trading settings' });
        }
        const settings = await Settings.update(req.user.id, req.body);
        res.json({ success: true, message: 'Settings updated', data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getSettings,
    updateSettings
};
