// frontend/src/components/trading/AccountSummary.jsx
import React from 'react';
import { FaWallet, FaChartLine, FaPercent, FaExchangeAlt } from 'react-icons/fa';

const AccountSummary = ({ portfolio, showBalance, onToggleBalance }) => {
  const cards = [
    {
      title: 'Total Equity',
      value: portfolio.equity,
      icon: FaWallet,
      subValue: `Available: $${portfolio.availableBalance}`,
      subText: '+2.3%',
      subTextColor: 'text-green-400'
    },
    {
      title: 'Daily P&L',
      value: portfolio.dailyPnL,
      icon: FaChartLine,
      prefix: '+',
      valueColor: 'text-green-400',
      subValue: 'Today',
      subText: `+${portfolio.dailyPnLPercent}%`,
      subTextColor: 'text-green-400'
    },
    {
      title: 'Margin Level',
      value: `${portfolio.marginLevel}%`,
      icon: FaPercent,
      subValue: `Used: $${portfolio.margin}`,
      subText: 'Healthy',
      subTextColor: 'text-green-400'
    },
    {
      title: 'Open Positions',
      value: portfolio.positionsCount,
      icon: FaExchangeAlt,
      subValue: 'Total P&L',
      subText: '+$650',
      subTextColor: 'text-green-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-navy-800/50 rounded-xl p-4 border border-gold-500/20 hover:border-gold-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gold-500/70 text-sm">{card.title}</span>
            <card.icon className="text-gold-500" />
          </div>
          <p className={`text-2xl font-bold ${card.valueColor || 'text-white'}`}>
            {card.prefix || ''}{typeof card.value === 'number' ? `$${card.value.toLocaleString()}` : card.value}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gold-500/50">{card.subValue}</span>
            <span className={`text-xs ${card.subTextColor}`}>{card.subText}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountSummary;