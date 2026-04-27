// frontend/src/components/trading/TerminalAssetList.jsx
import React, { useState } from 'react';
import { FaSearch, FaStar, FaRegStar, FaChevronDown, FaTimes } from 'react-icons/fa';
import { calculateSpreads } from '../../utils/spreadCalculator';
import { buildInstrumentSnapshot } from '../../utils/marketSymbols';

const TerminalAssetList = ({ 
  activeSymbol, 
  onSelectSymbol, 
  favorites = [], 
  onToggleFavorite, 
  onClose, 
  marketData = {},
  instruments = [],
  categories = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('All');
  const [secondaryFilter, setSecondaryFilter] = useState('All');

  // Filter options
  const primaryOptions = ['All', ...(categories.length > 0 ? categories : ['Crypto', 'Forex', 'Stocks', 'Indices', 'Commodities', 'Futures', 'Bonds', 'Economy'])];
  const secondaryOptions = ['All', 'Watchlist', 'Popular', 'Top Gainers', 'Top Losers'];

  let filtered = instruments.filter(inst => {
    let matchesPrimary = primaryCategory === 'All' || inst.category === primaryCategory;
    const liveChange = marketData[inst.symbol]?.change !== undefined ? marketData[inst.symbol].change : inst.change;
    
    let matchesSecondary = true;
    if (secondaryFilter === 'Watchlist') {
      matchesSecondary = favorites.includes(inst.symbol);
    } else if (secondaryFilter === 'Popular') {
      const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'AAPL', 'TSLA', 'SPX', 'EURUSD', 'XAUUSD'];
      matchesSecondary = popularSymbols.includes(inst.symbol);
    } else if (secondaryFilter === 'Top Gainers') {
      matchesSecondary = liveChange > 0;
    } else if (secondaryFilter === 'Top Losers') {
      matchesSecondary = liveChange < 0;
    }

    const matchesSearch = 
      !searchQuery.trim() || 
      inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesPrimary && matchesSecondary && matchesSearch;
  });

  // Apply sorting based on secondary filter if required
  if (secondaryFilter === 'Top Gainers') {
    filtered.sort((a, b) => (marketData[b.symbol]?.change ?? b.change) - (marketData[a.symbol]?.change ?? a.change));
  } else if (secondaryFilter === 'Top Losers') {
    filtered.sort((a, b) => (marketData[a.symbol]?.change ?? a.change) - (marketData[b.symbol]?.change ?? b.change));
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
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] md:text-[11px] font-medium placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Primary Dropdown */}
          <div className="relative">
            <select
              value={primaryCategory}
              onChange={(e) => setPrimaryCategory(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] md:text-[11px] font-bold px-2 md:px-3 py-2 rounded-md focus:outline-none focus:border-gold-500 transition-colors"
            >
              {primaryOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'Classes' : opt}</option>)}
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={8} />
          </div>

          {/* Secondary Dropdown */}
          <div className="relative">
            <select
              value={secondaryFilter}
              onChange={(e) => setSecondaryFilter(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] md:text-[11px] font-bold px-2 md:px-3 py-2 rounded-md focus:outline-none focus:border-gold-500 transition-colors"
            >
              {secondaryOptions.map(opt => <option key={opt} value={opt}>{opt === 'All' ? 'Views' : opt}</option>)}
            </select>
            <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={8} />
          </div>
        </div>
      </div>

      {/* List Header */}
      <div className="grid grid-cols-[1.5fr_1fr_1fr_0.2fr] md:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-2 px-3 md:px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 transition-all">
        <div>Instrument</div>
        <div className="text-center">Sell</div>
        <div className="text-center">Buy</div>
        <div className="hidden md:block text-right">Change</div>
        <div className="hidden md:block text-center">24HTrend</div>
        <div className="w-1 md:w-4"></div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
        {filtered.map(inst => {
          const isActive = activeSymbol === inst.symbol;
          const isFav = favorites.includes(inst.symbol);

          return (
            <div
              key={inst.symbol}
              onClick={() => onSelectSymbol(inst.symbol)}
              className={`grid grid-cols-[1.5fr_1fr_1fr_0.2fr] md:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1.5fr_auto] gap-2 items-center px-3 md:px-4 py-2.5 md:py-2 cursor-pointer border-b border-slate-50 dark:border-slate-800/70 transition-all duration-150 ${
                isActive
                  ? 'bg-gold-50 dark:bg-gold-500/5 border-l-2 border-l-gold-500'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              
              {/* Instrument Column */}
              <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
                <span className="text-[11px] md:text-[10px] font-bold text-slate-900 dark:text-white truncate uppercase">
                  {inst.symbol.replace('USDT', '')}
                </span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>}
              </div>

              {/* Price Calculation (Live) */}
              {(() => {
                const instrumentSnapshot = buildInstrumentSnapshot({
                  symbol: inst.symbol,
                  instrument: inst,
                  marketData,
                });
                const liveData = marketData[inst.symbol] || {};
                const currentPrice = instrumentSnapshot.price;
                const currentChange = instrumentSnapshot.change;
                const lastDir = instrumentSnapshot.lastDir || 'none';
                const precision = instrumentSnapshot.precision;
                const { bidPrice: calcBid, askPrice: calcAsk, spreadAmt: calcSpread } = calculateSpreads(inst.symbol, currentPrice, {
                  category: inst.category,
                  precision,
                });

                const hasRealBidAsk = instrumentSnapshot.useBidAsk !== false
                  && Number.isFinite(liveData.bid)
                  && Number.isFinite(liveData.ask);
                const sellPrice = hasRealBidAsk ? liveData.bid.toFixed(precision) : Number(currentPrice || calcBid).toFixed(precision);
                const buyPrice = hasRealBidAsk ? liveData.ask.toFixed(precision) : Number(currentPrice || calcAsk).toFixed(precision);
                const spreadAmt = hasRealBidAsk ? Math.abs(liveData.ask - liveData.bid) : Number(calcSpread) || 0;
                
                const spreadDisplay = spreadAmt < 0.01 ? spreadAmt.toFixed(4) : spreadAmt.toFixed(2);
                
                const flashClass = lastDir === 'up' ? 'flash-up' : lastDir === 'down' ? 'flash-down' : '';
                const isPriceUp = currentChange >= 0;

                return (
                  <>
                    {/* Sell Column (Solid Red with Flash) */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className={`bg-rose-500 hover:bg-rose-600 text-white py-2 md:py-1.5 px-0.5 md:px-1 rounded-[4px] text-center text-[10px] md:text-[9px] font-black tabular-nums transition-colors shadow-sm ${flashClass}`}
                    >
                      {sellPrice}
                    </button>

                    {/* Buy Column (Solid Green with Flash) */}
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className={`bg-emerald-500 hover:bg-emerald-600 text-white py-2 md:py-1.5 px-0.5 md:px-1 rounded-[4px] text-center text-[10px] md:text-[9px] font-black tabular-nums transition-colors shadow-sm ${flashClass}`}
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

