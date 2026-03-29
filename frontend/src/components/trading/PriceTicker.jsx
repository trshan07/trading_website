import React from 'react';

const PriceTicker = ({ data }) => {
  return (
    <div className="bg-white border-y border-slate-100 overflow-hidden shadow-sm">
      <div className="flex animate-ticker whitespace-nowrap py-3">
        {Object.entries(data).map(([symbol, info]) => (
          <div key={symbol} className="flex items-center mx-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">{symbol}</span>
            <span className="text-sm font-bold text-slate-900 mr-2">${(info?.price ?? 0).toLocaleString()}</span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${(info?.change ?? 0) >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
              {(info?.change ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(info?.change ?? 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTicker;