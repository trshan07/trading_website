import React, { useState, useRef, useEffect } from 'react';
import AdvancedRealTimeChart from '../trading/TradingViewWidget';
import { FaGlobe, FaSearch, FaChartBar, FaLayerGroup, FaTimes, FaArrowUp, FaArrowDown, FaStar, FaRegStar } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

// Full instrument database for MarketsTab
const MARKET_INSTRUMENTS = [
  // Crypto
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Crypto', price: 43250, change: 2.5, volume: '$28.4B' },
  { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Crypto', price: 2820, change: 1.8, volume: '$14.1B' },
  { symbol: 'BNBUSDT', name: 'Binance Coin', category: 'Crypto', price: 380, change: -0.5, volume: '$1.2B' },
  { symbol: 'SOLUSDT', name: 'Solana', category: 'Crypto', price: 105, change: 5.2, volume: '$3.8B' },
  { symbol: 'ADAUSDT', name: 'Cardano', category: 'Crypto', price: 0.58, change: 1.1, volume: '$0.9B' },
  // Forex
  { symbol: 'EURUSD', name: 'Euro / USD', category: 'Forex', price: 1.0875, change: 0.23, volume: '$3.2T' },
  { symbol: 'GBPUSD', name: 'GBP / USD', category: 'Forex', price: 1.265, change: -0.12, volume: '$0.8T' },
  { symbol: 'USDJPY', name: 'USD / JPY', category: 'Forex', price: 148.5, change: 0.05, volume: '$1.1T' },
  // Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Stocks', price: 185.2, change: 1.2, volume: '$4.5B' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'Stocks', price: 410.5, change: -0.4, volume: '$2.8B' },
  { symbol: 'TSLA', name: 'Tesla', category: 'Stocks', price: 195.3, change: 3.5, volume: '$6.1B' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'Stocks', price: 141.8, change: 0.6, volume: '$1.9B' },
  // Indices
  { symbol: 'SPX', name: 'S&P 500', category: 'Indices', price: 4850, change: 0.32, volume: '$—' },
  { symbol: 'NDX', name: 'Nasdaq 100', category: 'Indices', price: 16800, change: 0.45, volume: '$—' },
  { symbol: 'DJI', name: 'Dow Jones', category: 'Indices', price: 38500, change: 0.18, volume: '$—' },
  // Funds
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', category: 'Funds', price: 484.5, change: 0.31, volume: '$18.2B' },
  { symbol: 'QQQ', name: 'Invesco QQQ', category: 'Funds', price: 412.3, change: 0.42, volume: '$9.8B' },
  // Bonds
  { symbol: 'US10Y', name: 'US 10-Yr Treasury', category: 'Bonds', price: 4.15, change: -0.02, volume: '$—' },
  // Economy
  { symbol: 'DXY', name: 'US Dollar Index', category: 'Economy', price: 104.2, change: 0.15, volume: '$—' },
  // Options
  { symbol: 'VIX', name: 'Volatility Index', category: 'Options', price: 13.5, change: -2.5, volume: '$—' },
];

const CATEGORIES = ['All', 'Crypto', 'Forex', 'Stocks', 'Indices', 'Funds', 'Bonds', 'Economy', 'Options'];

const CATEGORY_COLORS = {
  Crypto: { text: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' },
  Forex: { text: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
  Stocks: { text: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
  Indices: { text: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' },
  Funds: { text: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' },
  Bonds: { text: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-100 dark:border-slate-700' },
  Economy: { text: 'text-gold-500', bg: 'bg-gold-50 dark:bg-gold-500/10', border: 'border-gold-100 dark:border-gold-500/20' },
  Options: { text: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' },
};

const MarketsTab = ({ symbol: initialSymbol = 'BTCUSDT', onSymbolChange }) => {
  const { theme } = useTheme();
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [favorites, setFavorites] = useState(['BTCUSDT', 'ETHUSDT']);
  const searchRef = useRef(null);

  // Sync with parent symbol prop
  useEffect(() => {
    if (initialSymbol && initialSymbol !== activeSymbol) {
      setActiveSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSymbol = (sym) => {
    setActiveSymbol(sym);
    setSearchQuery('');
    setShowSearchDropdown(false);
    if (onSymbolChange) onSymbolChange(sym);
  };

  const toggleFavorite = (sym, e) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);
  };

  // Filter by search query + category
  const filtered = MARKET_INSTRUMENTS.filter(inst => {
    const matchesCategory = activeCategory === 'All' || inst.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Dropdown search results (top 6)
  const dropdownResults = MARKET_INSTRUMENTS.filter(inst =>
    searchQuery.trim() &&
    (inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 6);

  const activeInstrument = MARKET_INSTRUMENTS.find(i => i.symbol === activeSymbol);
  const colorClass = CATEGORY_COLORS[activeInstrument?.category] || CATEGORY_COLORS['Crypto'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Terminal */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50">

        {/* Header Bar */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/10 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-slate-900 dark:bg-gold-500 rounded-2xl flex items-center justify-center shadow-lg transition-colors">
              <FaGlobe className="text-gold-500 dark:text-slate-900 text-lg" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none transition-colors">
                  Global Hub
                </h3>
                {activeInstrument && (
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${colorClass.text} ${colorClass.bg} ${colorClass.border}`}>
                    {activeInstrument.category}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1.5 flex items-center transition-colors">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                {activeInstrument ? `${activeInstrument.name} · $${activeInstrument.price.toLocaleString()}` : 'Multi-Asset Liquidity Sync'}
              </p>
            </div>
          </div>

          {/* Functional Search Bar */}
          <div className="flex items-center space-x-3 w-full md:w-auto" ref={searchRef}>
            <div className="relative flex-1 md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 z-10" size={12} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Scan assets — BTC, AAPL, EUR..."
                className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:border-gold-500/30 transition-all shadow-sm placeholder-slate-300 dark:placeholder-slate-600"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <FaTimes size={10} />
                </button>
              )}

              {/* Search Dropdown */}
              {showSearchDropdown && searchQuery && dropdownResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                      {dropdownResults.length} instruments found
                    </span>
                  </div>
                  {dropdownResults.map((inst) => {
                    const cc = CATEGORY_COLORS[inst.category] || CATEGORY_COLORS['Crypto'];
                    const isUp = inst.change >= 0;
                    return (
                      <button
                        key={inst.symbol}
                        onClick={() => handleSelectSymbol(inst.symbol)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-50/50 dark:border-slate-800/50 last:border-0"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${cc.text} ${cc.bg} ${cc.border}`}>
                            {inst.category}
                          </span>
                          <div className="text-left">
                            <p className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-tight leading-none">{inst.symbol}</p>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">{inst.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums italic">${inst.price.toLocaleString()}</p>
                          <p className={`text-[9px] font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isUp ? '+' : ''}{inst.change}%
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button className="p-3 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-xl shadow-lg hover:bg-gold-600 dark:hover:bg-gold-400 transition-all">
              <FaLayerGroup size={14} />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="p-1 min-h-[700px] relative group">
          <div className="h-[700px] w-full rounded-[2rem] overflow-hidden border border-slate-50 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-slate-950 transition-colors">
            <AdvancedRealTimeChart symbol={activeSymbol} theme={theme} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/20 dark:bg-slate-800/10 transition-colors">
          <div className="flex items-center space-x-6">
            {[
              { label: 'Index Latency', value: '~14ms' },
              { label: 'Liquidity Engine', value: 'UltraHigh_v3', emerald: true },
              { label: 'Data Feed', value: 'Live Stream', emerald: true },
            ].map(({ label, value, emerald }) => (
              <div key={label} className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-0.5">{label}</span>
                <span className={`text-xs font-black italic ${emerald ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="flex space-x-3">
            {['Heatmaps', 'Volume Triggers', 'Alert Hub'].map(label => (
              <button key={label} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-900 dark:hover:bg-gold-500 hover:text-white dark:hover:text-slate-900 hover:border-slate-900 dark:hover:border-gold-500 transition-all shadow-sm">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
              activeCategory === cat
                ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 border-slate-900 dark:border-gold-500 shadow-lg'
                : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Instrument Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No instruments match your search</p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-2">Try clearing filters or searching again</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((inst) => {
            const cc = CATEGORY_COLORS[inst.category] || CATEGORY_COLORS['Crypto'];
            const isUp = inst.change >= 0;
            const isActive = activeSymbol === inst.symbol;
            const isFav = favorites.includes(inst.symbol);

            return (
              <div
                key={inst.symbol}
                onClick={() => handleSelectSymbol(inst.symbol)}
                className={`relative bg-white dark:bg-slate-900 p-5 rounded-[2rem] border cursor-pointer group hover:-translate-y-1 transition-all duration-300 shadow-lg overflow-hidden ${
                  isActive
                    ? 'border-gold-500/40 shadow-gold-500/10 ring-2 ring-gold-500/20'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-slate-200/50 dark:shadow-black/20'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600" />
                )}

                {/* Floating BG Glow */}
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl translate-x-8 -translate-y-8 transition-all group-hover:blur-xl ${isUp ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`} />

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-[7px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${cc.text} ${cc.bg} ${cc.border}`}>
                        {inst.category}
                      </span>
                      {isActive && (
                        <span className="text-[7px] font-black px-2 py-0.5 rounded-md bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-100 dark:border-gold-500/20 uppercase tracking-widest">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight">{inst.symbol}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{inst.name}</p>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(inst.symbol, e)}
                    className={`p-1.5 rounded-lg transition-colors ${isFav ? 'text-gold-500' : 'text-slate-300 dark:text-slate-600 hover:text-gold-400'}`}
                  >
                    {isFav ? <FaStar size={11} /> : <FaRegStar size={11} />}
                  </button>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter tabular-nums">
                      ${inst.price.toLocaleString()}
                    </p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{inst.volume} vol.</p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[10px] font-black ${
                    isUp
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'
                  }`}>
                    {isUp ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                    <span>{Math.abs(inst.change)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Market Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Market Cap', value: '$2.4T', change: '+2.4%', icon: FaChartBar, up: true },
          { label: 'Total Volume', value: '$84.2B', change: '-1.1%', icon: FaLayerGroup, up: false },
          { label: 'BTC Dominance', value: '48.2%', change: '+0.5%', icon: FaGlobe, up: true },
          { label: 'Fear/Greed Index', value: '72 — Greed', change: 'Bullish', icon: FaSearch, up: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 group hover:-translate-y-1 transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full translate-x-8 -translate-y-8 group-hover:bg-gold-50 dark:group-hover:bg-gold-500/10 transition-colors" />
            <stat.icon className="text-gold-500 mb-4 relative" size={16} />
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 relative">{stat.label}</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter relative">{stat.value}</h4>
            <p className={`text-[9px] font-black mt-1 relative ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketsTab;
