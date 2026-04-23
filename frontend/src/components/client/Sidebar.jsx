// frontend/src/components/client/Sidebar.jsx
import React, { useState } from 'react';
import { 
  FaChartLine, FaGlobe, FaChartPie, FaUniversity, 
  FaFileAlt, FaCog, FaSignOutAlt,
  FaArrowUp, FaArrowDown, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import logoLight from '../../assets/images/logos/logo-light.jpg';
import logoDark from '../../assets/images/logos/logo-dark.png';
import logoVerticalLight from '../../assets/images/logos/logo-vertical-light.jpg';
import logoVerticalDark from '../../assets/images/logos/logo-vertical-dark.png';


const Sidebar = ({ activeTab, onTabChange, onLogout, user, portfolio, showBalance, onShowStatement = () => {} }) => {
  const [activeMetric, setActiveMetric] = useState('equity');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { theme } = useTheme();


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
    if (activeMetric === 'margin')   return showBalance ? `$${(portfolio?.freeMargin ?? 0).toLocaleString()}` : '••••••';
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
    <aside className={`${isCollapsed ? 'w-20 lg:w-[4.5rem]' : 'w-72'} bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 z-50`}>

      {/* Header & Logo */}
      <div className={`pt-5 pb-4 shrink-0 flex items-center justify-between transition-all ${isCollapsed ? 'px-3 flex-col space-y-4' : 'px-6'}`}>
        <div className="flex items-center group cursor-pointer transition-all">
          <img 
            src={theme === 'dark' ? logoVerticalDark : logoVerticalLight} 
            alt="TIK TRADES" 
            className={`${isCollapsed ? 'h-10' : 'h-16'} w-auto object-contain transition-all duration-300`} 
          />
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-xl text-slate-400 hover:text-gold-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isCollapsed ? '' : '-mr-2'}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </button>
      </div>

      {/* Account Snapshot Card (Hidden when collapsed) */}
      <div className={`px-4 pb-4 shrink-0 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden m-0 p-0' : 'opacity-100'}`}>
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
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 whitespace-nowrap">
              {activeMetric === 'balance' ? 'Total Balance' : 
               activeMetric === 'equity' ? 'Total Equity' : 
               activeMetric === 'margin' ? 'Free Margin' : 'Float Profit/Loss'}
            </p>
            <h3 className={`text-2xl font-black italic tracking-tight leading-none mb-3 whitespace-nowrap ${
              activeMetric === 'pnl' 
                ? (portfolio?.dailyPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                : 'text-white'
            }`}>
              {metricValue()}
            </h3>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center whitespace-nowrap">
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

      {/* Main Navigation */}
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

        {/* Reports / Statement (New) */}
        <div className={`pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 ${isCollapsed ? 'px-0' : ''}`}>
          <button
            onClick={onShowStatement}
            title={isCollapsed ? "Account Statement" : undefined}
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

      {/* Footer / User Profile */}
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
