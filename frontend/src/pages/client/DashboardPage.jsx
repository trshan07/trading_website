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
  FaGlobe,
  FaRocket,
  FaShieldAlt,
  FaChartPie,
  FaTrophy,
  FaGift,
  FaFire,
  FaBolt,
  FaLock,
  FaUnlock,
  FaExchangeAlt as FaTrade,
  FaCopy,
  FaShareAlt,
  FaBookmark,
  FaTag,
  FaBell as FaAlert,
  FaArrowCircleUp,
  FaArrowCircleDown,
  FaUser,
  FaUserPlus,
  FaChartArea,
  FaFileAlt,
  FaServer,
  FaCloud,
  FaDesktop,
  FaMobile,
  FaTable,
  FaThLarge,
} from "react-icons/fa";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [activeTab, setActiveTab] = useState("overview");
  const [activePortalTab, setActivePortalTab] = useState("capex-trader");
  const [showQuickTrade, setShowQuickTrade] = useState(false);
  const [quickTradeData, setQuickTradeData] = useState({
    symbol: "EUR/USD",
    type: "BUY",
    volume: 0.1,
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your deposit of $5,000 has been confirmed",
      type: "success",
      time: "2 min ago",
      read: false,
      category: "transaction",
    },
    {
      id: 2,
      message: "EUR/USD reached your take profit",
      type: "info",
      time: "15 min ago",
      read: false,
      category: "trade",
    },
    {
      id: 3,
      message: "Margin level below 200%",
      type: "warning",
      time: "1 hour ago",
      read: true,
      category: "alert",
    },
  ]);

  const [dashboardData, setDashboardData] = useState({
    accountSummary: {
      balance: 52450.75,
      equity: 53450.25,
      margin: 2450.5,
      freeMargin: 50000.25,
      profitLoss: 999.5,
      profitLossPercentage: 1.91,
      openPositions: 3,
      dailyChange: 450.25,
      dailyChangePercent: 0.86,
      marginLevel: 218,
      leverage: "1:100",
      currency: "USD",
      accountType: "Premium",
      accountNumber: "ACC-12345-6789",
      credit: 5000,
      bonus: 250,
      withdrawal: 10000,
      deposit: 15000,
      tradesToday: 8,
      winningTrades: 5,
      losingTrades: 3,
      winRate: 62.5,
      totalVolume: 2.5,
      averageHoldingTime: "4h 30m",
    },
    positions: [
      {
        id: 1,
        symbol: "EUR/USD",
        type: "BUY",
        volume: 0.5,
        openPrice: 1.085,
        currentPrice: 1.0875,
        profitLoss: 125.0,
        profitLossPercent: 0.23,
        openTime: "2024-03-07T10:30:00",
        stopLoss: 1.08,
        takeProfit: 1.09,
        swap: 0.15,
        commission: 0.5,
        duration: "2h 15m",
        margin: 542.5,
        risk: 2.5,
        reward: 5.0,
        riskRewardRatio: "1:2",
      },
      {
        id: 2,
        symbol: "BTC/USD",
        type: "SELL",
        volume: 0.02,
        openPrice: 42500.0,
        currentPrice: 42300.0,
        profitLoss: 400.0,
        profitLossPercent: 0.47,
        openTime: "2024-03-07T09:45:00",
        stopLoss: 43000.0,
        takeProfit: 42000.0,
        swap: -0.25,
        commission: 2.5,
        duration: "3h 0m",
        margin: 850.0,
        risk: 2.0,
        reward: 4.0,
        riskRewardRatio: "1:2",
      },
      {
        id: 3,
        symbol: "Gold",
        type: "BUY",
        volume: 1.0,
        openPrice: 2045.5,
        currentPrice: 2052.3,
        profitLoss: 680.0,
        profitLossPercent: 0.33,
        openTime: "2024-03-07T08:15:00",
        stopLoss: 2040.0,
        takeProfit: 2060.0,
        swap: -0.5,
        commission: 5.0,
        duration: "4h 30m",
        margin: 2045.5,
        risk: 1.5,
        reward: 3.0,
        riskRewardRatio: "1:2",
      },
    ],
    openOrders: [
      {
        id: 1,
        symbol: "EUR/USD",
        type: "BUY LIMIT",
        volume: 0.3,
        price: 1.082,
        status: "PENDING",
        createdTime: "2024-03-07T11:00:00",
        expiry: "2024-03-08T11:00:00",
        stopLoss: 1.077,
        takeProfit: 1.087,
        filled: 0,
        remaining: 0.3,
      },
      {
        id: 2,
        symbol: "BTC/USD",
        type: "SELL STOP",
        volume: 0.01,
        price: 42000.0,
        status: "PENDING",
        createdTime: "2024-03-07T10:30:00",
        expiry: "2024-03-08T10:30:00",
        stopLoss: 42500.0,
        takeProfit: 41500.0,
        filled: 0,
        remaining: 0.01,
      },
    ],
    marketData: [
      {
        symbol: "EUR/USD",
        bid: 1.08752,
        ask: 1.08755,
        change: 0.25,
        changePercent: 0.23,
        high: 1.089,
        low: 1.084,
        volume: "1.2B",
        spread: 0.3,
        volatility: "Low",
        trend: "Bullish",
        support: 1.085,
        resistance: 1.089,
      },
      {
        symbol: "GBP/USD",
        bid: 1.26543,
        ask: 1.26548,
        change: -0.15,
        changePercent: -0.12,
        high: 1.268,
        low: 1.263,
        volume: "890M",
        spread: 0.5,
        volatility: "Low",
        trend: "Bearish",
        support: 1.264,
        resistance: 1.267,
      },
      {
        symbol: "USD/JPY",
        bid: 148.23,
        ask: 148.25,
        change: 0.45,
        changePercent: 0.3,
        high: 148.5,
        low: 147.8,
        volume: "950M",
        spread: 2.0,
        volatility: "Medium",
        trend: "Bullish",
        support: 148.0,
        resistance: 148.5,
      },
      {
        symbol: "BTC/USD",
        bid: 42350,
        ask: 42400,
        change: 2.5,
        changePercent: 0.59,
        high: 42600,
        low: 42200,
        volume: "15.2B",
        spread: 50,
        volatility: "High",
        trend: "Bullish",
        support: 42200,
        resistance: 42600,
      },
      {
        symbol: "ETH/USD",
        bid: 2850,
        ask: 2855,
        change: 1.8,
        changePercent: 0.63,
        high: 2880,
        low: 2830,
        volume: "8.5B",
        spread: 5,
        volatility: "High",
        trend: "Bullish",
        support: 2830,
        resistance: 2880,
      },
      {
        symbol: "Gold",
        bid: 2052.3,
        ask: 2052.8,
        change: 7.8,
        changePercent: 0.38,
        high: 2055.0,
        low: 2045.0,
        volume: "3.1B",
        spread: 0.5,
        volatility: "Medium",
        trend: "Bullish",
        support: 2045,
        resistance: 2055,
      },
    ],
    tradeHistory: [
      {
        id: 1,
        symbol: "EUR/USD",
        type: "BUY",
        volume: 0.2,
        openPrice: 1.082,
        closePrice: 1.087,
        profit: 100.0,
        closeTime: "2024-03-06T16:30:00",
        duration: "5h 30m",
        reason: "Take Profit",
      },
      {
        id: 2,
        symbol: "BTC/USD",
        type: "SELL",
        volume: 0.01,
        openPrice: 43000,
        closePrice: 42500,
        profit: 500.0,
        closeTime: "2024-03-06T15:45:00",
        duration: "2h 15m",
        reason: "Stop Loss",
      },
    ],
    watchlist: [
      {
        symbol: "EUR/USD",
        alert: 1.09,
        favorite: true,
      },
      {
        symbol: "BTC/USD",
        alert: 43000,
        favorite: true,
      },
      {
        symbol: "Gold",
        alert: 2060,
        favorite: true,
      },
    ],
    performanceMetrics: {
      daily: { trades: 8, winRate: 62.5, profit: 1250 },
      weekly: { trades: 32, winRate: 58.3, profit: 4250 },
      monthly: { trades: 145, winRate: 61.2, profit: 18750 },
      yearly: { trades: 1560, winRate: 59.8, profit: 245000 },
    },
    tradingSignals: [
      {
        symbol: "EUR/USD",
        signal: "BUY",
        strength: 85,
        time: "5 min ago",
        indicators: ["RSI Oversold", "MACD Bullish"],
      },
      {
        symbol: "BTC/USD",
        signal: "SELL",
        strength: 72,
        time: "10 min ago",
        indicators: ["Resistance Level", "Overbought"],
      },
    ],
    economicCalendar: [
      {
        event: "FOMC Meeting",
        impact: "High",
        time: "14:00 GMT",
        forecast: "0.25%",
        previous: "0.50%",
      },
      {
        event: "Non-Farm Payrolls",
        impact: "High",
        time: "13:30 GMT",
        forecast: "200K",
        previous: "187K",
      },
    ],
    riskMetrics: {
      dailyRisk: 2.5,
      weeklyRisk: 8.2,
      monthlyRisk: 15.3,
      maxDrawdown: 5.2,
      currentDrawdown: 2.1,
      riskPerTrade: 1.5,
      recommendedLots: 0.15,
    },
    // Portal specific data
    portalData: {
      capexTrader: {
        platform: "CAPEX Trader Web",
        version: "3.2.1",
        lastLogin: "2024-03-07 08:30 AM",
        status: "Active",
        devices: ["Web Browser", "Mobile App"],
        sessions: [
          {
            id: 1,
            device: "Chrome / Windows",
            location: "New York, USA",
            lastActive: "Now",
            ip: "192.168.1.1",
          },
          {
            id: 2,
            device: "Mobile App / iOS",
            location: "New York, USA",
            lastActive: "5 min ago",
            ip: "192.168.1.2",
          },
        ],
      },
      capexMetaTrader: {
        platform: "MetaTrader 4/5",
        version: "5.0.0",
        build: "2345",
        terminals: [
          {
            id: 1,
            type: "MT5 Desktop",
            status: "Connected",
            account: "MT5-12345",
            server: "ICMarkets-Demo",
          },
          {
            id: 2,
            type: "MT4 Mobile",
            status: "Disconnected",
            account: "MT4-67890",
            server: "ICMarkets-Live",
          },
        ],
      },
      myAccount: {
        accountId: "ACC-12345-6789",
        accountType: "Premium",
        openedDate: "2023-01-15",
        currency: "USD",
        leverage: "1:100",
        commission: "Standard",
        swap: "Market",
        execution: "Market Execution",
      },
      myProfile: {
        fullName: "John Smith",
        email: "john.smith@email.com",
        phone: "+1 234 567 8900",
        country: "United States",
        city: "New York",
        address: "123 Trading Street",
        verificationLevel: "Tier 3 - Verified",
        kycStatus: "Approved",
        twoFactor: "Enabled",
      },
      metaTrader5: {
        terminals: [
          {
            id: 1,
            terminal: "MT5 Desktop",
            status: "Connected",
            account: "MT5-12345",
            server: "ICMarkets-Demo",
            balance: 50000,
            equity: 51250,
            margin: 1250,
            freeMargin: 50000,
          },
          {
            id: 2,
            terminal: "MT5 Mobile",
            status: "Disconnected",
            account: "MT5-67890",
            server: "ICMarkets-Live",
            balance: 25000,
            equity: 0,
            margin: 0,
            freeMargin: 25000,
          },
          {
            id: 3,
            terminal: "MT5 Web",
            status: "Connected",
            account: "MT5-24680",
            server: "ICMarkets-Demo",
            balance: 10000,
            equity: 10250,
            margin: 250,
            freeMargin: 10000,
          },
        ],
        expertAdvisors: [
          {
            name: "Moving Average EA",
            status: "Active",
            profit: 1250,
            trades: 45,
          },
          { name: "RSI Scalper", status: "Paused", profit: 750, trades: 23 },
          { name: "Grid Trader", status: "Active", profit: 2500, trades: 89 },
        ],
      },
      tradingAccounts: [
        {
          id: 1,
          account: "Standard USD",
          number: "10012345",
          type: "Live",
          balance: 52450.75,
          equity: 53450.25,
          leverage: "1:100",
          server: "Live-Server-01",
          status: "Active",
        },
        {
          id: 2,
          account: "Premium EUR",
          number: "10067890",
          type: "Live",
          balance: 35000.0,
          equity: 36250.5,
          leverage: "1:200",
          server: "Live-Server-02",
          status: "Active",
        },
        {
          id: 3,
          account: "Demo Account",
          number: "20054321",
          type: "Demo",
          balance: 100000.0,
          equity: 102500.75,
          leverage: "1:500",
          server: "Demo-Server-01",
          status: "Active",
        },
      ],
      tradingCentral: {
        analysis: [
          {
            instrument: "EUR/USD",
            outlook: "Bullish",
            confidence: "High",
            target: 1.095,
            stopLoss: 1.08,
            timeFrame: "1H",
            updateTime: "2024-03-07 10:30",
          },
          {
            instrument: "GBP/USD",
            outlook: "Bearish",
            confidence: "Medium",
            target: 1.255,
            stopLoss: 1.27,
            timeFrame: "4H",
            updateTime: "2024-03-07 09:15",
          },
          {
            instrument: "Gold",
            outlook: "Bullish",
            confidence: "High",
            target: 2070.0,
            stopLoss: 2040.0,
            timeFrame: "1D",
            updateTime: "2024-03-07 08:00",
          },
        ],
        technicalIndicators: [
          {
            instrument: "EUR/USD",
            rsi: 65,
            macd: "Bullish",
            movingAverages: "Buy",
            pivot: 1.085,
          },
          {
            instrument: "BTC/USD",
            rsi: 72,
            macd: "Bullish",
            movingAverages: "Strong Buy",
            pivot: 42000,
          },
        ],
      },
      myReport: {
        daily: {
          date: "2024-03-07",
          pnl: 1250.5,
          trades: 8,
          winRate: 62.5,
          volume: 2.5,
        },
        weekly: {
          week: "Week 10",
          pnl: 4250.75,
          trades: 32,
          winRate: 58.3,
          volume: 10.2,
        },
        monthly: {
          month: "March 2024",
          pnl: 18750.25,
          trades: 145,
          winRate: 61.2,
          volume: 45.8,
        },
        yearly: {
          year: "2024",
          pnl: 245000.5,
          trades: 1560,
          winRate: 59.8,
          volume: 520.5,
        },
        recentReports: [
          {
            id: 1,
            name: "Monthly Statement - Feb 2024",
            date: "2024-02-29",
            type: "PDF",
            size: "245 KB",
          },
          {
            id: 2,
            name: "Trading Summary - Q1 2024",
            date: "2024-03-31",
            type: "PDF",
            size: "512 KB",
          },
          {
            id: 3,
            name: "Tax Report - 2023",
            date: "2024-01-15",
            type: "PDF",
            size: "1.2 MB",
          },
          {
            id: 4,
            name: "Performance Analytics",
            date: "2024-03-07",
            type: "CSV",
            size: "89 KB",
          },
        ],
      },
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Real-time price simulation with enhanced updates
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        setDashboardData((prev) => ({
          ...prev,
          marketData: prev.marketData.map((item) => {
            const change = (Math.random() - 0.5) * 0.0002;
            return {
              ...item,
              bid: item.bid * (1 + change),
              ask: item.ask * (1 + change),
              change: (Math.random() - 0.5) * 2,
              changePercent: (Math.random() - 0.5) * 0.5,
              high: Math.max(item.high, item.bid * 1.001),
              low: Math.min(item.low, item.bid * 0.999),
            };
          }),
          positions: prev.positions.map((pos) => {
            const priceChange = (Math.random() - 0.5) * 0.0001;
            const newPrice = pos.currentPrice * (1 + priceChange);
            const profitLoss =
              pos.type === "BUY"
                ? (newPrice - pos.openPrice) * pos.volume * 100000
                : (pos.openPrice - newPrice) * pos.volume * 100000;

            return {
              ...pos,
              currentPrice: newPrice,
              profitLoss: profitLoss,
              profitLossPercent:
                (profitLoss / (pos.openPrice * pos.volume * 100000)) * 100,
            };
          }),
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleClosePosition = (positionId) => {
    console.log("Closing position:", positionId);
  };

  const handleCancelOrder = (orderId) => {
    console.log("Cancelling order:", orderId);
  };

  const handleQuickTrade = () => {
    console.log("Quick trade:", quickTradeData);
    setShowQuickTrade(false);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Render portal tab content based on active tab
  const renderPortalContent = () => {
    switch (activePortalTab) {
      case "capex-trader":
        return (
          <div className="space-y-6">
            {/* Platform Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-navy-800/30 rounded-xl p-4 border border-gold-500/10">
                <p className="text-xs text-gold-500/70 mb-1">Platform</p>
                <p className="text-lg font-bold text-white">
                  {dashboardData.portalData.capexTrader.platform}
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  Version {dashboardData.portalData.capexTrader.version}
                </p>
              </div>
              <div className="bg-navy-800/30 rounded-xl p-4 border border-gold-500/10">
                <p className="text-xs text-gold-500/70 mb-1">Last Login</p>
                <p className="text-lg font-bold text-white">
                  {dashboardData.portalData.capexTrader.lastLogin}
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  Status: <span className="text-gold-400">Active</span>
                </p>
              </div>
              <div className="bg-navy-800/30 rounded-xl p-4 border border-gold-500/10">
                <p className="text-xs text-gold-500/70 mb-1">
                  Connected Devices
                </p>
                <p className="text-lg font-bold text-white">
                  {dashboardData.portalData.capexTrader.devices.length}
                </p>
                <div className="flex gap-1 mt-1">
                  {dashboardData.portalData.capexTrader.devices.map(
                    (device, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-navy-700 px-2 py-1 rounded text-gold-500"
                      >
                        {device}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Active Sessions Table */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
              <div className="p-4 border-b border-gold-500/20">
                <h3 className="text-md font-semibold text-white">
                  Active Sessions
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Device
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Last Active
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.portalData.capexTrader.sessions.map(
                      (session) => (
                        <tr key={session.id} className="hover:bg-navy-700/30">
                          <td className="px-4 py-3 text-sm text-white">
                            {session.device}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {session.location}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {session.lastActive}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {session.ip}
                          </td>
                          <td className="px-4 py-3">
                            <button className="px-3 py-1 bg-gold-600/20 text-gold-600 text-xs rounded-lg hover:bg-gold-600/30">
                              Terminate
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "capex-metatrader":
        return (
          <div className="space-y-6">
            {/* MT Terminals */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
              <div className="p-4 border-b border-gold-500/20">
                <h3 className="text-md font-semibold text-white">
                  MetaTrader Terminals
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Terminal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Server
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.portalData.capexMetaTrader.terminals.map(
                      (terminal) => (
                        <tr key={terminal.id} className="hover:bg-navy-700/30">
                          <td className="px-4 py-3 text-sm text-white">
                            {terminal.type}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                terminal.status === "Connected"
                                  ? "bg-gold-400/20 text-gold-400"
                                  : "bg-gold-600/20 text-gold-600"
                              }`}
                            >
                              {terminal.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {terminal.account}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {terminal.server}
                          </td>
                          <td className="px-4 py-3">
                            <button className="px-3 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-lg hover:bg-gold-500/30 mr-2">
                              Connect
                            </button>
                            <button className="px-3 py-1 bg-navy-700 text-gold-500/70 text-xs rounded-lg hover:bg-navy-600">
                              Settings
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Platform Info */}
            <div className="bg-navy-800/30 rounded-xl p-4 border border-gold-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gold-500/70">Platform Version</p>
                  <p className="text-lg font-bold text-white">
                    {dashboardData.portalData.capexMetaTrader.version}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gold-500/70">Build</p>
                  <p className="text-lg font-bold text-white">
                    {dashboardData.portalData.capexMetaTrader.build}
                  </p>
                </div>
                <button className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600">
                  Download Terminal
                </button>
              </div>
            </div>
          </div>
        );

      case "my-account":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-md font-semibold text-white mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gold-500/10">
                  <span className="text-gold-500/70">Account ID</span>
                  <span className="text-white font-medium">
                    {dashboardData.portalData.myAccount.accountId}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold-500/10">
                  <span className="text-gold-500/70">Account Type</span>
                  <span className="text-gold-400 font-medium">
                    {dashboardData.portalData.myAccount.accountType}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold-500/10">
                  <span className="text-gold-500/70">Opened Date</span>
                  <span className="text-white">
                    {dashboardData.portalData.myAccount.openedDate}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold-500/10">
                  <span className="text-gold-500/70">Currency</span>
                  <span className="text-white">
                    {dashboardData.portalData.myAccount.currency}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold-500/10">
                  <span className="text-gold-500/70">Leverage</span>
                  <span className="text-white">
                    {dashboardData.portalData.myAccount.leverage}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold-500/10">
                  <span className="text-gold-500/70">Commission</span>
                  <span className="text-white">
                    {dashboardData.portalData.myAccount.commission}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold-500/10">
                  <span className="text-gold-500/70">Swap</span>
                  <span className="text-white">
                    {dashboardData.portalData.myAccount.swap}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gold-500/70">Execution</span>
                  <span className="text-white">
                    {dashboardData.portalData.myAccount.execution}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-md font-semibold text-white mb-4">
                Account Settings
              </h3>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between">
                  <span>Change Password</span>
                  <FaCog className="text-gold-500" />
                </button>
                <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between">
                  <span>Two-Factor Authentication</span>
                  <span className="text-gold-400 text-sm">Enabled</span>
                </button>
                <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between">
                  <span>API Access</span>
                  <span className="text-gold-500/50 text-sm">Manage</span>
                </button>
                <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between">
                  <span>Notification Preferences</span>
                  <FaBell className="text-gold-500" />
                </button>
                <button className="w-full px-4 py-3 bg-navy-700 text-left text-white rounded-lg hover:bg-navy-600 flex items-center justify-between">
                  <span>Trading Preferences</span>
                  <FaChartLine className="text-gold-500" />
                </button>
              </div>
            </div>
          </div>
        );

      case "my-profile":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2 bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-md font-semibold text-white">
                  Personal Information
                </h3>
                <button className="px-4 py-2 bg-gold-500/20 text-gold-500 rounded-lg hover:bg-gold-500/30">
                  Edit Profile
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gold-500/70 mb-1">Full Name</p>
                  <p className="text-white font-medium">
                    {dashboardData.portalData.myProfile.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gold-500/70 mb-1">Email</p>
                  <p className="text-white">
                    {dashboardData.portalData.myProfile.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gold-500/70 mb-1">Phone</p>
                  <p className="text-white">
                    {dashboardData.portalData.myProfile.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gold-500/70 mb-1">Country</p>
                  <p className="text-white">
                    {dashboardData.portalData.myProfile.country}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gold-500/70 mb-1">City</p>
                  <p className="text-white">
                    {dashboardData.portalData.myProfile.city}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gold-500/70 mb-1">Address</p>
                  <p className="text-white">
                    {dashboardData.portalData.myProfile.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-6">
              <h3 className="text-md font-semibold text-white mb-4">
                Verification Status
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gold-500/70">KYC Status</span>
                    <span className="text-xs text-gold-400">
                      {dashboardData.portalData.myProfile.kycStatus}
                    </span>
                  </div>
                  <div className="w-full bg-navy-700 rounded-full h-2">
                    <div
                      className="bg-gold-500 h-2 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gold-500/70">
                      Verification Level
                    </span>
                    <span className="text-xs text-gold-400">Tier 3/3</span>
                  </div>
                  <div className="w-full bg-navy-700 rounded-full h-2">
                    <div
                      className="bg-gold-500 h-2 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex items-center justify-between p-3 bg-navy-700 rounded-lg">
                    <span className="text-sm text-white">2FA Status</span>
                    <span className="text-gold-400 text-sm">
                      {dashboardData.portalData.myProfile.twoFactor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "metatrader5":
        return (
          <div className="space-y-6">
            {/* MT5 Terminals Table */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
              <div className="p-4 border-b border-gold-500/20 flex justify-between items-center">
                <h3 className="text-md font-semibold text-white">
                  MT5 Terminals
                </h3>
                <button className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600">
                  Add Terminal
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Terminal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Account
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Server
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Balance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Equity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.portalData.metaTrader5.terminals.map(
                      (terminal) => (
                        <tr key={terminal.id} className="hover:bg-navy-700/30">
                          <td className="px-4 py-3 text-sm text-white">
                            {terminal.terminal}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                terminal.status === "Connected"
                                  ? "bg-gold-400/20 text-gold-400"
                                  : "bg-gold-600/20 text-gold-600"
                              }`}
                            >
                              {terminal.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {terminal.account}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {terminal.server}
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            ${terminal.balance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-400">
                            ${terminal.equity.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <button className="px-3 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-lg hover:bg-gold-500/30 mr-2">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expert Advisors Table */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
              <div className="p-4 border-b border-gold-500/20">
                <h3 className="text-md font-semibold text-white">
                  Expert Advisors
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        EA Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Profit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Trades
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.portalData.metaTrader5.expertAdvisors.map(
                      (ea, index) => (
                        <tr key={index} className="hover:bg-navy-700/30">
                          <td className="px-4 py-3 text-sm text-white">
                            {ea.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                ea.status === "Active"
                                  ? "bg-gold-400/20 text-gold-400"
                                  : "bg-gold-600/20 text-gold-600"
                              }`}
                            >
                              {ea.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-400">
                            ${ea.profit}
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            {ea.trades}
                          </td>
                          <td className="px-4 py-3">
                            <button className="px-3 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-lg hover:bg-gold-500/30 mr-2">
                              Settings
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "trading-accounts":
        return (
          <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
            <div className="p-4 border-b border-gold-500/20 flex justify-between items-center">
              <h3 className="text-md font-semibold text-white">
                Trading Accounts
              </h3>
              <button className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600">
                Open New Account
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-navy-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Equity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Leverage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Server
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-500/10">
                  {dashboardData.portalData.tradingAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-navy-700/30">
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {account.account}
                      </td>
                      <td className="px-4 py-3 text-sm text-gold-500/70">
                        {account.number}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            account.type === "Live"
                              ? "bg-gold-400/20 text-gold-400"
                              : "bg-gold-500/20 text-gold-500"
                          }`}
                        >
                          {account.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        ${account.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gold-400">
                        ${account.equity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gold-500/70">
                        {account.leverage}
                      </td>
                      <td className="px-4 py-3 text-sm text-gold-500/70">
                        {account.server}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gold-400/20 text-gold-400 text-xs rounded-full">
                          {account.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="px-3 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-lg hover:bg-gold-500/30 mr-2">
                          Details
                        </button>
                        <button className="px-3 py-1 bg-navy-700 text-gold-500/70 text-xs rounded-lg hover:bg-navy-600">
                          Switch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "trading-central":
        return (
          <div className="space-y-6">
            {/* Analysis Table */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
              <div className="p-4 border-b border-gold-500/20">
                <h3 className="text-md font-semibold text-white">
                  Market Analysis
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Instrument
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Outlook
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Confidence
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Target
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Stop Loss
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Time Frame
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.portalData.tradingCentral.analysis.map(
                      (item, index) => (
                        <tr key={index} className="hover:bg-navy-700/30">
                          <td className="px-4 py-3 text-sm font-medium text-white">
                            {item.instrument}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-medium ${
                                item.outlook === "Bullish"
                                  ? "text-gold-400"
                                  : "text-gold-600"
                              }`}
                            >
                              {item.outlook}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.confidence === "High"
                                  ? "bg-gold-400/20 text-gold-400"
                                  : item.confidence === "Medium"
                                    ? "bg-gold-500/20 text-gold-500"
                                    : "bg-gold-600/20 text-gold-600"
                              }`}
                            >
                              {item.confidence}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-400">
                            ${item.target}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-600">
                            ${item.stopLoss}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {item.timeFrame}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {item.updateTime}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
              <div className="p-4 border-b border-gold-500/20">
                <h3 className="text-md font-semibold text-white">
                  Technical Indicators
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Instrument
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        RSI
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        MACD
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Moving Averages
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Pivot Point
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.portalData.tradingCentral.technicalIndicators.map(
                      (item, index) => (
                        <tr key={index} className="hover:bg-navy-700/30">
                          <td className="px-4 py-3 text-sm font-medium text-white">
                            {item.instrument}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {item.rsi}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-medium ${
                                item.macd.includes("Bullish")
                                  ? "text-gold-400"
                                  : "text-gold-600"
                              }`}
                            >
                              {item.macd}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-medium ${
                                item.movingAverages.includes("Buy")
                                  ? "text-gold-400"
                                  : "text-gold-600"
                              }`}
                            >
                              {item.movingAverages}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            ${item.pivot}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "my-report":
        return (
          <div className="space-y-6">
            {/* Performance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <p className="text-xs text-gold-500/70 mb-1">Daily P&L</p>
                <p className="text-xl font-bold text-gold-400">
                  ${dashboardData.portalData.myReport.daily.pnl}
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  {dashboardData.portalData.myReport.daily.trades} trades
                </p>
              </div>
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <p className="text-xs text-gold-500/70 mb-1">Weekly P&L</p>
                <p className="text-xl font-bold text-gold-400">
                  ${dashboardData.portalData.myReport.weekly.pnl}
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  {dashboardData.portalData.myReport.weekly.trades} trades
                </p>
              </div>
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <p className="text-xs text-gold-500/70 mb-1">Monthly P&L</p>
                <p className="text-xl font-bold text-gold-400">
                  ${dashboardData.portalData.myReport.monthly.pnl}
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  {dashboardData.portalData.myReport.monthly.trades} trades
                </p>
              </div>
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <p className="text-xs text-gold-500/70 mb-1">Yearly P&L</p>
                <p className="text-xl font-bold text-gold-400">
                  ${dashboardData.portalData.myReport.yearly.pnl}
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  {dashboardData.portalData.myReport.yearly.trades} trades
                </p>
              </div>
            </div>

            {/* Recent Reports Table */}
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
              <div className="p-4 border-b border-gold-500/20 flex justify-between items-center">
                <h3 className="text-md font-semibold text-white">
                  Recent Reports
                </h3>
                <button className="px-4 py-2 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-600">
                  Generate Report
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Report Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.portalData.myReport.recentReports.map(
                      (report) => (
                        <tr key={report.id} className="hover:bg-navy-700/30">
                          <td className="px-4 py-3 text-sm text-white">
                            {report.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {report.date}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                              {report.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            {report.size}
                          </td>
                          <td className="px-4 py-3">
                            <button className="px-3 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-lg hover:bg-gold-500/30 mr-2">
                              <FaDownload size={12} className="inline mr-1" />
                              Download
                            </button>
                            <button className="px-3 py-1 bg-navy-700 text-gold-500/70 text-xs rounded-lg hover:bg-navy-600">
                              View
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <p className="text-xs text-gold-500/70 mb-2">Win Rate</p>
                <p className="text-2xl font-bold text-gold-400">
                  {dashboardData.portalData.myReport.daily.winRate}%
                </p>
                <div className="w-full bg-navy-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gold-500 h-2 rounded-full"
                    style={{
                      width: `${dashboardData.portalData.myReport.daily.winRate}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <p className="text-xs text-gold-500/70 mb-2">Total Volume</p>
                <p className="text-2xl font-bold text-white">
                  {dashboardData.portalData.myReport.daily.volume} lots
                </p>
                <p className="text-xs text-gold-500/50 mt-2">
                  Monthly: {dashboardData.portalData.myReport.monthly.volume}{" "}
                  lots
                </p>
              </div>
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <p className="text-xs text-gold-500/70 mb-2">
                  Average per Trade
                </p>
                <p className="text-2xl font-bold text-gold-400">
                  $
                  {(
                    dashboardData.portalData.myReport.daily.pnl /
                    dashboardData.portalData.myReport.daily.trades
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-gold-500/50 mt-2">
                  Based on {dashboardData.portalData.myReport.daily.trades}{" "}
                  trades
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-navy-900 font-raleway">
      {/* Header */}
      <header className="bg-navy-800/95 backdrop-blur-lg border-b border-gold-500/30 sticky top-0 z-50">
        <div className="px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-navy-900 text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Rizal's<span className="text-gold-500 ml-1">Trade</span>
                  </h1>
                  <p className="text-xs text-gold-500/70">Premium Dashboard</p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="hidden lg:flex items-center space-x-1 bg-navy-900/50 rounded-lg p-1 ml-6">
                {["overview", "trading", "analytics", "signals", "portal"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                        activeTab === tab
                          ? "bg-gold-500 text-navy-900"
                          : "text-gold-500/70 hover:text-gold-500"
                      }`}
                    >
                      {tab === "portal" ? "My Portal" : tab}
                    </button>
                  ),
                )}
              </div>

              {/* Timeframe Selector - Only show on overview tab */}
              {activeTab === "overview" && (
                <div className="hidden md:flex items-center space-x-1 bg-navy-900/50 rounded-lg p-1">
                  {["1H", "4H", "1D", "1W", "1M"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                        selectedTimeframe === tf
                          ? "bg-gold-500 text-navy-900"
                          : "text-gold-500/70 hover:text-gold-500"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Section - Same as before */}
            <div className="flex items-center space-x-4">
              {/* Currency Selector */}
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="hidden lg:block px-3 py-2 bg-navy-900 border border-gold-500/30 rounded-lg text-gold-500 focus:outline-none focus:border-gold-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>

              {/* Search */}
              <div className="hidden lg:block relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/50 text-sm" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  className="w-64 pl-10 pr-4 py-2 bg-navy-900 border border-gold-500/30 rounded-lg text-white placeholder-gold-500/50 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              {/* Notifications */}
              <div className="relative group">
                <button className="relative p-2 text-gold-500/70 hover:text-gold-500 transition-colors">
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-gold-500 text-navy-900 text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <div className="absolute right-0 mt-2 w-96 bg-navy-800 rounded-lg shadow-xl border border-gold-500/30 hidden group-hover:block">
                  <div className="p-3 border-b border-gold-500/30 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Notifications
                    </h3>
                    <button className="text-xs text-gold-500 hover:text-gold-400">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 border-b border-gold-500/10 hover:bg-navy-700 cursor-pointer transition-colors ${
                          !notif.read ? "bg-navy-700/50" : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-1 w-2 h-2 rounded-full bg-gold-500"></div>
                          <div className="flex-1">
                            <p className="text-sm text-white">
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gold-500/70">
                                {notif.time}
                              </p>
                              <span className="text-xs text-gold-500/50 capitalize">
                                {notif.category}
                              </span>
                            </div>
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
              <button className="p-2 text-gold-500/70 hover:text-gold-500 transition-colors">
                <FaCog size={20} />
              </button>

              {/* Balance Toggle */}
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 text-gold-500/70 hover:text-gold-500 transition-colors"
              >
                {showBalance ? <FaEye size={20} /> : <FaEye size={20} />}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-2 border-l border-gold-500/30">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-white">John Smith</p>
                  <p className="text-xs text-gold-500/70">
                    {dashboardData.accountSummary.accountType} Member
                  </p>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center cursor-pointer">
                    <span className="text-navy-900 font-bold text-lg">J</span>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-navy-800 rounded-lg shadow-xl border border-gold-500/30 hidden group-hover:block">
                    <div className="p-2">
                      <div className="px-4 py-2 border-b border-gold-500/30 mb-2">
                        <p className="text-sm text-white">John Smith</p>
                        <p className="text-xs text-gold-500/70">
                          {dashboardData.accountSummary.accountNumber}
                        </p>
                      </div>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors"
                      >
                        Profile
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors"
                      >
                        Account Settings
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors"
                      >
                        Statements
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors"
                      >
                        Verification
                      </a>
                      <div className="border-t border-gold-500/30 my-2"></div>
                      <button className="w-full text-left px-4 py-2 text-sm text-gold-500/70 hover:text-gold-500 hover:bg-navy-700 rounded transition-colors flex items-center">
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
        {activeTab === "overview" ? (
          /* Existing Overview Content */
          <>
            {/* Welcome Banner with Quick Stats */}
            <div className="mb-8 bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Welcome back, <span className="text-gold-500">John!</span>
                  </h2>
                  <p className="text-gold-500/70">
                    Today's trading performance:{" "}
                    <span className="text-gold-400">
                      +${dashboardData.accountSummary.dailyChange.toFixed(2)}
                    </span>{" "}
                    ({dashboardData.accountSummary.dailyChangePercent}%)
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
                  <button className="px-4 py-2 bg-navy-700 text-gold-500 rounded-lg hover:bg-navy-600 transition-colors flex items-center space-x-2 border border-gold-500/30">
                    <FaGift size={14} />
                    <span>Bonus</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-xs text-gold-500/70">Win Rate</p>
                  <p className="text-lg font-bold text-gold-400">
                    {dashboardData.accountSummary.winRate}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gold-500/70">Trades Today</p>
                  <p className="text-lg font-bold text-white">
                    {dashboardData.accountSummary.tradesToday}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gold-500/70">Winning Trades</p>
                  <p className="text-lg font-bold text-gold-400">
                    {dashboardData.accountSummary.winningTrades}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gold-500/70">Losing Trades</p>
                  <p className="text-lg font-bold text-gold-600">
                    {dashboardData.accountSummary.losingTrades}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gold-500/70">Total Volume</p>
                  <p className="text-lg font-bold text-white">
                    {dashboardData.accountSummary.totalVolume} lots
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6">
                <div className="bg-navy-800 border border-gold-500/30 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaInfoCircle className="text-gold-500" />
                    <p className="text-gold-500/70">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-gold-500/70 hover:text-gold-500"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            )}

            {/* Account Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Balance Card */}
              <div className="bg-navy-800 rounded-2xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-navy-700 rounded-lg group-hover:bg-navy-600 transition-colors">
                    <FaWallet className="text-gold-500 text-xl" />
                  </div>
                  <span className="text-xs text-gold-500/70">Available</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {showBalance
                    ? `$${dashboardData.accountSummary.balance.toLocaleString()}`
                    : "****"}
                </p>
                <p className="text-sm text-gold-500/70">Total Balance</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gold-400">
                    <FaArrowUp className="mr-1" size={10} />
                    <span>+2.3% today</span>
                  </div>
                  <div className="text-xs text-gold-500/50">
                    Credit: ${dashboardData.accountSummary.credit}
                  </div>
                </div>
              </div>

              {/* Equity Card */}
              <div className="bg-navy-800 rounded-2xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-navy-700 rounded-lg group-hover:bg-navy-600 transition-colors">
                    <FaChartLine className="text-gold-500 text-xl" />
                  </div>
                  <span className="text-xs text-gold-500/70">With P/L</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {showBalance
                    ? `$${dashboardData.accountSummary.equity.toLocaleString()}`
                    : "****"}
                </p>
                <p className="text-sm text-gold-500/70">Total Equity</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gold-400">
                    <FaArrowUp className="mr-1" size={10} />
                    <span>+$999.50 (1.91%)</span>
                  </div>
                  <div className="text-xs text-gold-500/50">
                    Bonus: ${dashboardData.accountSummary.bonus}
                  </div>
                </div>
              </div>

              {/* Margin Card */}
              <div className="bg-navy-800 rounded-2xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-navy-700 rounded-lg group-hover:bg-navy-600 transition-colors">
                    <FaPercent className="text-gold-500 text-xl" />
                  </div>
                  <span className="text-xs text-gold-500/70">
                    Level: {dashboardData.accountSummary.marginLevel}%
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {showBalance
                    ? `$${dashboardData.accountSummary.margin.toLocaleString()}`
                    : "****"}
                </p>
                <p className="text-sm text-gold-500/70">Used Margin</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gold-500/50">Usage</span>
                    <span className="text-gold-500">
                      {(
                        (dashboardData.accountSummary.margin /
                          dashboardData.accountSummary.equity) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-navy-700 rounded-full h-1.5">
                    <div
                      className="bg-gold-500 h-1.5 rounded-full"
                      style={{
                        width: `${(dashboardData.accountSummary.margin / dashboardData.accountSummary.equity) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Free Margin Card */}
              <div className="bg-navy-800 rounded-2xl p-6 border border-gold-500/20 hover:border-gold-500/40 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-navy-700 rounded-lg group-hover:bg-navy-600 transition-colors">
                    <FaCoins className="text-gold-500 text-xl" />
                  </div>
                  <span className="text-xs text-gold-500/70">Available</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {showBalance
                    ? `$${dashboardData.accountSummary.freeMargin.toLocaleString()}`
                    : "****"}
                </p>
                <p className="text-sm text-gold-500/70">Free Margin</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gold-400">
                    <FaArrowUp className="mr-1" size={10} />
                    <span>Available for trading</span>
                  </div>
                  <div className="text-xs text-gold-500/50">
                    Leverage: {dashboardData.accountSummary.leverage}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-navy-800/30 rounded-xl p-4 border border-gold-500/10">
                <p className="text-xs text-gold-500/70 mb-1">Daily Risk</p>
                <p className="text-lg font-bold text-gold-400">
                  {dashboardData.riskMetrics.dailyRisk}%
                </p>
                <div className="w-full bg-navy-700 rounded-full h-1 mt-2">
                  <div
                    className="bg-gold-500 h-1 rounded-full"
                    style={{
                      width: `${dashboardData.riskMetrics.dailyRisk * 10}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-navy-800/30 rounded-xl p-4 border border-gold-500/10">
                <p className="text-xs text-gold-500/70 mb-1">
                  Current Drawdown
                </p>
                <p className="text-lg font-bold text-gold-600">
                  {dashboardData.riskMetrics.currentDrawdown}%
                </p>
                <div className="w-full bg-navy-700 rounded-full h-1 mt-2">
                  <div
                    className="bg-gold-600 h-1 rounded-full"
                    style={{
                      width: `${dashboardData.riskMetrics.currentDrawdown * 10}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-navy-800/30 rounded-xl p-4 border border-gold-500/10">
                <p className="text-xs text-gold-500/70 mb-1">Risk per Trade</p>
                <p className="text-lg font-bold text-white">
                  {dashboardData.riskMetrics.riskPerTrade}%
                </p>
                <p className="text-xs text-gold-500/50 mt-1">
                  Recommended: {dashboardData.riskMetrics.recommendedLots} lots
                </p>
              </div>
              <div className="bg-navy-800/30 rounded-xl p-4 border border-gold-500/10">
                <p className="text-xs text-gold-500/70 mb-1">Max Drawdown</p>
                <p className="text-lg font-bold text-gold-500">
                  {dashboardData.riskMetrics.maxDrawdown}%
                </p>
                <p className="text-xs text-gold-500/50 mt-1">All-time high</p>
              </div>
            </div>

            {/* Market Ticker */}
            <div className="mb-8 overflow-hidden bg-navy-800/50 rounded-xl border border-gold-500/20">
              <div className="flex items-center justify-between p-3 border-b border-gold-500/20">
                <div className="flex items-center">
                  <FaChartBar className="text-gold-500 mr-2" />
                  <h3 className="text-sm font-semibold text-white">
                    Live Market Prices
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gold-500/70">
                    Auto-refresh 3s
                  </span>
                  <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="flex space-x-8 p-4 min-w-max">
                  {dashboardData.marketData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-white">
                            {item.symbol}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              item.volatility === "High"
                                ? "bg-gold-600/20 text-gold-600"
                                : item.volatility === "Medium"
                                  ? "bg-gold-500/20 text-gold-500"
                                  : "bg-gold-400/20 text-gold-400"
                            }`}
                          >
                            {item.volatility}
                          </span>
                        </div>
                        <p className="text-xs text-gold-500/70 mt-1">
                          B: ${item.bid.toFixed(5)} | A: ${item.ask.toFixed(5)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-medium ${
                            item.changePercent >= 0
                              ? "text-gold-400"
                              : "text-gold-600"
                          }`}
                        >
                          {item.changePercent >= 0 ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </span>
                        <p className="text-xs text-gold-500/50">
                          Spread: {item.spread}
                        </p>
                      </div>
                      {index < dashboardData.marketData.length - 1 && (
                        <div className="w-px h-10 bg-gold-500/20"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trading Signals */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <FaRocket className="text-gold-500 mr-2" />
                  Trading Signals
                </h3>
                <button className="text-sm text-gold-500 hover:text-gold-400">
                  View All Signals →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.tradingSignals.map((signal, index) => (
                  <div
                    key={index}
                    className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20 hover:border-gold-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-white">
                          {signal.symbol}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            signal.signal === "BUY"
                              ? "bg-gold-400/20 text-gold-400"
                              : "bg-gold-600/20 text-gold-600"
                          }`}
                        >
                          {signal.signal}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gold-500">
                          Strength: {signal.strength}%
                        </div>
                        <p className="text-xs text-gold-500/50">
                          {signal.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {signal.indicators.map((indicator, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-navy-700 rounded text-xs text-gold-500"
                        >
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Grid - Positions and Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Open Positions */}
              <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden">
                <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaExchangeAlt className="text-gold-500" />
                    <h2 className="text-lg font-semibold text-white">
                      Open Positions
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                      {dashboardData.positions.length} positions
                    </span>
                    <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                      Total P/L: $
                      {dashboardData.positions
                        .reduce((sum, pos) => sum + pos.profitLoss, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-navy-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">
                          Symbol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">
                          Volume
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">
                          Open
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">
                          Current
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">
                          P/L
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">
                          R/R
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {dashboardData.positions.map((position) => (
                        <tr
                          key={position.id}
                          className="hover:bg-navy-700/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-white">
                              {position.symbol}
                            </span>
                            <p className="text-xs text-gold-500/50">
                              {position.duration}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                position.type === "BUY"
                                  ? "bg-gold-400/20 text-gold-400"
                                  : "bg-gold-600/20 text-gold-600"
                              }`}
                            >
                              {position.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            {position.volume}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            ${position.openPrice.toFixed(5)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            ${position.currentPrice.toFixed(5)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-sm font-medium ${
                                position.profitLoss >= 0
                                  ? "text-gold-400"
                                  : "text-gold-600"
                              }`}
                            >
                              ${position.profitLoss.toFixed(2)}
                            </span>
                            <p
                              className={`text-xs ${
                                position.profitLossPercent >= 0
                                  ? "text-gold-400"
                                  : "text-gold-600"
                              }`}
                            >
                              {position.profitLossPercent >= 0 ? "+" : ""}
                              {position.profitLossPercent.toFixed(2)}%
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gold-500">
                              {position.riskRewardRatio}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleClosePosition(position.id)}
                              className="px-3 py-1 bg-gold-600/20 text-gold-600 text-xs rounded-lg hover:bg-gold-600/30 transition-colors"
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
                    <p className="text-gold-500/50">No open positions</p>
                  </div>
                )}
              </div>

              {/* Open Orders */}
              <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden">
                <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaClock className="text-gold-500" />
                    <h2 className="text-lg font-semibold text-white">
                      Open Orders
                    </h2>
                  </div>
                  <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                    {dashboardData.openOrders.length} orders
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-navy-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                          Symbol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                          Volume
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                          SL/TP
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {dashboardData.openOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-navy-700/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-white">
                              {order.symbol}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                              {order.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            {order.volume}
                          </td>
                          <td className="px-4 py-3 text-sm text-gold-500/70">
                            ${order.price.toFixed(5)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gold-500/50">
                              SL: ${order.stopLoss.toFixed(5)}
                            </p>
                            <p className="text-xs text-gold-500/50">
                              TP: ${order.takeProfit.toFixed(5)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gold-500/20 text-gold-500 text-xs rounded-full">
                              {order.status}
                            </span>
                            <p className="text-xs text-gold-500/50 mt-1">
                              Exp: {new Date(order.expiry).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-3 py-1 bg-gold-600/20 text-gold-600 text-xs rounded-lg hover:bg-gold-600/30 transition-colors"
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
                    <p className="text-gold-500/50">No open orders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Economic Calendar */}
            <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden mb-8">
              <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gold-500" />
                  <h2 className="text-lg font-semibold text-white">
                    Economic Calendar
                  </h2>
                </div>
                <button className="text-sm text-gold-500 hover:text-gold-400">
                  View Full Calendar →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Event
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Impact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Forecast
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Previous
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.economicCalendar.map((event, index) => (
                      <tr
                        key={index}
                        className="hover:bg-navy-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-white">
                          {event.event}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              event.impact === "High"
                                ? "bg-gold-600/20 text-gold-600"
                                : event.impact === "Medium"
                                  ? "bg-gold-500/20 text-gold-500"
                                  : "bg-gold-400/20 text-gold-400"
                            }`}
                          >
                            {event.impact}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          {event.time}
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          {event.forecast}
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          {event.previous}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Overview */}
            <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden mb-8">
              <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaGlobe className="text-gold-500" />
                  <h2 className="text-lg font-semibold text-white">
                    Market Overview
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gold-500/70 hover:text-gold-500 transition-colors">
                    <FaFilter size={14} />
                  </button>
                  <button className="p-2 text-gold-500/70 hover:text-gold-500 transition-colors">
                    <FaDownload size={14} />
                  </button>
                  <button className="p-2 text-gold-500/70 hover:text-gold-500 transition-colors">
                    <FaCopy size={14} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Symbol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Bid
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Ask
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Change
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Spread
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        High/Low
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Trend
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.marketData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-navy-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-white">
                            {item.symbol}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          ${item.bid.toFixed(5)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          ${item.ask.toFixed(5)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-medium ${
                              item.changePercent >= 0
                                ? "text-gold-400"
                                : "text-gold-600"
                            }`}
                          >
                            {item.changePercent >= 0 ? "+" : ""}
                            {item.changePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          {item.spread}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gold-400">
                            H: ${item.high.toFixed(5)}
                          </p>
                          <p className="text-xs text-gold-600">
                            L: ${item.low.toFixed(5)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium ${
                              item.trend === "Bullish"
                                ? "text-gold-400"
                                : "text-gold-600"
                            }`}
                          >
                            {item.trend}
                          </span>
                          <p className="text-xs text-gold-500/50">
                            S: ${item.support} | R: ${item.resistance}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          {item.volume}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Trade History */}
            <div className="bg-navy-800/50 rounded-2xl border border-gold-500/20 overflow-hidden mb-8">
              <div className="p-4 border-b border-gold-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaHistory className="text-gold-500" />
                  <h2 className="text-lg font-semibold text-white">
                    Recent Trade History
                  </h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gold-500/70">
                      Winning Rate:
                    </span>
                    <span className="text-sm font-bold text-gold-400">
                      {dashboardData.accountSummary.winRate}%
                    </span>
                  </div>
                  <button className="text-sm text-gold-500 hover:text-gold-400 transition-colors">
                    View All →
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Symbol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Volume
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Open
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Close
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Profit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gold-500/70 uppercase">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-500/10">
                    {dashboardData.tradeHistory.map((trade) => (
                      <tr
                        key={trade.id}
                        className="hover:bg-navy-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-white">
                          {trade.symbol}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              trade.type === "BUY"
                                ? "bg-gold-400/20 text-gold-400"
                                : "bg-gold-600/20 text-gold-600"
                            }`}
                          >
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {trade.volume}
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          ${trade.openPrice.toFixed(5)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          ${trade.closePrice.toFixed(5)}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${
                            trade.profit >= 0
                              ? "text-gold-400"
                              : "text-gold-600"
                          }`}
                        >
                          ${trade.profit.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gold-500/70">
                          {trade.duration}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              trade.reason === "Take Profit"
                                ? "bg-gold-400/20 text-gold-400"
                                : "bg-gold-600/20 text-gold-600"
                            }`}
                          >
                            {trade.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <h4 className="text-sm text-gold-500/70 mb-3">
                  Daily Performance
                </h4>
                <p className="text-2xl font-bold text-gold-400 mb-2">
                  ${dashboardData.performanceMetrics.daily.profit}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gold-500/50">
                    Trades: {dashboardData.performanceMetrics.daily.trades}
                  </span>
                  <span className="text-gold-400">
                    Win: {dashboardData.performanceMetrics.daily.winRate}%
                  </span>
                </div>
              </div>
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <h4 className="text-sm text-gold-500/70 mb-3">
                  Weekly Performance
                </h4>
                <p className="text-2xl font-bold text-gold-400 mb-2">
                  ${dashboardData.performanceMetrics.weekly.profit}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gold-500/50">
                    Trades: {dashboardData.performanceMetrics.weekly.trades}
                  </span>
                  <span className="text-gold-400">
                    Win: {dashboardData.performanceMetrics.weekly.winRate}%
                  </span>
                </div>
              </div>
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <h4 className="text-sm text-gold-500/70 mb-3">
                  Monthly Performance
                </h4>
                <p className="text-2xl font-bold text-gold-400 mb-2">
                  ${dashboardData.performanceMetrics.monthly.profit}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gold-500/50">
                    Trades: {dashboardData.performanceMetrics.monthly.trades}
                  </span>
                  <span className="text-gold-400">
                    Win: {dashboardData.performanceMetrics.monthly.winRate}%
                  </span>
                </div>
              </div>
              <div className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20">
                <h4 className="text-sm text-gold-500/70 mb-3">
                  Yearly Performance
                </h4>
                <p className="text-2xl font-bold text-gold-400 mb-2">
                  ${dashboardData.performanceMetrics.yearly.profit}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gold-500/50">
                    Trades: {dashboardData.performanceMetrics.yearly.trades}
                  </span>
                  <span className="text-gold-400">
                    Win: {dashboardData.performanceMetrics.yearly.winRate}%
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "portal" ? (
          /* My Portal Section */
          <div className="space-y-6">
            {/* Portal Header */}
            <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">
                <FaThLarge className="inline mr-3 text-gold-500" />
                My Portal
              </h2>
              <p className="text-gold-500/70">
                Manage your trading platforms, accounts, and reports in one
                place
              </p>
            </div>

            {/* Portal Tabs */}
            <div className="flex flex-wrap gap-2 bg-navy-800/30 rounded-xl p-2 border border-gold-500/20">
              <button
                onClick={() => setActivePortalTab("capex-trader")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activePortalTab === "capex-trader"
                    ? "bg-gold-500 text-navy-900"
                    : "text-gold-500/70 hover:text-gold-500 hover:bg-navy-700"
                }`}
              >
                <FaDesktop />
                <span>CAPEX Trader</span>
              </button>
              <button
                onClick={() => setActivePortalTab("capex-metatrader")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activePortalTab === "capex-metatrader"
                    ? "bg-gold-500 text-navy-900"
                    : "text-gold-500/70 hover:text-gold-500 hover:bg-navy-700"
                }`}
              >
                <FaServer />
                <span>CAPEX MetaTrader</span>
              </button>
              <button
                onClick={() => setActivePortalTab("my-account")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activePortalTab === "my-account"
                    ? "bg-gold-500 text-navy-900"
                    : "text-gold-500/70 hover:text-gold-500 hover:bg-navy-700"
                }`}
              >
                <FaUser />
                <span>My Account</span>
              </button>
              <button
                onClick={() => setActivePortalTab("my-profile")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activePortalTab === "my-profile"
                    ? "bg-gold-500 text-navy-900"
                    : "text-gold-500/70 hover:text-gold-500 hover:bg-navy-700"
                }`}
              >
                <FaUserCircle />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setActivePortalTab("metatrader5")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activePortalTab === "metatrader5"
                    ? "bg-gold-500 text-navy-900"
                    : "text-gold-500/70 hover:text-gold-500 hover:bg-navy-700"
                }`}
              >
                <FaChartLine />
                <span>MetaTrader 5</span>
              </button>
              <button
                onClick={() => setActivePortalTab("trading-accounts")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activePortalTab === "trading-accounts"
                    ? "bg-gold-500 text-navy-900"
                    : "text-gold-500/70 hover:text-gold-500 hover:bg-navy-700"
                }`}
              >
                <FaWallet />
                <span>Trading Accounts</span>
              </button>
              <button
                onClick={() => setActivePortalTab("trading-central")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activePortalTab === "trading-central"
                    ? "bg-gold-500 text-navy-900"
                    : "text-gold-500/70 hover:text-gold-500 hover:bg-navy-700"
                }`}
              >
                <FaChartBar />
                <span>Trading Central</span>
              </button>
              <button
                onClick={() => setActivePortalTab("my-report")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  activePortalTab === "my-report"
                    ? "bg-gold-500 text-navy-900"
                    : "text-gold-500/70 hover:text-gold-500 hover:bg-navy-700"
                }`}
              >
                <FaFileAlt />
                <span>My Report</span>
              </button>
            </div>

            {/* Portal Content */}
            <div className="mt-6">{renderPortalContent()}</div>
          </div>
        ) : (
          /* Other tabs placeholder */
          <div className="bg-navy-800/50 rounded-2xl p-8 border border-gold-500/20 text-center">
            <h2 className="text-2xl font-bold text-gold-500 mb-4 capitalize">
              {activeTab} Section
            </h2>
            <p className="text-gold-500/70">
              This section is under development. Please check back later.
            </p>
          </div>
        )}
      </main>

      {/* Quick Trade Modal */}
      {showQuickTrade && (
        <div className="fixed inset-0 bg-navy-900/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-800 rounded-2xl border border-gold-500/30 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gold-500">Quick Trade</h3>
              <button
                onClick={() => setShowQuickTrade(false)}
                className="text-gold-500/70 hover:text-gold-500"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gold-500/70 mb-2">
                  Symbol
                </label>
                <select
                  value={quickTradeData.symbol}
                  onChange={(e) =>
                    setQuickTradeData({
                      ...quickTradeData,
                      symbol: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                >
                  {dashboardData.marketData.map((item) => (
                    <option key={item.symbol} value={item.symbol}>
                      {item.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gold-500/70 mb-2">
                  Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setQuickTradeData({ ...quickTradeData, type: "BUY" })
                    }
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                      quickTradeData.type === "BUY"
                        ? "bg-gold-400 text-navy-900"
                        : "bg-navy-700 text-gold-500/70 hover:bg-navy-600"
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() =>
                      setQuickTradeData({ ...quickTradeData, type: "SELL" })
                    }
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                      quickTradeData.type === "SELL"
                        ? "bg-gold-600 text-navy-900"
                        : "bg-navy-700 text-gold-500/70 hover:bg-navy-600"
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gold-500/70 mb-2">
                  Volume (lots)
                </label>
                <input
                  type="number"
                  value={quickTradeData.volume}
                  onChange={(e) =>
                    setQuickTradeData({
                      ...quickTradeData,
                      volume: parseFloat(e.target.value),
                    })
                  }
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-3 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="bg-navy-700/50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gold-500/70">
                    Margin Required
                  </span>
                  <span className="text-sm font-medium text-gold-400">
                    ${(quickTradeData.volume * 1000).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gold-500/70">
                    Available Margin
                  </span>
                  <span className="text-sm font-medium text-gold-400">
                    ${dashboardData.accountSummary.freeMargin.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleQuickTrade}
                className="w-full px-4 py-3 bg-gold-500 text-navy-900 rounded-lg font-bold hover:bg-gold-600 transition-colors"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <button
          onClick={() => setShowQuickTrade(true)}
          className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 shadow-lg hover:bg-gold-600 transition-colors"
        >
          <FaBolt size={20} />
        </button>
        <button className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center text-gold-500 shadow-lg hover:bg-navy-600 transition-colors border border-gold-500/30">
          <FaStar size={20} />
        </button>
        <button className="w-12 h-12 bg-navy-700 rounded-full flex items-center justify-center text-gold-500 shadow-lg hover:bg-navy-600 transition-colors border border-gold-500/30">
          <FaShieldAlt size={20} />
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
