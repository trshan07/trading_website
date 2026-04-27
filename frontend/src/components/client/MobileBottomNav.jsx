
import React from 'react';
import { FaChartLine, FaChartBar, FaChartPie, FaWallet } from 'react-icons/fa';

const MobileBottomNav = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'trading', label: 'Trade', icon: FaChartLine },
    { id: 'markets', label: 'Markets', icon: FaChartBar },
    { id: 'portfolio', label: 'Portfolio', icon: FaChartPie },
    { id: 'banking', label: 'Banking', icon: FaWallet },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300">
      <div className="flex items-center justify-around h-16 sm:h-20">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all ${
                isActive 
                  ? 'text-gold-500' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <item.icon size={20} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-gold-500 rounded-full shadow-[0_0_8px_#D4AF37]" />
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
