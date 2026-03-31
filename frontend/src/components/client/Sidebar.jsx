// frontend/src/components/client/Sidebar.jsx
import React, { useState } from 'react';
import { 
  FaChartLine, FaGlobe, FaChartPie, FaUniversity, 
  FaFileAlt, FaCog, FaSignOutAlt, FaShieldAlt,
  FaArrowUp, FaArrowDown, FaPlus
} from 'react-icons/fa';

const Sidebar = ({ activeTab, onTabChange, onLogout, user, portfolio, showBalance }) => {
  const [activeMetric, setActiveMetric] = useState('equity');
  const menuItems = [
    { id: 'trading', label: 'Trading', icon: FaChartLine },
    { id: 'markets', label: 'Markets', icon: FaGlobe },
    { id: 'portfolio', label: 'Portfolio', icon: FaChartPie },
    { id: 'banking', label: 'Banking', icon: FaUniversity },
    { id: 'documents', label: 'Documents', icon: FaFileAlt },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <aside className="w-72 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-screen sticky top-0 transition-colors duration-300">
      {/* Logo Section */}
      <div className="p-8 pb-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-12 h-12 bg-slate-900 dark:bg-gold-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/10 group-hover:bg-gold-500 dark:group-hover:bg-gold-400 transition-all duration-500 transform group-hover:rotate-[15deg]">
            <FaChartLine className="text-white dark:text-slate-900 text-2xl group-hover:text-gold-500 dark:group-hover:text-slate-900 transition-colors" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Rizal<span className="text-gold-500">.</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1">Terminal Prime</p>
          </div>
        </div>
      </div>

      {/* Account Snapshot Card - Glassmorphism */}
      <div className="px-6 mb-10">
        <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-900/30 dark:shadow-black/20 overflow-hidden relative border border-white/5">
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col h-[180px]">
            {/* Interactive Tabs */}
            <div className="flex space-x-1 mb-6 bg-slate-800/50 dark:bg-slate-950/40 p-1 rounded-[1rem] backdrop-blur-sm border border-white/5 shrink-0">
              {[
                { id: 'balance', label: 'Balance' },
                { id: 'equity', label: 'Equity' },
                { id: 'margin', label: 'Margin' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMetric(tab.id)}
                  className={`flex-1 py-1.5 rounded-[0.8rem] text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeMetric === tab.id 
                      ? 'bg-gold-500 text-slate-900 shadow-lg scale-100' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-95'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col justify-between">
              {activeMetric === 'balance' && (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Balance</p>
                      <h3 className="text-2xl font-black text-white italic tracking-tight">
                        {showBalance ? `$${(portfolio?.totalBalance ?? 0).toLocaleString()}` : '••••••'}
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                     <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Available for Trading</p>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">
                          {showBalance ? `$${(portfolio?.availableBalance ?? 0).toLocaleString()}` : '••••'}
                        </p>
                     </div>
                  </div>
                </>
              )}

              {activeMetric === 'equity' && (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Equity</p>
                      <h3 className="text-2xl font-black text-white italic tracking-tight">
                        {showBalance ? `$${(portfolio?.equity ?? 0).toLocaleString()}` : '••••••'}
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                     <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Unrealized PnL</p>
                        <p className={`text-sm font-bold mt-0.5 ${(portfolio?.dailyPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {showBalance ? `${(portfolio?.dailyPnL ?? 0) >= 0 ? '+' : ''}${(portfolio?.dailyPnL ?? 0).toLocaleString()}` : '••••'}
                        </p>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Performance</p>
                        <div className="flex items-center justify-end text-emerald-400 text-xs font-bold mt-0.5">
                          <FaArrowUp className="mr-1" size={8} /> +6.5%
                        </div>
                     </div>
                  </div>
                </>
              )}

              {activeMetric === 'margin' && (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Free Margin</p>
                      <h3 className="text-2xl font-black text-white italic tracking-tight">
                        {showBalance ? `$${(portfolio?.availableBalance ?? 0).toLocaleString()}` : '••••••'}
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                     <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Used Margin</p>
                        <p className="text-sm font-bold text-slate-300 mt-0.5">
                          {showBalance ? `$${(portfolio?.margin ?? 0).toLocaleString()}` : '••••'}
                        </p>
                     </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full group px-5 py-4 rounded-[1.25rem] flex items-center transition-all duration-300 relative ${
                isActive 
                  ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-gold-500/10' 
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div className={`p-2 rounded-xl border transition-all duration-300 mr-4 ${
                isActive ? 'bg-gold-500 dark:bg-slate-900 border-gold-400 dark:border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600'
              }`}>
                <item.icon size={12} className={isActive ? 'text-white dark:text-gold-500' : 'text-slate-300 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'} />
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-6 w-1.5 h-1.5 bg-gold-400 dark:bg-slate-900 rounded-full shadow-[0_0_10px_#D4AF37] dark:shadow-none"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-gold-500 rounded-2xl flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-lg group-hover:scale-110 transition-transform">
               {user?.firstName?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase">{user?.firstName} {user?.lastName}</p>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{user?.selectedAccountType} account</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
          >
            <FaSignOutAlt size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

