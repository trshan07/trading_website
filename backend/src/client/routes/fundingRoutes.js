// backend/src/routes/fundingRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getBankAccounts, 
    addBankAccount, 
    deleteBankAccount, 
    setDefaultBankAccount,
    getCreditCards,
    addCreditCard,
    deleteCreditCard,
    setDefaultCreditCard,
    getTransactions,
    deposit,
    withdraw,
    transfer
} = require('../controllers/fundingController');
const { getPlatformBankingInfo } = require('../controllers/platformController');
const { protect } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

router.use(protect); // All funding routes require authentication

// Bank Accounts
router.get('/bank-accounts', getBankAccounts);
router.post('/bank-accounts', upload.single('proofOfBankAccount'), addBankAccount);
router.delete('/bank-accounts/:id', deleteBankAccount);
router.patch('/bank-accounts/:id/default', setDefaultBankAccount);

// Credit Cards
router.get('/credit-cards', getCreditCards);
router.post('/credit-cards', addCreditCard);
router.delete('/credit-cards/:id', deleteCreditCard);
router.patch('/credit-cards/:id/default', setDefaultCreditCard);

// Transactions
router.get('/transactions', getTransactions);
router.post('/deposit', upload.single('proof'), deposit);
router.post('/withdraw', withdraw);
router.post('/transfer', transfer);

// Platform Info
router.get('/platform-info', getPlatformBankingInfo);

module.exports = router;
