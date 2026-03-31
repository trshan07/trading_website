import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaBolt, FaBell, FaBars, FaChevronDown, FaExchangeAlt, FaShieldAlt, FaUserEdit } from 'react-icons/fa';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import ThemeToggle from '../ui/ThemeToggle';

const Header = ({ 
  portfolio = {}, 
  showBalance = true, 
  onToggleBalance = () => {}, 
  onQuickTrade = () => {},
  unreadNotifications = 0,
  onLogout = () => {},
  onMenuClick = () => {},
  user = { firstName: 'Trader', lastName: '', selectedAccountType: 'demo' },
  isDemo = false,
  onSwitchAccount = () => {}
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (type) => {
    onSwitchAccount(type);
    setShowDropdown(false);
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-10 h-20 flex items-center transition-colors duration-300">
      <div className="flex-1 flex justify-between items-center">
        {/* Left Section - Quick Search & Mobile Menu */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl shadow-xl hover:bg-slate-800 transition-all"
          >
            <FaBars size={18} />
          </button>

          <div className="hidden md:flex items-center relative group">
            <HiMagnifyingGlass className="absolute left-4 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search markets, assets, news..." 
              className="pl-12 pr-6 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white w-80 focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all"
            />
          </div>
        </div>

        {/* Right Section - Balance, Quick Trade, & Profile */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Balance Widget */}
          <div className="hidden sm:flex flex-col items-end border-r border-slate-200 dark:border-slate-800 pr-8 mr-2 last:border-0 last:pr-0 last:mr-0">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1.5 flex items-center">
              Global Balance <FaEye className="ml-2 cursor-pointer hover:text-gold-500 transition-colors" onClick={onToggleBalance} />
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">
              {showBalance ? `$${(portfolio?.totalBalance ?? 0).toLocaleString()}` : '••••••••'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            <button
              onClick={onQuickTrade}
              className="hidden lg:flex items-center space-x-3 px-6 py-3 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-gold-600 dark:hover:bg-gold-400 hover:scale-[1.02] transition-all font-black uppercase tracking-widest text-[11px] border border-slate-800 dark:border-gold-400/50"
            >
              <FaBolt />
              <span>Quick Trade</span>
            </button>

            {/* Notifications */}
            <button className="relative p-3 bg-slate-900 dark:bg-slate-800 text-white dark:text-gold-500 rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all group">
              <FaBell size={18} className="group-hover:rotate-12 transition-transform" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Account Selector & Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setShowDropdown(!showDropdown)}
                className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 ml-4 group cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                  <div className="w-10 h-10 bg-slate-900 dark:bg-gold-500 rounded-[1.1rem] flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-lg">
                      {user?.firstName?.charAt(0)}
                  </div>
                  <div className="px-4 py-1 text-right">
                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                          {user?.firstName} {user?.lastName}
                      </p>
                      <div className="flex items-center justify-end">
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 shadow-[0_0_8px_currentColor] ${
                            isDemo ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500'
                          }`}></span>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            isDemo ? 'text-amber-500/80' : 'text-emerald-500/80'
                          }`}>
                              {isDemo ? 'Practice' : 'Real'} Mode
                          </span>
                      </div>
                  </div>
                  <FaChevronDown className={`mx-2 text-[10px] text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Active Portfolio</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                      {isDemo ? 'Demo Trading Account' : 'Live Trading Account'}
                    </p>
                  </div>
                  
                  <div className="p-4 space-y-1">
                    <button 
                      onClick={() => handleSwitch(isDemo ? 'real' : 'demo')}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all group ${
                        isDemo 
                          ? 'hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:text-slate-400 dark:hover:text-emerald-400' 
                          : 'hover:bg-amber-50 text-slate-600 hover:text-amber-600 dark:hover:bg-amber-500/10 dark:text-slate-400 dark:hover:text-amber-400'
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-all shrink-0 ${
                        isDemo 
                          ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' 
                          : 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white'
                      }`}>
                        <FaExchangeAlt size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          Switch to {isDemo ? 'Real' : 'Demo'}
                        </p>
                        <p className="text-[9px] font-medium opacity-60">
                          {isDemo ? 'Execute live market trades' : 'Practice with virtual funds'}
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <button 
                      onClick={onLogout}
                      className="w-full py-4 rounded-2xl text-[10px] font-black text-rose-500 hover:bg-rose-500 hover:text-white uppercase tracking-[0.2em] transition-all border border-rose-500/20 hover:border-transparent italic"
                    >
                      Terminate Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;