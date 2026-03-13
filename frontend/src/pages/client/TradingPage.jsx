// frontend/src/pages/client/TradingPage.jsx
import React, { useState, useEffect } from 'react';
import {
  FaWallet, FaChartLine, FaExchangeAlt, FaBell, FaUserCircle,
  FaCog, FaSignOutAlt, FaArrowUp, FaArrowDown, FaEye, FaTimes,
  FaCheck, FaClock, FaPercent, FaDollarSign, FaBitcoin, FaEthereum,
  FaSearch, FaDownload, FaFilter, FaHistory, FaStar, FaChartBar,
  FaCalendarAlt, FaInfoCircle, FaCreditCard, FaCoins, FaGlobe,
  FaRocket, FaShieldAlt, FaChartPie, FaTrophy, FaGift, FaFire,
  FaBolt, FaLock, FaUnlock, FaExchangeAlt as FaTrade, FaCopy,
  FaShareAlt, FaBookmark, FaTag, FaBell as FaAlert, FaArrowCircleUp,
  FaArrowCircleDown, FaUser, FaUserPlus, FaChartArea, FaFileAlt,
  FaServer, FaCloud, FaDesktop, FaMobile, FaTable, FaThLarge,
  FaChartLine as FaChartLineIcon, FaWaveSquare, FaChartNetwork,
  FaUniversity, FaCreditCard as FaCreditCardIcon, FaMoneyBillWave,
  FaHistory as FaHistoryIcon, FaArrowRight, FaArrowLeft,
  FaUpload, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel,
  FaTrash, FaEdit, FaPlus, FaMinus, FaCheckCircle, FaExclamationCircle,
  FaPaperPlane, FaQrcode, FaMobileAlt, FaLandmark, FaPiggyBank,
  FaHandHoldingUsd, FaMoneyCheck, FaReceipt, FaFileInvoice
} from 'react-icons/fa';
import { MdCandlestickChart } from 'react-icons/md';
import { BsFillBarChartFill, BsGraphUp, BsGraphDown } from 'react-icons/bs';
import { RiBankCardFill, RiSecurePaymentFill } from 'react-icons/ri';

// Import components
import TradingViewWidget from '../../components/trading/TradingViewWidget';
import PriceTicker from '../../components/trading/PriceTicker';
import TradingChart from '../../components/trading/TradingChart';
import OrderBook from '../../components/trading/OrderBook';
import OrderForm from '../../components/trading/OrderForm';
import PositionsTable from '../../components/trading/PositionsTable';
import OpenOrders from '../../components/trading/OpenOrders';
import AccountSummary from '../../components/trading/AccountSummary';
import AreaChart from '../../components/ui/charts/AreaChart';

const TradingPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [chartType, setChartType] = useState('line');
  const [timeframe, setTimeframe] = useState('1H');
  const [activeTab, setActiveTab] = useState('positions');
  const [activePortalTab, setActivePortalTab] = useState('banking');
  const [showBalance, setShowBalance] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('wallet');
  const [transferAmount, setTransferAmount] = useState('');
  const [fromAccount, setFromAccount] = useState('wallet');
  const [toAccount, setToAccount] = useState('trading');

  

  // Portfolio Data
  const [portfolio, setPortfolio] = useState({
    totalBalance: 52450.75,
    availableBalance: 50000.25,
    equity: 53450.25,
    margin: 2450.5,
    marginLevel: 218,
    dailyPnL: 1250.5,
    dailyPnLPercent: 2.41,
    weeklyPnL: 4250.75,
    monthlyPnL: 18750.25,
    yearlyPnL: 245000.5,
    positionsCount: 3
  });

  // Wallet Data
  const [walletData, setWalletData] = useState({
    mainWallet: 52450.75,
    tradingWallet: 50000.25,
    bonusWallet: 2500.00,
    creditWallet: 5000.00,
    totalBalance: 59950.75,
    pendingWithdrawals: 1500.00,
    pendingDeposits: 2000.00
  });

  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 1,
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      accountName: 'John Smith',
      routingNumber: '021000021',
      accountType: 'Checking',
      isVerified: true,
      isDefault: true,
      balance: 25000.00
    },
    {
      id: 2,
      bankName: 'Bank of America',
      accountNumber: '****5678',
      accountName: 'John Smith',
      routingNumber: '026009593',
      accountType: 'Savings',
      isVerified: true,
      isDefault: false,
      balance: 15000.00
    }
  ]);

  // Credit Cards
  const [creditCards, setCreditCards] = useState([
    {
      id: 1,
      cardType: 'Visa',
      last4: '4242',
      expiryDate: '05/26',
      cardholderName: 'John Smith',
      isVerified: true,
      isDefault: true,
      creditLimit: 10000,
      availableCredit: 7500
    },
    {
      id: 2,
      cardType: 'Mastercard',
      last4: '8888',
      expiryDate: '08/25',
      cardholderName: 'John Smith',
      isVerified: true,
      isDefault: false,
      creditLimit: 15000,
      availableCredit: 12000
    }
  ]);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      method: 'PayPal',
      email: 'john.smith@email.com',
      isVerified: true,
      isDefault: true
    },
    {
      id: 2,
      method: 'Skrill',
      email: 'john.smith@skrill.com',
      isVerified: true,
      isDefault: false
    },
    {
      id: 3,
      method: 'Neteller',
      email: 'john.smith@neteller.com',
      isVerified: false,
      isDefault: false
    }
  ]);

  // Transaction History
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'Deposit',
      amount: 5000,
      currency: 'USD',
      method: 'Bank Transfer',
      status: 'Completed',
      date: '2024-03-07 10:30 AM',
      reference: 'DEP-2024-001',
      from: 'Chase Bank ****1234',
      to: 'Main Wallet',
      fee: 0
    },
    {
      id: 2,
      type: 'Withdrawal',
      amount: 1000,
      currency: 'USD',
      method: 'Credit Card',
      status: 'Pending',
      date: '2024-03-06 02:15 PM',
      reference: 'WDR-2024-002',
      from: 'Trading Account',
      to: 'Visa ****4242',
      fee: 2.50
    },
    {
      id: 3,
      type: 'Transfer',
      amount: 2500,
      currency: 'USD',
      method: 'Internal',
      status: 'Completed',
      date: '2024-03-05 09:45 AM',
      reference: 'TRF-2024-003',
      from: 'Main Wallet',
      to: 'Trading Account',
      fee: 0
    },
    {
      id: 4,
      type: 'Deposit',
      amount: 3000,
      currency: 'USD',
      method: 'PayPal',
      status: 'Completed',
      date: '2024-03-04 03:20 PM',
      reference: 'DEP-2024-004',
      from: 'PayPal',
      to: 'Main Wallet',
      fee: 15.00
    }
  ]);

  // Documents/Proof Uploads
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Passport.pdf',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2024-03-01',
      category: 'Identity Proof',
      status: 'Verified',
      url: '#'
    },
    {
      id: 2,
      name: 'Bank_Statement.pdf',
      type: 'PDF',
      size: '1.8 MB',
      uploadDate: '2024-03-01',
      category: 'Address Proof',
      status: 'Verified',
      url: '#'
    },
    {
      id: 3,
      name: 'Tax_Return_2023.pdf',
      type: 'PDF',
      size: '3.2 MB',
      uploadDate: '2024-03-05',
      category: 'Income Proof',
      status: 'Pending',
      url: '#'
    }
  ]);

  // Positions Data
  const [positions, setPositions] = useState([
    {
      id: 1,
      symbol: 'BTC/USD',
      type: 'LONG',
      quantity: 0.5,
      entryPrice: 42500,
      currentPrice: 43250,
      pnl: 375,
      pnlPercent: 1.76,
      liquidationPrice: 38250,
      margin: 2125
    },
    {
      id: 2,
      symbol: 'ETH/USD',
      type: 'SHORT',
      quantity: 5,
      entryPrice: 2850,
      currentPrice: 2820,
      pnl: 150,
      pnlPercent: 1.05,
      liquidationPrice: 3135,
      margin: 1425
    },
    {
      id: 3,
      symbol: 'EUR/USD',
      type: 'LONG',
      quantity: 10000,
      entryPrice: 1.0850,
      currentPrice: 1.0875,
      pnl: 25,
      pnlPercent: 0.23,
      liquidationPrice: 1.0650,
      margin: 1085
    }
  ]);

  // Orders Data
  const [orders, setOrders] = useState([
    {
      id: 1,
      symbol: 'BTC/USD',
      type: 'LIMIT',
      side: 'BUY',
      quantity: 0.1,
      price: 42000,
      status: 'OPEN',
      created: '2024-03-07T10:30:00'
    },
    {
      id: 2,
      symbol: 'ETH/USD',
      type: 'STOP',
      side: 'SELL',
      quantity: 2,
      price: 2900,
      status: 'OPEN',
      created: '2024-03-07T09:15:00'
    }
  ]);

  // Market Data
  const [marketData, setMarketData] = useState({
    'BTC/USD': { price: 43250, change: 2.5, volume: 1520000000 },
    'ETH/USD': { price: 2820, change: 1.8, volume: 850000000 },
    'EUR/USD': { price: 1.0875, change: 0.23, volume: 1200000000 },
    'GBP/USD': { price: 1.2650, change: -0.12, volume: 890000000 },
    'GOLD': { price: 2052.30, change: 0.38, volume: 3100000000 }
  });

  // Portfolio Chart Data
  const portfolioHistory = [
    { date: '2024-03-01', value: 50200 },
    { date: '2024-03-02', value: 50800 },
    { date: '2024-03-03', value: 51500 },
    { date: '2024-03-04', value: 51200 },
    { date: '2024-03-05', value: 52000 },
    { date: '2024-03-06', value: 52450 },
    { date: '2024-03-07', value: 53450 }
  ];

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'BTC/USD reached resistance level', type: 'info', read: false },
    { id: 2, message: 'Position liquidated: ETH/USD', type: 'warning', read: false },
    { id: 3, message: 'Deposit confirmed: $5,000', type: 'success', read: true },
    { id: 4, message: 'Document verified: Passport.pdf', type: 'success', read: false }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Real-time price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => {
        const newData = {};
        Object.keys(prev).forEach(key => {
          const change = (Math.random() - 0.5) * 0.001;
          newData[key] = {
            ...prev[key],
            price: prev[key].price * (1 + change),
            change: prev[key].change + (Math.random() - 0.5) * 0.1
          };
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePlaceOrder = (orderData) => {
    console.log('Placing order:', orderData);
    setShowOrderForm(false);
  };

  const handleClosePosition = (positionId) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  };

  const handleCancelOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleTransfer = () => {
    console.log('Transferring:', { from: fromAccount, to: toAccount, amount: transferAmount });
    setShowTransferModal(false);
    setTransferAmount('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newDoc = {
        id: documents.length + 1,
        name: file.name,
        type: file.type.split('/')[1].toUpperCase(),
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date().toISOString().split('T')[0],
        category: 'New Document',
        status: 'Pending',
        url: '#'
      };
      setDocuments([...documents, newDoc]);
      setShowUploadModal(false);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Header Component
  const Header = () => (
    <header className="bg-navy-900/95 backdrop-blur-lg border-b border-gold-500/30 sticky top-0 z-50">
      <div className="px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                <FaChartLineIcon className="text-navy-950 text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Rizal's<span className="text-gold-500 ml-1">Trade</span>
                </h1>
                <p className="text-xs text-gold-500/70">Professional Trading</p>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 bg-navy-800/50 rounded-lg p-1 ml-6">
              {['trading', 'markets', 'portfolio', 'banking', 'documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-gold-500 text-navy-950'
                      : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            <div className="hidden lg:block">
              <p className="text-xs text-gold-500/70">Account Balance</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-bold text-white">
                  {showBalance ? `$${portfolio.totalBalance.toLocaleString()}` : '••••••'}
                </p>
                <button onClick={() => setShowBalance(!showBalance)}>
                  <FaEye className={`text-gold-500/70 hover:text-gold-500 ${showBalance ? '' : 'opacity-50'}`} />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setShowOrderForm(true)}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all"
            >
              <FaBolt />
              <span className="font-medium">Quick Trade</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-gold-500/70 hover:text-gold-500">
                <FaBell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-2 border-l border-gold-500/30">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">John Smith</p>
                <p className="text-xs text-gold-500/70">Premium Trader</p>
              </div>
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-gold-500/20">
                  <span className="text-navy-950 font-bold text-lg">JS</span>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-navy-800 rounded-lg shadow-xl border border-gold-500/30 hidden group-hover:block">
                  <div className="p-2">
                    <a href="#" className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded">Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded">Settings</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded">Statements</a>
                    <div className="border-t border-gold-500/30 my-2"></div>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-navy-700 rounded flex items-center">
                      <FaSignOutAlt className="mr-2" size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // Banking Zone Component
  const BankingZone = () => (
    <div className="space-y-6">
      {/* Banking Navigation */}
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Banking Overview', icon: FaUniversity },
            { id: 'transfer', label: 'Internal Transfer', icon: FaExchangeAlt },
            { id: 'withdraw', label: 'Withdrawals', icon: FaMoneyBillWave },
            { id: 'accounts', label: 'Bank Accounts', icon: FaLandmark },
            { id: 'cards', label: 'Credit Cards', icon: FaCreditCardIcon },
            { id: 'payment', label: 'Payment Methods', icon: FaMobileAlt },
            { id: 'history', label: 'Transaction History', icon: FaHistoryIcon }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePortalTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                activePortalTab === item.id
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
                  ${walletData.mainWallet.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-navy-700/50 rounded-lg p-3">
                  <p className="text-xs text-gold-500/70">Trading Wallet</p>
                  <p className="text-lg font-semibold text-gold-400">
                    ${walletData.tradingWallet.toLocaleString()}
                  </p>
                </div>
                <div className="bg-navy-700/50 rounded-lg p-3">
                  <p className="text-xs text-gold-500/70">Bonus Wallet</p>
                  <p className="text-lg font-semibold text-green-400">
                    ${walletData.bonusWallet.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-gold-500/20">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Pending Withdrawals</span>
                  <span className="text-yellow-400">${walletData.pendingWithdrawals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gold-500/70">Pending Deposits</span>
                  <span className="text-green-400">${walletData.pendingDeposits}</span>
                </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button className="flex-1 px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all">
                  Deposit
                </button>
                <button className="flex-1 px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 transition-all">
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
                onClick={() => setShowTransferModal(true)}
                className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between"
              >
                <span className="flex items-center">
                  <FaExchangeAlt className="mr-2 text-gold-500" />
                  Internal Transfer
                </span>
                <FaArrowRight className="text-gold-500/50" />
              </button>
              <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between">
                <span className="flex items-center">
                  <FaCreditCardIcon className="mr-2 text-gold-500" />
                  Add Bank Account
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
          {activePortalTab === 'overview' && (
            <>
              {/* Banking Overview */}
              <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
                <h3 className="text-lg font-semibold text-gold-500 mb-4">Banking Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">${walletData.totalBalance}</p>
                    <p className="text-xs text-gold-500/70">Total Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">+$5,250</p>
                    <p className="text-xs text-gold-500/70">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold-400">12</p>
                    <p className="text-xs text-gold-500/70">Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">2</p>
                    <p className="text-xs text-gold-500/70">Pending</p>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
                <div className="p-4 border-b border-gold-500/20 flex justify-between items-center">
                  <h3 className="text-md font-semibold text-gold-500">Recent Transactions</h3>
                  <button className="text-sm text-gold-500 hover:text-gold-400">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-navy-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Method</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {transactions.slice(0, 3).map((tx) => (
                        <tr key={tx.id} className="hover:bg-navy-700/30">
                          <td className="px-4 py-3 text-sm text-gold-500/70">{tx.date}</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm ${
                              tx.type === 'Deposit' ? 'text-green-400' : 
                              tx.type === 'Withdrawal' ? 'text-red-400' : 'text-gold-400'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-white">${tx.amount}</td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">{tx.method}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bank Accounts Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                  <h4 className="text-sm font-semibold text-gold-500 mb-3">Linked Bank Accounts</h4>
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between py-2 border-b border-gold-500/10 last:border-0">
                      <div>
                        <p className="text-sm text-white">{account.bankName}</p>
                        <p className="text-xs text-gold-500/50">{account.accountNumber}</p>
                      </div>
                      {account.isDefault && (
                        <span className="text-xs bg-gold-500/20 text-gold-500 px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                  <h4 className="text-sm font-semibold text-gold-500 mb-3">Linked Cards</h4>
                  {creditCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between py-2 border-b border-gold-500/10 last:border-0">
                      <div>
                        <p className="text-sm text-white">{card.cardType} •••• {card.last4}</p>
                        <p className="text-xs text-gold-500/50">Expires {card.expiryDate}</p>
                      </div>
                      {card.isDefault && (
                        <span className="text-xs bg-gold-500/20 text-gold-500 px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activePortalTab === 'transfer' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-lg font-semibold text-gold-500 mb-6">Manual Internal Transfer Request</h3>
              
              <div className="space-y-6">
                {/* From Section */}
                <div>
                  <label className="block text-sm text-gold-500/70 mb-3">From</label>
                  <div className="space-y-3">
                    <div className="flex items-center p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
                      <input
                        type="radio"
                        name="from"
                        value="wallet"
                        checked={fromAccount === 'wallet'}
                        onChange={(e) => setFromAccount(e.target.value)}
                        className="mr-3 accent-gold-500"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">My Wallet (USD)</p>
                        <p className="text-sm text-gold-500/70">Current Balance: ${walletData.mainWallet}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
                      <input
                        type="radio"
                        name="from"
                        value="trading"
                        checked={fromAccount === 'trading'}
                        onChange={(e) => setFromAccount(e.target.value)}
                        className="mr-3 accent-gold-500"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">My Trading Accounts</p>
                        <p className="text-sm text-gold-500/70">Available Balance: ${walletData.tradingWallet}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* To Section */}
                <div>
                  <label className="block text-sm text-gold-500/70 mb-3">To</label>
                  <select
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="trading">Trading Account (MT5)</option>
                    <option value="wallet">Main Wallet</option>
                    <option value="bonus">Bonus Wallet</option>
                  </select>
                </div>

                {/* Wallet Information */}
                <div className="bg-navy-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gold-500 mb-3">My Wallet Information</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-gold-500/70">Current Balance</span>
                    <span className="text-2xl font-bold text-white">$0.00</span>
                  </div>
                </div>

                {/* Amount to Transfer */}
                <div>
                  <label className="block text-sm text-gold-500/70 mb-2">Amount to Transfer (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500">$</span>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[100, 500, 1000, 5000, 10000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTransferAmount(amount)}
                      className="px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Transfer Summary */}
                <div className="bg-navy-700/50 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gold-500/70">Transfer Amount</span>
                    <span className="text-white font-medium">${transferAmount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gold-500/70">Transfer Fee</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gold-500/20">
                    <span className="text-gold-500/70">You'll Receive</span>
                    <span className="text-gold-400 font-bold">${transferAmount || '0.00'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleTransfer}
                    className="flex-1 px-6 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 transition-all"
                  >
                    Confirm Transfer
                  </button>
                  <button
                    onClick={() => setShowTransferModal(false)}
                    className="px-6 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePortalTab === 'accounts' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gold-500">Your Bank Accounts</h3>
                <button className="px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all">
                  + Add Bank Account
                </button>
              </div>
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="bg-navy-700/50 rounded-lg p-4 border border-gold-500/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <FaLandmark className="text-gold-500" />
                          <h4 className="text-white font-medium">{account.bankName}</h4>
                          {account.isVerified && (
                            <FaCheckCircle className="text-green-400" size={16} />
                          )}
                        </div>
                        <p className="text-sm text-gold-500/70 mt-2">
                          Account: {account.accountName} - {account.accountNumber}
                        </p>
                        <p className="text-xs text-gold-500/50">
                          Routing: {account.routingNumber} • {account.accountType}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {account.isDefault && (
                          <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
                        )}
                        <button className="p-2 text-gold-500/70 hover:text-gold-500">
                          <FaEdit />
                        </button>
                        <button className="p-2 text-red-400/70 hover:text-red-400">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePortalTab === 'cards' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gold-500">Your Credit Cards</h3>
                <button className="px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all">
                  + Add Card
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creditCards.map((card) => (
                  <div key={card.id} className="bg-gradient-to-br from-navy-700 to-navy-800 rounded-lg p-4 border border-gold-500/30">
                    <div className="flex justify-between items-start mb-4">
                      <FaCreditCardIcon className="text-gold-500 text-2xl" />
                      {card.isDefault && (
                        <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
                      )}
                    </div>
                    <p className="text-white font-mono text-lg">•••• •••• •••• {card.last4}</p>
                    <p className="text-sm text-gold-500/70 mt-2">{card.cardholderName}</p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xs text-gold-500/50">Expires {card.expiryDate}</p>
                      <p className="text-xs text-green-400">Available: ${card.availableCredit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePortalTab === 'payment' && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-lg font-semibold text-gold-500 mb-6">Your Online Payment Methods</h3>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
                    <div className="flex items-center space-x-3">
                      {method.method === 'PayPal' && <FaMoneyBillWave className="text-blue-400" />}
                      <div>
                        <p className="text-white font-medium">{method.method}</p>
                        <p className="text-sm text-gold-500/70">{method.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {method.isVerified ? (
                        <FaCheckCircle className="text-green-400" />
                      ) : (
                        <FaExclamationCircle className="text-yellow-400" />
                      )}
                      {method.isDefault && (
                        <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded">Default</span>
                      )}
                      <button className="p-2 text-gold-500/70 hover:text-gold-500">
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePortalTab === 'history' && (
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
                          <span className={`text-sm ${
                            tx.type === 'Deposit' ? 'text-green-400' : 
                            tx.type === 'Withdrawal' ? 'text-red-400' : 'text-gold-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">${tx.amount}</td>
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
                          <button className="text-gold-500/70 hover:text-gold-500">
                            <FaDownload size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Documents/Verification Component
  const DocumentsZone = () => (
    <div className="space-y-6">
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gold-500">My Documents</h3>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gold-500 text-navy-950 rounded-lg hover:bg-gold-600 transition-all flex items-center space-x-2"
          >
            <FaUpload />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Document Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-navy-700/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">2</p>
            <p className="text-sm text-gold-500/70">Verified</p>
          </div>
          <div className="bg-navy-700/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">1</p>
            <p className="text-sm text-gold-500/70">Pending</p>
          </div>
          <div className="bg-navy-700/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gold-400">3</p>
            <p className="text-sm text-gold-500/70">Total Documents</p>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Document Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Upload Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/10">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-navy-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {doc.type === 'PDF' && <FaFilePdf className="text-red-400" />}
                      {doc.type === 'JPG' && <FaFileImage className="text-blue-400" />}
                      <span className="text-sm text-white">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{doc.category}</td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{doc.type}</td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{doc.size}</td>
                  <td className="px-4 py-3 text-sm text-gold-500/70">{doc.uploadDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doc.status === 'Verified' ? 'bg-green-500/20 text-green-400' : 
                      doc.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gold-500/70 hover:text-gold-500">
                        <FaDownload size={14} />
                      </button>
                      <button className="p-1 text-gold-500/70 hover:text-gold-500">
                        <FaEye size={14} />
                      </button>
                      <button className="p-1 text-red-400/70 hover:text-red-400">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification Progress */}
        <div className="mt-6 p-4 bg-navy-700/30 rounded-lg">
          <h4 className="text-sm font-semibold text-gold-500 mb-3">Verification Progress</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gold-500/70">Identity Verification</span>
                <span className="text-green-400">Completed</span>
              </div>
              <div className="w-full bg-navy-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gold-500/70">Address Verification</span>
                <span className="text-green-400">Completed</span>
              </div>
              <div className="w-full bg-navy-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gold-500/70">Income Verification</span>
                <span className="text-yellow-400">Pending</span>
              </div>
              <div className="w-full bg-navy-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaChartLineIcon className="text-gold-500 text-3xl animate-pulse" />
            </div>
          </div>
          <p className="text-gold-400 text-lg font-medium">Loading your trading dashboard...</p>
          <p className="text-gold-500/50 text-sm mt-2">Real-time data connecting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <Header />
      <PriceTicker data={marketData} />

      <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {activeTab === 'trading' && (
          <>
            <AccountSummary 
              portfolio={portfolio}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
            />

            {/* Main Trading Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 mb-6">
              {/* Chart Area - 3 columns */}
              <div className="lg:col-span-3 space-y-4">
                {/* Chart Controls */}
                <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {/* Symbol Selector */}
                      <select
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        className="px-3 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-gold-500 focus:outline-none focus:border-gold-500"
                      >
                        <option value="BTCUSD">BTC/USD</option>
                        <option value="ETHUSD">ETH/USD</option>
                        <option value="EURUSD">EUR/USD</option>
                        <option value="GBPUSD">GBP/USD</option>
                        <option value="GOLD">GOLD</option>
                      </select>

                      {/* Chart Type Selector */}
                      <div className="flex items-center space-x-1 bg-navy-700 rounded-lg p-1">
                        <button
                          onClick={() => setChartType('candlestick')}
                          className={`p-2 rounded ${chartType === 'candlestick' ? 'bg-gold-500 text-navy-950' : 'text-gold-500/70 hover:text-gold-500'}`}
                          title="Candlestick"
                        >
                          <MdCandlestickChart size={18} />
                        </button>
                        <button
                          onClick={() => setChartType('line')}
                          className={`p-2 rounded ${chartType === 'line' ? 'bg-gold-500 text-navy-950' : 'text-gold-500/70 hover:text-gold-500'}`}
                          title="Line"
                        >
                          <FaChartLine size={16} />
                        </button>
                        <button
                          onClick={() => setChartType('area')}
                          className={`p-2 rounded ${chartType === 'area' ? 'bg-gold-500 text-navy-950' : 'text-gold-500/70 hover:text-gold-500'}`}
                          title="Area"
                        >
                          <BsFillBarChartFill size={16} />
                        </button>
                      </div>

                      {/* Timeframe Selector */}
                      <div className="flex items-center space-x-1 bg-navy-700 rounded-lg p-1">
                        {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              timeframe === tf
                                ? 'bg-gold-500 text-navy-950'
                                : 'text-gold-500/70 hover:text-gold-500'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Market Stats */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="text-gold-500/70 mr-2">Bid:</span>
                        <span className="text-white">${marketData['BTC/USD']?.price || 43250}</span>
                      </div>
                      <div>
                        <span className="text-gold-500/70 mr-2">24h Change:</span>
                        <span className={marketData['BTC/USD']?.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {marketData['BTC/USD']?.change >= 0 ? '+' : ''}{marketData['BTC/USD']?.change || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gold-500/70 mr-2">Volume:</span>
                        <span className="text-white">${(marketData['BTC/USD']?.volume / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Container */}
                <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden" style={{ height: '500px' }}>
                  {selectedSymbol === 'BTCUSD' ? (
                    <TradingViewWidget symbol="BTCUSD" />
                  ) : (
                    <TradingChart type={chartType} />
                  )}
                </div>

                {/* Order Book */}
                <OrderBook />
              </div>

              {/* Order Form - 1 column */}
              <div className="lg:col-span-1">
                <OrderForm onSubmit={handlePlaceOrder} />
              </div>
            </div>

            {/* Positions and Orders Tabs */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden mb-6">
              <div className="border-b border-gold-500/20">
                <div className="flex space-x-1 p-1">
                  <button
                    onClick={() => setActiveTab('positions')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeTab === 'positions'
                        ? 'bg-gold-500 text-navy-950'
                        : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
                    }`}
                  >
                    Open Positions ({positions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      activeTab === 'orders'
                        ? 'bg-gold-500 text-navy-950'
                        : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
                    }`}
                  >
                    Open Orders ({orders.length})
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === 'positions' && (
                  <PositionsTable 
                    positions={positions}
                    onClose={handleClosePosition}
                  />
                )}
                {activeTab === 'orders' && (
                  <OpenOrders 
                    orders={orders}
                    onCancel={handleCancelOrder}
                  />
                )}
              </div>
            </div>

            {/* Portfolio Performance Chart */}
            <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gold-500">Portfolio Performance</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gold-500/50">Total Return: </span>
                  <span className="text-sm font-medium text-green-400">+6.5%</span>
                </div>
              </div>
              <div style={{ height: '200px' }}>
                <AreaChart 
                  data={portfolioHistory}
                  xKey="date"
                  yKey="value"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'banking' && <BankingZone />}
        {activeTab === 'documents' && <DocumentsZone />}
        {activeTab === 'markets' && (
          <div className="bg-navy-800/50 rounded-xl p-8 text-center border border-gold-500/20">
            <h2 className="text-2xl font-bold text-gold-500 mb-4">Markets Overview</h2>
            <p className="text-gold-500/70">Market analysis and data coming soon...</p>
          </div>
        )}
        {activeTab === 'portfolio' && (
          <div className="bg-navy-800/50 rounded-xl p-8 text-center border border-gold-500/20">
            <h2 className="text-2xl font-bold text-gold-500 mb-4">Portfolio Analytics</h2>
            <p className="text-gold-500/70">Detailed portfolio analysis coming soon...</p>
          </div>
        )}
      </main>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Internal Transfer</h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gold-500/70 hover:text-gold-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* From Section */}
              <div>
                <label className="block text-sm text-gold-500/70 mb-3">From</label>
                <div className="space-y-3">
                  <div className="flex items-center p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
                    <input
                      type="radio"
                      name="from"
                      value="wallet"
                      checked={fromAccount === 'wallet'}
                      onChange={(e) => setFromAccount(e.target.value)}
                      className="mr-3 accent-gold-500"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">My Wallet (USD)</p>
                      <p className="text-sm text-gold-500/70">Current Balance: ${walletData.mainWallet}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-navy-700/50 rounded-lg border border-gold-500/20">
                    <input
                      type="radio"
                      name="from"
                      value="trading"
                      checked={fromAccount === 'trading'}
                      onChange={(e) => setFromAccount(e.target.value)}
                      className="mr-3 accent-gold-500"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">My Trading Accounts</p>
                      <p className="text-sm text-gold-500/70">Available Balance: ${walletData.tradingWallet}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* To Section */}
              <div>
                <label className="block text-sm text-gold-500/70 mb-3">To</label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="trading">Trading Account (MT5)</option>
                  <option value="wallet">Main Wallet</option>
                  <option value="bonus">Bonus Wallet</option>
                </select>
              </div>

              {/* Wallet Information */}
              <div className="bg-navy-700/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gold-500 mb-3">My Wallet Information</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gold-500/70">Current Balance</span>
                  <span className="text-2xl font-bold text-white">
                    ${fromAccount === 'wallet' ? walletData.mainWallet : walletData.tradingWallet}
                  </span>
                </div>
              </div>

              {/* Amount to Transfer */}
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Amount to Transfer (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold-500">$</span>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 5000, 10000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTransferAmount(amount)}
                    className="px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Transfer Summary */}
              <div className="bg-navy-700/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Transfer Amount</span>
                  <span className="text-white font-medium">${transferAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gold-500/70">Transfer Fee</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gold-500/20">
                  <span className="text-gold-500/70">You'll Receive</span>
                  <span className="text-gold-400 font-bold">${transferAmount || '0.00'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleTransfer}
                  className="flex-1 px-6 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 transition-all"
                >
                  Confirm Transfer
                </button>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-6 py-3 bg-navy-700 text-gold-500 rounded-lg font-bold hover:bg-navy-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gold-500/70 hover:text-gold-500"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Document Type</label>
                <select className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500">
                  <option>Identity Proof (Passport/Driver's License)</option>
                  <option>Address Proof (Utility Bill)</option>
                  <option>Income Proof (Bank Statement)</option>
                  <option>Tax Document</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gold-500/70 mb-2">Upload File</label>
                <div className="border-2 border-dashed border-gold-500/30 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FaUpload className="text-gold-500 text-3xl mb-2" />
                    <p className="text-gold-500/70 text-sm mb-1">Click to upload or drag and drop</p>
                    <p className="text-gold-500/50 text-xs">PDF, JPG, PNG up to 10MB</p>
                  </label>
                </div>
              </div>

              <div className="bg-navy-700/30 rounded-lg p-3">
                <p className="text-xs text-gold-500/70 mb-2">Accepted formats:</p>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-navy-700 text-gold-500 text-xs rounded">PDF</span>
                  <span className="px-2 py-1 bg-navy-700 text-gold-500 text-xs rounded">JPG</span>
                  <span className="px-2 py-1 bg-navy-700 text-gold-500 text-xs rounded">PNG</span>
                  <span className="px-2 py-1 bg-navy-700 text-gold-500 text-xs rounded">DOC</span>
                </div>
              </div>

              <button className="w-full px-4 py-3 bg-gold-500 text-navy-950 rounded-lg font-bold hover:bg-gold-600 transition-all">
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Trade Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Quick Trade</h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-gold-500/70 hover:text-gold-500"
              >
                <FaTimes />
              </button>
            </div>
            <OrderForm onSubmit={handlePlaceOrder} />
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowOrderForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center text-navy-950 shadow-lg hover:bg-gold-600 transition-all hover:scale-110 z-40"
      >
        <FaBolt size={24} />
      </button>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TradingPage;