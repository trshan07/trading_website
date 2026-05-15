// backend/src/controllers/userController.js
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const Account = require('../../models/Account');
const Settings = require('../../models/Settings');
const Position = require('../../models/Position');
const Transaction = require('../../models/Transaction');
const FundingRequest = require('../../models/FundingRequest');

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

// @desc    Get account overview
// @route   GET /api/users/account-overview
// @access  Private
const getAccountOverview = async (req, res) => {
    try {
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Admins do not have trading account overviews' });
        }

        await Account.ensureAccounts(req.user.id);
        const accounts = await Account.findByUserId(req.user.id);

        if (!accounts.length) {
            return res.status(404).json({ success: false, message: 'No accounts found' });
        }

        const requestedAccountId = req.query.accountId ? String(req.query.accountId) : null;
        const selectedAccount = requestedAccountId
            ? accounts.find((account) => String(account.id) === requestedAccountId)
            : accounts[0];

        if (!selectedAccount) {
            return res.status(404).json({ success: false, message: 'Requested account not found' });
        }

        const [openPositions, closedPositions, transactions, fundingRequests] = await Promise.all([
            Position.findByAccountId(selectedAccount.id, 'open'),
            Position.findByAccountId(selectedAccount.id, 'closed'),
            Transaction.findByAccountId(selectedAccount.id, 100),
            FundingRequest.findByUserId(req.user.id),
        ]);

        const scopedFundingRequests = fundingRequests.filter((request) => String(request.account_id) === String(selectedAccount.id));
        const totalBalance = (Number.parseFloat(selectedAccount.balance) || 0) + (Number.parseFloat(selectedAccount.credit) || 0);
        const usedMargin = openPositions.reduce((sum, position) => sum + (Number.parseFloat(position.margin) || 0), 0);
        const unrealizedPnl = openPositions.reduce((sum, position) => sum + (Number.parseFloat(position.pnl) || 0), 0);
        const realizedPnl = closedPositions.reduce((sum, position) => sum + (Number.parseFloat(position.pnl) || 0), 0);
        const totalPnl = realizedPnl + unrealizedPnl;
        const equity = totalBalance + unrealizedPnl;
        const freeMargin = equity - usedMargin;
        const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;

        const normalizedTransactions = [
            ...transactions.map((entry) => ({
                ...entry,
                source_type: 'transaction',
                status: 'completed',
                reference: entry.reference_id || entry.reference || '-',
            })),
            ...scopedFundingRequests.map((entry) => ({
                ...entry,
                source_type: 'funding_request',
                reference: entry.bank_reference || entry.reference || '-',
            })),
        ].sort((left, right) => new Date(right.created_at) - new Date(left.created_at));

        const deposits = normalizedTransactions.filter((entry) => String(entry.type || '').toLowerCase() === 'deposit');
        const withdrawals = normalizedTransactions.filter((entry) => String(entry.type || '').toLowerCase() === 'withdrawal');

        res.json({
            success: true,
            data: {
                account: {
                    id: selectedAccount.id,
                    accountNumber: selectedAccount.account_number,
                    accountType: selectedAccount.account_type,
                    currency: selectedAccount.currency,
                    leverage: selectedAccount.leverage,
                },
                metrics: {
                    totalBalance,
                    equity,
                    freeMargin,
                    usedMargin,
                    marginLevel,
                    credit: Number.parseFloat(selectedAccount.credit) || 0,
                    realizedPnl,
                    unrealizedPnl,
                    totalPnl,
                },
                totals: {
                    depositsCount: deposits.length,
                    withdrawalsCount: withdrawals.length,
                    openPositionsCount: openPositions.length,
                    closedTradesCount: closedPositions.length,
                    depositAmount: deposits.reduce((sum, entry) => sum + Math.abs(Number.parseFloat(entry.amount) || 0), 0),
                    withdrawalAmount: withdrawals.reduce((sum, entry) => sum + Math.abs(Number.parseFloat(entry.amount) || 0), 0),
                },
                recentTransactions: normalizedTransactions.slice(0, 8),
                deposits: deposits.slice(0, 6),
                withdrawals: withdrawals.slice(0, 6),
            }
        });
    } catch (error) {
        console.error('Get Account Overview Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch account overview' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getSettings,
    updateSettings,
    getAccountOverview
};
