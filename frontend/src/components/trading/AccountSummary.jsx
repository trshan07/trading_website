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
      <div className="bg-navy-800/50 rounded-lg p-3 sm:p-4 border border-gold-500/20">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gold-500/70">Total Balance</p>
          <button onClick={onToggleBalance} className="text-gold-500/70 hover:text-gold-500">
            {showBalance ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
          </button>
        </div>
        <p className="text-lg sm:text-xl font-bold text-white">${formatBalance(portfolio.totalBalance)}</p>
      </div>

      <div className="bg-navy-800/50 rounded-lg p-3 sm:p-4 border border-gold-500/20">
        <p className="text-xs text-gold-500/70 mb-1">Equity</p>
        <p className="text-lg sm:text-xl font-bold text-white">${formatBalance(portfolio.equity)}</p>
      </div>

      <div className="bg-navy-800/50 rounded-lg p-3 sm:p-4 border border-gold-500/20">
        <p className="text-xs text-gold-500/70 mb-1">Margin</p>
        <p className="text-lg sm:text-xl font-bold text-yellow-400">${formatBalance(portfolio.margin)}</p>
      </div>

      <div className="bg-navy-800/50 rounded-lg p-3 sm:p-4 border border-gold-500/20">
        <p className="text-xs text-gold-500/70 mb-1">Margin Level</p>
        <p className="text-lg sm:text-xl font-bold text-gold-400">{showBalance ? portfolio.marginLevel : '•••'}%</p>
      </div>

      <div className="bg-navy-800/50 rounded-lg p-3 sm:p-4 border border-gold-500/20">
        <p className="text-xs text-gold-500/70 mb-1">Daily P&L</p>
        <div className="flex items-center">
          {portfolio.dailyPnL > 0 ? (
            <FaArrowUp className="text-green-400 mr-1" size={14} />
          ) : (
            <FaArrowDown className="text-red-400 mr-1" size={14} />
          )}
          <p className={`text-lg sm:text-xl font-bold ${portfolio.dailyPnL > 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${formatBalance(Math.abs(portfolio.dailyPnL))}
          </p>
        </div>
      </div>

      <div className="bg-navy-800/50 rounded-lg p-3 sm:p-4 border border-gold-500/20">
        <p className="text-xs text-gold-500/70 mb-1">Positions</p>
        <p className="text-lg sm:text-xl font-bold text-white">{portfolio.positionsCount || 0}</p>
      </div>
    </div>
  );
};

export default AccountSummary;