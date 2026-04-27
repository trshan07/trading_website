import React, { useState, useRef, useEffect } from 'react';
import { FaEye, FaBolt, FaBell, FaBars, FaChevronDown, FaExchangeAlt, FaTimes, FaFileAlt } from 'react-icons/fa';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import ThemeToggle from '../ui/ThemeToggle';
import { buildInstrumentSnapshot } from '../../utils/marketSymbols';

// Infrastructure color mappings are now handled by the backend per instrumentcategory.
// This allows the admin to change branding without a frontend redeploy.

const Header = ({ 
  portfolio = {}, 
  showBalance = true, 
  onToggleBalance = () => {},
  onQuickTrade = () => {},
  unreadNotifications = 0,
  notifications = [],
  onMarkNotificationRead = () => {},
  onMarkAllNotificationsRead = () => {},
  onLogout = () => {},
  onMenuClick = () => {},
  user = { firstName: 'Trader', lastName: '', selectedAccountType: 'demo' },
  isDemo = false,
  onSwitchAccount = () => {},
  onSelectSymbol = () => {},
  onShowStatement = () => {},
  instruments = [],
  marketData = {},
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const previousUnreadCountRef = useRef(unreadNotifications);

  // Filter instruments based on query
  const searchResults = searchQuery.trim().length > 0
    ? instruments.filter(inst =>
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : instruments.slice(0, 6); // show top 6 as suggestions when focused with no query

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
        setSearchFocused(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (previousUnreadCountRef.current < unreadNotifications) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.18);
      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.24);
    }

    previousUnreadCountRef.current = unreadNotifications;
  }, [unreadNotifications]);

  const handleSwitch = (type) => {
    onSwitchAccount(type);
    setShowDropdown(false);
  };

  const handleNotificationClick = (notification) => {
    onMarkNotificationRead(notification.id);
  };

  const handleSelectInstrument = (instrument) => {
    onSelectSymbol(instrument.symbol);
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchFocused(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (searchResults.length > 0) {
        handleSelectInstrument(searchResults[0]);
      }
    }

    if (event.key === 'Escape') {
      setShowSearchResults(false);
      setSearchFocused(false);
    }
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-10 flex flex-col transition-colors duration-300">
      {/* Primary Header Row */}
      <div className="h-20 flex items-center justify-between">
        {/* Left Section - Quick Search & Mobile Menu */}
        <div className="flex items-center space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <FaBars size={18} />
          </button>

          {/* Global Search */}
          <div className="hidden sm:flex items-center relative group w-full" ref={searchRef}>
            <HiMagnifyingGlass
              className="absolute left-4 text-slate-400 group-focus-within:text-gold-500 transition-colors z-10"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                setSearchFocused(true);
                setShowSearchResults(true);
              }}
              placeholder="Search markets, assets, news..."
              className="pl-12 pr-10 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white w-full md:w-72 lg:w-80 focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <FaTimes size={12} />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchFocused && (
              <div className="absolute top-full left-0 mt-2 w-[min(24rem,calc(100vw-2rem))] md:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    {searchQuery ? `Results for "${searchQuery}"` : 'Trending Instruments'}
                  </span>
                  <span className="text-[9px] font-black text-gold-500">{searchResults.length} found</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No instruments found</p>
                    <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-1">Try searching BTC, EUR, AAPL...</p>
                  </div>
                ) : (
                  <div className="py-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {searchResults.map((inst) => {
                      const liveInstrument = buildInstrumentSnapshot({
                        symbol: inst.symbol,
                        instrument: inst,
                        marketData,
                      });

                      return (
                        <button
                          key={inst.symbol}
                          onClick={() => handleSelectInstrument(inst)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item"
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${inst.colors?.text || 'text-slate-500'} ${inst.colors?.bg || 'bg-slate-50'}`}>
                              {inst.category}
                            </span>
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-tight leading-none">{inst.symbol}</p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{inst.name}</p>
                            </div>
                          </div>
                          <p className="text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums italic">
                            ${liveInstrument.price.toLocaleString(undefined, {
                              minimumFractionDigits: liveInstrument.precision,
                              maximumFractionDigits: liveInstrument.precision,
                            })}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Footer hint */}
                <div className="px-4 py-2.5 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                    Press Enter to view all results · Click to open chart
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Profile and Actions */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            <button
              onClick={onQuickTrade}
              className="flex items-center space-x-0 lg:space-x-3 px-3 lg:px-6 py-3 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-gold-600 dark:hover:bg-gold-400 hover:scale-[1.02] transition-all font-black uppercase tracking-widest text-[11px] border border-slate-800 dark:border-gold-400/50"
              title="Quick Trade"
            >
              <FaBolt className={window.innerWidth < 1024 ? 'text-lg' : ''} />
              <span className="hidden lg:inline">Quick Trade</span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((current) => !current)}
                className="relative p-3 bg-slate-900 dark:bg-slate-800 text-white dark:text-gold-500 rounded-2xl shadow-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all group"
              >
                <FaBell size={18} className="group-hover:rotate-12 transition-transform" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[1.5rem] h-6 px-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Notification Center</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white italic">{unreadNotifications} unread</p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[9px] font-black uppercase tracking-widest text-gold-500 hover:text-gold-400 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No notifications yet</p>
                      <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-1">Fresh account activity will appear here.</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.map((notification) => {
                        const toneClass = notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'warning' ? 'bg-amber-500' : notification.type === 'error' ? 'bg-rose-500' : 'bg-blue-500';
                        return (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full px-4 py-3 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${notification.read ? 'opacity-70' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${toneClass}`} />
                              <div className="min-w-0">
                                <p className={`text-xs font-black leading-relaxed ${notification.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                  {notification.message}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 mt-1">
                                  {notification.read ? 'Read' : 'Unread'}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Account Selector & Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 ml-1 lg:ml-4 group cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-900 dark:bg-gold-500 rounded-xl lg:rounded-[1.1rem] flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-lg">
                  {user?.firstName?.charAt(0)}
                </div>
                <div className="px-3 hidden xl:block">
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                    {isDemo ? '⚡ Demo Mode' : '🟢 Live Account'}
                  </p>
                </div>
                <FaChevronDown
                  size={10}
                  className={`mr-2 text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
                />
              </div>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-[min(16rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white italic">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => handleSwitch(isDemo ? 'real' : 'demo')}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-left"
                    >
                      <FaExchangeAlt size={12} className="text-gold-500" />
                      <span>{isDemo ? 'Switch to Live' : 'Switch to Demo'}</span>
                    </button>
                    <div className="border-t border-slate-50 dark:border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => { onShowStatement(); setShowDropdown(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-left"
                      >
                        <FaFileAlt size={12} className="text-gold-500" />
                        <span>Account Statement</span>
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-left"
                      >
                        <FaTimes size={12} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* High-Density Account Summary Bar (Trade.com Style) */}
      <div className="h-12 border-t border-slate-100 dark:border-slate-800/50 flex items-center relative group">
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-6 sm:space-x-8 px-4 h-full">
          {[
            { label: 'Balance', value: portfolio?.totalBalance, highlight: false },
            { label: 'Equity', value: portfolio?.equity, highlight: true },
            { label: 'Used Margin', value: portfolio?.margin, highlight: false },
            { label: 'Free Margin', value: portfolio?.freeMargin, highlight: false },
            { label: 'Margin Level', value: `${(portfolio?.marginLevel || 0).toFixed(2)}%`, highlight: (portfolio?.marginLevel || 0) < 100 && (portfolio?.marginLevel || 0) > 0, isPercent: true },
            { label: 'Credit', value: portfolio?.credit || 0, highlight: false },
            { label: 'Leverage', value: `1:${portfolio?.leverage || 100}`, highlight: false, isPercent: true }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center space-x-3 whitespace-nowrap">
              <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {item.label}:
              </span>
              <span className={`text-[10px] lg:text-[11px] font-black tabular-nums italic ${
                item.highlight 
                  ? (item.label === 'Margin Level' && (portfolio?.marginLevel || 0) < 100 ? 'text-rose-500 animate-pulse' : 'text-gold-500') 
                  : 'text-slate-900 dark:text-white'
              }`}>
                {showBalance ? (item.isPercent ? item.value : (item.value < 0 ? `-$${Math.abs(item.value).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}` : `$${(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`)) : '••••'}
              </span>
              {idx < 6 && <div className="h-3 w-[1px] bg-slate-100 dark:bg-slate-800 ml-4" />}
            </div>
          ))}
        </div>
      </div>
        {/* Mobile Scroll Indicator Mask */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none sm:hidden"></div>
      </div>
    </header>
  );
};

export default Header;

