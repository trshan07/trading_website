// frontend/src/components/trading/TerminalAssetList.jsx
import React, { useState } from 'react';
import { FaSearch, FaStar, FaRegStar, FaChevronDown, FaTimes } from 'react-icons/fa';
import { MARKET_INSTRUMENTS, CATEGORIES } from '../../constants/marketData';

const TerminalAssetList = ({ activeSymbol, onSelectSymbol, favorites = [], onToggleFavorite, onClose, marketData = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('All');
  const [secondaryFilter, setSecondaryFilter] = useState('All');

  // Filter options
  const primaryOptions = ['All', 'Crypto', 'Forex', 'Stocks', 'Indices', 'Commodities', 'Futures', 'Bonds', 'Economy'];
  const secondaryOptions = ['All', 'Watchlist', 'Popular', 'Top Gainers', 'Top Losers'];

  let filtered = MARKET_INSTRUMENTS.filter(inst => {
    let matchesPrimary = primaryCategory === 'All' || inst.category === primaryCategory;
    
    let matchesSecondary = true;
    if (secondaryFilter === 'Watchlist') {
      matchesSecondary = favorites.includes(inst.symbol);
    } else if (secondaryFilter === 'Popular') {
      const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'AAPL', 'TSLA', 'SPX', 'EURUSD', 'XAUUSD'];
      matchesSecondary = popularSymbols.includes(inst.symbol);
    } else if (secondaryFilter === 'Top Gainers') {
      matchesSecondary = inst.change > 0;
    } else if (secondaryFilter === 'Top Losers') {
      matchesSecondary = inst.change < 0;
    }

    const matchesSearch = 
      !searchQuery.trim() || 
      inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPrimary && matchesSecondary && matchesSearch;
  });

  // Apply sorting based on secondary filter if required
  if (secondaryFilter === 'Top Gainers') {
    filtered.sort((a, b) => b.change - a.change);
  } else if (secondaryFilter === 'Top Losers') {
    filtered.sort((a, b) => a.change - b.change);
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-colors">
      
      {/* Search & Filters Header */}
      <div className="p-4 space-y-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        
        {/* Header with Close Button */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Markets</h3>
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              title="Close Panel"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-medium placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
        
        <div className="space-y-2">
          {/* Primary Dropdown */}
          <div className="relative">
            <select
              value={primaryCategory}
              onChange={(e) => setPrimaryCategory(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-3 py-2 rounded-md focus:outline-none focus:border-gold-500 transition-colors"
            >
              {primaryOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Asset Classes' : opt}</option>)}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
          </div>

          {/* Secondary Dropdown */}
          <div className="relative">
            <select
              value={secondaryFilter}
              onChange={(e) => setSecondaryFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-3 py-2 rounded-md focus:outline-none focus:border-gold-500 transition-colors"
            >
              {secondaryOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'All Views' : opt}</option>)}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={10} />
          </div>
        </div>
      </div>

      {/* List Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_auto] md:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-2 px-3 md:px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 transition-all">
        <div>Instrument</div>
        <div className="text-center">Sell</div>
        <div className="text-center">Buy</div>
        <div className="hidden md:block text-right">Change</div>
        <div className="hidden md:block text-center">24HTrend</div>
        <div className="w-4"></div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
        {filtered.map(inst => {
          const isActive = activeSymbol === inst.symbol;
          const isUp = inst.change >= 0;
          const isFav = favorites.includes(inst.symbol);
          
          // Generate mock bid/ask based on the single price for demo purposes
          const spread = inst.price * 0.0005; 
          const sellPrice = (inst.price - spread).toFixed(inst.price > 100 ? 2 : 4);
          const buyPrice = (inst.price + spread).toFixed(inst.price > 100 ? 2 : 4);

          return (
            <div
              key={inst.symbol}
              onClick={() => onSelectSymbol(inst.symbol)}
              className={`group grid grid-cols-[2fr_1fr_1fr_auto] md:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-2 px-3 md:px-4 py-3 items-center cursor-pointer border-b border-slate-50 dark:border-slate-800/50 transition-all ${
                isActive ? 'bg-slate-50 dark:bg-slate-800/50 relative' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
              }`}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-500"></div>}
              
              {/* Instrument Column */}
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate uppercase">
                  {inst.symbol.replace('USDT', '')}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>}
              </div>

              {/* Price Calculation (Live) */}
              {(() => {
                const liveData = marketData[inst.symbol] || {};
                const currentPrice = liveData.price || inst.price;
                const currentChange = liveData.change !== undefined ? liveData.change : inst.change;
                const lastDir = liveData.lastDir || 'none';
                
                const spread = currentPrice * 0.0005; 
                const sellPrice = (currentPrice - spread).toFixed(currentPrice > 100 ? 2 : 4);
                const buyPrice = (currentPrice + spread).toFixed(currentPrice > 100 ? 2 : 4);
                
                const flashClass = lastDir === 'up' ? 'flash-up' : lastDir === 'down' ? 'flash-down' : '';
                const isPriceUp = currentChange >= 0;

                return (
                  <>
                    {/* Sell Column (Solid Red with Flash) */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className={`bg-rose-500 hover:bg-rose-600 text-white py-1.5 px-0.5 rounded-[4px] text-center text-[9px] font-black tabular-nums transition-colors ${flashClass}`}
                    >
                      {sellPrice}
                    </button>

                    {/* Buy Column (Solid Green with Flash) */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className={`bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 px-0.5 rounded-[4px] text-center text-[9px] font-black tabular-nums transition-colors ${flashClass}`}
                    >
                      {buyPrice}
                    </button>

                    {/* Change Column */}
                    <div className={`hidden md:block text-right text-[10px] font-black tabular-nums ${isPriceUp ? 'text-emerald-500' : 'text-rose-500'} ${lastDir === 'up' ? 'text-flash-up' : lastDir === 'down' ? 'text-flash-down' : ''}`}>
                      {isPriceUp ? '+' : ''}{currentChange.toFixed(2)}%
                    </div>

                    {/* 24HTrend Sparkline */}
                    <div className="hidden md:flex justify-center items-center h-4">
                      <svg viewBox="0 0 40 12" className={`w-10 h-3 ${isPriceUp ? 'stroke-emerald-600 dark:stroke-emerald-500' : 'stroke-rose-600 dark:stroke-rose-500'}`} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {isPriceUp 
                          ? <path d="M0 10 L10 8 L15 12 L25 4 L30 6 L40 0" /> 
                          : <path d="M0 2 L10 4 L15 0 L25 8 L30 6 L40 12" />
                        }
                      </svg>
                    </div>
                  </>
                );
              })()}

              {/* Star Column */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(inst.symbol); }}
                className={`hidden md:block transition-colors ${isFav ? 'text-gold-500' : 'text-slate-300 dark:text-slate-600 hover:text-gold-400'}`}
              >
                {isFav ? <FaStar size={11} /> : <FaRegStar size={11} />}
              </button>
            </div>
          );
        })}


        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[10px] font-medium text-slate-400">No instruments found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalAssetList;

