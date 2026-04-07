// frontend/src/components/client/Sidebar.jsx
import React, { useState } from 'react';
import { 
  FaChartLine, FaGlobe, FaChartPie, FaUniversity, 
  FaFileAlt, FaCog, FaSignOutAlt,
  FaArrowUp, FaArrowDown
} from 'react-icons/fa';

const Sidebar = ({ activeTab, onTabChange, onLogout, user, portfolio, showBalance }) => {
  const [activeMetric, setActiveMetric] = useState('equity');

  const menuItems = [
    { id: 'trading',   label: 'Trading',   icon: FaChartLine },
    { id: 'markets',   label: 'Markets',   icon: FaGlobe },
    { id: 'portfolio', label: 'Portfolio', icon: FaChartPie },
    { id: 'banking',   label: 'Banking',   icon: FaUniversity },
    { id: 'documents', label: 'Documents', icon: FaFileAlt },
    { id: 'settings',  label: 'Settings',  icon: FaCog },
  ];

  const metricValue = () => {
    if (activeMetric === 'balance')  return showBalance ? `$${(portfolio?.totalBalance ?? 0).toLocaleString()}` : '••••••';
    if (activeMetric === 'equity')   return showBalance ? `$${(portfolio?.equity ?? 0).toLocaleString()}` : '••••••';
    if (activeMetric === 'margin')   return showBalance ? `$${(portfolio?.availableBalance ?? 0).toLocaleString()}` : '••••••';
    if (activeMetric === 'pnl') {
      const pnl = portfolio?.dailyPnL ?? 0;
      return showBalance ? `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toLocaleString()}` : '••••••';
    }
  };

  const metricSub = () => {
    if (activeMetric === 'balance') return {
      label: 'Available for Trading',
      value: showBalance ? `$${(portfolio?.availableBalance ?? 0).toLocaleString()}` : '••••',
      color: 'text-emerald-400',
    };
    if (activeMetric === 'equity') return {
      label: 'Unrealized PnL',
      value: showBalance ? `${(portfolio?.dailyPnL ?? 0) >= 0 ? '+' : ''}${(portfolio?.dailyPnL ?? 0).toLocaleString()}` : '••••',
      color: (portfolio?.dailyPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
    };
    if (activeMetric === 'margin') return {
      label: 'Used Margin',
      value: showBalance ? `$${(portfolio?.margin ?? 0).toLocaleString()}` : '••••',
      color: 'text-slate-300',
    };
    if (activeMetric === 'pnl') return {
      label: 'Positions Count',
      value: `${portfolio?.positionsCount ?? 0} Active`,
      color: 'text-gold-400',
    };
  };

  const sub = metricSub();

  return (
    <aside className="w-72 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden transition-colors duration-300">

      {/* Logo */}
      <div className="px-6 pt-5 pb-4 shrink-0">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-11 h-11 bg-slate-900 dark:bg-gold-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-gold-500 dark:group-hover:bg-gold-400 transition-all duration-500 group-hover:rotate-[15deg]">
            <FaChartLine className="text-white dark:text-slate-900 text-lg group-hover:text-gold-500 dark:group-hover:text-slate-900 transition-colors" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Rizal<span className="text-gold-500">.</span>
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-0.5">Terminal Prime</p>
          </div>
        </div>
      </div>

      {/* Account Snapshot Card */}
      <div className="px-4 pb-4 shrink-0">
        <div className="bg-slate-900 dark:bg-slate-800 rounded-[1.75rem] p-4 shadow-xl shadow-slate-900/30 dark:shadow-black/20 overflow-hidden relative border border-white/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/10 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />

          {/* Metric Tabs */}
          <div className="flex space-x-1 mb-3 bg-slate-800/60 dark:bg-slate-950/40 p-1 rounded-xl border border-white/5">
            {[
              { id: 'balance', label: 'Balance' },
              { id: 'equity',  label: 'Equity' },
              { id: 'margin',  label: 'Margin' },
              { id: 'pnl',     label: 'P&L' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveMetric(tab.id)}
                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                  activeMetric === tab.id
                    ? 'bg-gold-500 text-slate-900 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Metric Value */}
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              {activeMetric === 'balance' ? 'Total Balance' : 
               activeMetric === 'equity' ? 'Total Equity' : 
               activeMetric === 'margin' ? 'Free Margin' : 'Float Profit/Loss'}
            </p>
            <h3 className={`text-2xl font-black italic tracking-tight leading-none mb-3 ${
              activeMetric === 'pnl' 
                ? (portfolio?.dailyPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                : 'text-white'
            }`}>
              {metricValue()}
            </h3>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <div>
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider">{sub?.label}</p>
                <p className={`text-xs font-bold mt-0.5 ${sub?.color}`}>{sub?.value}</p>
              </div>
              {activeMetric === 'equity' && (
                <div className="flex items-center text-emerald-400 text-[10px] font-bold">
                  <FaArrowUp size={8} className="mr-1" /> +6.5%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation — flex-1 fills remaining space, items never overflow */}
      <nav className="flex-1 px-4 space-y-0.5 min-h-0">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full group px-4 py-3.5 rounded-[1.25rem] flex items-center transition-all duration-300 relative ${
                isActive
                  ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-gold-500/10'
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div className={`p-2 rounded-xl border transition-all duration-300 mr-3 ${
                isActive
                  ? 'bg-gold-500 dark:bg-slate-900 border-gold-400 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600'
              }`}>
                <item.icon size={11} className={isActive ? 'text-white dark:text-gold-500' : 'text-slate-300 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'} />
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-5 w-1.5 h-1.5 bg-gold-400 dark:bg-slate-900 rounded-full shadow-[0_0_10px_#D4AF37] dark:shadow-none" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="px-4 py-4 shrink-0">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-3 border border-slate-100 dark:border-slate-700 flex items-center justify-between group cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-slate-900 dark:bg-gold-500 rounded-xl flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-lg group-hover:scale-110 transition-transform text-sm">
              {user?.firstName?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{user?.selectedAccountType} account</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
          >
            <FaSignOutAlt size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
