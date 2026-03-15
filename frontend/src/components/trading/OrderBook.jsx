// frontend/src/components/trading/OrderBook.jsx
import React, { useState, useEffect } from 'react';

const OrderBook = ({ symbol = 'BTCUSD', compact = false }) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [showFullOrderBook, setShowFullOrderBook] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Mock order book data with more entries for better visualization
  const asks = [
    { price: 43254, size: 1.5, total: 64881 },
    { price: 43253, size: 2.1, total: 90831.3 },
    { price: 43252, size: 0.8, total: 34601.6 },
    { price: 43251, size: 1.2, total: 51901.2 },
    { price: 43250, size: 0.5, total: 21625 },
    { price: 43249, size: 1.8, total: 77848.2 },
    { price: 43248, size: 0.9, total: 38923.2 },
    { price: 43247, size: 2.3, total: 99468.1 },
    { price: 43246, size: 1.1, total: 47570.6 },
    { price: 43245, size: 1.7, total: 73516.5 }
  ];

  const bids = [
    { price: 43244, size: 1.4, total: 60541.6 },
    { price: 43243, size: 2.0, total: 86486 },
    { price: 43242, size: 0.7, total: 30269.4 },
    { price: 43241, size: 1.3, total: 56213.3 },
    { price: 43240, size: 1.9, total: 82156 },
    { price: 43239, size: 0.6, total: 25943.4 },
    { price: 43238, size: 2.2, total: 95123.6 },
    { price: 43237, size: 1.0, total: 43237 },
    { price: 43236, size: 1.6, total: 69177.6 },
    { price: 43235, size: 2.4, total: 103764 }
  ];

  // Calculate spread
  const bestAsk = asks[0]?.price || 0;
  const bestBid = bids[0]?.price || 0;
  const spread = (bestAsk - bestBid).toFixed(2);
  const spreadPercentage = ((bestAsk - bestBid) / bestAsk * 100).toFixed(3);

  // Determine how many rows to show based on screen size
  const getRowCount = () => {
    if (compact) return 3;
    if (isMobile) return 4;
    if (isTablet) return 6;
    return 8;
  };

  const rowCount = getRowCount();

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-medium text-gold-500">{symbol} Order Book</h4>
          <span className="text-xs text-gold-500/50">Spread: ${spread}</span>
        </div>
        
        {/* Headers */}
        <div className="text-xs text-gold-500/70 flex justify-between mb-1 px-1">
          <span>Price (USD)</span>
          <span>Size (BTC)</span>
          <span>Total</span>
        </div>

        {/* Asks (Sell orders) */}
        <div className="space-y-1">
          {asks.slice(0, rowCount).map((ask, i) => (
            <div key={`ask-${i}`} className="flex justify-between text-xs bg-red-500/5 hover:bg-red-500/10 px-1 py-0.5 rounded">
              <span className="text-red-400 font-medium">${ask.price.toLocaleString()}</span>
              <span className="text-white">{ask.size.toFixed(3)}</span>
              <span className="text-gold-500/50">${(ask.total / 1000).toFixed(1)}k</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="text-center bg-navy-700/30 py-1.5 rounded-lg my-2">
          <span className="text-gold-500 text-xs font-medium">Spread: ${spread} ({spreadPercentage}%)</span>
        </div>

        {/* Bids (Buy orders) */}
        <div className="space-y-1">
          {bids.slice(0, rowCount).map((bid, i) => (
            <div key={`bid-${i}`} className="flex justify-between text-xs bg-green-500/5 hover:bg-green-500/10 px-1 py-0.5 rounded">
              <span className="text-green-400 font-medium">${bid.price.toLocaleString()}</span>
              <span className="text-white">{bid.size.toFixed(3)}</span>
              <span className="text-gold-500/50">${(bid.total / 1000).toFixed(1)}k</span>
            </div>
          ))}
        </div>

        {/* Show more/less toggle for compact view */}
        {!compact && (
          <button 
            onClick={() => setShowFullOrderBook(!showFullOrderBook)}
            className="w-full mt-2 text-xs text-gold-500/70 hover:text-gold-500 py-1"
          >
            {showFullOrderBook ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-navy-800/50 rounded-xl border border-gold-500/20 p-3 sm:p-4">
      {/* Header with symbol and spread */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gold-500 flex items-center">
          <span>Order Book</span>
          <span className="ml-2 text-xs font-normal text-gold-500/50">{symbol}</span>
        </h3>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-gold-500/70">Spread:</span>
          <span className="text-white font-medium">${spread}</span>
          <span className="text-gold-500/50">({spreadPercentage}%)</span>
        </div>
      </div>

      {/* Responsive layout - stack on mobile, side by side on larger screens */}
      <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-2 gap-4'}`}>
        {/* Asks Column */}
        <div>
          <div className="flex justify-between text-xs text-gold-500/70 mb-2 px-1">
            <span>Price (USD)</span>
            <span>Size ({symbol.split('/')[0] || 'BTC'})</span>
            <span>Total (USD)</span>
          </div>
          <div className="space-y-1 max-h-[200px] sm:max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-navy-700 pr-1">
            {asks.slice(0, showFullOrderBook ? asks.length : rowCount).map((ask, i) => {
              // Calculate depth visualization percentage
              const maxTotal = Math.max(...asks.map(a => a.total));
              const depthPercent = (ask.total / maxTotal) * 100;
              
              return (
                <div 
                  key={`ask-${i}`} 
                  className="relative flex justify-between text-xs py-1 px-1 rounded hover:bg-red-500/10 transition-colors"
                >
                  {/* Depth background */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-red-500/10 rounded"
                    style={{ width: `${depthPercent}%`, opacity: 0.3 }}
                  />
                  <span className="relative text-red-400 font-medium z-10">${ask.price.toLocaleString()}</span>
                  <span className="relative text-white z-10">{ask.size.toFixed(3)}</span>
                  <span className="relative text-gold-500/50 z-10">${(ask.total / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bids Column */}
        <div>
          <div className="flex justify-between text-xs text-gold-500/70 mb-2 px-1">
            <span>Price (USD)</span>
            <span>Size ({symbol.split('/')[0] || 'BTC'})</span>
            <span>Total (USD)</span>
          </div>
          <div className="space-y-1 max-h-[200px] sm:max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-500/20 scrollbar-track-navy-700 pr-1">
            {bids.slice(0, showFullOrderBook ? bids.length : rowCount).map((bid, i) => {
              // Calculate depth visualization percentage
              const maxTotal = Math.max(...bids.map(b => b.total));
              const depthPercent = (bid.total / maxTotal) * 100;
              
              return (
                <div 
                  key={`bid-${i}`} 
                  className="relative flex justify-between text-xs py-1 px-1 rounded hover:bg-green-500/10 transition-colors"
                >
                  {/* Depth background */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-green-500/10 rounded"
                    style={{ width: `${depthPercent}%`, opacity: 0.3 }}
                  />
                  <span className="relative text-green-400 font-medium z-10">${bid.price.toLocaleString()}</span>
                  <span className="relative text-white z-10">{bid.size.toFixed(3)}</span>
                  <span className="relative text-gold-500/50 z-10">${(bid.total / 1000).toFixed(1)}k</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Show more/less button */}
      {!isMobile && (
        <button 
          onClick={() => setShowFullOrderBook(!showFullOrderBook)}
          className="w-full mt-3 text-xs text-gold-500/70 hover:text-gold-500 py-1 border-t border-gold-500/20"
        >
          {showFullOrderBook ? 'Show less' : `Show more (${asks.length + bids.length} total orders)`}
        </button>
      )}

      {/* Mobile summary stats */}
      {isMobile && (
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gold-500/20 text-center text-xs">
          <div>
            <p className="text-gold-500/50">Best Bid</p>
            <p className="text-green-400 font-medium">${bestBid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gold-500/50">Spread</p>
            <p className="text-gold-400 font-medium">${spread}</p>
          </div>
          <div>
            <p className="text-gold-500/50">Best Ask</p>
            <p className="text-red-400 font-medium">${bestAsk.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Add custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1a2b3c;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.2);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default OrderBook;