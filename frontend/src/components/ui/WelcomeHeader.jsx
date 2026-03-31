// frontend/src/components/ui/WelcomeHeader.jsx
import React from 'react';
import { FaPlus, FaWallet, FaBolt, FaArrowRight } from 'react-icons/fa';

const WelcomeHeader = ({ user, portfolio, onDeposit, onTrade }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="relative mb-8 group">
      {/* Background Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/10 via-slate-100 dark:via-slate-800 to-rose-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      
      <div className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 flex flex-col lg:flex-row justify-between items-center shadow-xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300">
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
            Your portfolio is up <span className="text-emerald-500 font-bold">+2.4%</span> since your last session. Market volatility is currently <span className="text-slate-900 dark:text-white font-bold italic transition-colors">moderate</span>.
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

          <button className="w-14 h-14 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[1.5rem] flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
            <FaPlus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
