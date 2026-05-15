import React, { useMemo, useState } from 'react';
import { FaChevronDown, FaRegStar, FaSearch, FaStar } from 'react-icons/fa';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol } from '../../utils/marketSymbols';
import { useTheme } from '../../context/ThemeContext';

const WATCHLIST_SECTIONS = [
  { label: 'FOREX (MAJORS)', symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'] },
  { label: 'FOREX (MINORS & EXOTICS)', symbols: ['EURGBP', 'EURJPY', 'GBPJPY', 'USDSGD', 'USDTRY'] },
  { label: 'INDICES (CFD SYMBOLS)', symbols: ['US500', 'NAS100', 'US30', 'UK100', 'DE40', 'JP225'] },
  { label: 'COMMODITIES', symbols: ['XAUUSD', 'XAGUSD', 'WTI', 'BRENT', 'NATGAS'] },
  { label: 'CRYPTOCURRENCIES', symbols: ['BTCUSD', 'ETHUSD', 'XRPUSD'] },
  { label: 'STOCKS (US SHARES CFD)', symbols: ['AAPL', 'TSLA', 'AMZN', 'MSFT'] },
];

const GROUP_OPTIONS = [
  { id: 'all', label: 'All Markets' },
  { id: 'FOREX (MAJORS)', label: 'Forex (Majors)' },
  { id: 'FOREX (MINORS & EXOTICS)', label: 'Forex (Minors & Exotics)' },
  { id: 'INDICES (CFD SYMBOLS)', label: 'Indices (CFD Symbols)' },
  { id: 'COMMODITIES', label: 'Commodities' },
  { id: 'CRYPTOCURRENCIES', label: 'Cryptocurrencies' },
  { id: 'STOCKS (US SHARES CFD)', label: 'Stocks (US Shares CFD)' },
  { id: 'favorites', label: 'Saved Watchlist' },
];

const PriceCell = ({ price, label, className = '' }) => {
  const [flash, setFlash] = useState('');
  const prevPriceRef = React.useRef(price);

  React.useEffect(() => {
    if (price > prevPriceRef.current) {
      setFlash('flash-up');
    } else if (price < prevPriceRef.current) {
      setFlash('flash-down');
    }
    prevPriceRef.current = price;

    const timer = setTimeout(() => setFlash(''), 1000);
    return () => clearTimeout(timer);
  }, [price]);

  return (
    <div className={`${className} ${flash} min-w-0 rounded px-1 transition-all duration-300`}>
      <p className="truncate text-[13px] font-semibold tabular-nums text-slate-900 dark:text-slate-100">{label}</p>
    </div>
  );
};

const TerminalAssetList = ({
  activeSymbol,
  onSelectSymbol,
  favorites = [],
  onToggleFavorite,
  marketData = {},
  instruments = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const { theme } = useTheme();

  const instrumentMap = useMemo(
    () => new Map(instruments.map((instrument) => [instrument.symbol, instrument])),
    [instruments]
  );

  const watchlistSections = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (selectedGroup === 'favorites') {
      const favoriteRows = favorites
        .map((symbol) => instrumentMap.get(symbol))
        .filter(Boolean)
        .filter((instrument) => {
          if (!normalizedQuery) {
            return true;
          }

          return instrument.symbol.toLowerCase().includes(normalizedQuery)
            || String(instrument.name || '').toLowerCase().includes(normalizedQuery);
        });

      return favoriteRows.length ? [{ label: 'SAVED WATCHLIST', rows: favoriteRows }] : [];
    }

    return WATCHLIST_SECTIONS
      .map((section) => {
        if (selectedGroup !== 'all' && selectedGroup !== section.label) {
          return null;
        }

        const rows = section.symbols
          .map((symbol) => instrumentMap.get(symbol))
          .filter(Boolean)
          .filter((instrument) => {
            if (!normalizedQuery) {
              return true;
            }

            return instrument.symbol.toLowerCase().includes(normalizedQuery)
              || String(instrument.name || '').toLowerCase().includes(normalizedQuery);
          });

        return rows.length ? { ...section, rows } : null;
      })
      .filter(Boolean);
  }, [favorites, instrumentMap, searchQuery, selectedGroup]);

  const instrumentCount = watchlistSections.reduce((sum, section) => sum + section.rows.length, 0);

  return (
    <div className="flex h-full flex-col bg-transparent font-sans text-slate-900 dark:text-white">
      <div className="border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur dark:border-slate-700/60 dark:bg-[#1b2030]/95">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300/70">Watchlist</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Market overview</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{instrumentCount} instruments available</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-[#161b27] dark:text-slate-300">
            {favorites.length} saved
          </div>
        </div>

        <div className="relative mt-3">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-400 dark:border-slate-700 dark:bg-[#141925] dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div className="relative mt-3">
          <select
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-[#141925] dark:text-white"
          >
            {GROUP_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={11} />
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(5.5rem,0.9fr)_minmax(5.5rem,0.9fr)_minmax(4.75rem,0.75fr)_3.5rem_2.75rem] items-center gap-3 border-b border-slate-200 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 min-[440px]:grid dark:border-slate-700/60">
        <span>Instrument</span>
        <span className="text-right">Sell</span>
        <span className="text-right">Buy</span>
        <span className="text-right">Change</span>
        <span className="text-center">Trend</span>
        <span className="text-right">Save</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {watchlistSections.map((section) => (
          <div key={section.label}>
            <div className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:border-slate-800/90 dark:bg-[#171c2a] dark:text-slate-400">
              {section.label}
            </div>

            {section.rows.map((instrument) => {
              const instrumentSnapshot = buildInstrumentSnapshot({
                symbol: instrument.symbol,
                instrument,
                marketData,
              });
              const quoteSnapshot = getDisplayQuoteSnapshot({
                symbol: instrument.symbol,
                instrument: instrumentSnapshot,
                marketData,
              });
              const change = Number(instrumentSnapshot.change || 0);
              const isPositive = change >= 0;
              const isActive = activeSymbol === instrument.symbol;
              const isFavorite = favorites.includes(instrument.symbol);
              const activeRowClass = theme === 'dark'
                ? 'bg-sky-500/10 shadow-[inset_2px_0_0_0_rgba(56,189,248,0.95)]'
                : 'bg-sky-50 shadow-[inset_2px_0_0_0_rgba(56,189,248,0.9)]';

              return (
                <div
                  key={instrument.symbol}
                  onClick={() => onSelectSymbol(instrument.symbol)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectSymbol(instrument.symbol);
                    }
                  }}
                  className={`w-full border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-left transition-all cursor-pointer ${
                    isActive
                      ? activeRowClass
                      : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 min-[440px]:grid-cols-[minmax(0,1.5fr)_minmax(5.5rem,0.9fr)_minmax(5.5rem,0.9fr)_minmax(4.75rem,0.75fr)_3.5rem_2.75rem] min-[440px]:items-center">
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3 min-[440px]:block">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold uppercase leading-none tracking-tight text-slate-900 dark:text-white">
                            {formatInstrumentDisplaySymbol(instrument.symbol, { withSlash: false })}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <p className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                              {instrument.name || instrument.category}
                            </p>
                            {String(instrumentSnapshot.source || '').includes('twelvedata') && (
                              <span className="flex shrink-0 items-center gap-1 rounded border border-teal-400/20 bg-teal-400/10 px-1 py-0.5 text-[8px] font-black uppercase tracking-widest text-teal-400">
                                <span className="h-1 w-1 animate-pulse rounded-full bg-teal-400" />
                                Live
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`shrink-0 text-[12px] font-semibold tabular-nums min-[440px]:hidden ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-3 min-[440px]:hidden">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">Sell</p>
                          <PriceCell price={quoteSnapshot.bid} label={quoteSnapshot.bidLabel} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">Buy</p>
                          <PriceCell price={quoteSnapshot.ask} label={quoteSnapshot.askLabel} />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">Trend</p>
                            <div className="mt-2 flex justify-start">
                              <svg viewBox="0 0 40 12" className={`h-4 w-10 ${isPositive ? 'stroke-emerald-400' : 'stroke-rose-400'}`} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                {isPositive
                                  ? <path d="M0 10 L10 8 L15 12 L25 4 L30 6 L40 0" />
                                  : <path d="M0 2 L10 4 L15 0 L25 8 L30 6 L40 12" />
                                }
                              </svg>
                            </div>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleFavorite(instrument.symbol);
                            }}
                            className={`rounded-full border px-2.5 py-1.5 transition-colors ${
                              isFavorite
                                ? 'border-amber-300/40 bg-amber-300/12 text-amber-200'
                                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-[#161b27] dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            {isFavorite ? <FaStar size={11} /> : <FaRegStar size={11} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-0 text-right min-[440px]:block">
                      <PriceCell price={quoteSnapshot.bid} label={quoteSnapshot.bidLabel} className="text-right" />
                    </div>

                    <div className="hidden min-w-0 text-right min-[440px]:block">
                      <PriceCell price={quoteSnapshot.ask} label={quoteSnapshot.askLabel} className="text-right" />
                    </div>

                    <div className={`hidden whitespace-nowrap text-right text-[12px] font-semibold tabular-nums min-[440px]:block ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </div>

                    <div className="hidden justify-center min-[440px]:flex">
                      <svg viewBox="0 0 40 12" className={`h-4 w-10 ${isPositive ? 'stroke-emerald-400' : 'stroke-rose-400'}`} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {isPositive
                          ? <path d="M0 10 L10 8 L15 12 L25 4 L30 6 L40 0" />
                          : <path d="M0 2 L10 4 L15 0 L25 8 L30 6 L40 12" />
                        }
                      </svg>
                    </div>

                    <div className="hidden justify-end min-[440px]:flex">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleFavorite(instrument.symbol);
                        }}
                        className={`rounded-full border px-2.5 py-1.5 transition-colors ${
                          isFavorite
                            ? 'border-amber-300/40 bg-amber-300/12 text-amber-200'
                            : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-[#161b27] dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        {isFavorite ? <FaStar size={11} /> : <FaRegStar size={11} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {watchlistSections.length === 0 && (
          <div className="px-4 py-16 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">No instruments found</p>
            <p className="mt-2 text-sm text-slate-500">Try another search term or switch the watchlist filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalAssetList;
