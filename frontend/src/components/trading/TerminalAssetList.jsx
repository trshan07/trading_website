import React, { useMemo, useState } from 'react';
import { FaChevronDown, FaRegStar, FaSearch, FaStar } from 'react-icons/fa';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol } from '../../utils/marketSymbols';

const WATCHLIST_SECTIONS = [
  { label: 'FOREX (MAJORS)', symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'] },
  { label: 'FOREX (MINORS & EXOTICS)', symbols: ['EURGBP', 'EURJPY', 'GBPJPY', 'USDSGD', 'USDTRY'] },
  { label: 'INDICES (CFD SYMBOLS)', symbols: ['US500', 'NAS100', 'US30', 'UK100', 'DE40', 'JP225'] },
  { label: 'COMMODITIES', symbols: ['XAUUSD', 'XAGUSD', 'WTI', 'BRENT'] },
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
    <div className={`${className} ${flash} rounded px-1 transition-all duration-300`}>
      <p className="text-[13px] font-semibold tabular-nums text-slate-100">{label}</p>
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
    <div className="flex h-full flex-col bg-transparent font-sans text-white">
      <div className="border-b border-slate-700/60 bg-[#1b2030]/95 px-4 py-3.5 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/70">Watchlist</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-white">Market overview</p>
            <p className="mt-1 text-xs text-slate-400">{instrumentCount} instruments available</p>
          </div>
          <div className="rounded-full border border-slate-700 bg-[#161b27] px-3 py-1 text-[11px] font-semibold text-slate-300">
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
            className="w-full rounded-xl border border-slate-700 bg-[#141925] py-2.5 pl-10 pr-4 text-[13px] font-medium text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
          />
        </div>

        <div className="relative mt-3">
          <select
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-700 bg-[#141925] px-3.5 py-2.5 text-[13px] font-semibold text-white outline-none focus:border-sky-400"
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

      <div className="hidden grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_0.7fr_0.65fr_auto] items-center gap-3 border-b border-slate-700/60 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 md:grid">
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
            <div className="border-b border-slate-800/90 bg-[#171c2a] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
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

              return (
                <button
                  key={instrument.symbol}
                  onClick={() => onSelectSymbol(instrument.symbol)}
                  className={`w-full border-b border-slate-800 px-4 py-3 text-left transition-all ${
                    isActive
                      ? 'bg-sky-400/8 shadow-[inset_2px_0_0_0_rgba(56,189,248,0.9)]'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_0.7fr_0.65fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3 md:block">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold uppercase leading-none tracking-tight text-white">
                            {formatInstrumentDisplaySymbol(instrument.symbol, { withSlash: false })}
                          </p>
                          <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                            {instrument.name || instrument.category}
                          </p>
                        </div>
                        <div className={`shrink-0 text-[12px] font-semibold tabular-nums md:hidden ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-3 md:hidden">
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
                                : 'border-slate-700 bg-[#161b27] text-slate-400 hover:text-white'
                            }`}
                          >
                            {isFavorite ? <FaStar size={11} /> : <FaRegStar size={11} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="hidden text-right md:block">
                      <PriceCell price={quoteSnapshot.bid} label={quoteSnapshot.bidLabel} className="text-right" />
                    </div>

                    <div className="hidden text-right md:block">
                      <PriceCell price={quoteSnapshot.ask} label={quoteSnapshot.askLabel} className="text-right" />
                    </div>

                    <div className={`hidden text-right text-[12px] font-semibold tabular-nums md:block ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </div>

                    <div className="hidden justify-center md:flex">
                      <svg viewBox="0 0 40 12" className={`h-4 w-10 ${isPositive ? 'stroke-emerald-400' : 'stroke-rose-400'}`} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        {isPositive
                          ? <path d="M0 10 L10 8 L15 12 L25 4 L30 6 L40 0" />
                          : <path d="M0 2 L10 4 L15 0 L25 8 L30 6 L40 12" />
                        }
                      </svg>
                    </div>

                    <div className="hidden justify-end md:flex">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleFavorite(instrument.symbol);
                        }}
                        className={`rounded-full border px-2.5 py-1.5 transition-colors ${
                          isFavorite
                            ? 'border-amber-300/40 bg-amber-300/12 text-amber-200'
                            : 'border-slate-700 bg-[#161b27] text-slate-400 hover:text-white'
                        }`}
                      >
                        {isFavorite ? <FaStar size={11} /> : <FaRegStar size={11} />}
                      </button>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {watchlistSections.length === 0 && (
          <div className="px-4 py-16 text-center">
            <p className="text-lg font-semibold text-white">No instruments found</p>
            <p className="mt-2 text-sm text-slate-500">Try another search term or switch the watchlist filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalAssetList;
