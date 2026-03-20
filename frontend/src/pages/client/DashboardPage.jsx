// frontend/src/pages/client/DashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBolt, FaChartLine, FaTimes, FaBars, FaBell, 
  FaUser, FaSignOutAlt, FaCog, FaSearch, FaFilter,
  FaArrowUp, FaArrowDown, FaWallet, FaExchangeAlt,
  FaFileAlt, FaLandmark, FaCreditCard, FaHistory,
  FaHome, FaChartBar, FaDatabase, FaDownload,
  FaMoon, FaSun
} from 'react-icons/fa';

// Import dashboard components
import Header from '../../components/client/Header';
import TradingTab from '../../components/client/TradingTab';
import BankingTab from '../../components/client/BankingTab';
import DocumentsTab from '../../components/client/DocumentsTab';
import TransferModal from '../../components/client/TransferModal';
import UploadModal from '../../components/client/UploadModal';
import PriceTicker from '../../components/trading/PriceTicker';
import { AuthContext } from '../../context/AuthContext';
import RealTimeChart from '../../components/trading/RealTimeChart';


const DashboardPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('trading');
  const [showBalance, setShowBalance] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [darkMode, setDarkMode] = useState(true);

  // Find the selected account based on the session
  const activeAccount = user?.accounts?.find(acc => acc.type === user.selectedAccountType) || {
    balance: 0,
    type: user?.selectedAccountType || 'demo',
    account_number: 'N/A'
  };

  // Dynamic Portfolio Data
  const [portfolio, setPortfolio] = useState({
    totalBalance: activeAccount.balance,
    availableBalance: activeAccount.balance,
    equity: activeAccount.balance,
    margin: 0,
    marginLevel: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    weeklyPnL: 0,
    monthlyPnL: 0,
    yearlyPnL: 0,
    positionsCount: 0
  });

  // Dynamic Wallet Data
  const [walletData, setWalletData] = useState({
    mainWallet: activeAccount.balance,
    tradingWallet: activeAccount.balance,
    bonusWallet: 0,
    creditWallet: 0,
    totalBalance: activeAccount.balance,
    pendingWithdrawals: 0,
    pendingDeposits: 0
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
    { id: 3, message: 'Deposit confirmed: $5,000', type: 'success', read: true }
  ]);

  // Mobile Navigation Items with darker styling
  const mobileNavItems = [
    { id: 'trading', label: 'Trading', icon: FaChartLine, color: 'text-blue-400' },
    { id: 'banking', label: 'Banking', icon: FaWallet, color: 'text-green-400' },
    { id: 'documents', label: 'Documents', icon: FaFileAlt, color: 'text-yellow-400' },
    { id: 'markets', label: 'Markets', icon: FaChartBar, color: 'text-purple-400' },
    { id: 'portfolio', label: 'Portfolio', icon: FaDatabase, color: 'text-orange-400' },
    { id: 'history', label: 'History', icon: FaHistory, color: 'text-pink-400' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    
    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
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

  const handleTransfer = ({ from, to, amount }) => {
    console.log('Transferring:', { from, to, amount });
    // Update wallet balances
    if (from === 'wallet' && to === 'trading') {
      setWalletData(prev => ({
        ...prev,
        mainWallet: prev.mainWallet - amount,
        tradingWallet: prev.tradingWallet + amount
      }));
    }
    setShowTransferModal(false);
  };

  const handleFileUpload = (file) => {
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
  };

  const handleAddBankAccount = (newAccount) => {
    setBankAccounts([...bankAccounts, newAccount]);
  };

  const handleAddCreditCard = (newCard) => {
    setCreditCards([...creditCards, newCard]);
  };

  const handleDeleteBankAccount = (id) => {
    setBankAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const handleDeleteCreditCard = (id) => {
    setCreditCards(prev => prev.filter(card => card.id !== id));
  };

  const handleSetDefaultBankAccount = (id) => {
    setBankAccounts(prev => prev.map(acc => ({
      ...acc,
      isDefault: acc.id === id
    })));
  };

  const handleSetDefaultCreditCard = (id) => {
    setCreditCards(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === id
    })));
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const isMobile = windowWidth < 768;

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 sm:w-24 h-16 sm:h-24 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaChartLine className="text-gold-500 text-xl sm:text-3xl animate-pulse" />
            </div>
          </div>
          <p className="text-gold-400 text-base sm:text-lg font-medium">Loading your dashboard...</p>
          <p className="text-gold-500/50 text-xs sm:text-sm mt-2">Real-time data connecting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <Header 
        activeTab={activeMainTab}
        onTabChange={(tab) => {
          setActiveMainTab(tab);
          setShowMobileMenu(false);
        }}
        portfolio={portfolio}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
        onQuickTrade={() => setShowOrderForm(true)}
        unreadNotifications={unreadNotifications}
        user={user}
        onLogout={handleLogout}
      />
      
      <PriceTicker data={marketData} />

      {/* Mobile Navigation Bar - Darker for better visibility */}
      {isMobile && (
        <div className="sticky top-0 z-40 bg-navy-900/98 backdrop-blur-sm border-b border-gold-500/30 shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 bg-navy-800 rounded-lg text-gold-400 hover:text-gold-300 border border-gold-500/20"
            >
              <FaBars size={20} />
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="p-2 bg-navy-800 rounded-lg text-gold-400 hover:text-gold-300 border border-gold-500/20"
              >
                <FaFilter size={18} />
              </button>
              <button className="p-2 bg-navy-800 rounded-lg text-gold-400 hover:text-gold-300 border border-gold-500/20 relative">
                <FaBell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-navy-900">
                    {unreadNotifications}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Filters - Darker background */}
          {showMobileFilters && (
            <div className="px-4 py-3 bg-navy-900 border-t border-gold-500/30">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/70" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  className="w-full pl-10 pr-4 py-3 bg-navy-800 border border-gold-500/40 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 placeholder-gold-500/50"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Side Menu - Darker and more visible */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay - Darker */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          
          {/* Menu Panel - Darker with better contrast */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-navy-950 border-r border-gold-500/40 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gold-500/40 bg-navy-900">
              <h2 className="text-xl font-bold text-gold-400">Navigation</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 bg-navy-800 rounded-lg text-gold-400 hover:text-gold-300 border border-gold-500/30"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-navy-950">
              <div className="space-y-2">
                {mobileNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMainTab(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full px-4 py-4 rounded-xl text-left flex items-center space-x-3 transition-all ${
                      activeMainTab === item.id
                        ? 'bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/20'
                        : 'bg-navy-800 hover:bg-navy-700 text-gold-300 border border-gold-500/30'
                    }`}
                  >
                    <item.icon size={20} className={activeMainTab === item.id ? 'text-navy-950' : item.color} />
                    <span className={`font-medium ${activeMainTab === item.id ? 'text-navy-950' : 'text-white'}`}>
                      {item.label}
                    </span>
                    {activeMainTab === item.id && (
                      <span className="ml-auto text-xs bg-navy-950/20 text-navy-950 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gold-500/40">
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 bg-navy-800 hover:bg-navy-700 rounded-xl text-left flex items-center space-x-3 border border-gold-500/30">
                    <FaUser className="text-blue-400" size={18} />
                    <span className="text-white font-medium">Profile</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-navy-800 hover:bg-navy-700 rounded-xl text-left flex items-center space-x-3 border border-gold-500/30">
                    <FaCog className="text-purple-400" size={18} />
                    <span className="text-white font-medium">Settings</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-navy-800 hover:bg-navy-700 rounded-xl text-left flex items-center space-x-3 border border-gold-500/30">
                    <FaMoon className="text-yellow-400" size={18} />
                    <span className="text-white font-medium">Dark Mode</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-900/30 hover:bg-red-900/50 rounded-xl text-left flex items-center space-x-3 border border-red-500/30"
                  >
                    <FaSignOutAlt className="text-red-400" size={18} />
                    <span className="text-red-400 font-medium">Logout</span>
                  </button>
                </div>
              </div>
              
              {/* User Info - Darker */}
              <div className="mt-6 p-4 bg-navy-800 rounded-xl border border-gold-500/40">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center border-2 border-gold-500/50">
                    <FaUser className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">John Smith</p>
                    <p className="text-xs text-gold-400/70">Premium Member</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Quick Stats for Mobile - Darker cards */}
        {isMobile && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-navy-800 rounded-lg p-4 border border-gold-500/40 shadow-lg">
              <p className="text-xs text-gold-400 mb-1">Total Balance</p>
              <p className="text-xl font-bold text-white">
                ${showBalance ? portfolio.totalBalance.toLocaleString() : '••••••'}
              </p>
            </div>
            <div className="bg-navy-800 rounded-lg p-4 border border-gold-500/40 shadow-lg">
              <p className="text-xs text-gold-400 mb-1">Today's P&L</p>
              <div className="flex items-center">
                {portfolio.dailyPnL > 0 ? (
                  <FaArrowUp className="text-green-400 mr-1" size={14} />
                ) : (
                  <FaArrowDown className="text-red-400 mr-1" size={14} />
                )}
                <p className={`text-xl font-bold ${
                  portfolio.dailyPnL > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${showBalance ? Math.abs(portfolio.dailyPnL).toLocaleString() : '••••••'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeMainTab === 'trading' && (
          <TradingTab 
            portfolio={portfolio}
            showBalance={showBalance}
            onToggleBalance={() => setShowBalance(!showBalance)}
            positions={positions}
            orders={orders}
            marketData={marketData}
            portfolioHistory={portfolioHistory}
            onPlaceOrder={handlePlaceOrder}
            onClosePosition={handleClosePosition}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {activeMainTab === 'banking' && (
          <BankingTab 
            walletData={walletData}
            bankAccounts={bankAccounts}
            creditCards={creditCards}
            paymentMethods={paymentMethods}
            transactions={transactions}
            onTransfer={handleTransfer}
            onShowTransferModal={() => setShowTransferModal(true)}
            onAddBankAccount={handleAddBankAccount}
            onAddCreditCard={handleAddCreditCard}
            onDeleteBankAccount={handleDeleteBankAccount}
            onDeleteCreditCard={handleDeleteCreditCard}
            onSetDefaultBankAccount={handleSetDefaultBankAccount}
            onSetDefaultCreditCard={handleSetDefaultCreditCard}
          />
        )}

        {activeMainTab === 'documents' && (
          <DocumentsTab 
            documents={documents}
            onUpload={() => setShowUploadModal(true)}
          />
        )}

  {activeMainTab === 'markets' && (
  <div className="space-y-4">
    {/* Main Chart */}
    <div className="bg-navy-800/80 rounded-xl p-4 sm:p-6 border border-gold-500/30 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gold-400">BTC/USD Chart</h2>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-gold-500 text-sm">
            <option>1H</option>
            <option>4H</option>
            <option selected>1D</option>
            <option>1W</option>
            <option>1M</option>
          </select>
        </div>
      </div>
      
      <div className="w-full h-[400px] sm:h-[500px] rounded-lg overflow-hidden border border-gold-500/30">
        <RealTimeChart 
          symbol="BTC/USD"
          theme={darkMode ? 'dark' : 'light'}
          height="100%"
          width="100%"
        />
      </div>
    </div>

    {/* Market Grid */}
    <div className="bg-navy-800/80 rounded-xl p-4 sm:p-6 border border-gold-500/30 shadow-xl">
      <h2 className="text-lg sm:text-xl font-bold text-gold-400 mb-4">Market Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(marketData).map(([symbol, data]) => (
          <div key={symbol} className="bg-navy-700/80 rounded-lg p-4 border border-gold-500/30 hover:border-gold-500/50 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <span className="text-white font-semibold">{symbol}</span>
              <span className={`text-sm font-medium ${data.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.change > 0 ? '+' : ''}{data.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">${data.price.toLocaleString()}</p>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gold-400/70">Vol: ${(data.volume / 1e6).toFixed(1)}M</span>
              <span className="text-gold-400">View →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

  {activeMainTab === 'portfolio' && (
  <div className="space-y-4">
    {/* Portfolio Performance */}
    <div className="bg-navy-800/80 rounded-xl p-4 sm:p-6 border border-gold-500/30 shadow-xl">
      <h2 className="text-lg sm:text-xl font-bold text-gold-400 mb-4">Portfolio Performance</h2>
      
      <div className="w-full h-[300px] sm:h-[350px] rounded-lg overflow-hidden border border-gold-500/30 mb-4">
        <RealTimeChart 
          symbol="BTC/USD"
          theme={darkMode ? 'dark' : 'light'}
          height="100%"
          width="100%"
        />
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy-700/50 rounded-lg p-3">
          <span className="text-xs text-gold-400/70">Total Value</span>
          <p className="text-xl font-bold text-white">${showBalance ? portfolio.totalBalance.toLocaleString() : '••••••'}</p>
        </div>
        <div className="bg-navy-700/50 rounded-lg p-3">
          <span className="text-xs text-gold-400/70">Daily P&L</span>
          <p className={`text-xl font-bold ${portfolio.dailyPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {showBalance ? (portfolio.dailyPnL > 0 ? '+' : '') + portfolio.dailyPnL.toLocaleString() : '••••••'}
          </p>
        </div>
        <div className="bg-navy-700/50 rounded-lg p-3">
          <span className="text-xs text-gold-400/70">Win Rate</span>
          <p className="text-xl font-bold text-white">68.5%</p>
        </div>
        <div className="bg-navy-700/50 rounded-lg p-3">
          <span className="text-xs text-gold-400/70">Sharpe Ratio</span>
          <p className="text-xl font-bold text-white">1.85</p>
        </div>
      </div>
    </div>

    {/* Open Positions */}
    <div className="bg-navy-800/80 rounded-xl p-4 sm:p-6 border border-gold-500/30 shadow-xl">
      <h3 className="text-md sm:text-lg font-semibold text-gold-400 mb-4">Open Positions</h3>
      
      {positions.map(position => (
        <div key={position.id} className="bg-navy-700/80 rounded-lg p-4 mb-3 border border-gold-500/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg">{position.symbol}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                position.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {position.type}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${position.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {position.pnl > 0 ? '+' : ''}{position.pnl.toFixed(2)} ({position.pnlPercent > 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
              </span>
              <button
                onClick={() => handleClosePosition(position.id)}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gold-400/70">Entry:</span>
              <span className="ml-1 text-white">${position.entryPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gold-400/70">Current:</span>
              <span className="ml-1 text-white">${position.currentPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gold-400/70">Quantity:</span>
              <span className="ml-1 text-white">{position.quantity}</span>
            </div>
            <div>
              <span className="text-gold-400/70">Liquidation:</span>
              <span className="ml-1 text-white">${position.liquidationPrice?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {activeMainTab === 'history' && (
          <div className="bg-navy-800/80 rounded-xl p-4 sm:p-6 border border-gold-500/30 shadow-xl">
            <h2 className="text-lg sm:text-xl font-bold text-gold-400 mb-4">Transaction History</h2>
            
            {/* Mobile-friendly transaction list */}
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="bg-navy-700/80 rounded-lg p-4 border border-gold-500/30">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      {tx.type === 'Deposit' && <FaArrowDown className="text-green-400 mr-2" size={14} />}
                      {tx.type === 'Withdrawal' && <FaArrowUp className="text-red-400 mr-2" size={14} />}
                      {tx.type === 'Transfer' && <FaExchangeAlt className="text-gold-400 mr-2" size={14} />}
                      <span className="text-white font-medium text-sm">{tx.type}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'Completed' ? 'bg-green-500/30 text-green-300' : 
                      tx.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-300' : 
                      'bg-red-500/30 text-red-300'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-gold-400/70">Amount:</span>
                      <span className="ml-1 text-white">${tx.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gold-400/70">Method:</span>
                      <span className="ml-1 text-white">{tx.method}</span>
                    </div>
                    <div>
                      <span className="text-gold-400/70">Date:</span>
                      <span className="ml-1 text-white">{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gold-400/70">Ref:</span>
                      <span className="ml-1 text-white text-xs">{tx.reference}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-2 px-4 py-3 bg-navy-600 hover:bg-navy-500 text-gold-300 rounded-lg text-sm flex items-center justify-center border border-gold-500/30">
                    <FaDownload className="mr-2" size={12} />
                    Download Receipt
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TransferModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        walletData={walletData}
        onConfirm={handleTransfer}
      />

      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
      />

      {/* Quick Trade Modal - Darker */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-navy-900 rounded-2xl border border-gold-500/40 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gold-400">Quick Trade</h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="p-2 bg-navy-800 rounded-lg text-gold-400 hover:text-gold-300 border border-gold-500/30"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            {/* Simplified order form for mobile */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gold-400 mb-2">Symbol</label>
                <select className="w-full px-4 py-3 bg-navy-800 border border-gold-500/40 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500">
                  <option>BTC/USD</option>
                  <option>ETH/USD</option>
                  <option>EUR/USD</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-3 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium border border-green-500/40 hover:bg-green-500/30">
                  BUY
                </button>
                <button className="px-4 py-3 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium border border-red-500/40 hover:bg-red-500/30">
                  SELL
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-gold-400 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-navy-800 border border-gold-500/40 rounded-lg text-white text-sm focus:outline-none focus:border-gold-500 placeholder-gold-500/50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => setShowOrderForm(false)}
                  className="px-4 py-3 bg-navy-800 text-gold-300 rounded-lg text-sm font-medium border border-gold-500/30 hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePlaceOrder({})}
                  className="px-4 py-3 bg-gold-500 text-navy-950 rounded-lg text-sm font-medium hover:bg-gold-400"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button - Darker */}
      {isMobile && (
        <button
          onClick={() => setShowOrderForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center text-navy-950 shadow-2xl hover:bg-gold-400 transition-all hover:scale-110 z-40 border-2 border-gold-300"
        >
          <FaBolt size={24} />
        </button>
      )}

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        
        @media (max-width: 640px) {
          .animate-ticker {
            animation-duration: 20s;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
