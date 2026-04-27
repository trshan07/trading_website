// frontend/src/components/ui/WelcomeHeader.jsx
import React from 'react';
import { FaWallet, FaBolt, FaArrowRight, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const WelcomeHeader = ({ user, portfolio, onDeposit, onTrade }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const equity = Number(portfolio?.equity ?? 0);
  const freeMargin = Number(portfolio?.freeMargin ?? portfolio?.availableBalance ?? 0);
  const dailyPnl = Number(portfolio?.dailyPnL ?? 0);
  const marginLevel = Number(portfolio?.marginLevel ?? 0);

  return (
    <div className="relative mb-8 group">
      <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/10 via-slate-100 dark:via-slate-800 to-rose-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-10 flex flex-col lg:flex-row justify-between items-center shadow-xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300">
        <div className="mb-8 lg:mb-0 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
            <span className="px-3 py-1 bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gold-100 dark:border-gold-500/20 transition-colors">
              Personalized Dashboard
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic transition-colors">
            {greeting}, <span className="text-gold-500">{user?.firstName || 'Trader'}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-md transition-colors">
            Keep the day simple: monitor your account, review live positions, and place trades only when the setup is clear.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Equity', value: `$${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FaWallet, tone: 'text-slate-900 dark:text-white' },
              { label: 'Free Margin', value: `$${freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FaShieldAlt, tone: 'text-slate-900 dark:text-white' },
              { label: 'Today P/L', value: `${dailyPnl >= 0 ? '+' : ''}$${dailyPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FaChartLine, tone: dailyPnl >= 0 ? 'text-emerald-500' : 'text-rose-500' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/60 px-4 py-3 text-left">
                <div className="flex items-center space-x-2 mb-1.5">
                  <item.icon className="text-gold-500" size={12} />
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {item.label}
                  </p>
                </div>
                <p className={`text-sm font-black italic ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Margin Level: {marginLevel > 0 ? `${marginLevel.toFixed(2)}%` : 'N/A'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={onTrade}
            className="group px-8 py-4 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-900/40 dark:shadow-gold-500/20 hover:bg-gold-600 dark:hover:bg-gold-400 transition-all active:scale-95 flex items-center"
          >
            <FaBolt className="mr-3 text-gold-500 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
            Quick Trade
            <FaArrowRight className="ml-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
          
          <button 
            onClick={onDeposit}
            className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:border-gold-500 hover:text-gold-500 dark:hover:text-gold-400 transition-all active:scale-95 flex items-center"
          >
            <FaWallet className="mr-3 text-gold-500" />
            Deposit Funds
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
