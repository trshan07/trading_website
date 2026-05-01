import React from 'react';
import { formatInstrumentDisplaySymbol, getSymbolPrecision } from '../../utils/marketSymbols';

const PriceTicker = ({ data }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>

      <div className="flex animate-ticker whitespace-nowrap py-3">
        {[...Object.entries(data), ...Object.entries(data)].map(([symbol, info], idx) => {
          const precision = getSymbolPrecision({ symbol, price: info?.price ?? 0 });

          return (
            <div key={`${symbol}-${idx}`} className="flex items-center mx-10">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mr-3 font-sans">
                {formatInstrumentDisplaySymbol(symbol, { withSlash: true })}
              </span>
              <span className={`text-xs font-black tabular-nums transition-colors mr-3 ${info.lastDir === 'up' ? 'text-emerald-500' : info.lastDir === 'down' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                ${(info?.price ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: precision,
                  maximumFractionDigits: precision,
                })}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${(info?.change ?? 0) >= 0 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'}`}>
                <span className="text-[8px]">{(info?.change ?? 0) >= 0 ? '▲' : '▼'}</span>
                {Math.abs(info?.change ?? 0).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceTicker;
