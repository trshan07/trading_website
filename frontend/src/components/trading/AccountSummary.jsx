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
        { label: 'Margin', value: portfolio.margin, color: 'text-amber-600' },
        { label: 'Margin Level', value: `${portfolio.marginLevel}%`, raw: true, color: 'text-gold-600' },
        { label: 'Daily P&L', value: portfolio.dailyPnL, isPnL: true },
        { label: 'Positions', value: portfolio.positionsCount || 0, raw: true }
      ].map((item, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{item.label}</p>
            {item.showEye && (
              <button onClick={onToggleBalance} className="text-slate-300 hover:text-gold-600 transition-colors">
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
              <p className={`text-xl font-bold ${item.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ${formatBalance(Math.abs(item.value))}
              </p>
            </div>
          ) : (
            <p className={`text-xl font-bold ${item.color || 'text-slate-900'}`}>
              {item.raw ? item.value : `$${formatBalance(item.value)}`}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccountSummary;