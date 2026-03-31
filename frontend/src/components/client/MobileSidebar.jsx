import React from 'react';
import { 
  FaChartLine, FaTimes, FaSignOutAlt, FaChartBar, FaDatabase, FaWallet, FaFileAlt, FaCog, FaExchangeAlt
} from 'react-icons/fa';
import ThemeToggle from '../ui/ThemeToggle';

const MobileSidebar = ({ 
  show, 
  onClose, 
  activeMainTab, 
  setActiveMainTab, 
  user, 
  portfolio, 
  showBalance, 
  onLogout,
  onSwitchAccount = () => {}
}) => {
  if (!show) return null;

  const isDemo = user?.selectedAccountType === 'demo';

  const mobileNavItems = [
    { id: 'trading', label: 'Trading', icon: FaChartLine },
    { id: 'markets', label: 'Markets', icon: FaChartBar },
    { id: 'portfolio', label: 'Portfolio', icon: FaDatabase },
    { id: 'banking', label: 'Banking', icon: FaWallet },
    { id: 'documents', label: 'Documents', icon: FaFileAlt },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex lg:hidden">
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-[280px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-left duration-300 transition-colors">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center bg-slate-900 dark:bg-gold-500 rounded-lg text-gold-500 dark:text-slate-900 shadow-md">
              <FaChartLine size={14} />
            </div>
            <h2 className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">RIZAL<span className="text-gold-500">.</span></h2>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
              <FaTimes size={16} />
            </button>
          </div>
        </div>
        
        {/* Static Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Account Transition Button */}
          <div className="p-5 pb-2">
             <button 
               onClick={() => onSwitchAccount(isDemo ? 'real' : 'demo')}
               className={`w-full py-4 rounded-[1.5rem] border flex items-center justify-center space-x-3 transition-all active:scale-95 shadow-lg ${
                 isDemo 
                   ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' 
                   : 'bg-amber-500 border-amber-400 text-slate-900 shadow-amber-500/20'
               }`}
             >
                <FaExchangeAlt size={12} className={isDemo ? 'animate-pulse' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Switch to {isDemo ? 'Real' : 'Demo'} mode
                </span>
             </button>
          </div>

          {/* Account Snapshot Mobile */}
          <div className="p-5">
            <div className="bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] p-5 shadow-xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gold-400/10 rounded-full -translate-y-8 translate-x-8 blur-xl"></div>
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                   {isDemo ? 'Practice Balance' : 'Live Equity'}
                </p>
                <h3 className="text-xl font-black text-white italic tracking-tight mb-3">
                  {showBalance ? `$${(portfolio?.totalBalance ?? 0).toLocaleString()}` : '••••••'}
                </h3>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                   <div>
                      <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Available Margin</p>
                      <p className="text-xs font-bold text-white mt-0.5">
                        {showBalance ? `$${(portfolio?.availableBalance ?? 0).toLocaleString()}` : '••••'}
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="px-3 pb-6 space-y-1">
            {mobileNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveMainTab(item.id); onClose(); }}
                className={`w-full px-5 py-3.5 rounded-xl flex items-center space-x-3 transition-all ${
                  activeMainTab === item.id 
                    ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg border transition-all ${activeMainTab === item.id ? 'bg-gold-500 dark:bg-slate-900 border-gold-400 dark:border-slate-800 text-white dark:text-gold-500' : 'bg-transparent border-transparent text-slate-400'}`}>
                   <item.icon size={14} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Sticky Mobile Footer / User Profile */}
        <div className="p-4 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-900 dark:bg-gold-500 rounded-xl flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-md">
                 {user?.firstName?.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">{user?.firstName}</p>
                <div className="flex items-center mt-0.5">
                   <span className={`w-1 h-1 rounded-full mr-1.5 ${isDemo ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                   <p className={`text-[8px] font-bold uppercase tracking-widest leading-tight ${isDemo ? 'text-amber-500' : 'text-emerald-500'}`}>
                     {isDemo ? 'Demo' : 'Real'}
                   </p>
                </div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg transition-all shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <FaSignOutAlt size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
