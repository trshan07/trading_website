import React, { useState, useRef, useEffect } from 'react';
import RealTimeChart from '../trading/RealTimeChart';
import TerminalAssetList from '../trading/TerminalAssetList';
import { FaGlobe, FaSearch, FaChartBar, FaLayerGroup, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { buildInstrumentSnapshot } from '../../utils/marketSymbols';

const MarketsTab = ({
  symbol,
  onSymbolChange,
  initialCategory = 'All',
  favorites = [],
  onToggleFavorite,
  instruments = [],
  categories = [],
  marketData = {},
}) => {
  const { theme } = useTheme();
  const hasExternalSymbol = typeof symbol === 'string' && symbol.trim().length > 0;
  const isControlled = hasExternalSymbol && typeof onSymbolChange === 'function';
  const [uncontrolledSymbol, setUncontrolledSymbol] = useState(() => (hasExternalSymbol ? symbol : 'BTCUSDT'));
  const activeSymbol = isControlled ? symbol : uncontrolledSymbol;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  const getCategoryMatches = (category) => {
    if (category === 'Watchlist') {
      return instruments.filter((inst) => favorites.includes(inst.symbol));
    }

    if (category === 'Popular') {
      const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'AAPL', 'TSLA', 'SPX', 'EURUSD', 'XAUUSD'];
      return instruments.filter((inst) => popularSymbols.includes(inst.symbol));
    }

    if (category === 'Shares') {
      return instruments.filter((inst) => inst.category === 'Stocks');
    }

    if (category === 'All') {
      return instruments;
    }

    return instruments.filter((inst) => inst.category === category);
  };

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);

      if (initialCategory !== 'All') {
        const matches = getCategoryMatches(initialCategory);
        if (matches.length > 0 && !matches.some((inst) => inst.symbol === activeSymbol)) {
          handleSelectSymbol(matches[0].symbol);
        }
      }
    }
  }, [initialCategory, instruments, favorites]);

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
    if (!isControlled) {
      setUncontrolledSymbol(sym);
    }
    setSearchQuery('');
    setShowSearchDropdown(false);
    if (onSymbolChange) onSymbolChange(sym);
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);

    if (category === 'All') {
      return;
    }

    const matches = getCategoryMatches(category);
    if (matches.length === 0) {
      return;
    }

    const currentStillVisible = matches.some((inst) => inst.symbol === activeSymbol);
    if (!currentStillVisible) {
      handleSelectSymbol(matches[0].symbol);
    }
  };

  const filtered = getCategoryMatches(activeCategory).filter((inst) => {
    const query = searchQuery.toLowerCase();
    return (
      !searchQuery.trim() ||
      inst.symbol.toLowerCase().includes(query) ||
      inst.name.toLowerCase().includes(query)
    );
  });

  const dropdownResults = instruments.filter((inst) => {
    const query = searchQuery.toLowerCase();
    return (
      searchQuery.trim() &&
      (inst.symbol.toLowerCase().includes(query) || inst.name.toLowerCase().includes(query))
    );
  }).slice(0, 6);

  const baseActiveInstrument = instruments.find((inst) => inst.symbol === activeSymbol);
  const activeInstrument = baseActiveInstrument
    ? buildInstrumentSnapshot({
        symbol: activeSymbol,
        instrument: baseActiveInstrument,
        marketData,
      })
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[500px] lg:min-h-[1050px] -mx-4 md:-mx-10 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto lg:overflow-hidden gap-6">
        <div className="block w-full lg:w-72 xl:w-80 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 relative z-10 mx-auto lg:mx-0 max-w-full">
          <TerminalAssetList
            activeSymbol={activeSymbol}
            onSelectSymbol={handleSelectSymbol}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            marketData={marketData}
            instruments={instruments}
            categories={categories}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 relative overflow-y-auto custom-scrollbar space-y-6">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex items-center space-x-2 scrollbar-hide overflow-x-auto whitespace-nowrap">
            {['All', 'Watchlist', 'Popular', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-lg'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50">
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
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${activeInstrument.colors?.text || 'text-slate-500'} ${activeInstrument.colors?.bg || 'bg-slate-50'} ${activeInstrument.colors?.border || 'border-slate-100'}`}>
                        {activeInstrument.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1.5 flex items-center transition-colors">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                    {activeInstrument
                      ? `${activeInstrument.name} · $${activeInstrument.price.toLocaleString(undefined, {
                          minimumFractionDigits: activeInstrument.precision,
                          maximumFractionDigits: activeInstrument.precision,
                        })}`
                      : 'Multi-Asset Liquidity Sync'}
                  </p>
                </div>
              </div>

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
                    placeholder="Scan assets - BTC, AAPL, EUR..."
                    className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:border-gold-500/30 transition-all shadow-sm placeholder-slate-300 dark:placeholder-slate-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchDropdown(false);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                      <FaTimes size={10} />
                    </button>
                  )}

                  {showSearchDropdown && searchQuery && dropdownResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden z-50">
                      <div className="px-4 py-2.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                          {dropdownResults.length} instruments found
                        </span>
                      </div>
                      {dropdownResults.map((inst) => {
                        const liveInstrument = buildInstrumentSnapshot({
                          symbol: inst.symbol,
                          instrument: inst,
                          marketData,
                        });
                        const isUp = liveInstrument.change >= 0;

                        return (
                          <button
                            key={inst.symbol}
                            onClick={() => handleSelectSymbol(inst.symbol)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-50/50 dark:border-slate-800/50 last:border-0"
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`text-[7px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${inst.colors?.text || 'text-slate-500'} ${inst.colors?.bg || 'bg-slate-50'} ${inst.colors?.border || 'border-slate-100'}`}>
                                {liveInstrument.category}
                              </span>
                              <div className="text-left">
                                <p className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-tight leading-none">{inst.symbol}</p>
                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">{inst.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums italic">
                                ${liveInstrument.price.toLocaleString(undefined, {
                                  minimumFractionDigits: liveInstrument.precision,
                                  maximumFractionDigits: liveInstrument.precision,
                                })}
                              </p>
                              <p className={`text-[9px] font-black ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isUp ? '+' : ''}{liveInstrument.change}%
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

            <div className="p-1 min-h-[500px] relative group">
              <div className="min-h-[500px] h-full w-full rounded-[2rem] overflow-hidden border border-slate-50 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-slate-950 transition-colors">
                <RealTimeChart
                  symbol={activeSymbol}
                  instrument={baseActiveInstrument}
                  theme={theme}
                  livePrice={marketData[activeSymbol]?.price || baseActiveInstrument?.price || 0}
                  initialPrice={baseActiveInstrument?.price || 100}
                />
              </div>
            </div>

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
                {['Heatmaps', 'Volume Triggers', 'Alert Hub'].map((label) => (
                  <button key={label} className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-900 dark:hover:bg-gold-500 hover:text-white dark:hover:text-slate-900 hover:border-slate-900 dark:hover:border-gold-500 transition-all shadow-sm">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Market Cap', value: '$2.4T', change: '+2.4%', icon: FaChartBar, up: true },
              { label: 'Total Volume', value: '$84.2B', change: '-1.1%', icon: FaLayerGroup, up: false },
              { label: 'BTC Dominance', value: '48.2%', change: '+0.5%', icon: FaGlobe, up: true },
              { label: 'Fear/Greed Index', value: '72 - Greed', change: 'Bullish', icon: FaSearch, up: true },
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
      </div>
    </div>
  );
};

export default MarketsTab;
