import React from 'react';
import { FaSearch } from 'react-icons/fa';

const QuickCategories = ({ onSelectCategory }) => {
  return (
    <div className="mb-8 overflow-hidden relative animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide items-center">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mr-2 whitespace-nowrap"><FaSearch className="inline -mt-0.5 mr-1"/> Explore Markets:</span>
        {[
          { id: 'watchlist', label: 'Watchlist', icon: '⭐' },
          { id: 'popular', label: 'Popular', icon: '🔥' },
          { id: 'forex', label: 'Forex', icon: '💱' },
          { id: 'commodities', label: 'Commodities', icon: '🛢️' },
          { id: 'crypto', label: 'Crypto', icon: '₿' },
          { id: 'shares', label: 'Shares', icon: '📈' },
          { id: 'indices-cash-1', label: 'Indices Cash 1', icon: '📊' },
          { id: 'future-rolling-cfds', label: 'Future Rolling CFDs', icon: '📜' },
          { id: 'brazilian-index', label: 'Brazilian Index', icon: '🇧🇷' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="px-4 py-2 bg-slate-900/5 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-gold-500 text-slate-800 dark:text-slate-400 hover:text-white dark:hover:text-slate-900 rounded-[1rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center space-x-2 border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-gold-500 active:scale-95"
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickCategories;
