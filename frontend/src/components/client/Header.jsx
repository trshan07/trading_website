// frontend/src/components/dashboard/Header.jsx
import React from 'react';
import { FaEye, FaBolt, FaBell, FaSignOutAlt, FaSearch, FaBars } from 'react-icons/fa';

const Header = ({ 
  portfolio = {}, 
  showBalance = true, 
  onToggleBalance = () => {}, 
  onQuickTrade = () => {},
  unreadNotifications = 0,
  onLogout = () => {},
  onMenuClick = () => {},
  user = { firstName: 'Trader', lastName: '', selectedAccountType: 'demo' }
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-10 h-20 flex items-center shadow-lg shadow-slate-200/50">
      <div className="flex-1 flex justify-between items-center">
        {/* Left Section - Quick Search & Mobile Menu */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-slate-800 transition-all"
          >
            <FaBars size={18} />
          </button>

          <div className="hidden md:flex items-center relative group">
            <FaSearch className="absolute left-4 text-slate-400 group-focus-within:text-gold-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search markets, assets, news..." 
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 w-80 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-300 transition-all"
            />
          </div>
        </div>

        {/* Right Section - Balance, Quick Trade, & Profile */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Balance Widget */}
          <div className="hidden sm:flex flex-col items-end border-r border-slate-200 pr-8 mr-2 last:border-0 last:pr-0 last:mr-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 flex items-center">
              Global Balance <FaEye className="ml-2 cursor-pointer hover:text-gold-500 transition-colors" onClick={onToggleBalance} />
            </span>
            <p className="text-xl font-black text-slate-900 italic tracking-tighter">
              {showBalance ? `$${(portfolio?.totalBalance ?? 0).toLocaleString()}` : '••••••••'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onQuickTrade}
              className="flex items-center space-x-3 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-gold-600 hover:scale-[1.02] transition-all font-black uppercase tracking-widest text-[11px] border border-slate-800"
            >
              <FaBolt />
              <span className="hidden lg:inline">Quick Trade</span>
            </button>

            {/* Notifications */}
            <button className="relative p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-slate-800 transition-all group">
              <FaBell size={18} className="group-hover:rotate-12 transition-transform" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Account Selector Widget */}
            <div className="hidden lg:flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 ml-4 group cursor-pointer hover:bg-white hover:border-slate-300 transition-all">
                <div className="w-10 h-10 bg-slate-900 rounded-[1.1rem] flex items-center justify-center text-gold-500 font-black italic shadow-lg">
                    {user?.firstName?.charAt(0)}
                </div>
                <div className="px-4 py-1 text-right">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                        {user?.firstName} {user?.lastName}
                    </p>
                    <div className="flex items-center justify-end">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_#10b981]"></span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {user?.selectedAccountType} Live
                        </span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;