import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useTrading } from "../../hooks/useTrading";
import AccountSummary from "../../components/trading/AccountSummary";
import PositionsTable from "../../components/trading/PositionsTable";
import OpenOrders from "../../components/trading/OpenOrders";
import PriceTicker from "../../components/trading/PriceTicker";
import TradingChart from "../../components/trading/TradingChart";
import MarketOverview from "../../components/trading/MarketOverview";
import OrderForm from "../../components/trading/OrderForm";
import TradeHistory from "../../components/trading/TradeHistory";
import Loader from "../../components/common/Loader";
import Alert from "../../components/common/Alert";
import { formatCurrency } from "../../utils/formatters";
import { REFRESH_INTERVAL, DEFAULT_SYMBOL } from "../../utils/constants";

const DashboardPage = () => {
  const { user } = useAuth();
  const { lastMessage, isConnected, sendMessage } = useWebSocket();
  const { executeTrade, getAccountSummary, getPositions, getOrders } =
    useTrading();

  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOL);
  const [activeTab, setActiveTab] = useState("overview");

  // Data States
  const [dashboardData, setDashboardData] = useState({
    accountSummary: {
      balance: 0,
      equity: 0,
      margin: 0,
      freeMargin: 0,
      profitLoss: 0,
      profitLossPercentage: 0,
    },
    positions: [],
    openOrders: [],
    tradeHistory: [],
    marketData: [],
    watchlist: [],
  });

  // UI States
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderType, setOrderType] = useState("market");
  const [timeframe, setTimeframe] = useState("1H");
  const [chartType, setChartType] = useState("candlestick");

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh
    const intervalId = setInterval(() => {
      refreshDashboardData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  // Handle symbol change
  useEffect(() => {
    if (isConnected) {
      sendMessage({
        type: "SUBSCRIBE_SYMBOL",
        payload: { symbol: selectedSymbol },
      });
    }
  }, [selectedSymbol, isConnected]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        accountSummary,
        positions,
        openOrders,
        tradeHistory,
        marketData,
        watchlist,
      ] = await Promise.all([
        getAccountSummary(),
        getPositions(),
        getOrders("open"),
        getOrders("history"),
        fetchMarketData(),
        fetchWatchlist(),
      ]);

      setDashboardData({
        accountSummary,
        positions,
        openOrders,
        tradeHistory,
        marketData,
        watchlist,
      });

      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data. Please refresh the page.");
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardData = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);

      // Refresh only critical data
      const [accountSummary, positions, marketData] = await Promise.all([
        getAccountSummary(),
        getPositions(),
        fetchMarketData(),
      ]);

      setDashboardData((prev) => ({
        ...prev,
        accountSummary,
        positions,
        marketData,
      }));
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleWebSocketMessage = (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "PRICE_UPDATE":
          handlePriceUpdate(data.payload);
          break;
        case "POSITION_UPDATE":
          handlePositionUpdate(data.payload);
          break;
        case "ORDER_UPDATE":
          handleOrderUpdate(data.payload);
          break;
        case "ACCOUNT_UPDATE":
          handleAccountUpdate(data.payload);
          break;
        case "TRADE_EXECUTED":
          handleTradeExecuted(data.payload);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("WebSocket message parsing error:", err);
    }
  };

  const handlePriceUpdate = (update) => {
    setDashboardData((prev) => {
      // Update market data
      const updatedMarketData = prev.marketData.map((item) =>
        item.symbol === update.symbol
          ? { ...item, ...update, lastUpdate: Date.now() }
          : item,
      );

      // Update positions with new prices
      const updatedPositions = prev.positions.map((position) => {
        if (position.symbol === update.symbol) {
          const currentPrice =
            position.type === "BUY" ? update.bid : update.ask;
          const profitLoss =
            (currentPrice - position.openPrice) * position.volume * 100000;
          const profitLossPercentage = (profitLoss / position.margin) * 100;

          return {
            ...position,
            currentPrice,
            profitLoss,
            profitLossPercentage,
          };
        }
        return position;
      });

      return {
        ...prev,
        marketData: updatedMarketData,
        positions: updatedPositions,
      };
    });
  };

  const handlePositionUpdate = (update) => {
    setDashboardData((prev) => ({
      ...prev,
      positions: update.positions || prev.positions,
    }));
  };

  const handleOrderUpdate = (update) => {
    setDashboardData((prev) => ({
      ...prev,
      openOrders: update.orders || prev.openOrders,
    }));
  };

  const handleAccountUpdate = (update) => {
    setDashboardData((prev) => ({
      ...prev,
      accountSummary: { ...prev.accountSummary, ...update },
    }));
  };

  const handleTradeExecuted = (trade) => {
    setSuccess(
      `Trade executed: ${trade.symbol} ${trade.type} ${trade.volume} lots @ ${trade.price}`,
    );

    // Refresh relevant data
    refreshDashboardData();
  };

  const handleTrade = async (orderData) => {
    try {
      setError(null);
      const result = await executeTrade(orderData);

      if (result.success) {
        setSuccess("Order placed successfully!");
        setShowOrderForm(false);
        refreshDashboardData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to execute trade. Please try again.");
    }
  };

  const handleClosePosition = async (positionId) => {
    try {
      const result = await executeTrade({
        type: "CLOSE_POSITION",
        positionId,
      });

      if (result.success) {
        setSuccess("Position closed successfully");
        refreshDashboardData();
      }
    } catch (err) {
      setError("Failed to close position");
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      // API call to cancel order
      setSuccess("Order cancelled successfully");
      refreshDashboardData();
    } catch (err) {
      setError("Failed to cancel order");
    }
  };

  const fetchMarketData = async () => {
    // Simulated API call
    return [
      {
        symbol: "EUR/USD",
        bid: 1.0875,
        ask: 1.0878,
        high: 1.089,
        low: 1.0865,
        volume: 12543,
        change: 0.25,
        changePercent: 0.23,
        spread: 0.3,
      },
      {
        symbol: "GBP/USD",
        bid: 1.265,
        ask: 1.2653,
        high: 1.267,
        low: 1.264,
        volume: 8932,
        change: -0.15,
        changePercent: -0.12,
        spread: 0.3,
      },
      {
        symbol: "USD/JPY",
        bid: 148.32,
        ask: 148.35,
        high: 148.5,
        low: 148.2,
        volume: 15678,
        change: 0.35,
        changePercent: 0.24,
        spread: 0.3,
      },
      {
        symbol: "BTC/USD",
        bid: 42500,
        ask: 42550,
        high: 42800,
        low: 42300,
        volume: 2345,
        change: 2.5,
        changePercent: 0.59,
        spread: 50,
      },
      {
        symbol: "ETH/USD",
        bid: 2250,
        ask: 2255,
        high: 2280,
        low: 2230,
        volume: 12345,
        change: 1.8,
        changePercent: 0.8,
        spread: 5,
      },
    ];
  };

  const fetchWatchlist = async () => {
    return ["EUR/USD", "GBP/USD", "BTC/USD", "ETH/USD", "XAU/USD"];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy">
        <Loader size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "trading", name: "Trading", icon: "📈" },
    { id: "positions", name: "Positions", icon: "📋" },
    { id: "orders", name: "Orders", icon: "🔖" },
    { id: "history", name: "History", icon: "📜" },
  ];

  return (
    <div className="min-h-screen bg-navy font-raleway">
      {/* Header */}
      <header className="bg-navy-light border-b border-gold-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent">
                Rizals Trade
              </h1>

              {/* Connection Status */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-navy-lighter rounded-full border border-gold-light">
                <div
                  className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                    isConnected ? "bg-gold" : "bg-red-500"
                  }`}
                />
                <span className="text-xs font-medium text-gold-light">
                  {isConnected ? "LIVE" : "CONNECTING..."}
                </span>
              </div>

              {/* Refresh indicator */}
              {refreshing && (
                <div className="flex items-center space-x-2">
                  <Loader size="small" />
                  <span className="text-sm text-gold-light">Syncing...</span>
                </div>
              )}
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gold">
                    {user?.name || "Trader"}
                  </p>
                  <p className="text-xs text-gold-light">
                    Balance:{" "}
                    {formatCurrency(dashboardData.accountSummary.balance)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gold to-yellow-500 flex items-center justify-center text-navy font-bold">
                  {user?.name?.charAt(0) || "T"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        <div className="mb-6">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              autoClose={5000}
            />
          )}
          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
              autoClose={3000}
            />
          )}
        </div>

        {/* Account Summary Cards */}
        <div className="mb-6">
          <AccountSummary
            data={dashboardData.accountSummary}
            onRefresh={refreshDashboardData}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gold-light">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 inline-flex items-center space-x-2 border-b-2 font-medium text-sm transition-all
                  ${
                    activeTab === tab.id
                      ? "border-gold text-gold"
                      : "border-transparent text-gold-light hover:text-gold hover:border-gold-light"
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Price Ticker */}
              <div className="dashboard-card rounded-lg p-4">
                <PriceTicker
                  data={dashboardData.marketData}
                  onSelectSymbol={setSelectedSymbol}
                  selectedSymbol={selectedSymbol}
                />
              </div>

              {/* Main Trading Area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 dashboard-card rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gold">
                        {selectedSymbol} Chart
                      </h2>
                      <p className="text-sm text-gold-light">
                        Timeframe: {timeframe} | Type: {chartType}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="px-2 py-1 bg-navy-lighter border border-gold-light rounded-md text-sm text-gold focus:border-gold focus:outline-none"
                      >
                        <option value="1M">1M</option>
                        <option value="5M">5M</option>
                        <option value="15M">15M</option>
                        <option value="1H">1H</option>
                        <option value="4H">4H</option>
                        <option value="1D">1D</option>
                      </select>
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="px-2 py-1 bg-navy-lighter border border-gold-light rounded-md text-sm text-gold focus:border-gold focus:outline-none"
                      >
                        <option value="candlestick">Candlestick</option>
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                      </select>
                    </div>
                  </div>
                  <TradingChart
                    symbol={selectedSymbol}
                    timeframe={timeframe}
                    type={chartType}
                    height={500}
                  />
                </div>

                {/* Order Form */}
                <div className="dashboard-card rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gold">
                      Place Order
                    </h2>
                    <button
                      onClick={() => setShowOrderForm(!showOrderForm)}
                      className="text-sm text-gold hover:text-gold-light transition-colors"
                    >
                      {showOrderForm ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showOrderForm && (
                    <OrderForm
                      symbol={selectedSymbol}
                      accountBalance={dashboardData.accountSummary.balance}
                      onSubmit={handleTrade}
                      onCancel={() => setShowOrderForm(false)}
                    />
                  )}
                </div>
              </div>

              {/* Market Overview */}
              <div className="dashboard-card rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gold mb-4">
                  Market Overview
                </h2>
                <MarketOverview data={dashboardData.marketData} />
              </div>
            </>
          )}

          {/* Trading Tab */}
          {activeTab === "trading" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="dashboard-card rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gold mb-4">
                  Quick Trade
                </h2>
                <OrderForm
                  symbol={selectedSymbol}
                  accountBalance={dashboardData.accountSummary.balance}
                  onSubmit={handleTrade}
                />
              </div>
              <div className="dashboard-card rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gold mb-4">
                  Market Info
                </h2>
                <MarketOverview data={dashboardData.marketData} compact />
              </div>
            </div>
          )}

          {/* Positions Tab */}
          {activeTab === "positions" && (
            <div className="dashboard-card rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gold mb-4">
                Open Positions
              </h2>
              <PositionsTable
                positions={dashboardData.positions}
                onClose={handleClosePosition}
              />
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="dashboard-card rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gold mb-4">
                Open Orders
              </h2>
              <OpenOrders
                orders={dashboardData.openOrders}
                onCancel={handleCancelOrder}
              />
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="dashboard-card rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gold mb-4">
                Trade History
              </h2>
              <TradeHistory trades={dashboardData.tradeHistory} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
