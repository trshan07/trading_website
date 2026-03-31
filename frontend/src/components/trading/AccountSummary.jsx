// frontend/src/components/trading/AccountSummary.jsx
import React from 'react';
import { FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const AccountSummary = ({ portfolio, showBalance, onToggleBalance }) => {
  const formatBalance = (value) => {
    if (!showBalance) return '••••••';
    return value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {[
        { label: 'Total Balance', value: portfolio.totalBalance, showEye: true },
        { label: 'Equity', value: portfolio.equity },
        { label: 'Margin', value: portfolio.margin, color: 'text-amber-600 dark:text-amber-500' },
        { label: 'Margin Level', value: `${portfolio.marginLevel}%`, raw: true, color: 'text-gold-600 dark:text-gold-500' },
        { label: 'Daily P&L', value: portfolio.dailyPnL, isPnL: true },
        { label: 'Positions', value: portfolio.positionsCount || 0, raw: true }
      ].map((item, idx) => (
        <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-black/20 transition-all hover:shadow-md dark:hover:shadow-black/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 transition-colors">{item.label}</p>
            {item.showEye && (
              <button onClick={onToggleBalance} className="text-slate-300 dark:text-slate-600 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                {showBalance ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
              </button>
            )}
          </div>
          {item.isPnL ? (
            <div className="flex items-center">
              {item.value >= 0 ? (
                <FaArrowUp className="text-emerald-500 mr-1.5" size={12} />
              ) : (
                <FaArrowDown className="text-rose-500 mr-1.5" size={12} />
              ) }
              <p className={`text-xl font-bold transition-colors ${item.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ${formatBalance(Math.abs(item.value))}
              </p>
            </div>
          ) : (
            <p className={`text-xl font-bold transition-colors ${item.color || 'text-slate-900 dark:text-white'}`}>
              {item.raw ? item.value : `$${formatBalance(item.value)}`}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccountSummary;