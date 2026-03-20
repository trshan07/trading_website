import React from 'react';

const PriceTicker = ({ data }) => {
  return (
    <div className="bg-navy-900 border-y border-gold-500/30 overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap py-2">
        {Object.entries(data).map(([symbol, info]) => (
          <div key={symbol} className="flex items-center mx-4">
            <span className="text-gold-400 font-medium mr-2">{symbol}:</span>
            <span className="text-white mr-1">${info.price.toLocaleString()}</span>
            <span className={info.change > 0 ? 'text-green-400' : 'text-red-400'}>
              {info.change > 0 ? '+' : ''}{info.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTicker;