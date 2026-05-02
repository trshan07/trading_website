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
  const secondaryOptions = ['All', 'Watchlist', 'Popular', 'Top Gainers', 'Top Losers'];
  const activeInstrument = useMemo(
    () => instruments.find((instrument) => instrument.symbol === activeSymbol) || null,
    [activeSymbol, instruments]
  );
  const activeInstrumentSnapshot = useMemo(
    () => (
      activeInstrument
        ? buildInstrumentSnapshot({
            symbol: activeInstrument.symbol,
            instrument: activeInstrument,
            marketData,
          })
        : null
    ),
    [activeInstrument, marketData]
  );
  const activeInstrumentQuote = useMemo(
    () => (
      activeInstrumentSnapshot
        ? getDisplayQuoteSnapshot({
            symbol: activeInstrumentSnapshot.symbol,
            instrument: activeInstrumentSnapshot,
            marketData,
          })
        : null
    ),
    [activeInstrumentSnapshot, marketData]
  );

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
  }, [categories.length, favorites, instruments, marketData, primaryCategory, searchQuery, secondaryFilter]);

  return (
    <div className="flex h-full flex-col bg-[#1f2230] text-white">
      <div className="border-b border-slate-700/60 px-4 py-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-[#171a26] py-3 pl-11 pr-4 text-base font-semibold text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <select
              value={primaryCategory}
              onChange={(event) => setPrimaryCategory(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-700 bg-[#171a26] px-4 py-3 text-sm font-bold text-white outline-none"
            >
              {primaryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={11} />
          </div>

          <div className="relative">
            <select
              value={secondaryFilter}
              onChange={(event) => setSecondaryFilter(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-700 bg-[#171a26] px-4 py-3 text-sm font-bold text-white outline-none"
            >
              {secondaryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={11} />
          </div>
        </div>

        {activeInstrumentSnapshot && activeInstrumentQuote && (
          <div className="mt-4 rounded-2xl border border-slate-700/60 bg-[#171a26] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-black uppercase leading-none text-white">
                  {formatInstrumentDisplaySymbol(activeInstrumentSnapshot.symbol, { withSlash: true })}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {activeInstrumentSnapshot.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-right">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Sell</p>
                  <p className="text-sm font-black text-white sm:text-base">{activeInstrumentQuote.bidLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Buy</p>
                  <p className="text-sm font-black text-white sm:text-base">{activeInstrumentQuote.askLabel}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden grid-cols-[1.6fr_1fr_1fr_0.9fr_0.9fr_auto] gap-3 border-b border-slate-700/60 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 md:grid">
        <span>Instrument</span>
        <span className="text-right">Sell</span>
        <span className="text-right">Buy</span>
        <span className="text-right">Change</span>
        <span className="text-center">Trend</span>
        <span />
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
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-800 px-4 py-3 text-left transition-all md:grid-cols-[1.6fr_1fr_1fr_0.9fr_0.9fr_auto] ${
                isActive
                  ? 'bg-white/5'
                  : 'hover:bg-white/3'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3 md:block">
                  <div className="min-w-0">
                    <p className="truncate text-base font-black uppercase leading-none text-white sm:text-lg">
                  {formatInstrumentDisplaySymbol(instrument.symbol, { withSlash: true })}
                </p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {instrument.category}
                </p>
                  </div>

                  <div className={`shrink-0 text-sm font-black md:hidden ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 md:hidden">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Sell</p>
                    <p className="mt-1 text-sm font-black text-white">{quoteSnapshot.bidLabel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Buy</p>
                    <p className="mt-1 text-sm font-black text-white">{quoteSnapshot.askLabel}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Trend</p>
                      <div className="mt-1 flex justify-start">
                        <svg viewBox="0 0 40 12" className={`h-4 w-12 ${isPositive ? 'stroke-emerald-400' : 'stroke-rose-400'}`} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                      className="rounded-xl border border-slate-700 px-3 py-2 text-slate-400 transition-colors hover:text-white"
                    >
                      {isFavorite ? <FaStar className="text-white" size={14} /> : <FaRegStar size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden text-right md:block">
                <p className="text-lg font-black text-white">{quoteSnapshot.bidLabel}</p>
              </div>

              <div className="hidden text-right md:block">
                <p className="text-lg font-black text-white">{quoteSnapshot.askLabel}</p>
              </div>

              <div className={`hidden text-right text-base font-black md:block ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </div>

              <div className="hidden justify-center md:flex">
                <svg viewBox="0 0 40 12" className={`h-4 w-12 ${isPositive ? 'stroke-emerald-400' : 'stroke-rose-400'}`} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {isFavorite ? <FaStar className="text-white" size={14} /> : <FaRegStar size={14} />}
                </button>
              </div>
            </button>
          );
        })}

        {filteredInstruments.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">No instruments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalAssetList;
