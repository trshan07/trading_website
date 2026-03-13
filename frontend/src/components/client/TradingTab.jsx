// frontend/src/components/dashboard/TradingTab.jsx
import React, { useState } from 'react';
import { MdCandlestickChart } from 'react-icons/md';
import { BsFillBarChartFill } from 'react-icons/bs';
import { FaChartLine } from 'react-icons/fa';
import TradingViewWidget from '../trading/TradingViewWidget';
import TradingChart from '../trading/TradingChart';
import OrderBook from '../trading/OrderBook';
import OrderForm from '../trading/OrderForm';
import PositionsTable from '../trading/PositionsTable';
import OpenOrders from '../trading/OpenOrders';
import AccountSummary from '../trading/AccountSummary';
import AreaChart from '../ui/charts/AreaChart';

const TradingTab = ({ 
  portfolio, 
  showBalance, 
  onToggleBalance,
  positions,
  orders,
  marketData,
  portfolioHistory,
  onPlaceOrder,
  onClosePosition,
  onCancelOrder
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [chartType, setChartType] = useState('line');
  const [timeframe, setTimeframe] = useState('1H');
  const [activeSubTab, setActiveSubTab] = useState('positions');

  return (
    <>
      <AccountSummary 
        portfolio={portfolio}
        showBalance={showBalance}
        onToggleBalance={onToggleBalance}
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
          <OrderForm onSubmit={onPlaceOrder} />
        </div>
      </div>

      {/* Positions and Orders Tabs */}
      <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 overflow-hidden mb-6">
        <div className="border-b border-gold-500/20">
          <div className="flex space-x-1 p-1">
            <button
              onClick={() => setActiveSubTab('positions')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeSubTab === 'positions'
                  ? 'bg-gold-500 text-navy-950'
                  : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
              }`}
            >
              Open Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeSubTab === 'orders'
                  ? 'bg-gold-500 text-navy-950'
                  : 'text-gold-500/70 hover:text-gold-500 hover:bg-navy-700'
              }`}
            >
              Open Orders ({orders.length})
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeSubTab === 'positions' && (
            <PositionsTable 
              positions={positions}
              onClose={onClosePosition}
            />
          )}
          {activeSubTab === 'orders' && (
            <OpenOrders 
              orders={orders}
              onCancel={onCancelOrder}
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
  );
};

export default TradingTab;