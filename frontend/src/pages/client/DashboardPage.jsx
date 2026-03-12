// frontend/src/pages/client/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { 
  FaWallet, 
  FaChartLine, 
  FaExchangeAlt, 
  FaBell, 
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaTimes,
  FaCheck,
  FaClock,
  FaPercent,
  FaDollarSign,
  FaBitcoin,
  FaEthereum,
  FaSearch,
  FaDownload,
  FaFilter,
  FaHistory,
  FaStar,
  FaChartBar,
  FaCalendarAlt,
  FaInfoCircle,
  FaCreditCard,
  FaCoins,
  FaGlobe
} from "react-icons/fa";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your deposit of $5,000 has been confirmed', type: 'success', time: '2 min ago', read: false },
    { id: 2, message: 'EUR/USD reached your take profit', type: 'info', time: '15 min ago', read: false },
    { id: 3, message: 'Margin level below 200%', type: 'warning', time: '1 hour ago', read: true },
  ]);

  const [dashboardData, setDashboardData] = useState({
    accountSummary: {
      balance: 52450.75,
      equity: 53450.25,
      margin: 2450.50,
      freeMargin: 50000.25,
      profitLoss: 999.50,
      profitLossPercentage: 1.91,
      openPositions: 3,
      dailyChange: 450.25,
      dailyChangePercent: 0.86,
      marginLevel: 218,
      leverage: "1:100",
      currency: "USD",
      accountType: "Premium",
      accountNumber: "ACC-12345-6789",
    },
    positions: [
      {
        id: 1,
        symbol: "EUR/USD",
        type: "BUY",
        volume: 0.5,
        openPrice: 1.08500,
        currentPrice: 1.08750,
        profitLoss: 125.00,
        profitLossPercent: 0.23,
        openTime: "2024-03-07T10:30:00",
        stopLoss: 1.08000,
        takeProfit: 1.09000,
        swap: 0.15,
        commission: 0.50,
        duration: "2h 15m",
      },
      {
        id: 2,
        symbol: "BTC/USD",
        type: "SELL",
        volume: 0.02,
        openPrice: 42500.00,
        currentPrice: 42300.00,
        profitLoss: 400.00,
        profitLossPercent: 0.47,
        openTime: "2024-03-07T09:45:00",
        stopLoss: 43000.00,
        takeProfit: 42000.00,
        swap: -0.25,
        commission: 2.50,
        duration: "3h 0m",
      },
      {
        id: 3,
        symbol: "Gold",
        type: "BUY",
        volume: 1.0,
        openPrice: 2045.50,
        currentPrice: 2052.30,
        profitLoss: 680.00,
        profitLossPercent: 0.33,
        openTime: "2024-03-07T08:15:00",
        stopLoss: 2040.00,
        takeProfit: 2060.00,
        swap: -0.50,
        commission: 5.00,
        duration: "4h 30m",
      },
    ],
    openOrders: [
      {
        id: 1,
        symbol: "EUR/USD",
        type: "BUY LIMIT",
        volume: 0.3,
        price: 1.08200,
        status: "PENDING",
        createdTime: "2024-03-07T11:00:00",
        expiry: "2024-03-08T11:00:00",
        stopLoss: 1.07700,
        takeProfit: 1.08700,
      },
      {
        id: 2,
        symbol: "BTC/USD",
        type: "SELL STOP",
        volume: 0.01,
        price: 42000.00,
        status: "PENDING",
        createdTime: "2024-03-07T10:30:00",
        expiry: "2024-03-08T10:30:00",
        stopLoss: 42500.00,
        takeProfit: 41500.00,
      },
    ],
    marketData: [
      { symbol: "EUR/USD", bid: 1.08752, ask: 1.08755, change: 0.25, changePercent: 0.23, high: 1.08900, low: 1.08400, volume: "1.2B" },
      { symbol: "GBP/USD", bid: 1.26543, ask: 1.26548, change: -0.15, changePercent: -0.12, high: 1.26800, low: 1.26300, volume: "890M" },
      { symbol: "USD/JPY", bid: 148.23, ask: 148.25, change: 0.45, changePercent: 0.30, high: 148.50, low: 147.80, volume: "950M" },
      { symbol: "BTC/USD", bid: 42350, ask: 42400, change: 2.5, changePercent: 0.59, high: 42600, low: 42200, volume: "15.2B" },
      { symbol: "ETH/USD", bid: 2850, ask: 2855, change: 1.8, changePercent: 0.63, high: 2880, low: 2830, volume: "8.5B" },
      { symbol: "Gold", bid: 2052.30, ask: 2052.80, change: 7.80, changePercent: 0.38, high: 2055.00, low: 2045.00, volume: "3.1B" },
    ],
    tradeHistory: [
      { id: 1, symbol: "EUR/USD", type: "BUY", volume: 0.2, openPrice: 1.08200, closePrice: 1.08700, profit: 100.00, closeTime: "2024-03-06T16:30:00" },
      { id: 2, symbol: "BTC/USD", type: "SELL", volume: 0.01, openPrice: 43000, closePrice: 42500, profit: 500.00, closeTime: "2024-03-06T15:45:00" },
    ],
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Real-time price simulation
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setDashboardData(prev => ({
          ...prev,
          marketData: prev.marketData.map(item => ({
            ...item,
            bid: item.bid * (1 + (Math.random() - 0.5) * 0.0002),
            ask: item.ask * (1 + (Math.random() - 0.5) * 0.0002),
            change: (Math.random() - 0.5) * 2,
            changePercent: (Math.random() - 0.5) * 0.5,
          })),
          positions: prev.positions.map(pos => ({
            ...pos,
            currentPrice: pos.currentPrice * (1 + (Math.random() - 0.5) * 0.0001),
            profitLoss: pos.type === 'BUY' 
              ? ((pos.currentPrice * 1.0001 - pos.openPrice) * pos.volume * 100000)
              : ((pos.openPrice - pos.currentPrice * 1.0001) * pos.volume * 100000),
          })),
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleClosePosition = (positionId) => {
    console.log("Closing position:", positionId);
    // Add your close position logic here
  };

  const handleCancelOrder = (orderId) => {
    console.log("Cancelling order:", orderId);
    // Add your cancel order logic here
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaChartLine className="text-gold-500 text-2xl animate-pulse" />
            </div>
          </div>
          <p className="text-gold-400 text-lg font-raleway animate-pulse">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 font-raleway">
      {/* Header */}
      <header className="bg-navy-900/90 backdrop-blur-lg border-b border-gold-500/30 sticky top-0 z-50">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-navy-900 text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Rizal's<span className="text-gold-500 ml-1">Trade</span>
                  </h1>
                  <p className="text-xs text-gold-400/70">Premium Dashboard</p>
                </div>
              </div>
              
              {/* Timeframe Selector */}
              <div className="hidden md:flex items-center space-x-1 bg-navy-800/50 rounded-lg p-1 ml-6">
                {['1H', '4H', '1D', '1W', '1M'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                      selectedTimeframe === tf
                        ? 'bg-gold-500 text-navy-900'
                        : 'text-gray-400 hover:text-gold-500'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden lg:block relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/50 text-sm" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  className="w-64 pl-10 pr-4 py-2 bg-navy-800 border border-gold-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="relative p-2 text-gray-400 hover:text-gold-500 transition-colors">
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                <div className="absolute right-0 mt-2 w-80 bg-navy-800 rounded-lg shadow-xl border border-gold-500/30 hidden group-hover:block">
                  <div className="p-3 border-b border-gold-500/30">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 border-b border-gold-500/10 hover:bg-navy-700 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-navy-700/50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 w-2 h-2 rounded-full ${
                            notif.type === 'success' ? 'bg-green-500' :
                            notif.type === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{notif.message}</p>
                            <p className="text-xs text-gold-500/70 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-t border-gold-500/30">
                    <button className="text-xs text-gold-500 hover:text-gold-400">
                      View All
                    </button>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gold-500 transition-colors">
                <FaCog size={20} />
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-2 border-l border-gold-500/30">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-white">John Smith</p>
                  <p className="text-xs text-gold-500/70">Premium Member</p>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full flex items-center justify-center cursor-pointer">
                    <span className="text-navy-900 font-bold text-lg">J</span>
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-navy-800 rounded-lg shadow-xl border border-gold-500/30 hidden group-hover:block">
                    <div className="p-2">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors">
                        Profile
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors">
                        Account Settings
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors">
                        Statements
                      </a>
                      <div className="border-t border-gold-500/30 my-2"></div>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-navy-700 rounded transition-colors flex items-center">
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

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-gold-500/10 to-gold-600/5 rounded-2xl p-6 border border-gold-500/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back, <span className="text-gold-500">John!</span>
              </h2>
              <p className="text-gold-400/70">
                Here's what's happening with your trading account today.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600 transition-colors flex items-center space-x-2">
                <FaDownload size={14} />
                <span>Deposit</span>
              </button>
              <button className="px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 transition-colors flex items-center space-x-2 border border-gold-500/30">
                <FaCreditCard size={14} />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaInfoCircle className="text-red-500" />
                <p className="text-red-400">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Account Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
                <FaWallet className="text-gold-500 text-xl" />
              </div>
              <span className="text-xs text-gold-500/70">Available</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${dashboardData.accountSummary.balance.toLocaleString()}
            </p>
            <p className="text-sm text-gold-500/70">Total Balance</p>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <FaArrowUp className="mr-1" size={10} />
              <span>+2.3% today</span>
            </div>
          </div>

          {/* Equity Card */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
                <FaChartLine className="text-gold-500 text-xl" />
              </div>
              <span className="text-xs text-gold-500/70">With P/L</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${dashboardData.accountSummary.equity.toLocaleString()}
            </p>
            <p className="text-sm text-gold-500/70">Total Equity</p>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <FaArrowUp className="mr-1" size={10} />
              <span>+$999.50 (1.91%)</span>
            </div>
          </div>

          {/* Margin Card */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
                <FaPercent className="text-gold-500 text-xl" />
              </div>
              <span className="text-xs text-gold-500/70">Level: {dashboardData.accountSummary.marginLevel}%</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${dashboardData.accountSummary.margin.toLocaleString()}
            </p>
            <p className="text-sm text-gold-500/70">Used Margin</p>
            <div className="mt-4 w-full bg-navy-700 rounded-full h-1.5">
              <div 
                className="bg-gold-500 h-1.5 rounded-full" 
                style={{ width: `${(dashboardData.accountSummary.margin / dashboardData.accountSummary.equity) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Free Margin Card */}
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
                <FaCoins className="text-gold-500 text-xl" />
              </div>
              <span className="text-xs text-gold-500/70">Available</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${dashboardData.accountSummary.freeMargin.toLocaleString()}
            </p>
            <p className="text-sm text-gold-500/70">Free Margin</p>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <FaArrowUp className="mr-1" size={10} />
              <span>Available for trading</span>
            </div>
          </div>
        </div>

        {/* Market Ticker */}
        <div className="mb-8 overflow-hidden bg-navy-800/50 rounded-xl border border-gold-500/20">
          <div className="flex items-center p-3 border-b border-gold-500/20">
            <FaChartBar className="text-gold-500 mr-2" />
            <h3 className="text-sm font-semibold text-white">Live Market Prices</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-6 p-4 min-w-max">
              {dashboardData.marketData.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.symbol}</p>
                    <p className="text-xs text-gold-500/70">${item.bid.toFixed(5)}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                  {index < dashboardData.marketData.length - 1 && (
                    <div className="w-px h-8 bg-gold-500/20"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid - Positions and Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Open Positions */}
          <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden">
            <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaExchangeAlt className="text-gold-500" />
                <h2 className="text-lg font-semibold text-white">Open Positions</h2>
              </div>
              <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                {dashboardData.positions.length} positions
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">Volume</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">Open Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">Current</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">P/L</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/10">
                  {dashboardData.positions.map((position) => (
                    <tr key={position.id} className="hover:bg-navy-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-white">{position.symbol}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          position.type === 'BUY' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {position.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{position.volume}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">${position.openPrice.toFixed(5)}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">${position.currentPrice.toFixed(5)}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${
                        position.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        ${position.profitLoss.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleClosePosition(position.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-500 text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {dashboardData.positions.length === 0 && (
              <div className="p-8 text-center">
                <FaExchangeAlt className="mx-auto text-gold-500/30 text-4xl mb-3" />
                <p className="text-gray-500">No open positions</p>
              </div>
            )}
          </div>

          {/* Open Orders */}
          <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden">
            <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaClock className="text-gold-500" />
                <h2 className="text-lg font-semibold text-white">Open Orders</h2>
              </div>
              <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                {dashboardData.openOrders.length} orders
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Volume</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/10">
                  {dashboardData.openOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-navy-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">{order.symbol}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded-full">
                          {order.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{order.volume}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">${order.price.toFixed(5)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-3 py-1 bg-red-500/20 text-red-500 text-xs rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {dashboardData.openOrders.length === 0 && (
              <div className="p-8 text-center">
                <FaClock className="mx-auto text-gold-500/30 text-4xl mb-3" />
                <p className="text-gray-500">No open orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden mb-8">
          <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaGlobe className="text-gold-500" />
              <h2 className="text-lg font-semibold text-white">Market Overview</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gold-500 transition-colors">
                <FaFilter size={14} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gold-500 transition-colors">
                <FaDownload size={14} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Bid</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Ask</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Change</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">High</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Low</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/10">
                {dashboardData.marketData.map((item, index) => (
                  <tr key={index} className="hover:bg-navy-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-white">{item.symbol}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">${item.bid.toFixed(5)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">${item.ask.toFixed(5)}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">${item.high.toFixed(5)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">${item.low.toFixed(5)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{item.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Trade History */}
        <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden">
          <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaHistory className="text-gold-500" />
              <h2 className="text-lg font-semibold text-white">Recent Trade History</h2>
            </div>
            <button className="text-sm text-gold-500 hover:text-gold-400 transition-colors">
              View All →
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navy-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Symbol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Volume</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Open</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Close</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Profit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">Close Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/10">
                {dashboardData.tradeHistory.map((trade) => (
                  <tr key={trade.id} className="hover:bg-navy-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{trade.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trade.type === 'BUY' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{trade.volume}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">${trade.openPrice.toFixed(5)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">${trade.closePrice.toFixed(5)}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      trade.profit >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      ${trade.profit.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(trade.closeTime).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <button className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 shadow-lg hover:bg-gold-600 transition-colors">
          <FaChartLine size={20} />
        </button>
        <button className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center text-gold-500 shadow-lg hover:bg-navy-600 transition-colors border border-gold-500/30">
          <FaStar size={20} />
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;