import React, { useState, useRef, useEffect } from 'react';
import { FaBolt, FaBell, FaBars, FaChevronDown, FaExchangeAlt, FaTimes, FaFileAlt } from 'react-icons/fa';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import ThemeToggle from '../ui/ThemeToggle';
import { buildInstrumentSnapshot } from '../../utils/marketSymbols';

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

  const searchResults = searchQuery.trim().length > 0
    ? instruments.filter((instrument) =>
        instrument.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instrument.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instrument.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : instruments.slice(0, 6);

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
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
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
    }

    previousUnreadCountRef.current = unreadNotifications;
  }, [unreadNotifications]);

  const handleSwitch = (type) => {
    onSwitchAccount(type);
    setShowDropdown(false);
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

  const hiddenValue = '••••';
  const summaryItems = [
    {
      label: 'Balance',
      value: showBalance
        ? `$${Number(portfolio?.totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : hiddenValue,
      tone: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Equity',
      value: showBalance
        ? `$${Number(portfolio?.equity || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : hiddenValue,
      tone: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Free Margin',
      value: showBalance
        ? `$${Number(portfolio?.freeMargin || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : hiddenValue,
      tone: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Margin Level',
      value: Number(portfolio?.margin || 0) > 0 ? `${Number(portfolio?.marginLevel || 0).toFixed(2)}%` : 'N/A',
      tone: Number(portfolio?.marginLevel || 0) > 0 && Number(portfolio?.marginLevel || 0) < 100 ? 'text-rose-500' : 'text-gold-500',
    },
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 lg:px-10 flex flex-col transition-colors duration-300">
      <div className="min-h-[5rem] py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <FaBars size={18} />
          </button>

          <div className="hidden sm:flex items-center relative group w-full max-w-xl" ref={searchRef}>
            <HiMagnifyingGlass
              className="absolute left-4 text-slate-400 group-focus-within:text-gold-500 transition-colors z-10"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setShowSearchResults(true);
              }}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                setSearchFocused(true);
                setShowSearchResults(true);
              }}
              placeholder="Search instruments..."
              className="pl-12 pr-10 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white w-full focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <FaTimes size={12} />
              </button>
            )}

            {showSearchResults && searchFocused && (
              <div className="absolute top-full left-0 mt-2 w-[min(24rem,calc(100vw-2rem))] md:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    {searchQuery ? `Results for "${searchQuery}"` : 'Suggested Instruments'}
                  </span>
                  <span className="text-[9px] font-black text-gold-500">{searchResults.length} found</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No instruments found</p>
                    <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-1">Try BTC, EURUSD, XAUUSD, or AAPL.</p>
                  </div>
                ) : (
                  <div className="py-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {searchResults.map((instrument) => {
                      const liveInstrument = buildInstrumentSnapshot({
                        symbol: instrument.symbol,
                        instrument,
                        marketData,
                      });

                      return (
                        <button
                          key={instrument.symbol}
                          onClick={() => handleSelectInstrument(instrument)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${instrument.colors?.text || 'text-slate-500'} ${instrument.colors?.bg || 'bg-slate-50'}`}>
                              {instrument.category}
                            </span>
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-900 dark:text-white italic uppercase tracking-tight leading-none">{instrument.symbol}</p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{instrument.name}</p>
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

                <div className="px-4 py-2.5 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                    Press Enter to open the top result.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleBalance}
            className="hidden md:inline-flex px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            {showBalance ? 'Hide Balance' : 'Show Balance'}
          </button>

          <ThemeToggle />

          <button
            onClick={onQuickTrade}
            className="flex items-center space-x-2 px-4 lg:px-6 py-3 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-gold-600 dark:hover:bg-gold-400 hover:scale-[1.02] transition-all font-black uppercase tracking-widest text-[11px] border border-slate-800 dark:border-gold-400/50"
            title="Quick Trade"
          >
            <FaBolt />
            <span className="hidden lg:inline">Quick Trade</span>
          </button>

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
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Notifications</p>
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
                    <p className="text-[9px] text-slate-300 dark:text-slate-600 mt-1">Account updates will appear here.</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.map((notification) => {
                      const toneClass = notification.type === 'success'
                        ? 'bg-emerald-500'
                        : notification.type === 'warning'
                          ? 'bg-amber-500'
                          : notification.type === 'error'
                            ? 'bg-rose-500'
                            : 'bg-blue-500';

                      return (
                        <button
                          key={notification.id}
                          onClick={() => onMarkNotificationRead(notification.id)}
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

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 ml-1 group cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-900 dark:bg-gold-500 rounded-xl lg:rounded-[1.1rem] flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-lg">
                {user?.firstName?.charAt(0)}
              </div>
              <div className="px-3 hidden xl:block">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                  {isDemo ? 'Demo Account' : 'Live Account'}
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
                      onClick={() => {
                        onShowStatement();
                        setShowDropdown(false);
                      }}
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

      <div className="border-t border-slate-100 dark:border-slate-800/50 px-1 sm:px-0">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="min-w-[150px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-3">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                {item.label}
              </p>
              <p className={`text-sm font-black italic ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
