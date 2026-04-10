import React from 'react';

const PriceTicker = ({ data }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors">
      <div className="flex animate-ticker whitespace-nowrap py-3">
        {Object.entries(data).map(([symbol, info]) => (
          <div key={symbol} className="flex items-center mx-6">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">{symbol}</span>
            <span className={`text-sm font-bold text-slate-900 dark:text-white transition-colors mr-2 ${info.lastDir === 'up' ? 'text-flash-up' : info.lastDir === 'down' ? 'text-flash-down' : ''}`}>
              ${(info?.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: symbol.includes('USD') && !symbol.includes('USDT') ? 4 : 2 })}
            </span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded transition-all ${(info?.change ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'} ${info.lastDir === 'up' ? 'ring-1 ring-emerald-500' : info.lastDir === 'down' ? 'ring-1 ring-rose-500' : ''}`}>
              {(info?.change ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(info?.change ?? 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTicker;