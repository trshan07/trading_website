import React, { useState } from 'react';
import {
  FaChartLine,
  FaGlobe,
  FaChartPie,
  FaUniversity,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import logoVerticalLight from '../../assets/images/logos/logo-vertical-light.jpg';
import logoVerticalDark from '../../assets/images/logos/logo-vertical-dark.png';

const Sidebar = ({ activeTab, onTabChange, onLogout, user, portfolio, showBalance, onShowStatement = () => {} }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();

  const menuItems = [
    { id: 'trading', label: 'Trading', icon: FaChartLine },
    { id: 'markets', label: 'Markets', icon: FaGlobe },
    { id: 'portfolio', label: 'Portfolio', icon: FaChartPie },
    { id: 'banking', label: 'Banking', icon: FaUniversity },
    { id: 'documents', label: 'Documents', icon: FaFileAlt },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const formatCurrency = (value = 0) => (value < 0 ? `-$${Math.abs(value).toLocaleString()}` : `$${value.toLocaleString()}`);
  const hiddenValue = '••••••';
  const snapshotItems = [
    {
      label: 'Balance',
      value: showBalance ? formatCurrency(portfolio?.totalBalance ?? 0) : hiddenValue,
      tone: 'text-white',
    },
    {
      label: 'Free Margin',
      value: showBalance ? formatCurrency(portfolio?.freeMargin ?? 0) : hiddenValue,
      tone: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Open P/L',
      value: showBalance ? `${(portfolio?.dailyPnL ?? 0) >= 0 ? '+' : ''}${formatCurrency(portfolio?.dailyPnL ?? 0)}` : hiddenValue,
      tone: (portfolio?.dailyPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    {
      label: 'Open Trades',
      value: `${portfolio?.positionsCount ?? 0}`,
      tone: 'text-slate-900 dark:text-white',
    },
  ];
  const accountModeLabel = (user?.selectedAccountType || 'demo').toUpperCase();

  return (
    <aside className={`${isCollapsed ? 'w-20 lg:w-[4.5rem]' : 'w-72'} bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 z-50`}>
      <div className={`pt-5 pb-4 shrink-0 flex items-center justify-between transition-all ${isCollapsed ? 'px-3 flex-col space-y-4' : 'px-6'}`}>
        <div className="flex items-center group cursor-pointer transition-all">
          <img
            src={theme === 'dark' ? logoVerticalDark : logoVerticalLight}
            alt="TIK TRADES"
            className={`${isCollapsed ? 'h-10' : 'h-16'} w-auto object-contain transition-all duration-300`}
          />
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl text-slate-400 hover:text-gold-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? '' : '-mr-2'}`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </button>
      </div>

      <div className={`px-4 pb-4 shrink-0 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden m-0 p-0' : 'opacity-100'}`}>
        <div className="bg-slate-900 dark:bg-slate-800 rounded-[1.75rem] p-4 shadow-xl shadow-slate-900/30 dark:shadow-black/20 overflow-hidden relative border border-white/5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/10 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 whitespace-nowrap">
                  Account Overview
                </p>
                <h3 className="text-2xl font-black italic tracking-tight leading-none text-white whitespace-nowrap">
                  {showBalance ? formatCurrency(portfolio?.equity ?? 0) : hiddenValue}
                </h3>
              </div>
              <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-gold-500">
                {accountModeLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {snapshotItems.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/5 bg-white/5 px-3 py-2.5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    {item.label}
                  </p>
                  <p className={`text-xs font-black ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className={`flex-1 space-y-0.5 min-h-0 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full group py-3.5 flex items-center transition-all duration-300 relative ${isCollapsed ? 'justify-center rounded-2xl' : 'px-4 rounded-[1.25rem]'} ${
                isActive
                  ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-gold-500/10'
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`p-2 rounded-xl border transition-all duration-300 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} ${
                isActive
                  ? 'bg-gold-500 dark:bg-slate-900 border-gold-400 dark:border-slate-800'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 group-hover:border-slate-300 dark:group-hover:border-slate-600'
              }`}>
                <item.icon size={12} className={isActive ? 'text-white dark:text-gold-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'} />
              </div>

              {!isCollapsed && (
                <span className={`text-[11px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}

              {isActive && !isCollapsed && (
                <div className="absolute right-5 w-1.5 h-1.5 bg-gold-400 dark:bg-slate-900 rounded-full shadow-[0_0_10px_#D4AF37] dark:shadow-none" />
              )}
            </button>
          );
        })}

        <div className={`pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 ${isCollapsed ? 'px-0' : ''}`}>
          <button
            onClick={onShowStatement}
            title={isCollapsed ? 'Account Statement' : undefined}
            className={`w-full group py-3.5 flex items-center transition-all duration-300 relative ${isCollapsed ? 'justify-center rounded-2xl' : 'px-4 rounded-[1.25rem]'} text-slate-400 hover:text-gold-500 hover:bg-gold-50/50 dark:hover:bg-gold-500/10`}
          >
            <div className={`p-2 rounded-xl border transition-all duration-300 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'} bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 group-hover:border-gold-300`}>
              <FaFileAlt size={12} className="text-slate-400 group-hover:text-gold-500" />
            </div>
            {!isCollapsed && (
              <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300 group-hover:text-gold-500">
                Statement
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className={`py-4 shrink-0 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${isCollapsed ? 'flex-col p-2 space-y-3' : 'justify-between p-3'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 w-full'}`}>
            <div className="flex-shrink-0 w-9 h-9 bg-slate-900 dark:bg-gold-500 rounded-xl flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-lg group-hover:scale-110 transition-transform text-sm">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[11px] font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none whitespace-nowrap">{user?.firstName} {user?.lastName}</p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 whitespace-nowrap">{user?.selectedAccountType} account</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className={`p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all ${isCollapsed ? 'w-full flex justify-center' : ''}`}
          >
            <FaSignOutAlt size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
