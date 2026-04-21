const BankAccount = require('../../models/BankAccount');
const CreditCard = require('../../models/CreditCard');
const Transaction = require('../../models/Transaction');
const FundingRequest = require('../../models/FundingRequest');
const Account = require('../../models/Account');
const { createNotification } = require('./notificationController');
const { createActivityLog } = require('./activityController');

// --- Bank Account Methods ---

const getBankAccounts = async (req, res) => {
    try {
        const accounts = await BankAccount.findByUserId(req.user.id);
        res.json({ success: true, data: accounts });
    } catch (error) {
        console.error('Get Bank Accounts Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bank accounts' });
    }
};

const addBankAccount = async (req, res) => {
    try {
        const accountData = {
            ...req.body,
            proof_file: req.file ? req.file.path : null
        };
        const account = await BankAccount.create(req.user.id, accountData);
        
        await createActivityLog(req.user.id, 'SECURITY', `Linked Bank Account: ${req.body.bank_name}`);
        await createNotification(req.user.id, 'success', `Bank account ${req.body.bank_name} linked successfully.`);
        
        res.status(201).json({ success: true, data: account });
    } catch (error) {
        console.error('Add Bank Account Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add bank account' });
    }
};

const deleteBankAccount = async (req, res) => {
    try {
        await BankAccount.delete(req.params.id, req.user.id);
        res.json({ success: true, message: 'Bank account removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete bank account' });
    }
};

const setDefaultBankAccount = async (req, res) => {
    try {
        const account = await BankAccount.setDefault(req.user.id, req.params.id);
        res.json({ success: true, data: account });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to set default account' });
    }
};

// --- Credit Card Methods ---

const getCreditCards = async (req, res) => {
    try {
        const cards = await CreditCard.findByUserId(req.user.id);
        res.json({ success: true, data: cards });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch cards' });
    }
};

const addCreditCard = async (req, res) => {
    try {
        const card = await CreditCard.create(req.user.id, req.body);
        
        await createActivityLog(req.user.id, 'SECURITY', `Linked Credit Card: ****${req.body.last4}`);
        await createNotification(req.user.id, 'success', `Credit card ending in ${req.body.last4} linked.`);
        
        res.status(201).json({ success: true, data: card });
    } catch (error) {
        console.error('Add Credit Card Error:', error);
        res.status(500).json({ success: false, message: 'Failed to add card' });
    }
};

const deleteCreditCard = async (req, res) => {
    try {
        await CreditCard.delete(req.params.id, req.user.id);
        res.json({ success: true, message: 'Card removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete card' });
    }
};

// --- Transaction Methods ---

const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findByUserId(req.user.id);
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch transaction history' });
    }
};

const deposit = async (req, res) => {
    try {
        const { amount, method, accountId, reference } = req.body;
        
        // Use FundingRequest instead of direct Transaction for deposits
        const request = await FundingRequest.create({
            user_id: req.user.id,
            account_id: accountId,
            type: 'deposit',
            amount,
            method,
            proof_file: req.file ? req.file.path : null, // Handle via multer middleware
            bank_reference: reference
        });

        res.status(201).json({ 
            success: true, 
            message: 'Deposit request submitted for approval',
            data: request 
        });

        await createActivityLog(req.user.id, 'FUNDING', `Deposit Initiated: $${amount} via ${method}`);
        await createNotification(req.user.id, 'info', `Deposit of $${amount} is pending admin approval.`);
    } catch (error) {
        console.error('Deposit Error:', error);
        res.status(500).json({ success: false, message: 'Deposit failed' });
    }
};

const withdraw = async (req, res) => {
    try {
        const { amount, method, accountId } = req.body;
        
        // 1. Check balance
        const account = await Account.findById(accountId);
        
        if (!account || account.user_id !== req.user.id || parseFloat(account.balance) < parseFloat(amount)) {
            return res.status(400).json({ success: false, message: 'Insufficient funds or invalid account' });
        }

        // 2. Create funding request
        const request = await FundingRequest.create({
            user_id: req.user.id,
            account_id: accountId,
            type: 'withdrawal',
            amount,
            method
        });

        res.status(201).json({ 
            success: true, 
            message: 'Withdrawal request submitted',
            data: request 
        });

        await createActivityLog(req.user.id, 'FUNDING', `Withdrawal Requested: $${amount} via ${method}`);
        await createNotification(req.user.id, 'info', `Withdrawal of $${amount} has been requested.`);
    } catch (error) {
        console.error('Withdrawal Error:', error);
        res.status(500).json({ success: false, message: 'Withdrawal failed' });
    }
};

const transfer = async (req, res) => {
    try {
        const { amount, fromAccountId, toAccountId } = req.body;
        
        const accounts = await Account.findByUserId(req.user.id);
        const fromAccount = accounts.find(a => a.id == fromAccountId);
        const toAccount = accounts.find(a => a.id == toAccountId);

        if (!fromAccount || fromAccount.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient funds for transfer' });
        }

        // Processing transfer (atomic operation would be better)
        const newFromBalance = parseFloat(fromAccount.balance) - parseFloat(amount);
        const newToBalance = parseFloat(toAccount.balance) + parseFloat(amount);

        await Account.updateBalance(fromAccountId, newFromBalance);
        await Account.updateBalance(toAccountId, newToBalance);

        // Record locally for both accounts
        await Transaction.create(req.user.id, {
            account_id: fromAccountId,
            type: 'Transfer',
            amount: -parseFloat(amount),
            balance_before: parseFloat(fromAccount.balance),
            balance_after: newFromBalance,
            description: `Transfer to ${toAccount.account_type} account`
        });

        await Transaction.create(req.user.id, {
            account_id: toAccountId,
            type: 'Transfer',
            amount: parseFloat(amount),
            balance_before: parseFloat(toAccount.balance),
            balance_after: newToBalance,
            description: `Transfer from ${fromAccount.account_type} account`
        });

        res.json({ success: true, message: 'Transfer completed successfully' });

        await createActivityLog(req.user.id, 'FUNDING', `Internal Transfer: $${amount}`);
        await createNotification(req.user.id, 'success', `Successfully transferred $${amount} between accounts.`);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Transfer failed' });
    }
};

module.exports = {
    getBankAccounts,
    addBankAccount,
    deleteBankAccount,
    setDefaultBankAccount,
    getCreditCards,
    addCreditCard,
    deleteCreditCard,
    getTransactions,
    deposit,
    withdraw,
    transfer
};
