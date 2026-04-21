// controllers/adminController.js
const db = require('../../config/database');
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const Account = require('../../models/Account');
const KyCSubmission = require('../../models/KyCSubmission');
const FundingRequest = require('../../models/FundingRequest');
const Transaction = require('../../models/Transaction');
const AdminLog = require('../../models/AdminLog');
const Trade = require('../../models/Trade');
const PlatformSettings = require('../../models/PlatformSettings');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let users = [];
        
        const attachAccountsAndHistory = async (u) => {
            const accounts = await Account.findByUserId(u.id);
            const realAcc = accounts.find(a => a.account_type === 'real') || {};
            const demoAcc = accounts.find(a => a.account_type === 'demo') || {};
            
            // Fetch credit history from AdminLogs
            const logs = await AdminLog.findByTargetId(u.id);
            const creditHistory = logs
                .filter(log => log.action === 'ADJUST_CREDIT')
                .map(log => {
                    // details: "Adjusted credit by 500 for account RL-123"
                    const match = log.details.match(/by\s+([-0-9.]+)\s+for\s+account\s+(.+)/i);
                    const amt = match ? parseFloat(match[1]) : 0;
                    const accountStr = match ? match[2] : 'unknown';
                    return {
                        id: log.id,
                        amount: Math.abs(amt),
                        type: amt >= 0 ? 'credit' : 'debit',
                        account: accountStr.toLowerCase().includes('rl') ? 'real' : 'demo',
                        note: log.details,
                        date: log.created_at
                    };
                });

            return {
                ...u,
                realBalance: parseFloat(realAcc.balance) || 0,
                demoBalance: parseFloat(demoAcc.balance) || 0,
                realCredit: parseFloat(realAcc.credit) || 0,
                demoCredit: parseFloat(demoAcc.credit) || 0,
                realAccountId: realAcc.account_number || null,
                demoAccountId: demoAcc.account_number || null,
                leverage: realAcc.leverage || demoAcc.leverage || 50,
                accountType: realAcc.account_type ? 'Real' : 'Demo',
                accounts,
                creditHistory
            };
        };

        if (role === 'admin' || role === 'super_admin') {
            users = await Admin.findAll();
            if (role) users = users.filter(u => u.role === role);
        } else {
            // Fetch clients with their latest KYC status
            const { rows: rawClients } = await db.query(`
                SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.country, u.role, u.is_active, u.created_at,
                       k.status as kyc_status, k.created_at as kyc_submitted_at
                FROM users u
                LEFT JOIN (
                    SELECT DISTINCT ON (user_id) user_id, status, created_at
                    FROM kyc_submissions
                    ORDER BY user_id, created_at DESC
                ) k ON u.id = k.user_id
                WHERE u.role = 'client'
                ORDER BY u.created_at DESC
            `);
            
            const clients = await Promise.all(rawClients.map(attachAccountsAndHistory));
            
            if (role === 'client') {
                users = clients;
            } else {
                const admins = await Admin.findAll();
                users = [...clients, ...admins];
            }
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
// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const [
            clients,
            admins,
            kycPending,
            fundingPending,
            openTrades,
            totals
        ] = await Promise.all([
            User.findAll('client'),
            Admin.findAll(),
            KyCSubmission.findAll('pending'),
            FundingRequest.findAll('pending'),
            Trade.findAll('open'),
            db.query(`
                SELECT 
                    (SELECT SUM(balance) FROM accounts) as total_balance,
                    (SELECT SUM(credit) FROM accounts) as total_credit,
                    (SELECT COUNT(*) FROM positions) as total_trades,
                    (SELECT SUM(quantity) FROM positions) as total_volume
                FROM users LIMIT 1
            `)
        ]);

        const stats = {
            totalUsers: clients.length,
            totalAdmins: admins.length,
            activeUsers: clients.filter(u => u.is_active).length,
            pendingKyc: kycPending.length,
            pendingFunding: fundingPending.length,
            openTrades: openTrades.length,
            totalBalance: parseFloat(totals.rows[0].total_balance || 0),
            totalCredit: parseFloat(totals.rows[0].total_credit || 0),
            totalTrades: parseInt(totals.rows[0].total_trades || 0),
            totalVolume: parseFloat(totals.rows[0].total_volume || 0)
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

// @desc    Get growth stats (User growth and Trading volume)
// @route   GET /api/admin/growth-stats
// @access  Private/Admin
const getGrowthStats = async (req, res) => {
    try {
        // Last 7 months user growth
        const userGrowth = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon') as m,
                COUNT(*) as u
            FROM users
            WHERE created_at > CURRENT_DATE - INTERVAL '7 months'
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `);

        // Last 7 months trading volume
        const tradingVolume = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon') as m,
                SUM(quantity) as v
            FROM positions
            WHERE created_at > CURRENT_DATE - INTERVAL '7 months'
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `);

        res.json({
            success: true,
            data: {
                userGrowth: userGrowth.rows,
                tradingVolume: tradingVolume.rows
            }
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
        
        // Group by user
        const grouped = submissions.reduce((acc, s) => {
            if (!acc[s.user_id]) {
                acc[s.user_id] = {
                    id: s.user_id,
                    name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.user_email,
                    email: s.user_email,
                    kyc: 'pending', // Will calculate below
                    kycSubmitted: s.created_at,
                    kycReviewedAt: s.reviewed_at,
                    kycDocs: []
                };
            }
            
            acc[s.user_id].kycDocs.push({
                id: s.id,
                type: s.document_type || 'passport',
                label: (s.document_type || 'Document').charAt(0).toUpperCase() + (s.document_type || 'Document').slice(1),
                file: s.file_path,
                status: s.status,
                uploadedAt: s.created_at,
                rejectReason: s.rejection_reason
            });
            
            // If any doc is under_review or pending, the whole thing is
            const statuses = acc[s.user_id].kycDocs.map(d => d.status);
            if (statuses.includes('rejected')) acc[s.user_id].kyc = 'rejected';
            else if (statuses.includes('pending')) acc[s.user_id].kyc = 'pending';
            else if (statuses.includes('under_review')) acc[s.user_id].kyc = 'under_review';
            else if (statuses.every(st => st === 'approved' || st === 'verified')) acc[s.user_id].kyc = 'verified';
            
            return acc;
        }, {});

        res.json({ success: true, data: Object.values(grouped) });
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
        const rawRequests = await FundingRequest.findAll(status);
        
        const mappedRequests = rawRequests.map(f => {
            const isDemo = f.account_number && f.account_number.startsWith('DM');
            return {
                id: f.id,
                userId: f.user_id,
                userName: `${f.first_name || ''} ${f.last_name || ''}`.trim() || f.user_email,
                type: f.type,
                amount: parseFloat(f.amount),
                method: f.method,
                bankRef: f.bank_reference,
                proof: f.proof_file,
                status: f.status,
                created: f.created_at,
                processedAccount: isDemo ? 'demo' : 'real',
                note: f.rejection_reason || ''
            };
        });

        res.json({ success: true, data: mappedRequests });
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

// @desc    Get all trades (admin)
// @route   GET /api/admin/trades
// @access  Private/Admin
const getTrades = async (req, res) => {
    try {
        const { status } = req.query;
        const rawTrades = await Trade.findAll(status);

        const mappedTrades = rawTrades.map(t => ({
            id: t.id,
            userId: t.user_id,
            userName: `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.user_email,
            symbol: t.symbol,
            type: t.side,          // DB: side -> UI: type (buy/sell direction)
            lots: parseFloat(t.amount),
            openPrice: parseFloat(t.entry_price),
            closePrice: t.exit_price ? parseFloat(t.exit_price) : null,
            swap: 0,               // not tracked in current schema, default 0
            profit: parseFloat(t.pnl) || 0,
            status: t.status,
            opened: t.created_at,
            accountNumber: t.account_number
        }));

        res.json({ success: true, data: mappedTrades });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Cancel a trade (admin)
// @route   POST /api/admin/trades/:id/cancel
// @access  Private/Admin
const cancelTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
        if (trade.status !== 'open') return res.status(400).json({ success: false, message: 'Trade is not open' });

        const cancelled = await Trade.cancel(req.params.id);

        await AdminLog.create(req.user.id, {
            action: 'CANCEL_TRADE',
            target_id: trade.user_id,
            details: `Cancelled trade #${trade.id} (${trade.symbol} ${trade.side})`,
            ip_address: req.ip
        });

        res.json({ success: true, data: cancelled });
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

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        const settings = await PlatformSettings.getAll();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        await PlatformSettings.updateBatch(req.body);
        
        await AdminLog.create(req.user.id, {
            action: 'UPDATE_SETTINGS',
            target_id: null,
            details: `Updated platform settings: ${Object.keys(req.body).join(', ')}`,
            ip_address: req.ip
        });

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reset a user's password (Admin)
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
const resetUserPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const user = await User.updatePassword(req.params.id, password);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await AdminLog.create(req.user.id, {
            action: 'RESET_PASSWORD',
            target_id: req.params.id,
            details: `Password reset for user ${user.email}`,
            ip_address: req.ip
        });

        res.json({ success: true, message: 'Password reset successfully' });
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

// @desc    Get own admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }
        res.json({
            success: true,
            data: {
                id: admin.id,
                email: admin.email,
                firstName: admin.first_name,
                lastName: admin.last_name,
                phone: admin.phone,
                country: admin.country,
                role: admin.role,
                is_active: admin.is_active,
                created_at: admin.created_at
            }
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
    resetUserPassword,
    getDashboardStats,
    getAdminProfile,
    getKyCSubmissions,
    processKYC,
    getFundingRequests,
    processFunding,
    getTrades,
    cancelTrade,
    getSettings,
    updateSettings,
    getGrowthStats,
    getAdminLogs,
    deleteUser,
    createAdmin
};