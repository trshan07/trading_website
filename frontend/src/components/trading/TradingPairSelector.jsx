// frontend/src/components/trading/TradingPairSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaStar, FaTimes, FaArrowUp, FaArrowDown, FaChevronDown } from 'react-icons/fa';

const TradingPairSelector = ({ selectedSymbol, onSelectSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState(['BTCUSD', 'ETHUSD']);
  const containerRef = useRef(null);

  const tradingPairs = {
    'Crypto': [
      { symbol: 'BTCUSD', name: 'Bitcoin', price: 43250, change: 2.5 },
      { symbol: 'ETHUSD', name: 'Ethereum', price: 2820, change: 1.8 },
      { symbol: 'BNBUSD', name: 'Binance Coin', price: 380, change: -0.5 },
      { symbol: 'SOLUSD', name: 'Solana', price: 105, change: 5.2 },
    ],
    'Forex': [
      { symbol: 'EURUSD', name: 'Euro', price: 1.0875, change: 0.23 },
      { symbol: 'GBPUSD', name: 'British Pound', price: 1.2650, change: -0.12 },
      { symbol: 'USDJPY', name: 'Japanese Yen', price: 148.50, change: 0.05 },
    ],
    'Stocks': [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 185.20, change: 1.2 },
      { symbol: 'MSFT', name: 'Microsoft', price: 410.50, change: -0.4 },
      { symbol: 'TSLA', name: 'Tesla', price: 195.30, change: 3.5 },
    ],
    'Indices': [
      { symbol: 'SPX', name: 'S&P 500', price: 4850, change: 0.32 },
      { symbol: 'NDX', name: 'Nasdaq', price: 16800, change: 0.45 },
    ],
    'Funds': [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 484.50, change: 0.31 },
      { symbol: 'QQQ', name: 'Invesco QQQ', price: 412.30, change: 0.42 },
    ],
    'Futures': [
      { symbol: 'ES1!', name: 'E-Mini S&P 500', price: 4855.25, change: 0.35 },
      { symbol: 'NQ1!', name: 'E-Mini Nasdaq', price: 16815.50, change: 0.48 },
    ],
    'Bonds': [
      { symbol: 'US10Y', name: 'US 10-Yr Treasury', price: 4.15, change: -0.02 },
      { symbol: 'US02Y', name: 'US 2-Yr Treasury', price: 4.52, change: -0.01 },
    ],
    'Economy': [
      { symbol: 'DXY', name: 'US Dollar Index', price: 104.20, change: 0.15 },
    ],
    'Options': [
      { symbol: 'VIX', name: 'Volatility Index', price: 13.50, change: -2.5 },
    ]
  };

  const allCategories = ['All', ...Object.keys(tradingPairs)];

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSelector(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleFavorite = (symbol, e) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  // Filter by search + category
  const getFilteredPairs = () => {
    const result = {};
    Object.entries(tradingPairs).forEach(([category, pairs]) => {
      if (activeCategory !== 'All' && activeCategory !== category) return;
      const filtered = pairs.filter(pair =>
        !searchTerm ||
        pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pair.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) result[category] = filtered;
    });
    return result;
  };

  const filteredPairs = getFilteredPairs();
  const totalResults = Object.values(filteredPairs).reduce((s, arr) => s + arr.length, 0);

  // Get favorite pairs
  const favoritePairs = favorites.map(sym => {
    let found = null;
    Object.values(tradingPairs).forEach(arr => {
      const p = arr.find(x => x.symbol === sym);
      if (p) found = p;
    });
    return found;
  }).filter(Boolean);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="flex items-center space-x-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-gold-500/40 dark:hover:border-gold-500/40 transition-all group shadow-sm"
      >
        <span className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight">
          {selectedSymbol}
        </span>
        <FaChevronDown
          size={9}
          className={`text-slate-400 transition-transform duration-300 ${showSelector ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Selector Dropdown */}
      {showSelector && (
        <div className="absolute top-full left-0 mt-2 w-[min(24rem,calc(100vw-2rem))] max-w-[24rem] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <h3 className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-[0.2em] italic leading-none">Select Pair</h3>
              <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">{totalResults} instruments available</p>
            </div>
            <button
              onClick={() => setShowSelector(false)}
              className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
            >
              <FaTimes size={10} />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-3 border-b border-slate-50 dark:border-slate-800">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={11} />
              <input
                type="text"
                placeholder="Search symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500/30 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <FaTimes size={9} />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1 p-2 border-b border-slate-50 dark:border-slate-800 overflow-x-auto scrollbar-hide">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900'
                    : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {/* Favorites */}
            {activeCategory === 'All' && !searchTerm && favoritePairs.length > 0 && (
              <div className="px-3 pt-3 pb-1">
                <p className="text-[7px] font-black uppercase tracking-[0.25em] text-gold-500 mb-2 px-2">⭐ Favorites</p>
                {favoritePairs.map(pair => (
                  <PairRow
                    key={pair.symbol}
                    pair={pair}
                    isFavorite={true}
                    isSelected={selectedSymbol === pair.symbol}
                    onToggleFavorite={toggleFavorite}
                    onSelect={() => {
                      onSelectSymbol(pair.symbol);
                      setShowSelector(false);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Category Groups */}
            {Object.entries(filteredPairs).map(([category, pairs]) => (
              <div key={category} className="px-3 pt-3 pb-1">
                <p className="text-[7px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-2 px-2">{category}</p>
                {pairs.map(pair => (
                  <PairRow
                    key={pair.symbol}
                    pair={pair}
                    isFavorite={favorites.includes(pair.symbol)}
                    isSelected={selectedSymbol === pair.symbol}
                    onToggleFavorite={toggleFavorite}
                    onSelect={() => {
                      onSelectSymbol(pair.symbol);
                      setShowSelector(false);
                    }}
                  />
                ))}
              </div>
            ))}

            {totalResults === 0 && (
              <div className="p-8 text-center">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No results found</p>
                <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-1">Try BTC, EUR, AAPL...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PairRow = ({ pair, isFavorite, isSelected, onToggleFavorite, onSelect }) => {
  const isUp = pair.change >= 0;
  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group/row ${
        isSelected
          ? 'bg-gold-50 dark:bg-gold-500/10 border border-gold-100 dark:border-gold-500/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
      }`}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={(e) => onToggleFavorite(pair.symbol, e)}
          className={`transition-colors ${isFavorite ? 'text-gold-500' : 'text-slate-200 dark:text-slate-700 hover:text-gold-400'}`}
        >
          <FaStar size={10} />
        </button>
        <div>
          <p className="text-[11px] font-black text-slate-900 dark:text-white italic uppercase tracking-tight leading-none">
            {pair.symbol}
            {isSelected && <span className="ml-2 text-[7px] text-gold-500 font-black uppercase tracking-wider">Active</span>}
          </p>
          <p className="text-[8px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{pair.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 tabular-nums italic">${pair.price.toLocaleString()}</p>
        <div className={`flex items-center justify-end space-x-0.5 text-[9px] font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isUp ? <FaArrowUp size={7} /> : <FaArrowDown size={7} />}
          <span>{Math.abs(pair.change)}%</span>
        </div>
      </div>
    </div>
  );
};

export default TradingPairSelector;
