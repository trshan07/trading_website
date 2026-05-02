import React, { useMemo, useState } from 'react';
import { FaChevronDown, FaRegStar, FaSearch, FaStar } from 'react-icons/fa';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol } from '../../utils/marketSymbols';

const popularSymbols = ['BTCUSDT', 'ETHUSDT', 'AAPL', 'TSLA', 'SPX', 'EURUSD', 'XAUUSD'];

const TerminalAssetList = ({
  activeSymbol,
  onSelectSymbol,
  favorites = [],
  onToggleFavorite,
  marketData = {},
  instruments = [],
  categories = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [primaryCategory, setPrimaryCategory] = useState('All');
  const [secondaryFilter, setSecondaryFilter] = useState('All');

  const primaryOptions = ['All', ...(categories.length > 0 ? categories : ['Crypto', 'Forex', 'Stocks', 'Indices', 'Commodities'])];
  const quickFilters = ['All', 'Watchlist', 'Popular', 'Top Gainers', 'Top Losers'];

  const filteredInstruments = useMemo(() => {
    const matches = instruments.filter((instrument) => {
      const liveChange = marketData[instrument.symbol]?.change !== undefined
        ? marketData[instrument.symbol].change
        : instrument.change;

      const matchesPrimary = primaryCategory === 'All' || instrument.category === primaryCategory;
      const matchesSearch = !searchQuery.trim()
        || instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        || instrument.name.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesSecondary = true;
      if (secondaryFilter === 'Watchlist') {
        matchesSecondary = favorites.includes(instrument.symbol);
      } else if (secondaryFilter === 'Popular') {
        matchesSecondary = popularSymbols.includes(instrument.symbol);
      } else if (secondaryFilter === 'Top Gainers') {
        matchesSecondary = Number(liveChange) > 0;
      } else if (secondaryFilter === 'Top Losers') {
        matchesSecondary = Number(liveChange) < 0;
      }

      return matchesPrimary && matchesSecondary && matchesSearch;
    });

    if (secondaryFilter === 'Top Gainers') {
      matches.sort((left, right) => (marketData[right.symbol]?.change ?? right.change) - (marketData[left.symbol]?.change ?? left.change));
    } else if (secondaryFilter === 'Top Losers') {
      matches.sort((left, right) => (marketData[left.symbol]?.change ?? left.change) - (marketData[right.symbol]?.change ?? right.change));
    }

    return matches;
  }, [favorites, instruments, marketData, primaryCategory, searchQuery, secondaryFilter]);

  return (
    <div className="flex h-full flex-col bg-transparent text-white font-sans">
      <div className="border-b border-slate-700/60 bg-[#1b2030]/95 px-4 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/70">Watchlist</p>
            <p className="mt-1 font-display text-xl font-semibold tracking-tight text-white">Market overview</p>
            <p className="mt-1 text-sm text-slate-400">{filteredInstruments.length} instruments available</p>
          </div>
          <div className="rounded-full border border-slate-700 bg-[#161b27] px-3 py-1 text-xs font-semibold text-slate-300">
            {favorites.length} saved
          </div>
        </div>

        <div className="relative mt-4">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search symbol or instrument"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-[#141925] py-3 pl-11 pr-4 text-sm font-medium text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {quickFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSecondaryFilter(filter)}
              className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                secondaryFilter === filter
                  ? 'border-sky-400/50 bg-sky-400/12 text-sky-200'
                  : 'border-slate-700 bg-[#161b27] text-slate-400 hover:border-slate-500 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative mt-4">
          <select
            value={primaryCategory}
            onChange={(event) => setPrimaryCategory(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-700 bg-[#141925] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-sky-400"
          >
            {primaryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={11} />
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1.5fr)_0.9fr_0.9fr_0.8fr_0.7fr_auto] items-center gap-3 border-b border-slate-700/60 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 md:grid">
        <span>Instrument</span>
        <span className="text-right">Sell</span>
        <span className="text-right">Buy</span>
        <span className="text-right">Change</span>
        <span className="text-center">Trend</span>
        <span className="text-right">Save</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredInstruments.map((instrument) => {
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
              className={`w-full border-b border-slate-800 px-4 py-4 text-left transition-all ${
                isActive
                  ? 'bg-sky-400/8 shadow-[inset_3px_0_0_0_rgba(56,189,248,0.9)]'
                  : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 md:grid-cols-[minmax(0,1.5fr)_0.9fr_0.9fr_0.8fr_0.7fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3 md:block">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-semibold uppercase leading-none tracking-tight text-white">
                        {formatInstrumentDisplaySymbol(instrument.symbol, { withSlash: true })}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        {instrument.name || instrument.category}
                      </p>
                    </div>
                    <div className={`shrink-0 text-sm font-semibold tabular-nums md:hidden ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3 md:hidden">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Sell</p>
                      <p className="mt-1 text-base font-semibold tabular-nums text-slate-100">{quoteSnapshot.bidLabel}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Buy</p>
                      <p className="mt-1 text-base font-semibold tabular-nums text-slate-100">{quoteSnapshot.askLabel}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Trend</p>
                        <div className="mt-2 flex justify-start">
                          <svg viewBox="0 0 40 12" className={`h-4 w-12 ${isPositive ? 'stroke-emerald-400' : 'stroke-rose-400'}`} fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                        className={`rounded-full border px-3 py-2 transition-colors ${
                          isFavorite
                            ? 'border-amber-300/40 bg-amber-300/12 text-amber-200'
                            : 'border-slate-700 bg-[#161b27] text-slate-400 hover:text-white'
                        }`}
                      >
                        {isFavorite ? <FaStar size={13} /> : <FaRegStar size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden text-right md:block">
                  <p className="text-base font-semibold tabular-nums text-slate-100">{quoteSnapshot.bidLabel}</p>
                </div>

                <div className="hidden text-right md:block">
                  <p className="text-base font-semibold tabular-nums text-slate-100">{quoteSnapshot.askLabel}</p>
                </div>

                <div className={`hidden text-right text-sm font-semibold tabular-nums md:block ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{change.toFixed(2)}%
                </div>

                <div className="hidden justify-center md:flex">
                  <svg viewBox="0 0 40 12" className={`h-4 w-12 ${isPositive ? 'stroke-emerald-400' : 'stroke-rose-400'}`} fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                    className={`rounded-full border px-3 py-2 transition-colors ${
                      isFavorite
                        ? 'border-amber-300/40 bg-amber-300/12 text-amber-200'
                        : 'border-slate-700 bg-[#161b27] text-slate-400 hover:text-white'
                    }`}
                  >
                    {isFavorite ? <FaStar size={13} /> : <FaRegStar size={13} />}
                  </button>
                </div>
              </div>
            </button>
          );
        })}

        {filteredInstruments.length === 0 && (
          <div className="px-4 py-16 text-center">
            <p className="font-display text-lg font-semibold text-white">No instruments found</p>
            <p className="mt-2 text-sm text-slate-500">Try another search term or switch the watchlist filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalAssetList;
