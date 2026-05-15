import React from 'react';
import {
  FaChartLine,
  FaCog,
  FaCreditCard,
  FaSignOutAlt,
  FaShieldAlt,
  FaTimes,
  FaUserCircle,
} from 'react-icons/fa';
import logoLight from '../../assets/images/logos/logo-light.jpg';
import logoDark from '../../assets/images/logos/logo-dark.png';
import { useTheme } from '../../context/ThemeContext';

const menuItems = [
  { id: 'webtrader', label: 'WebTrader', icon: FaChartLine },
  { id: 'account', label: 'My Account', icon: FaUserCircle },
  { id: 'banking', label: 'Banking Zone', icon: FaCreditCard },
  { id: 'verification', label: 'Verification Center', icon: FaShieldAlt },
  { id: 'settings', label: 'Settings', icon: FaCog },
];

const MobileSidebar = ({
  show,
  onClose,
  activeMainTab,
  setActiveMainTab,
  user,
  onLogout,
}) => {
  const { theme } = useTheme();

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex">
      <button
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />

      <aside className="relative flex h-full w-[19rem] max-w-[86vw] flex-col border-r border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-[#0d1420]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800">
          <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt="TikTrades"
            className="h-8 w-auto object-contain"
          />
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Client workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const isActive = activeMainTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMainTab(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <item.icon size={15} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <FaSignOutAlt size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MobileSidebar;
