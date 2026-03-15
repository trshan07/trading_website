// frontend/src/components/client/BankingTab.jsx
import React, { useState } from 'react';
import { 
  FaWallet, FaExchangeAlt, FaMoneyBillWave, FaLandmark,
  FaCreditCard, FaMobileAlt, FaHistory, FaArrowRight,
  FaPlus, FaDownload, FaFileInvoice, FaUniversity,
  FaCheck, FaTimes, FaEye, FaTrash, FaEdit,
  FaPaypal, FaBitcoin, FaArrowUp, FaArrowDown,
  FaShieldAlt, FaCcVisa, FaCcMastercard, FaCcAmex,
  FaCcDiscover, FaCalendarAlt, FaUser, FaBuilding,
  FaIdCard, FaHome, FaPhone, FaEnvelope
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
    { id: 'overview', label: 'Banking Overview', icon: FaUniversity },
    { id: 'transfer', label: 'Internal Transfer', icon: FaExchangeAlt },
    { id: 'withdraw', label: 'Withdrawals', icon: FaMoneyBillWave },
    { id: 'accounts', label: 'Bank Accounts', icon: FaLandmark },
    { id: 'cards', label: 'Credit Cards', icon: FaCreditCard },
    { id: 'payment', label: 'Payment Methods', icon: FaMobileAlt },
    { id: 'history', label: 'Transaction History', icon: FaHistory }
  ];

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  const depositMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, processing: '1-3 business days', fee: 'Free' },
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, processing: 'Instant', fee: '2.5%' },
    { id: 'paypal', name: 'PayPal', icon: FaPaypal, processing: 'Instant', fee: '1.5%' },
    { id: 'crypto', name: 'Cryptocurrency', icon: FaBitcoin, processing: '10-30 minutes', fee: '0.1%' }
  ];

  const withdrawalMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, processing: '1-3 business days', fee: 'Free', min: 50, max: 50000 },
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, processing: '3-5 business days', fee: '1%', min: 20, max: 10000 },
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
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCardFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Format card number with spaces
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
    
    // Clear error for this field
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
      // Simulate API call
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
      
      // Reset form
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const cardNumberClean = cardForm.cardNumber.replace(/\s/g, '');
      const last4 = cardNumberClean.slice(-4);
      
      // Detect card type
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
        availableCredit: 5000 // Mock available credit
      };
      
      delete newCard.cvv;
      delete newCard.cardNumber;
      
      if (onAddCreditCard) {
        onAddCreditCard(newCard);
      }
      
      setShowSuccessMessage('Credit card added successfully!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
      
      // Reset form
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
      case 'Visa': return <FaCcVisa className="text-blue-400 text-2xl" />;
      case 'Mastercard': return <FaCcMastercard className="text-orange-400 text-2xl" />;
      case 'American Express': return <FaCcAmex className="text-blue-300 text-2xl" />;
      case 'Discover': return <FaCcDiscover className="text-orange-300 text-2xl" />;
      default: return <FaCreditCard className="text-gold-500 text-2xl" />;
    }
  };

  // Bank Accounts Section
  const BankAccountsSection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gold-500">Your Bank Accounts</h3>
        <button 
          onClick={() => setShowAddAccount(true)}
          className="px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center space-x-2"
        >
          <FaPlus size={14} />
          <span>Add Bank Account</span>
        </button>
      </div>

      <div className="space-y-4">
        {bankAccounts.map((account) => (
          <div key={account.id} className="bg-navy-700/50 rounded-lg p-4 border border-gold-500/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <FaBuilding className="text-gold-500" />
                  <h4 className="text-white font-medium">{account.bankName}</h4>
                  {account.isVerified && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center">
                      <FaCheck size={10} className="mr-1" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gold-500/70 mt-2">
                  {account.accountName} •••• {account.accountNumber.slice(-4)}
                </p>
                <p className="text-xs text-gold-500/50">
                  Routing: {account.routingNumber} • {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  {account.address}, {account.city}, {account.state} {account.zipCode}
                </p>
              </div>
              <div className="flex items-center space-x-2">
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
          </div>
        ))}
      </div>

      {bankAccounts.length === 0 && (
        <div className="text-center py-8">
          <FaBuilding className="mx-auto text-gold-500/30 text-4xl mb-3" />
          <p className="text-gold-500/50">No bank accounts added yet</p>
        </div>
      )}
    </div>
  );

  // Credit Cards Section
  const CreditCardsSection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gold-500">Your Credit Cards</h3>
        <button 
          onClick={() => setShowAddCard(true)}
          className="px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center space-x-2"
        >
          <FaPlus size={14} />
          <span>Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {creditCards.map((card) => (
          <div key={card.id} className="bg-gradient-to-br from-navy-700 to-navy-800 rounded-lg p-4 border border-gold-500/30">
            <div className="flex justify-between items-start mb-4">
              {getCardIcon(card.cardType)}
              {card.isDefault && (
                <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
              )}
            </div>
            <p className="text-white font-mono text-lg">•••• •••• •••• {card.last4}</p>
            <p className="text-sm text-gold-500/70 mt-2">{card.cardholderName}</p>
            <div className="flex justify-between items-center mt-4">
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
          <FaCreditCard className="mx-auto text-gold-500/30 text-4xl mb-3" />
          <p className="text-gold-500/50">No credit cards added yet</p>
        </div>
      )}
    </div>
  );

  // Payment Methods Section
  const PaymentMethodsSection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
      <h3 className="text-lg font-semibold text-gold-500 mb-6">Your Online Payment Methods</h3>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
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

  // Transaction History Section
  const TransactionHistorySection = () => (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
      <div className="p-4 border-b border-gold-500/20">
        <h3 className="text-lg font-semibold text-gold-500">Transaction History</h3>
      </div>
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
    </div>
  );

  return (
    <div className="space-y-6">
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

      {/* Banking Navigation */}
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4">
        <div className="flex flex-wrap gap-2">
          {bankingTabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveBankingTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activeBankingTab === item.id
                  ? 'bg-gold-500 text-navy-950'
                  : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banking Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wallet Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Wallet Balance Card */}
          <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-lg font-semibold text-gold-500 mb-4 flex items-center">
              <FaWallet className="mr-2" />
              My Wallet
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gold-500/70">Main Wallet Balance</p>
                <p className="text-3xl font-bold text-white">
                  ${walletData.mainWallet?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-navy-700/50 rounded-lg p-3">
                  <p className="text-xs text-gold-500/70">Trading Wallet</p>
                  <p className="text-lg font-semibold text-gold-400">
                    ${walletData.tradingWallet?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3">
                  <p className="text-xs text-gold-500/70">Bonus Wallet</p>
                  <p className="text-lg font-semibold text-green-400">
                    ${walletData.bonusWallet?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gold-500/20">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Pending Withdrawals</span>
                  <span className="text-yellow-400">${walletData.pendingWithdrawals?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gold-500/70">Pending Deposits</span>
                  <span className="text-green-400">${walletData.pendingDeposits?.toLocaleString() || '0'}</span>
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => setShowDeposit(true)}
                  className="flex-1 px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all"
                >
                  Deposit
                </button>
                <button 
                  onClick={() => setShowWithdraw(true)}
                  className="flex-1 px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 transition-all"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
            <h3 className="text-md font-semibold text-gold-500 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={onShowTransferModal}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaExchangeAlt className="mr-2 text-gold-500" />
                  Internal Transfer
                </span>
                <FaArrowRight className="text-gold-500/50" />
              </button>
              <button 
                onClick={() => setShowAddAccount(true)}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaBuilding className="mr-2 text-gold-500" />
                  Add Bank Account
                </span>
                <FaPlus className="text-gold-500/50" />
              </button>
              <button 
                onClick={() => setShowAddCard(true)}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaCreditCard className="mr-2 text-gold-500" />
                  Add Credit Card
                </span>
                <FaPlus className="text-gold-500/50" />
              </button>
              <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between">
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
        <div className="lg:col-span-2 space-y-6">
          {activeBankingTab === 'overview' && (
            <>
              <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
                <h3 className="text-lg font-semibold text-gold-500 mb-4">Banking Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">${walletData.totalBalance?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-gold-500/70">Total Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">+$5,250</p>
                    <p className="text-xs text-gold-500/70">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold-400">{transactions.length}</p>
                    <p className="text-xs text-gold-500/70">Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">
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
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-lg font-semibold text-gold-500 mb-4">Internal Transfer</h3>
              <button
                onClick={onShowTransferModal}
                className="px-6 py-3 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600"
              >
                Open Transfer Modal
              </button>
            </div>
          )}

          {activeBankingTab === 'withdraw' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-lg font-semibold text-gold-500 mb-4">Withdrawals</h3>
              <button
                onClick={() => setShowWithdraw(true)}
                className="px-6 py-3 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600"
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

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Deposit Funds</h3>
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
                          <p className="text-white font-medium">{method.name}</p>
                          <p className="text-xs text-gold-500/50">Processing: {method.processing} | Fee: {method.fee}</p>
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
                    className="px-3 py-1 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
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
              <div className="flex space-x-3">
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

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Withdraw Funds</h3>
              <button onClick={() => setShowWithdraw(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-navy-700/30 rounded-lg p-3">
                <p className="text-xs text-gold-500/70">Available Balance</p>
                <p className="text-2xl font-bold text-white">${walletData.mainWallet?.toLocaleString() || '0'}</p>
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
                    className="px-3 py-1 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
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
              <div className="flex space-x-3">
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

      {/* Add Bank Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gold-500">Add Bank Account</h3>
              <button onClick={() => setShowAddAccount(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddBankAccount} className="space-y-4">
              {/* Bank Information */}
              <div className="border-b border-gold-500/20 pb-4">
                <h4 className="text-md font-semibold text-gold-400 mb-4 flex items-center">
                  <FaBuilding className="mr-2" /> Bank Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Bank Name *</label>
                    <input
                      type="text"
                      name="bankName"
                      value={bankForm.bankName}
                      onChange={handleBankFormChange}
                      className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                        formErrors.bankName ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Enter bank name"
                    />
                    {formErrors.bankName && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.bankName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Account Type *</label>
                    <select
                      name="accountType"
                      value={bankForm.accountType}
                      onChange={handleBankFormChange}
                      className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    >
                      {accountTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Account Holder Information */}
              <div className="border-b border-gold-500/20 pb-4">
                <h4 className="text-md font-semibold text-gold-400 mb-4 flex items-center">
                  <FaUser className="mr-2" /> Account Holder Information
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Account Holder Name *</label>
                    <input
                      type="text"
                      name="accountName"
                      value={bankForm.accountName}
                      onChange={handleBankFormChange}
                      className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                        formErrors.accountName ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Name on account"
                    />
                    {formErrors.accountName && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.accountName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gold-500/70 mb-2">Account Number *</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankForm.accountNumber}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                          formErrors.accountNumber ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="Enter account number"
                      />
                      {formErrors.accountNumber && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.accountNumber}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gold-500/70 mb-2">Confirm Account Number *</label>
                      <input
                        type="text"
                        name="confirmAccountNumber"
                        value={bankForm.confirmAccountNumber}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                          formErrors.confirmAccountNumber ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="Confirm account number"
                      />
                      {formErrors.confirmAccountNumber && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.confirmAccountNumber}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Routing Number *</label>
                    <input
                      type="text"
                      name="routingNumber"
                      value={bankForm.routingNumber}
                      onChange={handleBankFormChange}
                      className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
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
              <div className="border-b border-gold-500/20 pb-4">
                <h4 className="text-md font-semibold text-gold-400 mb-4 flex items-center">
                  <FaHome className="mr-2" /> Address Information
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={bankForm.address}
                      onChange={handleBankFormChange}
                      className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                        formErrors.address ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Enter street address"
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-gold-500/70 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={bankForm.city}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                          formErrors.city ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="City"
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gold-500/70 mb-2">State *</label>
                      <select
                        name="state"
                        value={bankForm.state}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
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
                    
                    <div>
                      <label className="block text-sm text-gold-500/70 mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={bankForm.zipCode}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
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

                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Country</label>
                    <select
                      name="country"
                      value={bankForm.country}
                      onChange={handleBankFormChange}
                      className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
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
                <label htmlFor="isDefaultBank" className="text-sm text-gold-500/70">
                  Set as default bank account
                </label>
              </div>

              {/* Security Notice */}
              <div className="bg-navy-700/30 rounded-lg p-4 flex items-start space-x-3">
                <FaShieldAlt className="text-gold-500 mt-1" />
                <div>
                  <p className="text-sm text-gold-500 font-medium">Your information is secure</p>
                  <p className="text-xs text-gold-500/50">All banking information is encrypted and securely stored. We never share your details with third parties.</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 disabled:bg-gold-500/50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  className="px-4 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Credit Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gold-500">Add Credit Card</h3>
              <button onClick={() => setShowAddCard(false)} className="text-gold-500/70 hover:text-gold-500">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddCreditCard} className="space-y-4">
              {/* Card Information */}
              <div className="border-b border-gold-500/20 pb-4">
                <h4 className="text-md font-semibold text-gold-400 mb-4 flex items-center">
                  <FaCreditCard className="mr-2" /> Card Information
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={cardForm.cardholderName}
                      onChange={handleCardFormChange}
                      className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                        formErrors.cardholderName ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Name as it appears on card"
                    />
                    {formErrors.cardholderName && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.cardholderName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardForm.cardNumber}
                      onChange={handleCardFormChange}
                      className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                        formErrors.cardNumber ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                    {formErrors.cardNumber && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm text-gold-500/70 mb-2">Month *</label>
                      <select
                        name="expiryMonth"
                        value={cardForm.expiryMonth}
                        onChange={handleCardFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                          formErrors.expiry ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                      >
                        <option value="">MM</option>
                        {months.map(month => (
                          <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-sm text-gold-500/70 mb-2">Year *</label>
                      <select
                        name="expiryYear"
                        value={cardForm.expiryYear}
                        onChange={handleCardFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                          formErrors.expiry ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                      >
                        <option value="">YYYY</option>
                        {years.map(year => (
                          <option key={year.value} value={year.value}>{year.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-sm text-gold-500/70 mb-2">CVV *</label>
                      <input
                        type="password"
                        name="cvv"
                        value={cardForm.cvv}
                        onChange={handleCardFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
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
              <div className="border-b border-gold-500/20 pb-4">
                <h4 className="text-md font-semibold text-gold-400 mb-4 flex items-center">
                  <FaHome className="mr-2" /> Billing Address
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={cardForm.billingAddress}
                      onChange={handleCardFormChange}
                      className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                        formErrors.billingAddress ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                      }`}
                      placeholder="Enter billing address"
                    />
                    {formErrors.billingAddress && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.billingAddress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-gold-500/70 mb-2">City *</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={cardForm.billingCity}
                        onChange={handleCardFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
                          formErrors.billingCity ? 'border-red-500' : 'border-gold-500/30 focus:border-gold-500'
                        }`}
                        placeholder="City"
                      />
                      {formErrors.billingCity && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.billingCity}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gold-500/70 mb-2">State *</label>
                      <select
                        name="billingState"
                        value={cardForm.billingState}
                        onChange={handleCardFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
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
                    
                    <div>
                      <label className="block text-sm text-gold-500/70 mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        name="billingZip"
                        value={cardForm.billingZip}
                        onChange={handleCardFormChange}
                        className={`w-full px-4 py-3 bg-navy-700 border rounded-lg text-white focus:outline-none ${
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

                  <div>
                    <label className="block text-sm text-gold-500/70 mb-2">Country</label>
                    <select
                      name="billingCountry"
                      value={cardForm.billingCountry}
                      onChange={handleCardFormChange}
                      className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
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
                <label htmlFor="isDefaultCard" className="text-sm text-gold-500/70">
                  Set as default payment method
                </label>
              </div>

              {/* Security Notice */}
              <div className="bg-navy-700/30 rounded-lg p-4 flex items-start space-x-3">
                <FaShieldAlt className="text-gold-500 mt-1" />
                <div>
                  <p className="text-sm text-gold-500 font-medium">Your card information is secure</p>
                  <p className="text-xs text-gold-500/50">We use industry-standard encryption to protect your payment information. Your full card number is never stored on our servers.</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 disabled:bg-gold-500/50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  className="px-4 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600"
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