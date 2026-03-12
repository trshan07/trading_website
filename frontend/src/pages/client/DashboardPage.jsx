import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import AccountSummary from "../../components/trading/AccountSummary";
import PositionsTable from "../../components/trading/PositionsTable";
import OpenOrders from "../../components/trading/OpenOrders";
import PriceTicker from "../../components/trading/PriceTicker";
import MarketOverview from "../../components/trading/MarketOverview";
import Loader from "../../components/common/Loader";
import Alert from "../../components/common/Alert";

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    accountSummary: {
      balance: 50000,
      equity: 52345,
      margin: 2345,
      freeMargin: 50000,
      profitLoss: 2345,
      profitLossPercentage: 4.69,
    },
    positions: [
      {
        id: 1,
        symbol: "EUR/USD",
        type: "BUY",
        volume: 0.1,
        openPrice: 1.085,
        currentPrice: 1.0875,
        profitLoss: 25,
        profitLossPercentage: 0.23,
        openTime: new Date().toISOString(),
        stopLoss: 1.08,
        takeProfit: 1.09,
        commission: 0.5,
        swap: 0.1,
        margin: 108.5,
      },
      {
        id: 2,
        symbol: "BTC/USD",
        type: "SELL",
        volume: 0.01,
        openPrice: 42500,
        currentPrice: 42300,
        profitLoss: 200,
        profitLossPercentage: 0.47,
        openTime: new Date().toISOString(),
        stopLoss: 43000,
        takeProfit: 42000,
        commission: 2.5,
        swap: -0.3,
        margin: 425,
      },
    ],
    openOrders: [
      {
        id: 1,
        symbol: "EUR/USD",
        type: "BUY LIMIT",
        volume: 0.1,
        price: 1.08,
        status: "PENDING",
        createdTime: new Date().toISOString(),
        expiry: new Date(Date.now() + 86400000).toISOString(),
      },
    ],
    marketData: [
      {
        symbol: "EUR/USD",
        bid: 1.0875,
        ask: 1.0878,
        change: 0.25,
        changePercent: 0.23,
      },
      {
        symbol: "GBP/USD",
        bid: 1.265,
        ask: 1.2653,
        change: -0.15,
        changePercent: -0.12,
      },
      {
        symbol: "BTC/USD",
        bid: 42500,
        ask: 42550,
        change: 2.5,
        changePercent: 0.59,
      },
    ],
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClosePosition = (positionId) => {
    console.log("Closing position:", positionId);
    // Add your close position logic here
  };

  const handleCancelOrder = (orderId) => {
    console.log("Cancelling order:", orderId);
    // Add your cancel order logic here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy">
        <Loader size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy font-raleway">
      {/* Header */}
      <header className="bg-navy-light border-b border-gold-light sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gold">Trading Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gold">
                  {user?.name || "Trader"}
                </p>
                <p className="text-xs text-gold-light">
                  Balance: $
                  {dashboardData.accountSummary.balance.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gold flex items-center justify-center text-navy font-bold">
                {user?.name?.charAt(0) || "T"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Account Summary */}
        <div className="mb-6">
          <AccountSummary data={dashboardData.accountSummary} />
        </div>

        {/* Price Ticker */}
        <div className="mb-6">
          <PriceTicker data={dashboardData.marketData} />
        </div>

        {/* Market Overview */}
        <div className="mb-6">
          <MarketOverview data={dashboardData.marketData} />
        </div>

        {/* Positions and Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-navy-light rounded-lg border border-gold-light p-4">
            <h2 className="text-lg font-semibold text-gold mb-4">
              Open Positions
            </h2>
            <PositionsTable
              positions={dashboardData.positions}
              onClose={handleClosePosition}
            />
          </div>

          <div className="bg-navy-light rounded-lg border border-gold-light p-4">
            <h2 className="text-lg font-semibold text-gold mb-4">
              Open Orders
            </h2>
            <OpenOrders
              orders={dashboardData.openOrders}
              onCancel={handleCancelOrder}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
