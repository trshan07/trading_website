import React from 'react';
import { FaChartLine, FaCreditCard, FaShieldAlt, FaUserCircle } from 'react-icons/fa';

const navItems = [
  { id: 'webtrader', label: 'Trader', icon: FaChartLine },
  { id: 'account', label: 'Account', icon: FaUserCircle },
  { id: 'banking', label: 'Banking', icon: FaCreditCard },
  { id: 'verification', label: 'Verify', icon: FaShieldAlt },
];

const MobileBottomNav = ({ activeTab, onTabChange }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0d1420]/95 lg:hidden">
    <div className="grid h-16 grid-cols-4">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive
                ? 'text-slate-950 dark:text-white'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <item.icon size={17} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export default MobileBottomNav;
