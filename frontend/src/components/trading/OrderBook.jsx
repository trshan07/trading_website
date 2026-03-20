// frontend/src/components/trading/OrderBook.jsx
import React, { useState, useEffect } from 'react';

const OrderBook = ({ symbol = 'BTC/USD' }) => {
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  const [spread, setSpread] = useState({ value: 0, percentage: 0 });

  useEffect(() => {
    // Generate realistic order book data
    const generateOrderBook = () => {
      const basePrice = getBasePrice(symbol);
      const newAsks = [];
      const newBids = [];
      
      // Generate asks (sell orders)
      for (let i = 0; i < 10; i++) {
        const price = basePrice * (1 + (i + 1) * 0.001);
        const size = Math.random() * 2 + 0.1;
        const total = price * size;
        newAsks.push({
          price,
          size,
          total,
          cumulative: newAsks.reduce((sum, ask) => sum + ask.size, 0) + size
        });
      }
      
      // Generate bids (buy orders)
      for (let i = 0; i < 10; i++) {
        const price = basePrice * (1 - (i + 1) * 0.001);
        const size = Math.random() * 2 + 0.1;
        const total = price * size;
        newBids.push({
          price,
          size,
          total,
          cumulative: newBids.reduce((sum, bid) => sum + bid.size, 0) + size
        });
      }
      
      // Sort asks descending, bids ascending
      newAsks.sort((a, b) => a.price - b.price);
      newBids.sort((a, b) => b.price - a.price);
      
      // Calculate spread
      const bestAsk = newAsks[0]?.price || 0;
      const bestBid = newBids[0]?.price || 0;
      const spreadValue = bestAsk - bestBid;
      const spreadPercentage = (spreadValue / bestAsk) * 100;
      
      setAsks(newAsks);
      setBids(newBids);
      setSpread({ value: spreadValue, percentage: spreadPercentage });
    };

    generateOrderBook();
    
    // Update every 2 seconds
    const interval = setInterval(generateOrderBook, 2000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  const getBasePrice = (symbol) => {
    switch(symbol) {
      case 'BTC/USD': return 43250;
      case 'ETH/USD': return 2820;
      case 'EUR/USD': return 1.0875;
      case 'GBP/USD': return 1.2650;
      case 'GOLD': return 2052.30;
      default: return 100;
    }
  };

  // Calculate max cumulative for depth visualization
  const maxCumulative = Math.max(
    ...asks.map(a => a.cumulative),
    ...bids.map(b => b.cumulative)
  );

  return (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gold-500">Order Book - {symbol}</h3>
        <div className="text-xs text-gold-500/70">
          Spread: <span className="text-white">${spread.value.toFixed(2)}</span>
          <span className="text-gold-500/50 ml-1">({spread.percentage.toFixed(3)}%)</span>
        </div>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-3 text-xs text-gold-500/70 mb-2 px-2">
        <span>Price (USD)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="space-y-1 mb-4">
        {asks.slice(0, 8).map((ask, i) => {
          const depthPercent = (ask.cumulative / maxCumulative) * 100;
          
          return (
            <div key={i} className="relative">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-red-500/20 rounded"
                style={{ width: `${depthPercent}%` }}
              />
              <div className="relative grid grid-cols-3 text-xs py-1 px-2 hover:bg-navy-700/50">
                <span className="text-red-400 font-medium">${ask.price.toFixed(2)}</span>
                <span className="text-right text-white">{ask.size.toFixed(3)}</span>
                <span className="text-right text-gold-500/70">${(ask.total / 1000).toFixed(1)}k</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spread Indicator */}
      <div className="text-center text-xs bg-navy-700/30 py-2 rounded-lg mb-4">
        <span className="text-gold-500/70">Spread: </span>
        <span className="text-white">${spread.value.toFixed(2)}</span>
        <span className="text-gold-500/50 ml-2">({spread.percentage.toFixed(3)}%)</span>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="space-y-1">
        {bids.slice(0, 8).map((bid, i) => {
          const depthPercent = (bid.cumulative / maxCumulative) * 100;
          
          return (
            <div key={i} className="relative">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-green-500/20 rounded"
                style={{ width: `${depthPercent}%` }}
              />
              <div className="relative grid grid-cols-3 text-xs py-1 px-2 hover:bg-navy-700/50">
                <span className="text-green-400 font-medium">${bid.price.toFixed(2)}</span>
                <span className="text-right text-white">{bid.size.toFixed(3)}</span>
                <span className="text-right text-gold-500/70">${(bid.total / 1000).toFixed(1)}k</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gold-500/20 text-xs">
        <div>
          <p className="text-gold-500/70">24h High</p>
          <p className="text-green-400 font-medium">${getBasePrice(symbol) * 1.02}</p>
        </div>
        <div>
          <p className="text-gold-500/70">24h Low</p>
          <p className="text-red-400 font-medium">${getBasePrice(symbol) * 0.98}</p>
        </div>
        <div>
          <p className="text-gold-500/70">24h Volume</p>
          <p className="text-white">${(Math.random() * 1000 + 500).toFixed(0)}M</p>
        </div>
        <div>
          <p className="text-gold-500/70">24h Trades</p>
          <p className="text-white">{Math.floor(Math.random() * 50000 + 10000)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;