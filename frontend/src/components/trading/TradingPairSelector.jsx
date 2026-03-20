// frontend/src/components/trading/TradingPairSelector.jsx
import React, { useState } from 'react';
import { FaSearch, FaStar, FaTimes } from 'react-icons/fa';

const TradingPairSelector = ({ selectedSymbol, onSelectSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(['BTC/USD', 'ETH/USD']);
  const [showSelector, setShowSelector] = useState(false);

  const tradingPairs = {
    'Cryptocurrency': [
      { symbol: 'BTC/USD', name: 'Bitcoin', price: 43250, change: 2.5 },
      { symbol: 'ETH/USD', name: 'Ethereum', price: 2820, change: 1.8 },
      { symbol: 'BNB/USD', name: 'Binance Coin', price: 380, change: -0.5 },
      { symbol: 'SOL/USD', name: 'Solana', price: 105, change: 5.2 },
      { symbol: 'ADA/USD', name: 'Cardano', price: 0.55, change: 1.2 },
    ],
    'Forex': [
      { symbol: 'EUR/USD', name: 'Euro', price: 1.0875, change: 0.23 },
      { symbol: 'GBP/USD', name: 'British Pound', price: 1.2650, change: -0.12 },
      { symbol: 'USD/JPY', name: 'Japanese Yen', price: 148.50, change: 0.05 },
      { symbol: 'AUD/USD', name: 'Australian Dollar', price: 0.6650, change: -0.08 },
    ],
    'Commodities': [
      { symbol: 'GOLD', name: 'Gold', price: 2052.30, change: 0.38 },
      { symbol: 'SILVER', name: 'Silver', price: 24.50, change: -0.15 },
      { symbol: 'OIL', name: 'Crude Oil', price: 78.50, change: 0.75 },
    ],
    'Indices': [
      { symbol: 'SPX', name: 'S&P 500', price: 4850, change: 0.32 },
      { symbol: 'NDX', name: 'Nasdaq', price: 16800, change: 0.45 },
      { symbol: 'DJI', name: 'Dow Jones', price: 38000, change: 0.18 },
    ]
  };

  const toggleFavorite = (symbol, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const filterPairs = () => {
    if (!searchTerm) return tradingPairs;
    
    const filtered = {};
    Object.entries(tradingPairs).forEach(([category, pairs]) => {
      const filteredPairs = pairs.filter(pair => 
        pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pair.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredPairs.length > 0) {
        filtered[category] = filteredPairs;
      }
    });
    return filtered;
  };

  const filteredPairs = filterPairs();

  return (
    <div className="relative">
      {/* Selected Pair Display */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="flex items-center space-x-2 px-4 py-2 bg-navy-700 rounded-lg border border-gold-500/30 hover:bg-navy-600 transition-colors"
      >
        <span className="text-white font-medium">{selectedSymbol}</span>
        <span className="text-gold-500/50">▼</span>
      </button>

      {/* Pair Selector Modal */}
      {showSelector && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-navy-800 rounded-xl border border-gold-500/30 shadow-2xl z-50">
          <div className="p-4 border-b border-gold-500/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gold-500">Select Trading Pair</h3>
              <button 
                onClick={() => setShowSelector(false)}
                className="text-gold-500/70 hover:text-gold-500"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-500/50" />
              <input
                type="text"
                placeholder="Search pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-navy-700 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {/* Favorites Section */}
            {favorites.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs text-gold-500/70 px-2 mb-2">FAVORITES</h4>
                {favorites.map(symbol => {
                  let pair = null;
                  Object.values(tradingPairs).forEach(category => {
                    const found = category.find(p => p.symbol === symbol);
                    if (found) pair = found;
                  });
                  if (!pair) return null;
                  
                  return (
                    <PairRow
                      key={symbol}
                      pair={pair}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                      onSelect={() => {
                        onSelectSymbol(symbol);
                        setShowSelector(false);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Categories */}
            {Object.entries(filteredPairs).map(([category, pairs]) => (
              <div key={category} className="mb-4">
                <h4 className="text-xs text-gold-500/70 px-2 mb-2">{category.toUpperCase()}</h4>
                {pairs.map(pair => (
                  <PairRow
                    key={pair.symbol}
                    pair={pair}
                    isFavorite={favorites.includes(pair.symbol)}
                    onToggleFavorite={toggleFavorite}
                    onSelect={() => {
                      onSelectSymbol(pair.symbol);
                      setShowSelector(false);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PairRow = ({ pair, isFavorite, onToggleFavorite, onSelect }) => (
  <div
    onClick={onSelect}
    className="flex items-center justify-between px-2 py-2 hover:bg-navy-700 rounded-lg cursor-pointer"
  >
    <div className="flex items-center space-x-2">
      <button 
        onClick={(e) => onToggleFavorite(pair.symbol, e)}
        className={`text-sm ${isFavorite ? 'text-gold-500' : 'text-gold-500/30 hover:text-gold-500'}`}
      >
        <FaStar size={12} />
      </button>
      <div>
        <div className="text-white font-medium">{pair.symbol}</div>
        <div className="text-xs text-gold-500/50">{pair.name}</div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-white">${pair.price}</div>
      <div className={`text-xs ${pair.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {pair.change > 0 ? '+' : ''}{pair.change}%
      </div>
    </div>
  </div>
);

export default TradingPairSelector;