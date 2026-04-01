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
  FaIdCard, FaHome, FaPhone, FaEnvelope, FaBars
} from 'react-icons/fa';

const BankingTab = ({ 
  walletData, 
  bankAccounts, 
  creditCards, 
  paymentMethods, 
  transactions,
  onTransfer,
  onDeposit,
  onWithdraw,
  onAddBankAccount,
  onAddCreditCard,
  onDeleteBankAccount,
  onDeleteCreditCard,
  onSetDefaultBankAccount,
  onSetDefaultCreditCard,
  onShowTransferModal,
  isDemo
}) => {
  const [activeBankingTab, setActiveBankingTab] = useState('overview');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showErrorMessage, setShowErrorMessage] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Form states for adding bank account
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false
  });

  // Form states for adding credit card
  const [cardForm, setCardForm] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'USA',
    isDefault: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderModal = (content) => {
    if (typeof document === 'undefined') return null;
    return createPortal(content, document.body);
  };

  const bankingTabs = [
    { id: 'overview', label: 'Overview', icon: FaUniversity },
    { id: 'transfer', label: 'Transfer', icon: FaExchangeAlt },
    { id: 'withdraw', label: 'Withdraw', icon: FaMoneyBillWave },
    { id: 'accounts', label: 'Accounts', icon: FaLandmark },
    { id: 'cards', label: 'Cards', icon: FaCreditCard },
    { id: 'payment', label: 'Payment', icon: FaMobileAlt },
    { id: 'history', label: 'History', icon: FaHistory }
  ];

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  const depositMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, processing: '1-3 days', fee: 'Free' },
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, processing: 'Instant', fee: '2.5%' },
    { id: 'paypal', name: 'PayPal', icon: FaPaypal, processing: 'Instant', fee: '1.5%' },
    { id: 'crypto', name: 'Cryptocurrency', icon: FaBitcoin, processing: '30 min', fee: '0.1%' }
  ];

  const withdrawalMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, processing: '1-3 days', fee: 'Free', min: 50, max: 50000 },
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, processing: '3-5 days', fee: '1%', min: 20, max: 10000 },
    { id: 'paypal', name: 'PayPal', icon: FaPaypal, processing: '24 hours', fee: '2%', min: 10, max: 5000 },
    { id: 'crypto', name: 'Cryptocurrency', icon: FaBitcoin, processing: '1 hour', fee: '0.0005 BTC', min: 50, max: 50000 }
  ];

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'business', label: 'Business Account' }
  ];

  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Singapore'];
  
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });
  
  const years = Array.from({ length: 10 }, (_, i) => {
    const year = (new Date().getFullYear() + i).toString();
    return { value: year, label: year };
  });

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const validateBankForm = () => {
    const errors = {};
    
    if (!bankForm.bankName.trim()) errors.bankName = 'Bank name is required';
    if (!bankForm.accountName.trim()) errors.accountName = 'Account holder name is required';
    if (!bankForm.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (!/^\d{8,17}$/.test(bankForm.accountNumber.replace(/\s/g, ''))) {
      errors.accountNumber = 'Invalid account number (8-17 digits)';
    }
    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      errors.confirmAccountNumber = 'Account numbers do not match';
    }
    if (!bankForm.routingNumber.trim()) {
      errors.routingNumber = 'Routing number is required';
    } else if (!/^\d{9}$/.test(bankForm.routingNumber)) {
      errors.routingNumber = 'Routing number must be 9 digits';
    }
    if (!bankForm.address.trim()) errors.address = 'Address is required';
    if (!bankForm.city.trim()) errors.city = 'City is required';
    if (!bankForm.state) errors.state = 'State is required';
    if (!bankForm.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(bankForm.zipCode)) {
      errors.zipCode = 'Invalid ZIP code';
    }

    return errors;
  };

  const validateCardForm = () => {
    const errors = {};
    
    if (!cardForm.cardholderName.trim()) errors.cardholderName = 'Cardholder name is required';
    
    if (!cardForm.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else {
      const cardNumberClean = cardForm.cardNumber.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cardNumberClean)) {
        errors.cardNumber = 'Invalid card number';
      }
    }
    
    if (!cardForm.expiryMonth || !cardForm.expiryYear) {
      errors.expiry = 'Expiry date is required';
    } else {
      const currentDate = new Date();
      const expiryDate = new Date(parseInt(cardForm.expiryYear), parseInt(cardForm.expiryMonth) - 1);
      if (expiryDate < currentDate) {
        errors.expiry = 'Card has expired';
      }
    }
    
    if (!cardForm.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardForm.cvv)) {
      errors.cvv = 'Invalid CVV';
    }
    
    if (!cardForm.billingAddress.trim()) errors.billingAddress = 'Billing address is required';
    if (!cardForm.billingCity.trim()) errors.billingCity = 'City is required';
    if (!cardForm.billingState) errors.billingState = 'State is required';
    if (!cardForm.billingZip.trim()) {
      errors.billingZip = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(cardForm.billingZip)) {
      errors.billingZip = 'Invalid ZIP code';
    }

    return errors;
  };

  const handleBankFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBankForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
      setCardForm(prev => ({ ...prev, [name]: formatted }));
    } else {
      setCardForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    const errors = validateBankForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newAccount = {
        id: Date.now().toString(),
        ...bankForm,
        isVerified: false,
        isDefault: bankForm.isDefault || bankAccounts.length === 0
      };
      
      delete newAccount.confirmAccountNumber;
      
      if (onAddBankAccount) {
        onAddBankAccount(newAccount);
      }
      
      setShowSuccessMessage('Bank account added successfully!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
      
      setBankForm({
        bankName: '',
        accountName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        routingNumber: '',
        accountType: 'checking',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        isDefault: false
      });
      
      setShowAddAccount(false);
    } catch (error) {
      setShowErrorMessage('Failed to add bank account. Please try again.');
      setTimeout(() => setShowErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCreditCard = async (e) => {
    e.preventDefault();
    const errors = validateCardForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const cardNumberClean = cardForm.cardNumber.replace(/\s/g, '');
      const last4 = cardNumberClean.slice(-4);
      
      let cardType = 'Unknown';
      if (cardNumberClean.startsWith('4')) {
        cardType = 'Visa';
      } else if (cardNumberClean.startsWith('5')) {
        cardType = 'Mastercard';
      } else if (cardNumberClean.startsWith('3')) {
        cardType = 'American Express';
      } else if (cardNumberClean.startsWith('6')) {
        cardType = 'Discover';
      }
      
      const newCard = {
        id: Date.now().toString(),
        ...cardForm,
        last4,
        cardType,
        isVerified: false,
        isDefault: cardForm.isDefault || creditCards.length === 0,
        availableCredit: 5000
      };
      
      delete newCard.cvv;
      delete newCard.cardNumber;
      
      if (onAddCreditCard) {
        onAddCreditCard(newCard);
      }
      
      setShowSuccessMessage('Credit card added successfully!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
      
      setCardForm({
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        billingCountry: 'USA',
        isDefault: false
      });
      
      setShowAddCard(false);
    } catch (error) {
      setShowErrorMessage('Failed to add credit card. Please try again.');
      setTimeout(() => setShowErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setShowErrorMessage('Please enter a valid amount');
      setTimeout(() => setShowErrorMessage(''), 3000);
      return;
    }
    
    if (onDeposit) {
      onDeposit(depositAmount, selectedMethod);
    }
    
    setShowSuccessMessage('Deposit initiated successfully!');
    setTimeout(() => setShowSuccessMessage(''), 3000);
    setShowDeposit(false);
    setDepositAmount('');
  };

  const handleWithdraw = () => {
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
      onWithdraw(withdrawAmount, selectedMethod);
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

  const handleDeleteCard = (id) => {
    if (window.confirm('Are you sure you want to delete this credit card?')) {
      if (onDeleteCreditCard) {
        onDeleteCreditCard(id);
      }
      setShowSuccessMessage('Credit card deleted successfully!');
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

  const handleSetDefaultCard = (id) => {
    if (onSetDefaultCreditCard) {
      onSetDefaultCreditCard(id);
      setShowSuccessMessage('Default credit card updated!');
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

  // Bank Accounts Section - Responsive
  const BankAccountsSection = () => (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Financial Hub</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.2em]">Linked Asset Accounts</p>
        </div>
        <button 
          onClick={() => setShowAddAccount(true)}
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-xl shadow-slate-900/10 dark:shadow-gold-500/10 font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 group"
        >
          <FaPlus size={10} className="text-gold-500 dark:text-slate-900 group-hover:text-white transition-colors" />
          <span>Add Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bankAccounts.map((account) => (
          <div key={account.id} className="group bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-gold-500/30 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group-hover:border-gold-500/20 transition-colors">
                  <FaUniversity className="text-gold-500 text-xl" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-slate-900 dark:text-white font-extrabold">{account.bankName}</h4>
                    {account.isVerified && (
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-tighter">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {account.accountName} •••• {account.accountNumber.slice(-4)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold">
                    Routing: {account.routingNumber} • {account.accountType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {account.isDefault && (
                  <span className="px-3 py-1 bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black rounded-lg border border-gold-100 dark:border-gold-500/20 uppercase">Default</span>
                )}
                <div className="flex gap-1.5 ml-2">
                  {!account.isDefault && bankAccounts.length > 1 && (
                    <button 
                      onClick={() => handleSetDefaultAccount(account.id)}
                      className="p-2 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-emerald-100 transition-all"
                    >
                      <FaCheck size={12} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-2 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-rose-100 transition-all"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bankAccounts.length === 0 && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <FaBuilding className="mx-auto text-slate-200 dark:text-slate-700 text-5xl mb-4" />
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm">No Bank Accounts Linked</p>
        </div>
      )}
    </div>
  );

  // CreditCardsSection - Responsive
  const CreditCardsSection = () => (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300 mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Credit Lines</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.2em]">Authorized Payment Vectors</p>
        </div>
        <button 
          onClick={() => setShowAddCard(true)}
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-xl shadow-slate-900/10 dark:shadow-gold-500/10 font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 group"
        >
          <FaPlus size={10} className="text-gold-500 dark:text-slate-900 group-hover:text-white transition-colors" />
          <span>Register Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {creditCards.map((card) => (
          <div key={card.id} className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-800 dark:border-slate-700 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[50px] rounded-full translate-x-16 -translate-y-16"></div>
            <div className="flex justify-between items-start mb-10 relative">
              {getCardIcon(card.cardType)}
              {card.isDefault && (
                <span className="px-3 py-1 bg-gold-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest italic shadow-lg shadow-gold-500/20">Primary Vector</span>
              )}
            </div>
            <p className="text-white font-mono text-xl tracking-[0.2em] relative mb-6">•••• •••• •••• {card.last4}</p>
            <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest relative italic">{card.cardholderName}</p>
            <div className="flex justify-between items-end mt-8 relative pt-6 border-t border-white/5">
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Valid Thru</p>
                <p className="text-xs font-black text-white italic">{card.expiryMonth}/{card.expiryYear}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Limit</p>
                <p className="text-xs font-black text-emerald-400 italic">${card.availableCredit?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {creditCards.length === 0 && (
        <div className="text-center py-8">
          <FaCreditCard className="mx-auto text-gold-500/30 text-3xl sm:text-4xl mb-3" />
          <p className="text-gold-500/50 text-sm sm:text-base">No credit cards added yet</p>
        </div>
      )}
    </div>
  );

  // Payment Methods Section - Responsive
  const PaymentMethodsSection = () => (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300 mt-8">
      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-10">Digital Processors</h3>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 gap-6 group hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-5">
              <div className="p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-50 dark:border-slate-600 group-hover:border-gold-500/20 transition-colors">
                {method.method === 'PayPal' && <FaPaypal className="text-blue-500 text-2xl" />}
                {method.method === 'Skrill' && <FaMoneyBillWave className="text-orange-500 text-2xl" />}
                {method.method === 'Neteller' && <FaMoneyBillWave className="text-emerald-500 text-2xl" />}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{method.method}</p>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 italic lowercase">{method.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {method.isVerified ? (
                <span className="flex items-center px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                  <FaCheck size={8} className="mr-1.5" /> Verified Sink
                </span>
              ) : (
                <span className="flex items-center px-3 py-1 bg-rose-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                  <FaTimes size={8} className="mr-1.5" /> Unverified Sink
                </span>
              )}
              {method.isDefault && (
                <span className="px-3 py-1 bg-slate-900 dark:bg-gold-500 text-gold-500 dark:text-slate-900 text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">Master Link</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Transaction History Section - Responsive
  const TransactionHistorySection = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Transaction History</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-black tracking-widest">Recent Activity Logs</p>
      </div>
      
      <div className="p-2 sm:p-6 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">
              <th className="px-6 py-4 text-left font-black">Date</th>
              <th className="px-6 py-4 text-left font-black">Type</th>
              <th className="px-6 py-4 text-right font-black">Amount</th>
              <th className="px-6 py-4 text-left font-black">Method</th>
              {!isMobile && <th className="px-6 py-4 text-left font-black">Reference</th>}
              <th className="px-6 py-4 text-center font-black">Status</th>
              <th className="px-6 py-4 text-center font-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="group bg-white dark:bg-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800">
                <td className="px-6 py-4 first:rounded-l-xl border-y border-l border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{tx.date}</span>
                </td>
                <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20">
                  <div className="flex items-center space-x-2">
                    {tx.type === 'Deposit' && <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-lg"><FaArrowDown size={10} /></div>}
                    {tx.type === 'Withdrawal' && <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-lg"><FaArrowUp size={10} /></div>}
                    {tx.type === 'Transfer' && <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg"><FaExchangeAlt size={10} /></div>}
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">{tx.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20">
                  <span className={`text-sm font-black ${
                    tx.type === 'Deposit' ? 'text-emerald-500' : 
                    tx.type === 'Withdrawal' ? 'text-rose-500' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'Withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20 uppercase tracking-tighter">{tx.method}</td>
                {!isMobile && <td className="px-6 py-4 text-[10px] font-bold text-slate-300 dark:text-slate-600 border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20">{tx.reference}</td>}
                <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20 text-center">
                  <span className={`px-2 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                    tx.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20' : 
                    tx.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20' : 
                    'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 last:rounded-r-xl border-y border-r border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20 text-center">
                  <button className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg hover:bg-gold-500 hover:text-white transition-all">
                    <FaDownload size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Demo Mode Virtual Environment Banner */}
      {isDemo && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500 text-slate-900 rounded-2xl shadow-lg shadow-amber-500/20">
              <FaShieldAlt size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest italic leading-none mb-1 text-left">Virtual Asset Environment</h4>
              <p className="text-xs font-medium text-slate-400 text-left">All financial actions in this terminal are simulated. No real-world capital is being moved.</p>
            </div>
          </div>
        </div>
      )}
      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <FaCheck />
          <span>{showSuccessMessage}</span>
        </div>
      )}
      
      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-rose-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <FaTimes />
          <span>{showErrorMessage}</span>
        </div>
      )}

      {/* Banking Navigation - Responsive */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-3 shadow-xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300">
        {isMobile ? (
          <div className="relative p-2">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white font-black border border-slate-100 dark:border-slate-700 flex items-center justify-between uppercase tracking-widest text-[11px]"
            >
              <span className="flex items-center">
                {bankingTabs.find(tab => tab.id === activeBankingTab)?.icon && 
                  React.createElement(bankingTabs.find(tab => tab.id === activeBankingTab).icon, { className: "mr-4 text-gold-500" })}
                {bankingTabs.find(tab => tab.id === activeBankingTab)?.label}
              </span>
              <FaBars className="text-slate-400 dark:text-slate-500" />
            </button>
            
            {showMobileMenu && (
              <div className="absolute top-full left-0 right-0 mx-2 mt-3 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl z-20 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                {bankingTabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveBankingTab(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full px-8 py-5 text-left flex items-center space-x-4 transition-all ${
                      activeBankingTab === item.id ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 font-black' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon size={16} className={activeBankingTab === item.id ? 'text-gold-500 dark:text-slate-900' : 'text-slate-300 dark:text-slate-700'} />
                    <span className="text-[11px] uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-3 p-1">
            {bankingTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveBankingTab(item.id)}
                className={`flex-1 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center space-x-3 whitespace-nowrap ${
                  activeBankingTab === item.id 
                    ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/10' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon size={12} className={activeBankingTab === item.id ? 'text-gold-500 dark:text-slate-900' : 'text-slate-300 dark:text-slate-700'} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Banking Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wallet Info */}
        <div className="col-span-1 space-y-6">
          {/* Wallet Balance Card */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/30 dark:shadow-black/40 relative overflow-hidden border border-slate-800 dark:border-slate-700 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 blur-[80px] rounded-full -translate-y-24 translate-x-24"></div>
            <h3 className="text-xs font-black text-gold-500 uppercase tracking-[0.3em] mb-8 flex items-center italic">
              <FaWallet className="mr-3 text-lg" />
              Global Liquidity
            </h3>
            <div className="space-y-6 relative">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Net Worth</p>
                <p className="text-4xl font-black text-white italic tracking-tighter">
                  ${walletData.mainWallet?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50 dark:border-slate-800/50 backdrop-blur-xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Trading</p>
                  <p className="text-lg font-black text-gold-500 italic">
                    ${walletData.tradingWallet?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="bg-slate-800/50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50 dark:border-slate-800/50 backdrop-blur-xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Incentives</p>
                  <p className="text-lg font-black text-emerald-500 italic">
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
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors">
            <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-8 italic">Rapid Protocols</h3>
            <div className="space-y-3">
              {[
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
              <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full translate-x-32 -translate-y-32"></div>
                <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] mb-10 relative italic">Capital Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
                  {[
                    { label: 'Total Equity', value: `$${walletData.totalBalance?.toLocaleString() || '0'}`, color: 'text-white' },
                    { label: 'Monthly Flow', value: '+$5,250', color: 'text-emerald-400' },
                    { label: 'Ledger Count', value: transactions.length, color: 'text-gold-500' },
                    { label: 'Pending Sync', value: transactions.filter(t => t.status === 'Pending').length, color: 'text-amber-400' }
                  ].map((stat, idx) => (
                    <div key={idx} className="group">
                      <p className={`text-3xl font-black ${stat.color} italic tracking-tighter mb-2 group-hover:scale-110 transition-transform origin-left`}>{stat.value}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <TransactionHistorySection />
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

          {activeBankingTab === 'accounts' && <BankAccountsSection />}
          {activeBankingTab === 'cards' && <CreditCardsSection />}
          {activeBankingTab === 'payment' && <PaymentMethodsSection />}
          {activeBankingTab === 'history' && <TransactionHistorySection />}
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
                  {depositMethods.map((method) => (
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
                {withdrawalMethods.map((method) => (
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

      {/* Add Bank Account Modal */}
      {showAddAccount && renderModal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 overflow-y-auto p-4 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-12 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_120px_rgba(0,0,0,0.15)] transition-colors">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase transition-colors">Vault Registry</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.3em] transition-colors">Authorized Financial Interface Linking</p>
              </div>
              <button onClick={() => setShowAddAccount(false)} className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-[1.5rem] flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700">
                <FaTimes size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddBankAccount} className="space-y-10">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Institution Code *</label>
                    <input
                      type="text"
                      name="bankName"
                      value={bankForm.bankName}
                      onChange={handleBankFormChange}
                      className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-black italic focus:outline-none transition-all ${
                        formErrors.bankName ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white'
                      }`}
                      placeholder="e.g. JPMorgan Perpetual"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Account Logic *</label>
                    <div className="relative">
                      <select
                        name="accountType"
                        value={bankForm.accountType}
                        onChange={handleBankFormChange}
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 transition-all appearance-none"
                      >
                        {accountTypes.map(type => (
                          <option key={type.value} value={type.value} className="dark:bg-slate-900">{type.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <FaArrowDown size={10} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Legal Beneficiary *</label>
                  <input
                    type="text"
                    name="accountName"
                    value={bankForm.accountName}
                    onChange={handleBankFormChange}
                    className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-black italic focus:outline-none transition-all ${
                      formErrors.accountName ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                    placeholder="Exact name match on asset"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-10 py-6 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/10"
                >
                  {isSubmitting ? 'Verifying Integrity...' : 'Link Asset Repository'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="px-10 py-6 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
                >
                  Abort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credit Card Modal */}
      {showAddCard && renderModal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 overflow-y-auto p-4 sm:p-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 w-full max-w-2xl my-8 max-h-[90vh] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.15)] transition-colors">
            <form onSubmit={handleAddCreditCard} className="flex flex-col max-h-[90vh]">
              <div className="relative px-8 sm:px-12 pt-10 pb-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-gold-500/5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 blur-3xl rounded-full translate-x-14 -translate-y-10 pointer-events-none" />
                <div className="relative flex items-start justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm mb-5">
                      <FaShieldAlt className="text-gold-500 text-sm" />
                      <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Secure Vault Sync</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase transition-colors">Payment Vector</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.3em] transition-colors">Encrypted Card Interface Registration</p>
                  </div>
                  <button onClick={() => setShowAddCard(false)} type="button" className="w-14 h-14 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-[1.5rem] flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700 shadow-sm">
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 sm:px-12 py-8 pr-5 sm:pr-8">
                <div className="space-y-8">
                  <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/10 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center space-y-4 transition-colors">
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-gold-500 via-amber-400 to-transparent" />
                    <FaShieldAlt className="mx-auto text-gold-500 text-4xl mb-3" />
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic text-center transition-colors">Protocol sync active</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">Link a payment card with a cleaner authorization flow, stronger hierarchy, and easier review before submission.</p>
                  </div>

                  <div className="bg-white dark:bg-slate-950/30 rounded-[2.25rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between gap-4 mb-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gold-500 mb-2">Card Identity</p>
                        <h4 className="text-lg font-black italic text-slate-900 dark:text-white">Primary Authorization Details</h4>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Verified Input</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Cardholder Name *</label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={cardForm.cardholderName}
                    onChange={handleCardFormChange}
                    className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-black italic focus:outline-none transition-all ${
                      formErrors.cardholderName ? 'border-rose-500 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                    placeholder="Name exactly as printed on card"
                  />
                  {formErrors.cardholderName && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.cardholderName}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardForm.cardNumber}
                    onChange={handleCardFormChange}
                    className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-black italic focus:outline-none transition-all ${
                      formErrors.cardNumber ? 'border-rose-500 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                  />
                  {formErrors.cardNumber && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.cardNumber}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Expiry Month *</label>
                  <select
                    name="expiryMonth"
                    value={cardForm.expiryMonth}
                    onChange={handleCardFormChange}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 transition-all appearance-none"
                  >
                    <option value="">Month</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value} className="dark:bg-slate-900">{month.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Expiry Year *</label>
                  <select
                    name="expiryYear"
                    value={cardForm.expiryYear}
                    onChange={handleCardFormChange}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 transition-all appearance-none"
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year.value} value={year.value} className="dark:bg-slate-900">{year.label}</option>
                    ))}
                  </select>
                </div>
                {formErrors.expiry && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2 md:col-span-2">{formErrors.expiry}</p>}

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Security Code *</label>
                  <input
                    type="password"
                    name="cvv"
                    value={cardForm.cvv}
                    onChange={handleCardFormChange}
                    className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-black italic focus:outline-none transition-all ${
                      formErrors.cvv ? 'border-rose-500 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                    placeholder="CVV"
                    inputMode="numeric"
                  />
                  {formErrors.cvv && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.cvv}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Billing ZIP *</label>
                  <input
                    type="text"
                    name="billingZip"
                    value={cardForm.billingZip}
                    onChange={handleCardFormChange}
                    className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-black italic focus:outline-none transition-all ${
                      formErrors.billingZip ? 'border-rose-500 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                    placeholder="ZIP / Postal code"
                  />
                  {formErrors.billingZip && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.billingZip}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Billing Address *</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={cardForm.billingAddress}
                    onChange={handleCardFormChange}
                    className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-black italic focus:outline-none transition-all ${
                      formErrors.billingAddress ? 'border-rose-500 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                    placeholder="Street address"
                  />
                  {formErrors.billingAddress && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.billingAddress}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Billing City *</label>
                  <input
                    type="text"
                    name="billingCity"
                    value={cardForm.billingCity}
                    onChange={handleCardFormChange}
                    className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-xs font-black italic focus:outline-none transition-all ${
                      formErrors.billingCity ? 'border-rose-500 text-slate-900 dark:text-white' : 'border-slate-100 dark:border-slate-700 focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                    placeholder="City"
                  />
                  {formErrors.billingCity && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.billingCity}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Billing State *</label>
                  <select
                    name="billingState"
                    value={cardForm.billingState}
                    onChange={handleCardFormChange}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-800 transition-all appearance-none"
                  >
                    <option value="">State</option>
                    {states.map(state => (
                      <option key={state} value={state} className="dark:bg-slate-900">{state}</option>
                    ))}
                  </select>
                  {formErrors.billingState && <p className="text-rose-500 text-[10px] font-black uppercase tracking-wider ml-2">{formErrors.billingState}</p>}
                </div>

                <label className="md:col-span-2 flex items-center gap-3 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={cardForm.isDefault}
                    onChange={handleCardFormChange}
                    className="w-4 h-4 accent-gold-500"
                  />
                  Set As Default Payment Vector
                </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 sm:px-12 py-6 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-10 py-6 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/10"
                >
                  {isSubmitting ? 'Syncing Interface...' : 'Authorize Payment Vector'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="px-10 py-6 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
                >
                  Abort
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
