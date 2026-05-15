import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaBars, FaExchangeAlt, FaTimes, FaFileAlt } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { buildInstrumentSnapshot } from '../../utils/marketSymbols';
import logoLight from '../../assets/images/logos/logo-light.jpg';
import logoDark from '../../assets/images/logos/logo-dark.png';

const Header = ({
  portfolio = {},
  showBalance = true,
  onDepositFunds = () => {},
  onWithdrawFunds = () => {},
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
  const { theme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const previousUnreadCountRef = useRef(unreadNotifications);
  const audioContextRef = useRef(null);
  const pendingNotificationToneRef = useRef(false);

  const playNotificationTone = () => {
    const audioContext = audioContextRef.current;

    if (!audioContext || audioContext.state !== 'running') {
      return false;
    }

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

    return true;
  };

  const searchResults = searchQuery.trim().length > 0
    ? instruments.filter((inst) =>
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.category.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (typeof window === 'undefined') {
      return undefined;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return undefined;
    }

    const unlockAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextClass();
        }

        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        if (pendingNotificationToneRef.current) {
          pendingNotificationToneRef.current = false;
          playNotificationTone();
        }
      } catch (error) {
        // Ignore autoplay-policy failures until the next user gesture.
      }
    };

    const gestureEvents = ['pointerdown', 'keydown', 'touchstart'];
    gestureEvents.forEach((eventName) => {
      window.addEventListener(eventName, unlockAudio, { passive: true });
    });

    return () => {
      gestureEvents.forEach((eventName) => {
        window.removeEventListener(eventName, unlockAudio);
      });

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (previousUnreadCountRef.current < unreadNotifications) {
      const played = playNotificationTone();

      if (!played) {
        pendingNotificationToneRef.current = true;
      }
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

  const formatHeaderCurrency = (value) => {
    const numericValue = Number.parseFloat(value ?? 0) || 0;
    const formatted = Math.abs(numericValue).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return numericValue < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const topMetrics = [
    { label: 'Equity', value: portfolio?.equity, tone: 'text-slate-900 dark:text-white' },
    { label: 'P/L', value: portfolio?.dailyPnL, tone: (portfolio?.dailyPnL || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500' },
    { label: 'Free Margin', value: portfolio?.freeMargin, tone: 'text-slate-900 dark:text-white' },
    { label: 'Used Margin', value: portfolio?.margin, tone: 'text-slate-900 dark:text-white' },
    { label: 'Margin Level', value: `${(portfolio?.marginLevel || 0).toFixed(2)}%`, tone: 'text-slate-900 dark:text-white', isPercent: true },
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-3 sm:px-5 lg:px-6 flex flex-col transition-colors duration-300">
      <div className="min-h-[76px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 py-3 shrink-0">
            <img
              src={theme === 'dark' ? logoDark : logoLight}
              alt="TikTrades"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>

          <button
            onClick={onDepositFunds}
            className="px-3 sm:px-4 lg:px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
            title="Deposit Funds"
          >
            Deposit
          </button>

          <button
            onClick={onWithdrawFunds}
            className="px-3 sm:px-4 lg:px-5 py-3 rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all shrink-0"
            title="Withdraw Funds"
          >
            Withdrawal
          </button>

          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-3 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Balance
            </span>
            <span className="text-[11px] font-black italic tabular-nums text-slate-900 dark:text-white">
              {showBalance ? formatHeaderCurrency(portfolio?.totalBalance) : '••••'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 px-4 py-3 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              Credit
            </span>
            <span className="text-[11px] font-black italic tabular-nums text-slate-900 dark:text-white">
              {showBalance ? formatHeaderCurrency(portfolio?.credit) : '••••'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden xl:flex items-center relative group w-[20rem]" ref={searchRef}>
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
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <FaTimes size={12} />
              </button>
            )}

            {showSearchResults && searchFocused && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden z-50">
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
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
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
              </div>
            )}
          </div>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="relative p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
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

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center p-1 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-900 dark:bg-gold-500 rounded-xl lg:rounded-[1.1rem] flex items-center justify-center text-gold-500 dark:text-slate-900 font-black italic shadow-lg">
                {user?.firstName?.charAt(0)}
              </div>
              <div className="px-3 hidden lg:block">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {isDemo ? 'Demo Mode' : 'Live Account'}
                  </p>
                </div>
              </div>
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

          <button
            onClick={onMenuClick}
            className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Open Menu"
          >
            <FaBars size={18} />
          </button>
        </div>
      </div>

      <div className="h-12 border-t border-slate-100 dark:border-slate-800/50 flex items-center relative">
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-6 sm:space-x-8 px-4 h-full">
            {topMetrics.map((item, idx, items) => (
              <div key={idx} className="flex items-center space-x-3 whitespace-nowrap">
                <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  {item.label}:
                </span>
                <span className={`text-[10px] lg:text-[11px] font-black tabular-nums italic ${item.tone}`}>
                  {showBalance
                    ? item.isPercent
                      ? item.value
                      : formatHeaderCurrency(item.value)
                    : '••••'}
                </span>
                {idx < items.length - 1 && <div className="h-3 w-[1px] bg-slate-100 dark:bg-slate-800 ml-4" />}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none sm:hidden" />
      </div>
    </header>
  );
};

export default Header;
