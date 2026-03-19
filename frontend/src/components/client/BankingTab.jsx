// frontend/src/components/client/BankingTab.jsx
import React, { useState, useEffect } from 'react';
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
  onShowTransferModal,
  onAddBankAccount,
  onAddCreditCard,
  onDeleteBankAccount,
  onDeleteCreditCard,
  onSetDefaultBankAccount,
  onSetDefaultCreditCard
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
    
    console.log('Deposit:', { method: selectedMethod, amount: depositAmount });
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
    
    console.log('Withdraw:', { method: selectedMethod, amount: withdrawAmount });
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
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gold-500">Your Bank Accounts</h3>
        <button 
          onClick={() => setShowAddAccount(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center space-x-2"
        >
          <FaPlus size={14} />
          <span>Add Bank Account</span>
        </button>
      </div>

      <div className="space-y-4">
        {bankAccounts.map((account) => (
          <div key={account.id} className="bg-navy-700/50 rounded-lg p-4 border border-gold-500/20">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <FaBuilding className="text-gold-500" />
                  <h4 className="text-white font-medium">{account.bankName}</h4>
                  {account.isVerified && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center">
                      <FaCheck size={10} className="mr-1" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gold-500/70">
                  {account.accountName} •••• {account.accountNumber.slice(-4)}
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  Routing: {account.routingNumber} • {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                </p>
                {!isMobile && (
                  <p className="text-xs text-gold-500/50 mt-1">
                    {account.address}, {account.city}, {account.state} {account.zipCode}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {account.isDefault && (
                  <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
                )}
                {!account.isDefault && bankAccounts.length > 1 && (
                  <button 
                    onClick={() => handleSetDefaultAccount(account.id)}
                    className="p-2 text-gold-500/70 hover:text-gold-500"
                    title="Set as Default"
                  >
                    <FaCheck size={14} />
                  </button>
                )}
                <button 
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-2 text-red-400/70 hover:text-red-400" 
                  title="Delete"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
            {isMobile && (
              <p className="text-xs text-gold-500/50 mt-2">
                {account.address}, {account.city}, {account.state} {account.zipCode}
              </p>
            )}
          </div>
        ))}
      </div>

      {bankAccounts.length === 0 && (
        <div className="text-center py-8">
          <FaBuilding className="mx-auto text-gold-500/30 text-3xl sm:text-4xl mb-3" />
          <p className="text-gold-500/50 text-sm sm:text-base">No bank accounts added yet</p>
        </div>
      )}
    </div>
  );

  // Credit Cards Section - Responsive
  const CreditCardsSection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gold-500">Your Credit Cards</h3>
        <button 
          onClick={() => setShowAddCard(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center justify-center space-x-2"
        >
          <FaPlus size={14} />
          <span>Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {creditCards.map((card) => (
          <div key={card.id} className="bg-gradient-to-br from-navy-700 to-navy-800 rounded-lg p-4 border border-gold-500/30">
            <div className="flex justify-between items-start mb-4">
              {getCardIcon(card.cardType)}
              {card.isDefault && (
                <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
              )}
            </div>
            <p className="text-white font-mono text-base sm:text-lg">•••• •••• •••• {card.last4}</p>
            <p className="text-sm text-gold-500/70 mt-2">{card.cardholderName}</p>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
              <p className="text-xs text-gold-500/50">Expires {card.expiryMonth}/{card.expiryYear}</p>
              <p className="text-xs text-green-400">Available: ${card.availableCredit?.toLocaleString()}</p>
            </div>
            {card.isVerified && (
              <div className="mt-2 flex items-center text-xs text-green-400">
                <FaCheck size={10} className="mr-1" /> Verified
              </div>
            )}
            <div className="mt-3 flex justify-end space-x-2">
              {!card.isDefault && creditCards.length > 1 && (
                <button 
                  onClick={() => handleSetDefaultCard(card.id)}
                  className="px-2 py-1 text-xs text-gold-500 hover:text-gold-400"
                >
                  Set Default
                </button>
              )}
              <button 
                onClick={() => handleDeleteCard(card.id)}
                className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
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
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gold-500 mb-6">Your Online Payment Methods</h3>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-navy-700/50 rounded-lg border border-gold-500/20 gap-4">
            <div className="flex items-center space-x-3">
              {method.method === 'PayPal' && <FaPaypal className="text-blue-400 text-xl" />}
              {method.method === 'Skrill' && <FaMoneyBillWave className="text-orange-400 text-xl" />}
              {method.method === 'Neteller' && <FaMoneyBillWave className="text-green-400 text-xl" />}
              <div>
                <p className="text-white font-medium">{method.method}</p>
                <p className="text-sm text-gold-500/70">{method.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {method.isVerified ? (
                <span className="flex items-center text-xs text-green-400">
                  <FaCheck size={10} className="mr-1" /> Verified
                </span>
              ) : (
                <span className="flex items-center text-xs text-yellow-400">
                  <FaTimes size={10} className="mr-1" /> Unverified
                </span>
              )}
              {method.isDefault && (
                <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Transaction History Section - Responsive
  const TransactionHistorySection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
      <div className="p-4 border-b border-gold-500/20">
        <h3 className="text-base sm:text-lg font-semibold text-gold-500">Transaction History</h3>
      </div>
      
      {isMobile ? (
        // Mobile view - Card layout
        <div className="p-4 space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-navy-700/30 rounded-lg p-4 border border-gold-500/20">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  {tx.type === 'Deposit' && <FaArrowDown className="text-green-400" size={12} />}
                  {tx.type === 'Withdrawal' && <FaArrowUp className="text-red-400" size={12} />}
                  {tx.type === 'Transfer' && <FaExchangeAlt className="text-gold-400" size={12} />}
                  <span className={`text-sm font-medium ${
                    tx.type === 'Deposit' ? 'text-green-400' : 
                    tx.type === 'Withdrawal' ? 'text-red-400' : 'text-gold-400'
                  }`}>
                    {tx.type}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
                  tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-red-500/20 text-red-400'
                }`}>
                  {tx.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gold-500/50 text-xs">Amount</p>
                  <p className="text-white font-medium">${tx.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gold-500/50 text-xs">Method</p>
                  <p className="text-gold-500/70">{tx.method}</p>
                </div>
                <div>
                  <p className="text-gold-500/50 text-xs">Date</p>
                  <p className="text-gold-500/70 text-xs">{tx.date}</p>
                </div>
                <div>
                  <p className="text-gold-500/50 text-xs">Reference</p>
                  <p className="text-gold-500/50 text-xs">{tx.reference}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button className="p-2 text-gold-500/70 hover:text-gold-500">
                  <FaDownload size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop view - Table layout
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">From/To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/10">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-navy-700/30">
                  <td className="px-4 py-3 text-sm text-gold-500/70">{tx.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {tx.type === 'Deposit' && <FaArrowDown className="text-green-400" size={12} />}
                      {tx.type === 'Withdrawal' && <FaArrowUp className="text-red-400" size={12} />}
                      {tx.type === 'Transfer' && <FaExchangeAlt className="text-gold-400" size={12} />}
                      <span className={`text-sm ${
                        tx.type === 'Deposit' ? 'text-green-400' : 
                        tx.type === 'Withdrawal' ? 'text-red-400' : 'text-gold-400'
                      }`}>
                        {tx.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">${tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{tx.method}</td>
                  <td className="px-4 py-3 text-sm text-gold-500/50">{tx.from} → {tx.to}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 
                      tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gold-500/50">{tx.reference}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 text-gold-500/70 hover:text-gold-500">
                      <FaDownload size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <FaCheck />
          <span>{showSuccessMessage}</span>
        </div>
      )}
      
      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <FaTimes />
          <span>{showErrorMessage}</span>
        </div>
      )}

      {/* Banking Navigation - Responsive */}
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-3 sm:p-4">
        {isMobile ? (
          // Mobile navigation with dropdown
          <div className="relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full px-4 py-3 bg-navy-700 rounded-lg text-gold-500 flex items-center justify-between"
            >
              <span className="flex items-center">
                {bankingTabs.find(tab => tab.id === activeBankingTab)?.icon && 
                  React.createElement(bankingTabs.find(tab => tab.id === activeBankingTab).icon, { className: "mr-2" })}
                {bankingTabs.find(tab => tab.id === activeBankingTab)?.label}
              </span>
              <FaBars />
            </button>
            
            {showMobileMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-navy-800 rounded-lg border border-gold-500/30 shadow-xl z-10">
                {bankingTabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveBankingTab(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center space-x-2 hover:bg-navy-700 ${
                      activeBankingTab === item.id ? 'bg-gold-500/10 text-gold-500' : 'text-gold-500/70'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Desktop navigation - tabs
          <div className="flex flex-wrap gap-2">
            {bankingTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveBankingTab(item.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                  activeBankingTab === item.id
                    ? 'bg-gold-500 text-navy-950'
                    : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
                }`}
              >
                <item.icon size={isTablet ? 14 : 16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Banking Content */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-4 sm:gap-6`}>
        {/* Left Column - Wallet Info */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Wallet Balance Card */}
          <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gold-500 mb-4 flex items-center">
              <FaWallet className="mr-2" />
              My Wallet
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gold-500/70">Main Wallet Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  ${walletData.mainWallet?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-navy-700/50 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gold-500/70">Trading Wallet</p>
                  <p className="text-base sm:text-lg font-semibold text-gold-400">
                    ${walletData.tradingWallet?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-2 sm:p-3">
                  <p className="text-xs text-gold-500/70">Bonus Wallet</p>
                  <p className="text-base sm:text-lg font-semibold text-green-400">
                    ${walletData.bonusWallet?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gold-500/20">
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span className="text-gold-500/70">Pending Withdrawals</span>
                  <span className="text-yellow-400">${walletData.pendingWithdrawals?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gold-500/70">Pending Deposits</span>
                  <span className="text-green-400">${walletData.pendingDeposits?.toLocaleString() || '0'}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button 
                  onClick={() => setShowDeposit(true)}
                  className="flex-1 px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all text-sm sm:text-base"
                >
                  Deposit
                </button>
                <button 
                  onClick={() => setShowWithdraw(true)}
                  className="flex-1 px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 transition-all text-sm sm:text-base"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
            <h3 className="text-sm sm:text-md font-semibold text-gold-500 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={onShowTransferModal}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between text-sm sm:text-base"
              >
                <span className="flex items-center">
                  <FaExchangeAlt className="mr-2 text-gold-500" />
                  Internal Transfer
                </span>
                <FaArrowRight className="text-gold-500/50" />
              </button>
              <button 
                onClick={() => setShowAddAccount(true)}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between text-sm sm:text-base"
              >
                <span className="flex items-center">
                  <FaBuilding className="mr-2 text-gold-500" />
                  Add Bank Account
                </span>
                <FaPlus className="text-gold-500/50" />
              </button>
              <button 
                onClick={() => setShowAddCard(true)}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between text-sm sm:text-base"
              >
                <span className="flex items-center">
                  <FaCreditCard className="mr-2 text-gold-500" />
                  Add Credit Card
                </span>
                <FaPlus className="text-gold-500/50" />
              </button>
              <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between text-sm sm:text-base">
                <span className="flex items-center">
                  <FaFileInvoice className="mr-2 text-gold-500" />
                  Generate Statement
                </span>
                <FaDownload className="text-gold-500/50" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Main Banking Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {activeBankingTab === 'overview' && (
            <>
              <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gold-500 mb-4">Banking Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-white">${walletData.totalBalance?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-gold-500/70">Total Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-green-400">+$5,250</p>
                    <p className="text-xs text-gold-500/70">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-gold-400">{transactions.length}</p>
                    <p className="text-xs text-gold-500/70">Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-yellow-400">
                      {transactions.filter(t => t.status === 'Pending').length}
                    </p>
                    <p className="text-xs text-gold-500/70">Pending</p>
                  </div>
                </div>
              </div>
              <TransactionHistorySection />
            </>
          )}

          {activeBankingTab === 'transfer' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gold-500 mb-4">Internal Transfer</h3>
              <button
                onClick={onShowTransferModal}
                className="w-full sm:w-auto px-6 py-3 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600"
              >
                Open Transfer Modal
              </button>
            </div>
          )}

          {activeBankingTab === 'withdraw' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gold-500 mb-4">Withdrawals</h3>
              <button
                onClick={() => setShowWithdraw(true)}
                className="w-full sm:w-auto px-6 py-3 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600"
              >
                Make a Withdrawal
              </button>
            </div>
          )}

          {activeBankingTab === 'accounts' && <BankAccountsSection />}
          {activeBankingTab === 'cards' && <CreditCardsSection />}
          {activeBankingTab === 'payment' && <PaymentMethodsSection />}
          {activeBankingTab === 'history' && <TransactionHistorySection />}
        </div>
      </div>

      {/* Deposit Modal - Responsive */}
      {showDeposit && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gold-500">Deposit Funds</h3>
              <button onClick={() => setShowDeposit(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Select Method</label>
                <div className="space-y-2">
                  {depositMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-3 rounded-lg border flex items-center justify-between ${
                        selectedMethod === method.id
                          ? 'border-gold-500 bg-gold-500/10'
                          : 'border-gold-500/30 bg-navy-700/50 hover:bg-navy-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <method.icon className="text-gold-500 text-xl" />
                        <div className="text-left">
                          <p className="text-white font-medium text-sm">{method.name}</p>
                          <p className="text-xs text-gold-500/50">{method.processing} | Fee: {method.fee}</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && <FaCheck className="text-gold-500" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500">$</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount)}
                    className="px-3 py-1 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-xs sm:text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div className="bg-navy-700/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Deposit Amount</span>
                  <span className="text-white font-medium">${depositAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Fee</span>
                  <span className="text-yellow-400">
                    {selectedMethod === 'bank' ? 'Free' : 
                     selectedMethod === 'card' ? '$' + (depositAmount * 0.025).toFixed(2) :
                     selectedMethod === 'paypal' ? '$' + (depositAmount * 0.015).toFixed(2) :
                     '$' + (depositAmount * 0.001).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gold-500/20">
                  <span className="text-gold-500/70">Total to Pay</span>
                  <span className="text-gold-400 font-bold">
                    ${depositAmount ? (parseFloat(depositAmount) + 
                      (selectedMethod === 'card' ? parseFloat(depositAmount) * 0.025 :
                       selectedMethod === 'paypal' ? parseFloat(depositAmount) * 0.015 :
                       selectedMethod === 'crypto' ? parseFloat(depositAmount) * 0.001 : 0)).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold ${
                    depositAmount 
                      ? 'bg-gold-500 text-navy-950 hover:bg-gold-600' 
                      : 'bg-gold-500/50 text-navy-950/50 cursor-not-allowed'
                  }`}
                >
                  Confirm Deposit
                </button>
                <button
                  onClick={() => setShowDeposit(false)}
                  className="px-4 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal - Responsive */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gold-500">Withdraw Funds</h3>
              <button onClick={() => setShowWithdraw(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-navy-700/30 rounded-lg p-3">
                <p className="text-xs text-gold-500/70">Available Balance</p>
                <p className="text-xl sm:text-2xl font-bold text-white">${walletData.mainWallet?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Select Method</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                >
                  {withdrawalMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name} - Min: ${method.min} Max: ${method.max}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    max={walletData.mainWallet}
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setWithdrawAmount(amount)}
                    className="px-3 py-1 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-xs sm:text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setWithdrawAmount(walletData.mainWallet)}
                className="w-full px-3 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
              >
                Max Amount: ${walletData.mainWallet?.toLocaleString() || '0'}
              </button>
              <div className="bg-navy-700/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Withdrawal Amount</span>
                  <span className="text-white font-medium">${withdrawAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Fee</span>
                  <span className="text-yellow-400">
                    {selectedMethod === 'bank' ? 'Free' : 
                     selectedMethod === 'card' ? '$' + (withdrawAmount * 0.01).toFixed(2) :
                     selectedMethod === 'paypal' ? '$' + (withdrawAmount * 0.02).toFixed(2) :
                     '0.0005 BTC'}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gold-500/20">
                  <span className="text-gold-500/70">You'll Receive</span>
                  <span className="text-gold-400 font-bold">
                    ${withdrawAmount ? (parseFloat(withdrawAmount) - 
                      (selectedMethod === 'card' ? parseFloat(withdrawAmount) * 0.01 :
                       selectedMethod === 'paypal' ? parseFloat(withdrawAmount) * 0.02 : 0)).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) > walletData.mainWallet}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold ${
                    withdrawAmount && parseFloat(withdrawAmount) <= walletData.mainWallet
                      ? 'bg-gold-500 text-navy-950 hover:bg-gold-600' 
                      : 'bg-gold-500/50 text-navy-950/50 cursor-not-allowed'
                  }`}
                >
                  Confirm Withdrawal
                </button>
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="px-4 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Add Bank Account Modal - Fully Responsive */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-2 sm:p-4">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-3 sm:p-6 w-full max-w-2xl my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-navy-800 py-2 z-10">
              <h3 className="text-base sm:text-xl font-bold text-gold-500">Add Bank Account</h3>
              <button onClick={() => setShowAddAccount(false)} className="text-gold-500/70 hover:text-gold-500 p-2">
                <FaTimes size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddBankAccount} className="space-y-3 sm:space-y-4">
              {/* Bank Information */}
              <div className="border-b border-gold-500/20 pb-3 sm:pb-4">
                <h4 className="text-sm sm:text-md font-semibold text-gold-400 mb-3 sm:mb-4 flex items-center">
                  <FaBuilding className="mr-2" size={isMobile ? 14 : 16} /> Bank Information
                </h4>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Bank Name - Full width on mobile */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Bank Name *</label>
                    <input
                      type="text"
                      name="bankName"
                      value={bankForm.bankName}
                      onChange={handleBankFormChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                        formErrors.bankName ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Enter bank name"
                    />
                    {formErrors.bankName && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.bankName}</p>
                    )}
                  </div>
                  
                  {/* Account Type - Full width on mobile */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Account Type *</label>
                    <select
                      name="accountType"
                      value={bankForm.accountType}
                      onChange={handleBankFormChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-gold-500"
                    >
                      {accountTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Account Holder Information */}
              <div className="border-b border-gold-500/20 pb-3 sm:pb-4">
                <h4 className="text-sm sm:text-md font-semibold text-gold-400 mb-3 sm:mb-4 flex items-center">
                  <FaUser className="mr-2" size={isMobile ? 14 : 16} /> Account Holder Information
                </h4>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Account Holder Name *</label>
                    <input
                      type="text"
                      name="accountName"
                      value={bankForm.accountName}
                      onChange={handleBankFormChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                        formErrors.accountName ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Name on account"
                    />
                    {formErrors.accountName && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.accountName}</p>
                    )}
                  </div>

                  {/* Account Number and Confirm - Stack on mobile, side by side on desktop */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Account Number *</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankForm.accountNumber}
                        onChange={handleBankFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.accountNumber ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="Enter account number"
                      />
                      {formErrors.accountNumber && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.accountNumber}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Confirm Account Number *</label>
                      <input
                        type="text"
                        name="confirmAccountNumber"
                        value={bankForm.confirmAccountNumber}
                        onChange={handleBankFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.confirmAccountNumber ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="Confirm account number"
                      />
                      {formErrors.confirmAccountNumber && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.confirmAccountNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Routing Number */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Routing Number *</label>
                    <input
                      type="text"
                      name="routingNumber"
                      value={bankForm.routingNumber}
                      onChange={handleBankFormChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                        formErrors.routingNumber ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="9-digit routing number"
                      maxLength="9"
                    />
                    {formErrors.routingNumber && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.routingNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border-b border-gold-500/20 pb-3 sm:pb-4">
                <h4 className="text-sm sm:text-md font-semibold text-gold-400 mb-3 sm:mb-4 flex items-center">
                  <FaHome className="mr-2" size={isMobile ? 14 : 16} /> Address Information
                </h4>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Street Address */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={bankForm.address}
                      onChange={handleBankFormChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                        formErrors.address ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Enter street address"
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.address}</p>
                    )}
                  </div>

                  {/* City, State, ZIP - Responsive grid */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
                    {/* City - Full width on mobile, spans 1 on desktop */}
                    <div className="sm:col-span-1">
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={bankForm.city}
                        onChange={handleBankFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.city ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="City"
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.city}</p>
                      )}
                    </div>
                    
                    {/* State - Full width on mobile */}
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">State *</label>
                      <select
                        name="state"
                        value={bankForm.state}
                        onChange={handleBankFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.state ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                      >
                        <option value="">Select</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {formErrors.state && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.state}</p>
                      )}
                    </div>
                    
                    {/* ZIP - Full width on mobile */}
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={bankForm.zipCode}
                        onChange={handleBankFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.zipCode ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="ZIP"
                        maxLength="10"
                      />
                      {formErrors.zipCode && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Country</label>
                    <select
                      name="country"
                      value={bankForm.country}
                      onChange={handleBankFormChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-gold-500"
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Default Account Option */}
              <div className="flex items-center space-x-3 py-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefaultBank"
                  checked={bankForm.isDefault}
                  onChange={handleBankFormChange}
                  className="w-4 h-4 text-gold-500 bg-navy-700 border-gold-500/30 rounded focus:ring-gold-500"
                />
                <label htmlFor="isDefaultBank" className="text-xs sm:text-sm text-gold-500/70">
                  Set as default bank account
                </label>
              </div>

              {/* Security Notice */}
              <div className="bg-navy-700/30 rounded-lg p-3 sm:p-4 flex items-start space-x-3">
                <FaShieldAlt className="text-gold-500 mt-1 flex-shrink-0" size={isMobile ? 14 : 16} />
                <div>
                  <p className="text-xs sm:text-sm text-gold-500 font-medium">Your information is secure</p>
                  <p className="text-xs text-gold-500/50">All banking information is encrypted and securely stored.</p>
                </div>
              </div>

              {/* Form Actions - Stack on mobile, side by side on desktop */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 disabled:bg-gold-500/50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy-950 mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Bank Account'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="w-full sm:w-auto px-4 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credit Card Modal - Fully Responsive */}
      {showAddCard && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-2 sm:p-4">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-3 sm:p-6 w-full max-w-2xl my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-navy-800 py-2 z-10">
              <h3 className="text-base sm:text-xl font-bold text-gold-500">Add Credit Card</h3>
              <button onClick={() => setShowAddCard(false)} className="text-gold-500/70 hover:text-gold-500 p-2">
                <FaTimes size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddCreditCard} className="space-y-3 sm:space-y-4">
              {/* Card Information */}
              <div className="border-b border-gold-500/20 pb-3 sm:pb-4">
                <h4 className="text-sm sm:text-md font-semibold text-gold-400 mb-3 sm:mb-4 flex items-center">
                  <FaCreditCard className="mr-2" size={isMobile ? 14 : 16} /> Card Information
                </h4>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={cardForm.cardholderName}
                      onChange={handleCardFormChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                        formErrors.cardholderName ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Name as it appears on card"
                    />
                    {formErrors.cardholderName && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.cardholderName}</p>
                    )}
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardForm.cardNumber}
                      onChange={handleCardFormChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                        formErrors.cardNumber ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                    {formErrors.cardNumber && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.cardNumber}</p>
                    )}
                  </div>

                  {/* Expiry Month, Year, and CVV - Responsive grid */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
                    {/* Month */}
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Month *</label>
                      <select
                        name="expiryMonth"
                        value={cardForm.expiryMonth}
                        onChange={handleCardFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.expiry ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                      >
                        <option value="">MM</option>
                        {months.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Year */}
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Year *</label>
                      <select
                        name="expiryYear"
                        value={cardForm.expiryYear}
                        onChange={handleCardFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.expiry ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                      >
                        <option value="">YYYY</option>
                        {years.map(year => (
                          <option key={year.value} value={year.value}>{year.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* CVV */}
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">CVV *</label>
                      <input
                        type="password"
                        name="cvv"
                        value={cardForm.cvv}
                        onChange={handleCardFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.cvv ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="123"
                        maxLength="4"
                      />
                      {formErrors.cvv && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                  {formErrors.expiry && (
                    <p className="text-xs text-red-400">{formErrors.expiry}</p>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div className="border-b border-gold-500/20 pb-3 sm:pb-4">
                <h4 className="text-sm sm:text-md font-semibold text-gold-400 mb-3 sm:mb-4 flex items-center">
                  <FaHome className="mr-2" size={isMobile ? 14 : 16} /> Billing Address
                </h4>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Street Address */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={cardForm.billingAddress}
                      onChange={handleCardFormChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                        formErrors.billingAddress ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Enter billing address"
                    />
                    {formErrors.billingAddress && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.billingAddress}</p>
                    )}
                  </div>

                  {/* City, State, ZIP - Responsive grid */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
                    {/* City */}
                    <div className="sm:col-span-1">
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">City *</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={cardForm.billingCity}
                        onChange={handleCardFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.billingCity ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="City"
                      />
                      {formErrors.billingCity && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.billingCity}</p>
                      )}
                    </div>
                    
                    {/* State */}
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">State *</label>
                      <select
                        name="billingState"
                        value={cardForm.billingState}
                        onChange={handleCardFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.billingState ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                      >
                        <option value="">Select</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {formErrors.billingState && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.billingState}</p>
                      )}
                    </div>
                    
                    {/* ZIP */}
                    <div>
                      <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        name="billingZip"
                        value={cardForm.billingZip}
                        onChange={handleCardFormChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border rounded-lg text-white text-sm sm:text-base focus:outline-none ${
                          formErrors.billingZip ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="ZIP"
                        maxLength="10"
                      />
                      {formErrors.billingZip && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.billingZip}</p>
                      )}
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs sm:text-sm text-gold-500/70 mb-1 sm:mb-2">Country</label>
                    <select
                      name="billingCountry"
                      value={cardForm.billingCountry}
                      onChange={handleCardFormChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-gold-500"
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Default Card Option */}
              <div className="flex items-center space-x-3 py-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefaultCard"
                  checked={cardForm.isDefault}
                  onChange={handleCardFormChange}
                  className="w-4 h-4 text-gold-500 bg-navy-700 border-gold-500/30 rounded focus:ring-gold-500"
                />
                <label htmlFor="isDefaultCard" className="text-xs sm:text-sm text-gold-500/70">
                  Set as default payment method
                </label>
              </div>

              {/* Security Notice */}
              <div className="bg-navy-700/30 rounded-lg p-3 sm:p-4 flex items-start space-x-3">
                <FaShieldAlt className="text-gold-500 mt-1 flex-shrink-0" size={isMobile ? 14 : 16} />
                <div>
                  <p className="text-xs sm:text-sm text-gold-500 font-medium">Your card information is secure</p>
                  <p className="text-xs text-gold-500/50">Your full card number is never stored on our servers.</p>
                </div>
              </div>

              {/* Form Actions - Stack on mobile, side by side on desktop */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 disabled:bg-gold-500/50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy-950 mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Credit Card'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="w-full sm:w-auto px-4 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingTab;