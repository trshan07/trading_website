// frontend/src/components/dashboard/TradingTab.jsx
import React, { useState, useEffect } from 'react';
import TradingViewWidget from '../trading/TradingViewWidget';
import OrderBook from '../trading/OrderBook';
import OrderForm from '../trading/OrderForm';
import PositionsTable from '../trading/PositionsTable';
import OpenOrders from '../trading/OpenOrders';
import AccountSummary from '../trading/AccountSummary';
import AreaChart from '../ui/charts/AreaChart';

const TradingTab = ({ 
  portfolio = {
    totalBalance: 0,
    availableBalance: 0,
    equity: 0,
    margin: 0,
    marginLevel: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    weeklyPnL: 0,
    monthlyPnL: 0,
    yearlyPnL: 0,
    positionsCount: 0
  }, 
  showBalance = true, 
  onToggleBalance = () => {},
  positions = [],
  orders = [],
  marketData = {},
  portfolioHistory = [],
  onPlaceOrder = () => {},
  onClosePosition = () => {},
  onCancelOrder = () => {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState('positions');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <AccountSummary 
        portfolio={portfolio}
        showBalance={showBalance}
        onToggleBalance={onToggleBalance}
      />

      {/* Main Trading Area */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-4'} gap-4 sm:gap-6`}>
        {/* Chart Area - Responsive columns */}
        <div className={isMobile ? 'col-span-1' : 'lg:col-span-3 space-y-4'}>
          {/* Real Chart - No selector, just the chart */}
          <div 
            className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden" 
            style={{ height: isMobile ? '350px' : isTablet ? '400px' : '500px' }}
          >
            <TradingViewWidget symbol="BTCUSD" />
          </div>

          {/* Order Book */}
          {!isMobile && <OrderBook symbol="BTCUSD" />}
          
          {/* Mobile Order Book Toggle */}
          {isMobile && (
            <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-3">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-gold-500 font-medium">
                  <span>Order Book</span>
                  <span className="transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3">
                  <OrderBook symbol="BTCUSD" compact={true} />
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Order Form - Responsive column */}
        <div className={isMobile ? 'col-span-1' : 'lg:col-span-1'}>
          <OrderForm 
            onSubmit={onPlaceOrder} 
            symbol="BTCUSD"
            compact={isMobile}
          />
        </div>
      </div>

      {/* Positions and Orders Tabs */}
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden">
        <div className="border-b border-gold-500/20">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('positions')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeSubTab === 'positions'
                  ? 'bg-gold-500 text-navy-950'
                  : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
              }`}
            >
              Open Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeSubTab === 'orders'
                  ? 'bg-gold-500 text-navy-950'
                  : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
              }`}
            >
              Open Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeSubTab === 'history'
                  ? 'bg-gold-500 text-navy-950'
                  : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
              }`}
            >
              Order History
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          {activeSubTab === 'positions' && (
            positions.length > 0 ? (
              <PositionsTable 
                positions={positions}
                onClose={onClosePosition}
                compact={isMobile}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gold-500/50">No open positions</p>
              </div>
            )
          )}
          {activeSubTab === 'orders' && (
            orders.length > 0 ? (
              <OpenOrders 
                orders={orders}
                onCancel={onCancelOrder}
                compact={isMobile}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gold-500/50">No open orders</p>
              </div>
            )
          )}
          {activeSubTab === 'history' && (
            <div className="text-center py-8">
              <p className="text-gold-500/50">Order history coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Performance Chart */}
      <div className="bg-navy-800/50 rounded-xl p-3 sm:p-4 border border-gold-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gold-500">Portfolio Performance</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gold-500/50">Total Return: </span>
            <span className="text-sm font-medium text-green-400">+6.5%</span>
          </div>
        </div>
        <div style={{ height: isMobile ? '150px' : '200px' }}>
          {portfolioHistory && portfolioHistory.length > 0 ? (
            <AreaChart 
              data={portfolioHistory}
              xKey="date"
              yKey="value"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gold-500/50 text-sm">No portfolio data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingTab;