// frontend/src/components/client/BankingTab.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaWallet, FaExchangeAlt, FaMoneyBillWave, FaLandmark,
  FaCreditCard, FaMobileAlt, FaHistory, FaArrowRight,
  FaPlus, FaDownload, FaFileInvoice, FaUniversity,
  FaCheck, FaTimes, FaEye, FaTrash, FaEdit,
  FaPaypal, FaBitcoin, FaArrowUp, FaArrowDown,
  FaShieldAlt, FaCcVisa, FaCcMastercard, FaCcAmex,
  FaCcDiscover, FaCalendarAlt, FaUser, FaBuilding,
  FaIdCard, FaHome, FaPhone, FaEnvelope, FaBars, FaUpload
} from 'react-icons/fa';
import {
  BANK_ACCOUNT_TYPES,
  BANK_WIZARD_STEPS,
  BANKING_TABS,
  BENEFICIARY_RELATIONSHIPS,
  DEPOSIT_METHODS,
  INITIAL_BANK_FORM,
  SUPPORTED_COUNTRIES,
  SUPPORTED_CURRENCIES,
  WITHDRAWAL_METHODS,
} from './banking/config';
import { maskAccountNumber } from './banking/utils';
import BankAccountsSection from './banking/sections/BankAccountsSection';
import CreditCardsSection from './banking/sections/CreditCardsSection';
import PaymentMethodsSection from './banking/sections/PaymentMethodsSection';
import TransactionHistorySection from './banking/sections/TransactionHistorySection';

const BankingTab = ({ 
  walletData = {}, 
  bankAccounts = [], 
  creditCards = [], 
  paymentMethods = [], 
  transactions = [],
  onDeposit,
  onWithdraw,
  onAddBankAccount,
  onDeleteBankAccount,
  onSetDefaultBankAccount,
  onAddCreditCard,
  onDeleteCreditCard,
  onSetDefaultCreditCard,
  onShowTransferModal,
  platformInfo,
  isDemo
}) => {
  const [activeBankingTab, setActiveBankingTab] = useState('overview');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositReference, setDepositReference] = useState('');
  const [depositProof, setDepositProof] = useState(null);
  const [depositProofName, setDepositProofName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [bankFormStep, setBankFormStep] = useState(1);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  // Form states for adding bank account
  const [bankForm, setBankForm] = useState(() => ({ ...INITIAL_BANK_FORM }));
  const [cardForm, setCardForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    billingAddress: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [cardErrors, setCardErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCardSubmitting, setIsCardSubmitting] = useState(false);

  const renderModal = (content) => {
    if (typeof document === 'undefined') return null;
    return createPortal(content, document.body);
  };

  const validateBankForm = (step = bankFormStep) => {
    const errors = {};

    if (step >= 1) {
      if (!bankForm.bankName.trim()) errors.bankName = 'Bank name is required';
      if (!bankForm.branchName.trim()) errors.branchName = 'Branch name is required';
      if (!bankForm.country) errors.country = 'Country is required';
    }

    if (step >= 2) {
      if (!bankForm.accountHolderName.trim()) errors.accountHolderName = 'Account holder name is required';
      if (!bankForm.accountNumber.trim()) {
        errors.accountNumber = 'Account number is required';
      } else if (!/^[A-Za-z0-9]{8,34}$/.test(bankForm.accountNumber.replace(/\s/g, ''))) {
        errors.accountNumber = 'Use 8 to 34 letters or digits';
      }
      if (!bankForm.accountType) errors.accountType = 'Account type is required';
      if (!bankForm.currency.trim()) errors.currency = 'Currency is required';
      if (!bankForm.swiftCode.trim()) {
        errors.swiftCode = 'SWIFT / BIC code is required';
      } else if (!/^[A-Za-z0-9]{8,11}$/.test(bankForm.swiftCode.trim())) {
        errors.swiftCode = 'SWIFT / BIC must be 8 to 11 characters';
      }
      if (!bankForm.beneficiaryName.trim()) errors.beneficiaryName = 'Beneficiary name is required';
      if (!bankForm.relationship) errors.relationship = 'Relationship is required';
    }

    if (step >= 3) {
      if (!bankForm.proofOfBankAccountName) errors.proofOfBankAccount = 'Proof of bank account is required';
      if (!/^\d{4,6}$/.test(bankForm.withdrawalPin)) errors.withdrawalPin = 'PIN must be 4 to 6 digits';
      if (!/^\d{6}$/.test(bankForm.otpCode)) errors.otpCode = 'OTP must be 6 digits';
    }

    if (step >= 4) {
      if (!bankForm.confirmOwnership) errors.confirmOwnership = 'You must confirm bank account ownership';
      if (!bankForm.acceptTerms) errors.acceptTerms = 'You must accept the Terms & Conditions';
      if (!bankForm.authorizeTransactions) errors.authorizeTransactions = 'Authorization is required';
    }

    return errors;
  };

  const handleBankFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;

    if (type !== 'checkbox') {
      if (name === 'swiftCode' || name === 'iban') nextValue = value.toUpperCase();
      if (name === 'withdrawalPin' || name === 'otpCode') nextValue = value.replace(/\D/g, '');
      if (name === 'accountNumber') nextValue = value.replace(/\s/g, '');
    }

    setBankForm(prev => ({
      ...prev,
      [name]: nextValue
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBankFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setBankForm(prev => ({
      ...prev,
      proofOfBankAccount: file,
      proofOfBankAccountName: file?.name || ''
    }));
    if (formErrors.proofOfBankAccount) {
      setFormErrors(prev => ({ ...prev, proofOfBankAccount: '' }));
    }
  };

  const resetCardForm = () => {
    setCardForm({
      cardholderName: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      billingAddress: '',
    });
    setCardErrors({});
  };

  const closeCardModal = () => {
    setShowAddCard(false);
    resetCardForm();
  };

  const handleCardFormChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 19);
      nextValue = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    }

    if (name === 'expiry') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      if (digits.length <= 2) {
        nextValue = digits;
      } else {
        nextValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      }
    }

    if (name === 'cvv') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardForm((prev) => ({ ...prev, [name]: nextValue }));
    if (cardErrors[name]) {
      setCardErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateCardForm = () => {
    const errors = {};
    if (!cardForm.cardholderName?.trim()) errors.cardholderName = 'Cardholder name is required';
    if (!cardForm.cardNumber?.trim()) errors.cardNumber = 'Card number is required';
    if (!cardForm.expiry?.trim()) errors.expiry = 'Expiry is required';
    if (!cardForm.cvv?.trim()) errors.cvv = 'CVV is required';
    if (!cardForm.billingAddress?.trim()) errors.billingAddress = 'Billing address is required';
    return errors;
  };

  const handleAddCardDetails = async (e) => {
    e.preventDefault();
    console.log('Card Submit Clicked', cardForm);
    const errors = validateCardForm();
    console.log('Card Validation Errors:', errors);
    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }

    console.log('Validation Passed. Submitting...');
    setIsCardSubmitting(true);
    try {
      const result = await onAddCreditCard(cardForm);
      if (result !== false) {
        setShowSuccessMessage('Card details captured successfully.');
        setTimeout(() => setShowSuccessMessage(''), 3500);
        closeCardModal();
      }
    } catch {
      setShowErrorMessage('Unable to capture card details. Please try again.');
      setTimeout(() => setShowErrorMessage(''), 3000);
    } finally {
      setIsCardSubmitting(false);
    }
  };

  const resetBankForm = () => {
    setBankForm({ ...INITIAL_BANK_FORM });
    setBankFormStep(1);
    setFormErrors({});
  };

  const closeBankAccountModal = () => {
    setShowAddAccount(false);
    resetBankForm();
  };

  const goToNextBankStep = () => {
    const errors = validateBankForm(bankFormStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setBankFormStep(prev => Math.min(prev + 1, BANK_WIZARD_STEPS.length));
  };

  const goToPreviousBankStep = () => {
    setFormErrors({});
    setBankFormStep(prev => Math.max(prev - 1, 1));
  };

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    const errors = validateBankForm(4);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstInvalidStep = [1, 2, 3, 4].find((step) => Object.keys(validateBankForm(step)).length > 0) || 1;
      setBankFormStep(firstInvalidStep);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddBankAccount(bankForm);
      if (result !== false) {
        setShowSuccessMessage('Bank account linking request submitted successfully!');
        setTimeout(() => setShowSuccessMessage(''), 3000);
        closeBankAccountModal();
      }
    } catch {
      setShowErrorMessage('Failed to add bank account. Please try again.');
      setTimeout(() => setShowErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setShowErrorMessage('Please enter a valid amount');
      setTimeout(() => setShowErrorMessage(''), 3000);
      return;
    }

    if (selectedMethod === 'bank' && !depositReference.trim()) {
      setShowErrorMessage('Transfer reference is required');
      setTimeout(() => setShowErrorMessage(''), 3000);
      return;
    }
    
    if (onDeposit) {
      const success = await onDeposit(depositAmount, selectedMethod, depositReference, depositProof);
      if (!success) {
        setShowErrorMessage('Deposit request failed. Please try again.');
        setTimeout(() => setShowErrorMessage(''), 3000);
        return;
      }
    }
    
    setShowSuccessMessage('Deposit initiated successfully!');
    setTimeout(() => setShowSuccessMessage(''), 3000);
    setShowDeposit(false);
    setDepositAmount('');
    setDepositReference('');
    setDepositProof(null);
    setDepositProofName('');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setShowErrorMessage('Please enter a valid amount');
      setTimeout(() => setShowErrorMessage(''), 3000);
      return;
    }
    
    if (parseFloat(withdrawAmount) > walletData.mainWallet) {
      setShowErrorMessage('Insufficient balance');
      setTimeout(() => setShowErrorMessage(''), 3000);
      return;
    }
    
    if (onWithdraw) {
      const success = await onWithdraw(withdrawAmount, selectedMethod);
      if (!success) {
        setShowErrorMessage('Withdrawal request failed. Please try again.');
        setTimeout(() => setShowErrorMessage(''), 3000);
        return;
      }
    }
    
    setShowSuccessMessage('Withdrawal initiated successfully!');
    setTimeout(() => setShowSuccessMessage(''), 3000);
    setShowWithdraw(false);
    setWithdrawAmount('');
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      if (onDeleteBankAccount) {
        onDeleteBankAccount(id);
      }
      setShowSuccessMessage('Bank account deleted successfully!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  const handleSetDefaultAccount = (id) => {
    if (onSetDefaultBankAccount) {
      onSetDefaultBankAccount(id);
      setShowSuccessMessage('Default bank account updated!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  const handleDeleteCard = (id) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      if (onDeleteCreditCard) {
        onDeleteCreditCard(id);
      }
      setShowSuccessMessage('Card removed successfully!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  const handleSetDefaultCard = (id) => {
    if (onSetDefaultCreditCard) {
      onSetDefaultCreditCard(id);
      setShowSuccessMessage('Default card updated!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  const openTransferFlow = () => {
    if (onShowTransferModal) {
      onShowTransferModal();
      return;
    }

    setShowErrorMessage('Transfer flow is unavailable right now.');
    setTimeout(() => setShowErrorMessage(''), 3000);
  };

  const handleExportLedger = () => {
    if (!transactions || transactions.length === 0) {
      setShowErrorMessage('No transaction history available to export.');
      setTimeout(() => setShowErrorMessage(''), 3000);
      return;
    }

    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Date', 'Type', 'Amount', 'Method', 'Status', 'Reference'],
      ...transactions.map((tx) => [
        tx.date,
        tx.type,
        tx.amount,
        tx.method,
        tx.status,
        tx.reference
      ])
    ];

    const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    const dateStamp = new Date().toISOString().split('T')[0];

    link.href = url;
    link.setAttribute('download', `banking-ledger-${dateStamp}.csv`);
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    setShowSuccessMessage('Ledger exported successfully!');
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const getCardIcon = (cardType) => {
    switch(cardType) {
      case 'Visa': return <FaCcVisa className="text-blue-400 text-xl sm:text-2xl" />;
      case 'Mastercard': return <FaCcMastercard className="text-orange-400 text-xl sm:text-2xl" />;
      case 'American Express': return <FaCcAmex className="text-blue-300 text-xl sm:text-2xl" />;
      case 'Discover': return <FaCcDiscover className="text-orange-300 text-xl sm:text-2xl" />;
      default: return <FaCreditCard className="text-gold-500 text-xl sm:text-2xl" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Demo Mode Virtual Environment Banner */}
      {isDemo && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 bg-amber-500 text-slate-900 rounded-2xl shadow-lg shadow-amber-500/20">
              <FaShieldAlt size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-500 uppercase tracking-[0.14em] sm:tracking-widest italic leading-none mb-1 text-left">Virtual Asset Environment</h4>
              <p className="text-xs font-medium text-slate-400 text-left">All financial actions in this terminal are simulated. No real-world capital is being moved.</p>
            </div>
          </div>
        </div>
      )}
      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <FaCheck />
          <span className="text-sm break-words">{showSuccessMessage}</span>
        </div>
      )}
      
      {showErrorMessage && (
        <div className="fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-rose-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <FaTimes />
          <span className="text-sm break-words">{showErrorMessage}</span>
        </div>
      )}

      {/* Banking Navigation - Responsive */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-3 shadow-xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300">
        <div className="flex overflow-x-auto scrollbar-hide p-1 space-x-2 lg:space-x-3">
          {BANKING_TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveBankingTab(item.id)}
              className={`flex-shrink-0 lg:flex-1 px-4 lg:px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-3 whitespace-nowrap ${
                activeBankingTab === item.id 
                  ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-xl' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={12} className={activeBankingTab === item.id ? 'text-gold-500 dark:text-slate-900' : 'text-slate-300 dark:text-slate-700'} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banking Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Wallet Info */}
        <div className="col-span-1 space-y-6">
          {/* Wallet Balance Card */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-slate-900/30 dark:shadow-black/40 relative overflow-hidden border border-slate-800 dark:border-slate-700 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 blur-[80px] rounded-full -translate-y-24 translate-x-24"></div>
            <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-6 sm:mb-8 flex items-center italic">
              <FaWallet className="mr-3 text-lg" />
              Global Liquidity
            </h3>
            <div className="space-y-6 relative">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Net Worth</p>
                <p className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter">
                  ${walletData.totalBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 dark:bg-slate-900/40 rounded-2xl p-4 sm:p-5 border border-slate-700/50 dark:border-slate-800/50 backdrop-blur-xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Trading</p>
                  <p className="text-base sm:text-lg font-black text-gold-500 italic">
                    ${walletData.tradingWallet?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="bg-slate-800/50 dark:bg-slate-900/40 rounded-2xl p-4 sm:p-5 border border-slate-700/50 dark:border-slate-800/50 backdrop-blur-xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Incentives</p>
                  <p className="text-base sm:text-lg font-black text-emerald-500 italic">
                    ${walletData.bonusWallet?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pending Withdrawals</span>
                  <span className="text-xs font-black text-amber-500 italic">${walletData.pendingWithdrawals?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pending Deposits</span>
                  <span className="text-xs font-black text-emerald-500 italic">${walletData.pendingDeposits?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors">
            <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-6 sm:mb-8 italic">Rapid Protocols</h3>
            <div className="space-y-3">
              {[
                { label: 'Deposit Funds', icon: FaArrowDown, action: () => setShowDeposit(true) },
                { label: 'Internal Transfer', icon: FaExchangeAlt, action: openTransferFlow },
                { label: 'Add Repository', icon: FaBuilding, action: () => setShowAddAccount(true) },
                { label: 'Link interface', icon: FaCreditCard, action: () => setShowAddCard(true) },
                { label: 'Export Ledger', icon: FaDownload, action: handleExportLedger }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action}
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 text-left text-slate-900 dark:text-white rounded-2xl hover:bg-slate-900 dark:hover:bg-gold-500 hover:text-white dark:hover:text-slate-900 flex items-center justify-between transition-all duration-300 group shadow-sm border border-slate-100 dark:border-slate-700 hover:border-slate-900 dark:hover:border-gold-500"
                >
                  <span className="flex items-center text-[11px] font-black uppercase tracking-widest">
                    <item.icon className="mr-4 text-gold-500 group-hover:text-gold-400 transition-colors" />
                    {item.label}
                  </span>
                  <FaArrowRight size={10} className="text-slate-300 dark:text-slate-600 group-hover:text-gold-500 dark:group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Main Banking Area */}
        <div className="lg:col-span-2 space-y-8">
          {activeBankingTab === 'overview' && (
            <>
              <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full translate-x-32 -translate-y-32"></div>
                <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-8 sm:mb-10 relative italic">Capital Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 relative">
                  {[
                    { label: 'Total Equity', value: `$${walletData.totalBalance?.toLocaleString() || '0'}`, color: 'text-white' },
                    { label: 'Monthly Flow', value: '+$5,250', color: 'text-emerald-400' },
                    { label: 'Ledger Count', value: transactions.length, color: 'text-gold-500' },
                    { label: 'Pending Sync', value: transactions.filter(t => t.status === 'Pending').length, color: 'text-amber-400' }
                  ].map((stat, idx) => (
                    <div key={idx} className="group">
                      <p className={`text-2xl sm:text-3xl font-black ${stat.color} italic tracking-tighter mb-2 group-hover:scale-110 transition-transform origin-left`}>{stat.value}</p>
                      <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <TransactionHistorySection transactions={transactions} isMobile={isMobile} />
            </>
          )}

          {activeBankingTab === 'transfer' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8 transition-colors">Asset Migration</h3>
              <button
                onClick={openTransferFlow}
                className="px-10 py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-2xl shadow-slate-900/10 dark:shadow-gold-500/10"
              >
                Initialize Migration Vector
              </button>
            </div>
          )}

          {activeBankingTab === 'withdraw' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8 transition-colors">Capital Extraction</h3>
              {isDemo ? (
                <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  <FaMoneyBillWave className="mx-auto text-slate-200 dark:text-slate-700 text-4xl mb-6" />
                  <p className="text-slate-500 dark:text-slate-400 font-bold italic mb-6">Extraction protocols are locked for simulation-only repositories.</p>
                  <button
                    onClick={() => window.location.href = '/settings'}
                    className="px-10 py-5 bg-gold-500 text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 transition-all shadow-xl shadow-gold-500/20"
                  >
                    Authorize Live Operating ID
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWithdraw(true)}
                  className="px-10 py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-2xl shadow-slate-900/10 dark:shadow-gold-500/10"
                >
                  Deploy Sync Logic
                </button>
              )}
            </div>
          )}

          {activeBankingTab === 'accounts' && (
            <BankAccountsSection
              bankAccounts={bankAccounts}
              resetBankForm={resetBankForm}
              setShowAddAccount={setShowAddAccount}
              handleSetDefaultAccount={handleSetDefaultAccount}
              handleDeleteAccount={handleDeleteAccount}
            />
          )}
          {activeBankingTab === 'cards' && (
            <CreditCardsSection
              creditCards={creditCards}
              setShowAddCard={setShowAddCard}
              getCardIcon={getCardIcon}
              handleDeleteCard={handleDeleteCard}
              handleSetDefaultCard={handleSetDefaultCard}
            />
          )}
          {activeBankingTab === 'payment' && <PaymentMethodsSection paymentMethods={paymentMethods} />}
          {activeBankingTab === 'history' && <TransactionHistorySection transactions={transactions} isMobile={isMobile} />}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && renderModal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase transition-colors">Capital Injection</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.2em] transition-colors">Synchronize External Assets</p>
              </div>
              <button onClick={() => setShowDeposit(false)} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700">
                <FaTimes size={18} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Channel Selection</label>
                <div className="grid grid-cols-1 gap-3">
                  {DEPOSIT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-6 rounded-[1.5rem] border flex items-center justify-between transition-all duration-300 ${
                        selectedMethod === method.id
                          ? 'border-slate-900 dark:border-gold-500 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-xl scale-[1.02]'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-5">
                        <method.icon className={selectedMethod === method.id ? 'text-gold-500 dark:text-slate-900' : 'text-slate-300 dark:text-slate-600'} size={24} />
                        <div className="text-left font-black uppercase italic tracking-widest text-[10px]">
                          <p className={selectedMethod === method.id ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white transition-colors'}>{method.name}</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-1 opacity-70 transition-colors">{method.processing} | {method.fee} Ratio</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && <FaCheck className="text-gold-500 dark:text-slate-900" />}
                    </button>
                  ))}
                </div>
              </div>

               <div className="space-y-4">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Injection Magnitude</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 dark:text-slate-700 italic">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-12 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-3xl font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {selectedMethod === 'bank' && platformInfo && (
                <div className="bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-800 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] italic">Receiver Protocol Details</h4>
                    <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 text-[8px] font-black uppercase tracking-widest border border-gold-500/20">Verified Vault</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Bank Entity</p>
                      <p className="text-sm font-black text-white italic">{platformInfo.bank_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Account Identity</p>
                      <p className="text-sm font-black text-white italic">{platformInfo.account_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">IBAN / Account No</p>
                      <p className="text-sm font-black text-white italic tracking-tighter">{platformInfo.iban || platformInfo.account_number}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SWIFT / BIC</p>
                      <p className="text-sm font-black text-white italic">{platformInfo.swift_bic}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex flex-col gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Transfer Reference *</label>
                      <input
                        type="text"
                        value={depositReference}
                        onChange={(e) => setDepositReference(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                        placeholder="RT-XXXXXX"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Proof of Transfer *</label>
                      <label className="flex items-center justify-between gap-4 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-gold-500/50 transition-all">
                        <div className="flex items-center gap-3">
                          <FaUpload className="text-gold-500 text-xs" />
                          <span className="text-[10px] font-bold text-slate-300 truncate max-w-[200px]">
                            {depositProofName || 'Upload transaction receipt'}
                          </span>
                        </div>
                        <span className="text-[8px] font-black text-gold-500 uppercase tracking-widest">Select File</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setDepositProof(file);
                              setDepositProofName(file.name);
                            }
                          }}
                          accept="image/*,.pdf"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount}
                  className="flex-1 px-8 py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 dark:shadow-gold-500/10"
                >
                  Authorized Injection
                </button>
                <button
                  onClick={() => setShowDeposit(false)}
                  className="px-8 py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Abort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && renderModal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.1)] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase transition-colors">Capital Extraction</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.2em] transition-colors">Liquidate Assets to External Vault</p>
              </div>
              <button 
                onClick={() => setShowWithdraw(false)} 
                className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Method Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WITHDRAWAL_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${
                      selectedMethod === method.id 
                        ? 'border-slate-900 dark:border-gold-500 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-2xl scale-[1.02]' 
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <method.icon size={24} className={selectedMethod === method.id ? 'text-gold-500 dark:text-slate-900' : 'text-slate-300 dark:text-slate-600'} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{method.name}</span>
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 dark:text-slate-700 italic">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-12 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-3xl font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Execution Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) > walletData.mainWallet}
                  className="flex-1 px-8 py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 dark:shadow-gold-500/10"
                >
                  Confirm Extraction
                </button>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="px-8 py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Bank Account Modal */}
      {showAddAccount && renderModal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-start sm:items-center justify-center z-50 overflow-y-auto p-3 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 w-full max-w-4xl my-0 sm:my-8 h-[100dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.15)] transition-colors flex flex-col">
            <div className="relative px-4 sm:px-10 pt-5 sm:pt-10 pb-5 sm:pb-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-500/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 blur-3xl rounded-full translate-x-16 -translate-y-10 pointer-events-none" />
              <div className="relative flex items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-3 px-3 sm:px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm mb-3 sm:mb-5">
                    <FaShieldAlt className="text-gold-500 text-sm" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.28em] text-slate-500 dark:text-slate-400">Secure Banking Setup</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase transition-colors">Bank Account Linking</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 sm:mt-3 max-w-xl">A professional payout profile with verification, masked account previews, and step-by-step validation for safer withdrawals.</p>
                </div>
                <button onClick={closeBankAccountModal} className="w-11 h-11 sm:w-14 sm:h-14 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="relative mt-4 sm:mt-8 flex sm:grid sm:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto pb-1">
                {BANK_WIZARD_STEPS.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id <= bankFormStep) {
                        setFormErrors({});
                        setBankFormStep(step.id);
                      }
                    }}
                    className={`min-w-[8.75rem] sm:min-w-0 rounded-xl sm:rounded-[1.5rem] border px-3 sm:px-4 py-3 sm:py-4 text-left transition-all ${
                      step.id === bankFormStep
                        ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 border-slate-900 dark:border-gold-500 shadow-xl'
                        : step.id < bankFormStep
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/20'
                          : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] sm:tracking-[0.24em] opacity-70">Step {step.id}</p>
                    <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-black uppercase tracking-wide">{step.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddBankAccount} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 sm:px-10 py-5 sm:py-8">
                {bankFormStep === 1 && (
                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-800/10 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-500 mb-2">Section 1</p>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white italic">Financial Institution</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Capture the exact bank and branch identity to reduce payout mismatches.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Bank Name *</label>
                        <input type="text" name="bankName" value={bankForm.bankName} onChange={handleBankFormChange} placeholder="e.g. Commercial Bank, HSBC, Sampath Bank" className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.bankName ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`} />
                        {formErrors.bankName && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.bankName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Branch Name / Branch Code *</label>
                        <input type="text" name="branchName" value={bankForm.branchName} onChange={handleBankFormChange} placeholder="Colombo Fort / 001" className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.branchName ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`} />
                        {formErrors.branchName && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.branchName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Country *</label>
                        <select name="country" value={bankForm.country} onChange={handleBankFormChange} className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.country ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`}>
                          {SUPPORTED_COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
                        </select>
                        {formErrors.country && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.country}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {bankFormStep === 2 && (
                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-800/10 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-500 mb-2">Section 2 & 3</p>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white italic">Account Details & Beneficiary</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enter the legal banking details exactly as held by the institution.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Account Holder Name *</label>
                        <input type="text" name="accountHolderName" value={bankForm.accountHolderName} onChange={handleBankFormChange} placeholder="Full legal name as per bank" className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.accountHolderName ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`} />
                        {formErrors.accountHolderName && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.accountHolderName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Account Number *</label>
                        <input type="text" name="accountNumber" value={bankForm.accountNumber} onChange={handleBankFormChange} placeholder="Account number" className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.accountNumber ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`} />
                        {formErrors.accountNumber && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.accountNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Account Type *</label>
                        <select name="accountType" value={bankForm.accountType} onChange={handleBankFormChange} className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.accountType ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`}>
                          {BANK_ACCOUNT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                        </select>
                        {formErrors.accountType && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.accountType}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Currency *</label>
                        <select name="currency" value={bankForm.currency} onChange={handleBankFormChange} className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.currency ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`}>
                          {SUPPORTED_CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                        </select>
                        {formErrors.currency && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.currency}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">SWIFT / BIC Code *</label>
                        <input type="text" name="swiftCode" value={bankForm.swiftCode} onChange={handleBankFormChange} placeholder="Required for international transfers" className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold uppercase text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.swiftCode ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`} />
                        {formErrors.swiftCode && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.swiftCode}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">IBAN</label>
                        <input type="text" name="iban" value={bankForm.iban} onChange={handleBankFormChange} placeholder="Optional" className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Beneficiary Name *</label>
                        <input type="text" name="beneficiaryName" value={bankForm.beneficiaryName} onChange={handleBankFormChange} placeholder="Usually same as account holder" className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.beneficiaryName ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`} />
                        {formErrors.beneficiaryName && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.beneficiaryName}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Relationship *</label>
                        <select name="relationship" value={bankForm.relationship} onChange={handleBankFormChange} className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.relationship ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`}>
                          {BENEFICIARY_RELATIONSHIPS.map((relationship) => <option key={relationship.value} value={relationship.value}>{relationship.label}</option>)}
                        </select>
                        {formErrors.relationship && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.relationship}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {bankFormStep === 3 && (
                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-800/10 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-500 mb-2">Section 4</p>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white italic">Verification</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Match the account with supporting evidence and a secure withdrawal control layer.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Upload Proof Of Bank Account *</label>
                        <label className={`flex items-center justify-between gap-4 px-6 py-5 rounded-2xl border cursor-pointer transition-all ${formErrors.proofOfBankAccount ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-500/5' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}`}>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{bankForm.proofOfBankAccountName || 'Bank statement / passbook / screenshot'}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500 mt-2">PDF, JPG, PNG accepted</p>
                          </div>
                          <FaFileInvoice className="text-gold-500 text-xl" />
                          <input type="file" name="proofOfBankAccount" onChange={handleBankFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                        {formErrors.proofOfBankAccount && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.proofOfBankAccount}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">Set Withdrawal PIN *</label>
                        <input type="password" name="withdrawalPin" value={bankForm.withdrawalPin} onChange={handleBankFormChange} placeholder="4 to 6 digits" className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.withdrawalPin ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`} />
                        {formErrors.withdrawalPin && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.withdrawalPin}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.28em] ml-2">OTP Verification Code *</label>
                        <input type="text" name="otpCode" value={bankForm.otpCode} onChange={handleBankFormChange} placeholder="6-digit code" className={`w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${formErrors.otpCode ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'}`} />
                        {formErrors.otpCode && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.otpCode}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {bankFormStep === 4 && (
                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-800/10 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-500 mb-2">Section 5</p>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white italic">Agreements & Security Review</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Review the payout profile before submission. UI masking is active for stored account previews.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                      <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Linked Profile Summary</p>
                          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">Masked UI Active</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div><p className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">Bank Name</p><p className="text-slate-900 dark:text-white font-bold mt-1">{bankForm.bankName || '-'}</p></div>
                          <div><p className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">Branch</p><p className="text-slate-900 dark:text-white font-bold mt-1">{bankForm.branchName || bankForm.branchCode || '-'}</p></div>
                          <div><p className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">Account Holder</p><p className="text-slate-900 dark:text-white font-bold mt-1">{bankForm.accountHolderName || '-'}</p></div>
                          <div><p className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">Account Number</p><p className="text-slate-900 dark:text-white font-bold mt-1">{maskAccountNumber(bankForm.accountNumber)}</p></div>
                          <div><p className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">Type / Currency</p><p className="text-slate-900 dark:text-white font-bold mt-1">{bankForm.accountType} / {bankForm.currency}</p></div>
                          <div><p className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">SWIFT / BIC</p><p className="text-slate-900 dark:text-white font-bold mt-1">{bankForm.swiftCode || '-'}</p></div>
                          <div><p className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">Beneficiary</p><p className="text-slate-900 dark:text-white font-bold mt-1">{bankForm.beneficiaryName || '-'}</p></div>
                          <div><p className="text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-wider">Proof File</p><p className="text-slate-900 dark:text-white font-bold mt-1">{bankForm.proofOfBankAccountName || '-'}</p></div>
                        </div>
                      </div>

                      <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-500">Security Must-Haves</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Recommended backend enforcement alongside this form:</p>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                          <li>Encrypt account numbers in the database.</li>
                          <li>Always mask UI output like `XXXXXX1234`.</li>
                          <li>Require HTTPS and server-side validation for SWIFT, OTP, ownership, and file metadata.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-6 space-y-4">
                      <label className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <input type="checkbox" name="confirmOwnership" checked={!!bankForm.confirmOwnership} onChange={handleBankFormChange} className="mt-1 w-4 h-4 accent-gold-500" />
                        <span>I confirm this bank account belongs to me.</span>
                      </label>
                      {formErrors.confirmOwnership && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-7">{formErrors.confirmOwnership}</p>}
                      <label className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <input type="checkbox" name="acceptTerms" checked={!!bankForm.acceptTerms} onChange={handleBankFormChange} className="mt-1 w-4 h-4 accent-gold-500" />
                        <span>I agree to the platform Terms & Conditions.</span>
                      </label>
                      {formErrors.acceptTerms && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-7">{formErrors.acceptTerms}</p>}
                      <label className="flex items-start gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <input type="checkbox" name="authorizeTransactions" checked={!!bankForm.authorizeTransactions} onChange={handleBankFormChange} className="mt-1 w-4 h-4 accent-gold-500" />
                        <span>I authorize transactions to this account.</span>
                      </label>
                      {formErrors.authorizeTransactions && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-7">{formErrors.authorizeTransactions}</p>}
                      <label className="flex items-center gap-3 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        <input type="checkbox" name="isDefault" checked={!!bankForm.isDefault} onChange={handleBankFormChange} className="w-4 h-4 accent-gold-500" />
                        Set as default bank account
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 sm:px-10 py-4 sm:py-6 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
                  <button
                    type="button"
                    onClick={bankFormStep === 1 ? closeBankAccountModal : goToPreviousBankStep}
                    className="px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.25rem] sm:rounded-[1.5rem] font-black uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[10px] sm:text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
                  >
                    {bankFormStep === 1 ? 'Cancel' : 'Back'}
                  </button>
                  {bankFormStep < BANK_WIZARD_STEPS.length ? (
                    <button
                      type="button"
                      onClick={goToNextBankStep}
                      className="flex-1 px-6 sm:px-8 py-4 sm:py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.25rem] sm:rounded-[1.5rem] font-black uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[10px] sm:text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/10"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 sm:px-8 py-4 sm:py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.25rem] sm:rounded-[1.5rem] font-black uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[10px] sm:text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/10"
                    >
                      {isSubmitting ? 'Submitting Verification...' : 'Submit Bank Linking'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credit Card Modal */}
      {showAddCard && renderModal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-start sm:items-center justify-center z-50 overflow-y-auto p-3 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 w-full max-w-2xl my-4 sm:my-8 max-h-[90vh] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.15)] transition-colors flex flex-col">
            <form onSubmit={handleAddCardDetails} className="flex flex-col flex-1 min-h-0">
              <div className="relative px-5 sm:px-12 pt-7 sm:pt-10 pb-6 sm:pb-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-gold-500/5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 blur-3xl rounded-full translate-x-14 -translate-y-10 pointer-events-none" />
                <div className="relative flex items-start justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-3 px-3 sm:px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm mb-4 sm:mb-5">
                      <FaShieldAlt className="text-gold-500 text-sm" />
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.28em] text-slate-500 dark:text-slate-400">Card Profile Setup</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase transition-colors">Card Information</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.18em] sm:tracking-[0.3em] transition-colors">Process Securely Via Stripe Tokenization</p>
                  </div>
                  <button onClick={closeCardModal} type="button" className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700 shadow-sm">
                    <FaTimes size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 sm:px-12 py-5 sm:py-8 pr-4 sm:pr-8">
                <div className="space-y-6 sm:space-y-8">
                  <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/10 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center space-y-3 sm:space-y-4 transition-colors">
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-gold-500 via-amber-400 to-transparent" />
                    <FaCreditCard className="mx-auto text-gold-500 text-3xl sm:text-4xl mb-2 sm:mb-3" />
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic text-center transition-colors">Card Details Form</p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">Collect card details in UI only, then tokenize and process securely through Stripe or another PCI-compliant provider.</p>
                  </div>

                  <div className="bg-white dark:bg-slate-950/30 rounded-[2rem] sm:rounded-[2.25rem] border border-slate-100 dark:border-slate-800 p-4 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-500 mb-2">Required Details</p>
                        <h4 className="text-base sm:text-lg font-black italic text-slate-900 dark:text-white">Card Information</h4>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">PCI-Aware UI</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.22em] ml-1">Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardholderName"
                          value={cardForm.cardholderName ?? ''}
                          onChange={handleCardFormChange}
                          className={`w-full px-5 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                            cardErrors.cardholderName ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'
                          }`}
                          placeholder="Name on card"
                          autoComplete="cc-name"
                        />
                        {cardErrors.cardholderName && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">{cardErrors.cardholderName}</p>}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.22em] ml-1">Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardForm.cardNumber ?? ''}
                          onChange={handleCardFormChange}
                          className={`w-full px-5 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                            cardErrors.cardNumber ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'
                          }`}
                          placeholder="1234 5678 9012 3456"
                          inputMode="numeric"
                          autoComplete="cc-number"
                        />
                        {cardErrors.cardNumber && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">{cardErrors.cardNumber}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.22em] ml-1">Expiry Date (MM/YY) *</label>
                        <input
                          type="text"
                          name="expiry"
                          value={cardForm.expiry ?? ''}
                          onChange={handleCardFormChange}
                          className={`w-full px-5 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                            cardErrors.expiry ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'
                          }`}
                          placeholder="MM/YY"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                        />
                        {cardErrors.expiry && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">{cardErrors.expiry}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.22em] ml-1">CVV *</label>
                        <input
                          type="password"
                          name="cvv"
                          value={cardForm.cvv ?? ''}
                          onChange={handleCardFormChange}
                          className={`w-full px-5 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                            cardErrors.cvv ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'
                          }`}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                        {cardErrors.cvv && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">{cardErrors.cvv}</p>}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.22em] ml-1">Billing Address *</label>
                        <textarea
                          name="billingAddress"
                          value={cardForm.billingAddress ?? ''}
                          onChange={handleCardFormChange}
                          rows={3}
                          className={`w-full px-5 sm:px-6 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all resize-none ${
                            cardErrors.billingAddress ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10'
                          }`}
                          placeholder="Street, city, postal code, country"
                          autoComplete="street-address"
                        />
                        {cardErrors.billingAddress && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-1">{cardErrors.billingAddress}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-12 py-4 sm:py-6 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
                <button
                  type="submit"
                  disabled={isCardSubmitting}
                  className="flex-1 px-6 sm:px-10 py-4 sm:py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.25rem] sm:rounded-[2rem] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] text-[10px] sm:text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/10"
                >
                  {isCardSubmitting ? 'Securing Card Details...' : 'Save Card Details'}
                </button>
                <button
                  type="button"
                  onClick={closeCardModal}
                  className="px-6 sm:px-10 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[1.25rem] sm:rounded-[2rem] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] text-[10px] sm:text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
                >
                  Cancel
                </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingTab;


