// frontend/src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaCheck,
  FaTimes,
  FaDownload,
  FaCalendarAlt,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaWallet,
  FaCreditCard,
  FaHistory,
  FaFileAlt,
  FaShieldAlt,
  FaExclamationTriangle,
  FaBell,
  FaChartPie,
  FaCoins,
  FaGlobe,
  FaRobot,
  FaUserTie,
  FaCog
} from 'react-icons/fa';

const AdminDashboardPage = () => {
  // Initialize all state with default values
  const [realTimeStats, setRealTimeStats] = useState({
    onlineUsers: 234,
    activeTrades: 1256,
    pendingWithdrawals: 18,
    pendingDeposits: 23,
    pendingKYC: 45,
    systemAlerts: 2
  });

  // Key metrics with all required fields
  const keyMetrics = {
    totalUsers: 24521,
    newUsersToday: 145,
    activeUsers: 3892,
    verifiedUsers: 18754,
    totalAccounts: 31245,
    
    totalDeposits: 2450000,
    totalWithdrawals: 1850000,
    netFlow: 600000,
    pendingTransactions: 41,
    
    totalTrades: 45231,
    totalVolume: 8920000,
    openPositions: 3421,
    avgTradeSize: 197.5,
    
    revenue: 892000,
    commission: 445000,
    spread: 335000,
    swap: 112000,
    
    riskExposure: 2450000,
    marginUsed: 1250000,
    freeMargin: 3250000,
    marginLevel: 260
  };

  // Recent activities data
  const recentActivities = [
    {
      id: 1,
      type: 'deposit',
      user: 'John Smith',
      amount: 5000,
      status: 'pending',
      time: '2 minutes ago'
    },
    {
      id: 2,
      type: 'kyc',
      user: 'Sarah Johnson',
      document: 'Passport',
      status: 'pending',
      time: '5 minutes ago'
    },
    {
      id: 3,
      type: 'trade',
      user: 'Mike Wilson',
      action: 'Closed position',
      profit: 1240,
      time: '8 minutes ago'
    },
    {
      id: 4,
      type: 'withdrawal',
      user: 'Emma Brown',
      amount: 2500,
      status: 'approved',
      time: '12 minutes ago'
    },
    {
      id: 5,
      type: 'account',
      user: 'David Lee',
      action: 'New account opened',
      accountType: 'VIP',
      time: '15 minutes ago'
    }
  ];

  // Top traders data
  const topTraders = [
    { name: 'Emma Brown', trades: 345, volume: 1250000, profit: 45000, winRate: 78 },
    { name: 'James Wilson', trades: 289, volume: 980000, profit: 32000, winRate: 72 },
    { name: 'Maria Garcia', trades: 267, volume: 890000, profit: 28000, winRate: 68 },
    { name: 'Robert Chen', trades: 234, volume: 780000, profit: 22000, winRate: 65 }
  ];

  // Risk alerts data
  const riskAlerts = [
    { user: 'Michael Brown', risk: 'High leverage', exposure: 250000, level: 'critical' },
    { user: 'Lisa Anderson', risk: 'Concentrated position', exposure: 180000, level: 'warning' },
    { user: 'Thomas Lee', risk: 'Margin call imminent', exposure: 95000, level: 'critical' }
  ];

  // Real-time data simulation with cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        onlineUsers: Math.max(0, prev.onlineUsers + Math.floor(Math.random() * 10) - 5),
        activeTrades: Math.max(0, prev.activeTrades + Math.floor(Math.random() * 20) - 10)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  // Helper function to format millions
  const formatMillions = (value) => {
    if (value === undefined || value === null) return '0';
    return (value / 1000000).toFixed(2);
  };

  // Helper function to format thousands
  const formatThousands = (value) => {
    if (value === undefined || value === null) return '0';
    return (value / 1000).toFixed(1);
  };

  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'deposit':
        return <FaMoneyBillWave className="text-green-600" />;
      case 'withdrawal':
        return <FaCreditCard className="text-red-600" />;
      case 'kyc':
        return <FaUserCheck className="text-yellow-600" />;
      case 'trade':
        return <FaExchangeAlt className="text-blue-600" />;
      case 'account':
        return <FaUserTie className="text-purple-600" />;
      default:
        return <FaHistory className="text-gray-600" />;
    }
  };

  // Get activity background color
  const getActivityBg = (type) => {
    switch(type) {
      case 'deposit': return 'bg-green-100';
      case 'withdrawal': return 'bg-red-100';
      case 'kyc': return 'bg-yellow-100';
      case 'trade': return 'bg-blue-100';
      case 'account': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trading Platform Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">Real-time platform monitoring and management</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              <span className="text-sm">System Online</span>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <span className="text-sm">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-blue-200 text-xs">Online Users</p>
            <p className="text-2xl font-bold">{realTimeStats.onlineUsers}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-blue-200 text-xs">Active Trades</p>
            <p className="text-2xl font-bold">{realTimeStats.activeTrades}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-blue-200 text-xs">Pending Actions</p>
            <p className="text-2xl font-bold">{realTimeStats.pendingKYC + realTimeStats.pendingDeposits}</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-blue-200 text-xs">System Alerts</p>
            <p className="text-2xl font-bold text-yellow-300">{realTimeStats.systemAlerts}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Users</h3>
            <FaUsers className="text-blue-500" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users</span>
              <span className="font-semibold text-gray-900">{formatCurrency(keyMetrics.totalUsers)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Today</span>
              <span className="font-semibold text-green-600">+{keyMetrics.newUsersToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Now</span>
              <span className="font-semibold text-blue-600">{realTimeStats.onlineUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Verified</span>
              <span className="font-semibold text-gray-900">{formatCurrency(keyMetrics.verifiedUsers)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Accounts</span>
              <span className="font-semibold text-gray-900">{formatCurrency(keyMetrics.totalAccounts)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Users →
            </button>
          </div>
        </div>

        {/* Financials Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financials</h3>
            <FaMoneyBillWave className="text-green-500" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Deposits</span>
              <span className="font-semibold text-gray-900">${formatMillions(keyMetrics.totalDeposits)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Withdrawals</span>
              <span className="font-semibold text-gray-900">${formatMillions(keyMetrics.totalWithdrawals)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Flow</span>
              <span className="font-semibold text-green-600">+${formatMillions(keyMetrics.netFlow)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{keyMetrics.pendingTransactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commission</span>
              <span className="font-semibold text-gray-900">${formatThousands(keyMetrics.commission)}K</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Financial Reports →
            </button>
          </div>
        </div>

        {/* Trading Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trading</h3>
            <FaExchangeAlt className="text-purple-500" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Trades</span>
              <span className="font-semibold text-gray-900">{formatCurrency(keyMetrics.totalTrades)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Volume</span>
              <span className="font-semibold text-gray-900">${formatMillions(keyMetrics.totalVolume)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Open Positions</span>
              <span className="font-semibold text-blue-600">{keyMetrics.openPositions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Trade Size</span>
              <span className="font-semibold text-gray-900">${keyMetrics.avgTradeSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue</span>
              <span className="font-semibold text-green-600">${formatThousands(keyMetrics.revenue)}K</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Trading Overview →
            </button>
          </div>
        </div>

        {/* Risk Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Management</h3>
            <FaShieldAlt className="text-red-500" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Exposure</span>
              <span className="font-semibold text-gray-900">${formatMillions(keyMetrics.riskExposure)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Margin Used</span>
              <span className="font-semibold text-gray-900">${formatMillions(keyMetrics.marginUsed)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Free Margin</span>
              <span className="font-semibold text-green-600">${formatMillions(keyMetrics.freeMargin)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Margin Level</span>
              <span className="font-semibold text-yellow-600">{keyMetrics.marginLevel}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High Risk</span>
              <span className="font-semibold text-red-600">{riskAlerts.length}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Risk Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* Pending Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending KYC */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending KYC Verification</h3>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              {realTimeStats.pendingKYC} pending
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaUserClock className="text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Passport • Uploaded 5 min ago</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
                  <FaCheck size={14} />
                </button>
                <button className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaUserClock className="text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Michael Chen</p>
                  <p className="text-xs text-gray-500">Driver's License • 15 min ago</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
                  <FaCheck size={14} />
                </button>
                <button className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-center text-sm text-blue-600 hover:underline">
            View All KYC Requests ({realTimeStats.pendingKYC})
          </button>
        </div>

        {/* Pending Transactions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Transactions</h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {realTimeStats.pendingDeposits + realTimeStats.pendingWithdrawals} pending
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaMoneyBillWave className="text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">John Smith</p>
                  <p className="text-xs text-gray-500">Deposit $5,000 • Wire Transfer</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
                  <FaCheck size={14} />
                </button>
                <button className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaCreditCard className="text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Lisa Anderson</p>
                  <p className="text-xs text-gray-500">Withdrawal $2,500 • Credit Card</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
                  <FaCheck size={14} />
                </button>
                <button className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 text-center text-sm text-blue-600 hover:underline">
            View All Transactions ({realTimeStats.pendingDeposits + realTimeStats.pendingWithdrawals})
          </button>
        </div>

        {/* Risk Alerts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Alerts</h3>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              {riskAlerts.length} alerts
            </span>
          </div>
          <div className="space-y-4">
            {riskAlerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  alert.level === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
                }`}
              >
                <div className="flex items-center">
                  <FaExclamationTriangle className={`${
                    alert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  } mr-2`} />
                  <p className="text-sm font-medium text-gray-900">{alert.user}</p>
                </div>
                <p className="text-xs text-gray-600 mt-1">{alert.risk}</p>
                <p className="text-xs font-medium text-gray-700 mt-1">
                  Exposure: ${alert.exposure.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-center text-sm text-blue-600 hover:underline">
            View Risk Dashboard →
          </button>
        </div>
      </div>

      {/* Recent Activities and Top Traders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityBg(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">
                      {activity.type === 'deposit' && `Deposited $${activity.amount}`}
                      {activity.type === 'withdrawal' && `Withdrew $${activity.amount}`}
                      {activity.type === 'kyc' && `Uploaded ${activity.document}`}
                      {activity.type === 'trade' && `${activity.action} $${activity.profit}`}
                      {activity.type === 'account' && `Opened ${activity.accountType} account`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{activity.time}</p>
                  {activity.status && (
                    <span className={`text-xs font-medium ${
                      activity.status === 'pending' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-center text-sm text-blue-600 hover:underline">
            View All Activities
          </button>
        </div>

        {/* Top Traders */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Traders (This Month)</h3>
          <div className="space-y-4">
            {topTraders.map((trader, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{trader.name}</p>
                    <p className="text-xs text-gray-500">{trader.trades} trades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ${(trader.volume / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-green-600">+${(trader.profit / 1000).toFixed(1)}K</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-center text-sm text-blue-600 hover:underline">
            View All Traders
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
            <FaUserCheck className="mx-auto text-blue-500 mb-2" size={24} />
            <span className="text-xs text-gray-700">Verify KYC</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
            <FaMoneyBillWave className="mx-auto text-green-500 mb-2" size={24} />
            <span className="text-xs text-gray-700">Process Deposits</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
            <FaCreditCard className="mx-auto text-yellow-500 mb-2" size={24} />
            <span className="text-xs text-gray-700">Approve Withdrawals</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
            <FaExchangeAlt className="mx-auto text-purple-500 mb-2" size={24} />
            <span className="text-xs text-gray-700">Monitor Trades</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
            <FaShieldAlt className="mx-auto text-red-500 mb-2" size={24} />
            <span className="text-xs text-gray-700">Risk Check</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
            <FaFileAlt className="mx-auto text-indigo-500 mb-2" size={24} />
            <span className="text-xs text-gray-700">Reports</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
            <FaBell className="mx-auto text-pink-500 mb-2" size={24} />
            <span className="text-xs text-gray-700">Alerts</span>
          </button>
          <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 text-center transition-colors">
            <FaCog className="mx-auto text-gray-500 mb-2" size={24} />
            <span className="text-xs text-gray-700">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;