import React from 'react';
import { FaSearch, FaStar, FaFire, FaDollarSign, FaCube, FaChartLine, FaGlobe } from 'react-icons/fa';

const categories = [
  { id: 'watchlist', label: 'Watchlist', icon: FaStar },
  { id: 'popular', label: 'Popular', icon: FaFire },
  { id: 'forex', label: 'Forex', icon: FaDollarSign },
  { id: 'commodities', label: 'Commodities', icon: FaCube },
  { id: 'crypto', label: 'Crypto', icon: FaChartLine },
  { id: 'indices', label: 'Indices', icon: FaGlobe },
];

const QuickCategories = ({ onSelectCategory = () => {} }) => {
  return (
    <div className="mb-8 overflow-hidden relative animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide items-center">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mr-2 whitespace-nowrap">
          <FaSearch className="inline -mt-0.5 mr-1" />
          Explore Markets:
        </span>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="px-4 py-2 bg-slate-900/5 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-gold-500 text-slate-800 dark:text-slate-400 hover:text-white dark:hover:text-slate-900 rounded-[1rem] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center space-x-2 border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-gold-500 active:scale-95"
          >
            <category.icon className="text-sm" />
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickCategories;
