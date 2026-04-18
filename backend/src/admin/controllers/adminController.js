// controllers/adminController.js
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const Account = require('../../models/Account');
const KyCSubmission = require('../../models/KyCSubmission');
const FundingRequest = require('../../models/FundingRequest');
const Transaction = require('../../models/Transaction');
const AdminLog = require('../../models/AdminLog');
const Trade = require('../../models/Trade');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let users = [];
        
        if (role === 'admin' || role === 'super_admin') {
            users = await Admin.findAll();
            if (role) users = users.filter(u => u.role === role);
        } else if (role === 'client') {
            users = await User.findAll('client');
        } else {
            // Get both and merge
            const clients = await User.findAll('client');
            const admins = await Admin.findAll();
            users = [...clients, ...admins];
        }
        
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) user = await Admin.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get user accounts if client
        let accounts = [];
        if (user.role === 'client') {
            accounts = await Account.findByUserId(user.id);
        }

        res.json({
            success: true,
            data: { ...user, accounts }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, phone, country, is_active, role } = req.body;
        
        let user = await User.update(req.params.id, {
            firstName, lastName, phone, country, is_active
        });

        if (!user) {
            user = await Admin.update(req.params.id, {
                firstName, lastName, phone, country, is_active, role
            });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Log action
        await AdminLog.create(req.user.id, {
            action: 'UPDATE_USER',
            target_id: user.id,
            details: `Updated info for ${user.email} (${user.role})`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Adjust user balance or credit
// @route   POST /api/admin/users/:id/balance
// @access  Private/Admin
const adjustBalance = async (req, res) => {
    try {
        const { accountId, type, amount, description } = req.body;
        const userId = req.params.id;

        const account = await Account.findById(accountId);
        if (!account || account.user_id != userId) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        let result;
        const numAmount = parseFloat(amount);
        
        if (type === 'balance') {
            const newBalance = parseFloat(account.balance) + numAmount;
            result = await Account.updateBalance(accountId, newBalance);
            
            // Create transaction record
            await Transaction.create(userId, {
                account_id: accountId,
                type: numAmount >= 0 ? 'deposit' : 'withdrawal',
                amount: Math.abs(numAmount),
                balance_before: account.balance,
                balance_after: newBalance,
                description: description || `Admin adjustment: ${numAmount >= 0 ? 'Credit' : 'Debit'}`
            });
        } else if (type === 'credit') {
            const newCredit = parseFloat(account.credit) + numAmount;
            result = await Account.updateCredit(accountId, newCredit);
        }

        // Log action
        await AdminLog.create(req.user.id, {
            action: `ADJUST_${type.toUpperCase()}`,
            target_id: userId,
            details: `Adjusted ${type} by ${amount} for account ${account.account_number}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const clients = await User.findAll('client');
        const admins = await Admin.findAll();
        const kycPending = await KyCSubmission.findAll('pending');
        const fundingPending = await FundingRequest.findAll('pending');
        const openTrades = await Trade.findAllOpen();

        const stats = {
            totalUsers: clients.length,
            totalAdmins: admins.length,
            activeUsers: clients.filter(u => u.is_active).length,
            pendingKyc: kycPending.length,
            pendingFunding: fundingPending.length,
            openTrades: openTrades.length,
            totalDeposits: 0,
            totalBalance: 0,
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get KYC submissions
// @route   GET /api/admin/kyc
// @access  Private/Admin
const getKyCSubmissions = async (req, res) => {
    try {
        const { status } = req.query;
        const submissions = await KyCSubmission.findAll(status);
        res.json({ success: true, data: submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Process KYC submission
// @route   POST /api/admin/kyc/:id/process
// @access  Private/Admin
const processKYC = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const result = await KyCSubmission.updateStatus(req.params.id, {
            status,
            rejection_reason: reason,
            reviewed_by: req.user.id
        });

        // Log action
        await AdminLog.create(req.user.id, {
            action: 'PROCESS_KYC',
            target_id: result.user_id,
            details: `KYC ${status} for user ${result.user_id}. Reason: ${reason || 'N/A'}`,
            ip_address: req.ip
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get funding requests
// @route   GET /api/admin/funding
// @access  Private/Admin
const getFundingRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const requests = await FundingRequest.findAll(status);
        res.json({ success: true, data: requests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Process funding request
// @route   POST /api/admin/funding/:id/process
// @access  Private/Admin
const processFunding = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const request = await FundingRequest.findById(req.params.id);
        
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });

        const result = await FundingRequest.updateStatus(req.params.id, {
            status,
            rejection_reason: reason,
            processed_by: req.user.id
        });

        // If approved, update user balance
        if (status === 'approved') {
            const account = await Account.findById(request.account_id);
            const amount = parseFloat(request.amount);
            
            if (request.type === 'deposit') {
                const newBalance = parseFloat(account.balance) + amount;
                await Account.updateBalance(request.account_id, newBalance);
                await Transaction.create(request.user_id, {
                    account_id: request.account_id,
                    type: 'deposit',
                    amount: amount,
                    balance_before: account.balance,
                    balance_after: newBalance,
                    description: `Deposit via ${request.method} approved`,
                    reference_id: request.id
                });
            } else if (request.type === 'withdrawal') {
                // Withdrawal amount is usually already deducted or checked at request time
                // For completeness, if we didn't deduct at request time, do it now.
                // But typically we should have checked and reserved it.
            }
        }

        // Log action
        await AdminLog.create(req.user.id, {
            action: 'PROCESS_FUNDING',
            target_id: request.user_id,
            details: `Funding ${request.type} ${status}. Amount: ${request.amount}`,
            ip_address: req.ip
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get admin logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getAdminLogs = async (req, res) => {
    try {
        const logs = await AdminLog.findAll();
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        let user = await User.delete(req.params.id);
        if (!user) user = await Admin.delete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create admin user (by super admin)
// @route   POST /api/admin/users/admin
// @access  Private/Admin
const createAdmin = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, country, role } = req.body;

        // Check if exists in either table
        const userExists = await User.findByEmail(email);
        const adminExists = await Admin.findByEmail(email);
        if (userExists || adminExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await Admin.create({
            email,
            password,
            firstName,
            lastName,
            phone,
            country,
            role: role || 'admin'
        });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    adjustBalance,
    getDashboardStats,
    getKyCSubmissions,
    processKYC,
    getFundingRequests,
    processFunding,
    getAdminLogs,
    deleteUser,
    createAdmin
};