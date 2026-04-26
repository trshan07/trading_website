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
const { normalizeStoredUploadPath } = require('../../utils/uploadPath');

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
    }
    return value;
};

const paginate = (items, page = 1, limit = 10) => {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const start = (safePage - 1) * safeLimit;

    return {
        page: safePage,
        limit: safeLimit,
        total: items.length,
        items: items.slice(start, start + safeLimit)
    };
};

const mapUserName = (user) =>
    `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown User';

const attachAccountsAndHistory = async (user) => {
    const accounts = await Account.findByUserId(user.id);
    const realAcc = accounts.find((account) => account.account_type === 'real') || {};
    const demoAcc = accounts.find((account) => account.account_type === 'demo') || {};
    const logs = await AdminLog.findByTargetId(user.id);

    const creditHistory = logs
        .filter((log) => log.action === 'ADJUST_CREDIT')
        .map((log) => {
            const match = log.details.match(/by\s+([-0-9.]+)\s+for\s+account\s+(.+)/i);
            const amount = match ? parseFloat(match[1]) : 0;
            const accountLabel = match ? match[2] : 'unknown';

            return {
                id: log.id,
                amount: Math.abs(amount),
                type: amount >= 0 ? 'credit' : 'debit',
                account: accountLabel.toLowerCase().includes('rl') ? 'real' : 'demo',
                note: log.details,
                date: log.created_at
            };
        });

    const status = user.is_active === false ? 'suspended' : 'active';

    return {
        ...user,
        name: mapUserName(user),
        status,
        balance: toNumber(realAcc.balance) + toNumber(demoAcc.balance),
        realBalance: toNumber(realAcc.balance),
        demoBalance: toNumber(demoAcc.balance),
        realCredit: toNumber(realAcc.credit),
        demoCredit: toNumber(demoAcc.credit),
        realAccountId: realAcc.id || null,
        demoAccountId: demoAcc.id || null,
        realAccountNumber: realAcc.account_number || null,
        demoAccountNumber: demoAcc.account_number || null,
        leverage: realAcc.leverage || demoAcc.leverage || 50,
        accounts,
        creditHistory
    };
};

const findAdjustableAccount = async (userId, accountId) => {
    if (accountId) {
        const account = await Account.findById(accountId);
        if (account && String(account.user_id) === String(userId)) {
            return account;
        }
    }

    const accounts = await Account.findByUserId(userId);
    return accounts.find((account) => account.account_type === 'real')
        || accounts.find((account) => account.account_type === 'demo')
        || null;
};

const createCsv = (rows, headers) => {
    const escape = (value) => {
        const text = value == null ? '' : String(value);
        if (/[",\n]/.test(text)) {
            return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
    };

    const headerLine = headers.map((header) => escape(header.label)).join(',');
    const lines = rows.map((row) => headers.map((header) => escape(row[header.key])).join(','));

    return [headerLine, ...lines].join('\n');
};

const sendCsv = (res, filename, csv) => {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let users = [];

        if (role === 'admin' || role === 'super_admin') {
            users = await Admin.findAll();
            if (role) users = users.filter((user) => user.role === role);
        } else {
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

        if (search) {
            const needle = search.toLowerCase();
            users = users.filter((user) => {
                const name = mapUserName(user).toLowerCase();
                return name.includes(needle) || String(user.email || '').toLowerCase().includes(needle);
            });
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

// @desc    Create client user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            name,
            phone,
            country,
            role,
            status,
            is_active,
            initialBalance
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const existingUser = await User.findByEmail(email);
        const existingAdmin = await Admin.findByEmail(email);
        if (existingUser || existingAdmin) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const [parsedFirstName = '', ...lastParts] = String(name || '').trim().split(/\s+/).filter(Boolean);
        const payload = {
            email,
            password,
            firstName: firstName || parsedFirstName || 'Client',
            lastName: lastName || lastParts.join(' ') || 'User',
            phone,
            country,
            role: role === 'client' || role === 'user' || !role ? 'client' : role,
            is_active: is_active != null ? toBoolean(is_active) : status !== 'suspended'
        };

        const user = await User.create(payload);
        await Account.ensureAccounts(user.id);

        const balanceAmount = toNumber(initialBalance, 0);
        if (balanceAmount > 0) {
            const account = await findAdjustableAccount(user.id);
            if (account) {
                const updatedAccount = await Account.updateBalance(account.id, toNumber(account.balance) + balanceAmount);
                await Transaction.create(user.id, {
                    account_id: updatedAccount.id,
                    type: 'deposit',
                    amount: balanceAmount,
                    balance_before: account.balance,
                    balance_after: updatedAccount.balance,
                    description: 'Initial balance assigned during admin user creation'
                });
            }
        }

        await AdminLog.create(req.user.id, {
            action: 'CREATE_USER',
            target_id: user.id,
            details: `Created client user ${user.email}`,
            ip_address: req.ip
        });

        const createdUser = await attachAccountsAndHistory({
            ...user,
            phone,
            country,
            role: payload.role,
            is_active: payload.is_active
        });

        res.status(201).json({
            success: true,
            data: createdUser
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

        let payload = user;
        if (user.role === 'client') {
            payload = await attachAccountsAndHistory(user);
        }

        res.json({
            success: true,
            data: payload
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
        const body = req.body || {};
        const fullName = String(body.name || '').trim();
        const [parsedFirstName = '', ...lastParts] = fullName.split(/\s+/).filter(Boolean);

        const firstName = body.firstName || parsedFirstName || body.first_name;
        const lastName = body.lastName || lastParts.join(' ') || body.last_name;
        const phone = body.phone;
        const country = body.country;
        const is_active = body.is_active != null
            ? toBoolean(body.is_active)
            : body.status
                ? body.status !== 'suspended'
                : undefined;
        const role = body.role;

        let user = await User.update(req.params.id, {
            firstName,
            lastName,
            phone,
            country,
            is_active
        });

        if (!user) {
            user = await Admin.update(req.params.id, {
                firstName,
                lastName,
                phone,
                country,
                is_active,
                role
            });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

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

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        const isActive = status === 'active';

        let user = await User.update(req.params.id, { is_active: isActive });
        if (!user) {
            user = await Admin.update(req.params.id, { is_active: isActive });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await AdminLog.create(req.user.id, {
            action: 'UPDATE_USER_STATUS',
            target_id: user.id,
            details: `Set status to ${status} for ${user.email}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            data: {
                ...user,
                status
            }
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
        const { accountId, type, amount, description, reason } = req.body;
        const userId = req.params.id;
        const account = await findAdjustableAccount(userId, accountId);

        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        const requestedAmount = toNumber(amount);
        if (!requestedAmount) {
            return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
        }

        const normalizedType = String(type || 'balance').toLowerCase();
        const label = description || reason || 'Admin balance adjustment';

        if (normalizedType === 'credit' || normalizedType === 'debit') {
            const signedCredit = normalizedType === 'debit'
                ? -Math.abs(requestedAmount)
                : Math.abs(requestedAmount);
            const nextCredit = toNumber(account.credit) + signedCredit;

            if (nextCredit < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient credit available for this adjustment'
                });
            }

            const updatedAccount = await Account.updateCredit(account.id, nextCredit);

            await AdminLog.create(req.user.id, {
                action: 'ADJUST_CREDIT',
                target_id: userId,
                details: `Adjusted credit by ${signedCredit} for account ${account.account_number}`,
                ip_address: req.ip
            });

            return res.json({
                success: true,
                data: updatedAccount
            });
        }

        const signedAmount = normalizedType === 'subtract' ? -Math.abs(requestedAmount) : Math.abs(requestedAmount);
        const nextBalance = toNumber(account.balance) + signedAmount;

        const updatedAccount = await Account.updateBalance(account.id, nextBalance);
        await Transaction.create(userId, {
            account_id: account.id,
            type: signedAmount >= 0 ? 'deposit' : 'withdrawal',
            amount: Math.abs(signedAmount),
            balance_before: account.balance,
            balance_after: nextBalance,
            description: label
        });

        await AdminLog.create(req.user.id, {
            action: 'ADJUST_BALANCE',
            target_id: userId,
            details: `Adjusted balance by ${signedAmount} for account ${account.account_number}`,
            ip_address: req.ip
        });

        res.json({
            success: true,
            data: updatedAccount
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
            `)
        ]);

        const stats = {
            totalUsers: clients.length,
            totalAdmins: admins.length,
            activeUsers: clients.filter((user) => user.is_active).length,
            pendingKyc: kycPending.length,
            pendingFunding: fundingPending.length,
            openTrades: openTrades.length,
            totalBalance: toNumber(totals.rows[0]?.total_balance),
            totalCredit: toNumber(totals.rows[0]?.total_credit),
            totalTrades: parseInt(totals.rows[0]?.total_trades || 0, 10),
            totalVolume: toNumber(totals.rows[0]?.total_volume)
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

// @desc    Get growth stats
// @route   GET /api/admin/growth-stats
// @access  Private/Admin
const getGrowthStats = async (req, res) => {
    try {
        const userGrowth = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon') as m,
                COUNT(*) as u
            FROM users
            WHERE created_at > CURRENT_DATE - INTERVAL '7 months'
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `);

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

        const grouped = submissions.reduce((acc, submission) => {
            if (!acc[submission.user_id]) {
                acc[submission.user_id] = {
                    id: submission.user_id,
                    name: `${submission.first_name || ''} ${submission.last_name || ''}`.trim() || submission.user_email,
                    email: submission.user_email,
                    kyc: 'pending',
                    kycSubmitted: submission.created_at,
                    kycReviewedAt: submission.reviewed_at,
                    kycDocs: []
                };
            }

            acc[submission.user_id].kycDocs.push({
                id: submission.id,
                type: submission.document_type || 'passport',
                label: (submission.document_type || 'Document').charAt(0).toUpperCase() + (submission.document_type || 'Document').slice(1),
                file: normalizeStoredUploadPath(submission.file_path),
                status: submission.status,
                uploadedAt: submission.created_at,
                rejectReason: submission.rejection_reason
            });

            const statuses = acc[submission.user_id].kycDocs.map((doc) => doc.status);
            if (statuses.includes('rejected')) acc[submission.user_id].kyc = 'rejected';
            else if (statuses.includes('pending')) acc[submission.user_id].kyc = 'pending';
            else if (statuses.includes('under_review')) acc[submission.user_id].kyc = 'under_review';
            else if (statuses.every((value) => value === 'approved' || value === 'verified')) acc[submission.user_id].kyc = 'verified';

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

        const mappedRequests = rawRequests.map((request) => {
            const isDemo = request.account_number && request.account_number.startsWith('DM');
            return {
                id: request.id,
                userId: request.user_id,
                userName: `${request.first_name || ''} ${request.last_name || ''}`.trim() || request.user_email,
                userEmail: request.user_email,
                type: request.type,
                amount: toNumber(request.amount),
                method: request.method,
                bankRef: request.bank_reference,
                proof: normalizeStoredUploadPath(request.proof_file),
                proofImage: normalizeStoredUploadPath(request.proof_file),
                status: request.status,
                created: request.created_at,
                createdAt: request.created_at,
                updatedAt: request.processed_at || request.updated_at || request.created_at,
                processedAccount: isDemo ? 'demo' : 'real',
                note: request.rejection_reason || '',
                rejectionReason: request.rejection_reason || ''
            };
        });

        res.json({ success: true, data: mappedRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Export funding requests
// @route   GET /api/admin/funding/export
// @access  Private/Admin
const exportFundingRequests = async (req, res) => {
    try {
        const requests = await FundingRequest.findAll(req.query.status);
        const csv = createCsv(
            requests.map((request) => ({
                id: request.id,
                user_email: request.user_email,
                type: request.type,
                amount: request.amount,
                method: request.method,
                status: request.status,
                created_at: request.created_at
            })),
            [
                { key: 'id', label: 'ID' },
                { key: 'user_email', label: 'User Email' },
                { key: 'type', label: 'Type' },
                { key: 'amount', label: 'Amount' },
                { key: 'method', label: 'Method' },
                { key: 'status', label: 'Status' },
                { key: 'created_at', label: 'Created At' }
            ]
        );

        sendCsv(res, 'funding-requests.csv', csv);
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

        if (status === 'approved') {
            const account = await Account.findById(request.account_id);
            const amount = toNumber(request.amount);

            if (request.type === 'deposit') {
                const newBalance = toNumber(account.balance) + amount;
                await Account.updateBalance(request.account_id, newBalance);
                await Transaction.create(request.user_id, {
                    account_id: request.account_id,
                    type: 'deposit',
                    amount,
                    balance_before: account.balance,
                    balance_after: newBalance,
                    description: `Deposit via ${request.method} approved`,
                    reference_id: request.id
                });
            }
        }

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

// @desc    Get all trades
// @route   GET /api/admin/trades
// @access  Private/Admin
const getTrades = async (req, res) => {
    try {
        const { status } = req.query;
        const rawTrades = await Trade.findAll(status);

        const mappedTrades = rawTrades.map((trade) => {
            const normalizedStatus = trade.status === 'open'
                ? 'pending'
                : trade.status === 'closed'
                    ? 'completed'
                    : trade.status;
            const amount = toNumber(trade.amount);
            const price = toNumber(trade.entry_price);

            return {
                id: trade.id,
                userId: trade.user_id,
                userName: `${trade.first_name || ''} ${trade.last_name || ''}`.trim() || trade.user_email,
                userEmail: trade.user_email,
                pair: trade.symbol,
                symbol: trade.symbol,
                type: String(trade.side || '').toUpperCase(),
                amount,
                lots: amount,
                price,
                openPrice: price,
                closePrice: trade.exit_price ? toNumber(trade.exit_price) : null,
                total: amount * price,
                swap: 0,
                profit: toNumber(trade.pnl),
                status: normalizedStatus,
                createdAt: trade.created_at,
                updatedAt: trade.updated_at || trade.created_at,
                completedAt: normalizedStatus === 'completed' ? (trade.updated_at || trade.created_at) : null,
                opened: trade.created_at,
                accountNumber: trade.account_number
            };
        });

        res.json({ success: true, data: mappedTrades });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get trade stats
// @route   GET /api/admin/trades/stats
// @access  Private/Admin
const getTradeStats = async (req, res) => {
    try {
        const [aggregate, volumeRows] = await Promise.all([
            db.query(`
                SELECT
                    COUNT(*)::int AS total_trades,
                    COALESCE(SUM(quantity), 0) AS total_volume,
                    COUNT(*) FILTER (WHERE status = 'open')::int AS active_trades,
                    COUNT(*) FILTER (WHERE status = 'closed')::int AS completed_trades
                FROM positions
            `),
            db.query(`
                SELECT TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') AS date,
                       COALESCE(SUM(quantity), 0) AS volume
                FROM positions
                WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
                GROUP BY DATE_TRUNC('day', created_at)
                ORDER BY DATE_TRUNC('day', created_at)
            `)
        ]);

        const row = aggregate.rows[0] || {};
        const completedTrades = parseInt(row.completed_trades || 0, 10);
        const totalTrades = parseInt(row.total_trades || 0, 10);

        res.json({
            success: true,
            data: {
                totalTrades,
                totalVolume: toNumber(row.total_volume),
                activeTrades: parseInt(row.active_trades || 0, 10),
                successRate: totalTrades ? (completedTrades / totalTrades) * 100 : 0,
                volumeData: volumeRows.rows.map((item) => ({
                    date: item.date,
                    volume: toNumber(item.volume)
                }))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Cancel a trade
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

// @desc    Get transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT t.id,
                   t.user_id,
                   t.account_id,
                   t.type,
                   t.amount,
                   t.balance_before,
                   t.balance_after,
                   t.reference_id,
                   t.description,
                   t.created_at,
                   u.email AS user_email,
                   u.first_name,
                   u.last_name,
                   a.account_number,
                   fr.method,
                   fr.status AS funding_status,
                   fr.processed_at
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN accounts a ON t.account_id = a.id
            LEFT JOIN funding_requests fr ON t.reference_id = fr.id
            ORDER BY t.created_at DESC
        `);

        const mapped = rows.map((transaction) => ({
            id: transaction.id,
            userId: transaction.user_id,
            userName: `${transaction.first_name || ''} ${transaction.last_name || ''}`.trim() || transaction.user_email,
            userEmail: transaction.user_email,
            type: transaction.type,
            amount: toNumber(transaction.amount),
            status: transaction.funding_status || 'completed',
            method: transaction.method || 'internal',
            reference: transaction.reference_id || null,
            notes: transaction.description || '',
            accountNumber: transaction.account_number || null,
            createdAt: transaction.created_at,
            updatedAt: transaction.processed_at || transaction.created_at
        }));

        res.json({ success: true, data: mapped });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get transaction stats
// @route   GET /api/admin/transactions/stats
// @access  Private/Admin
const getTransactionStats = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT
                COUNT(*)::int AS total_transactions,
                COALESCE(SUM(amount), 0) AS total_volume,
                COUNT(*) FILTER (WHERE fr.status = 'pending')::int AS pending_transactions
            FROM transactions t
            LEFT JOIN funding_requests fr ON t.reference_id = fr.id
        `);

        const stats = rows[0] || {};
        res.json({
            success: true,
            data: {
                totalTransactions: parseInt(stats.total_transactions || 0, 10),
                totalVolume: toNumber(stats.total_volume),
                pendingTransactions: parseInt(stats.pending_transactions || 0, 10)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Export transactions
// @route   GET /api/admin/transactions/export
// @access  Private/Admin
const exportTransactions = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT t.id, u.email AS user_email, t.type, t.amount, t.description, t.created_at
            FROM transactions t
            JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        `);

        const csv = createCsv(rows, [
            { key: 'id', label: 'ID' },
            { key: 'user_email', label: 'User Email' },
            { key: 'type', label: 'Type' },
            { key: 'amount', label: 'Amount' },
            { key: 'description', label: 'Description' },
            { key: 'created_at', label: 'Created At' }
        ]);

        sendCsv(res, 'transactions.csv', csv);
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

// @desc    Export admin logs
// @route   GET /api/admin/logs/export
// @access  Private/Admin
const exportAdminLogs = async (req, res) => {
    try {
        const logs = await AdminLog.findAll();
        const csv = createCsv(logs, [
            { key: 'id', label: 'ID' },
            { key: 'admin_email', label: 'Admin Email' },
            { key: 'action', label: 'Action' },
            { key: 'target_id', label: 'Target ID' },
            { key: 'details', label: 'Details' },
            { key: 'created_at', label: 'Created At' }
        ]);

        sendCsv(res, 'admin-logs.csv', csv);
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

// @desc    Reset a user's password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
const resetUserPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        let user = await User.updatePassword(req.params.id, password);
        if (!user) {
            user = await Admin.updatePassword(req.params.id, password);
        }

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

// @desc    Create admin user
// @route   POST /api/admin/users/admin
// @access  Private/Admin
const createAdmin = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, country, role, status, is_active } = req.body;

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
            role: role || 'admin',
            is_active: is_active != null ? toBoolean(is_active) : status !== 'suspended'
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
        let admin = req.user;

        if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
            admin = await Admin.findById(req.user.id);
        }

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
    createUser,
    getUser,
    updateUser,
    updateUserStatus,
    adjustBalance,
    resetUserPassword,
    getDashboardStats,
    getAdminProfile,
    getKyCSubmissions,
    processKYC,
    getFundingRequests,
    exportFundingRequests,
    processFunding,
    getTrades,
    getTradeStats,
    cancelTrade,
    getTransactions,
    getTransactionStats,
    exportTransactions,
    getSettings,
    updateSettings,
    getGrowthStats,
    getAdminLogs,
    exportAdminLogs,
    deleteUser,
    createAdmin
};
