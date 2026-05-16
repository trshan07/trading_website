import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaBell,
  FaChevronDown,
  FaExchangeAlt,
  FaFileAlt,
  FaSearch,
  FaSignOutAlt,
  FaSlidersH,
} from 'react-icons/fa';
import { buildInstrumentSnapshot } from '../../utils/marketSymbols';
import logoLight from '../../assets/images/logos/logo-light.jpg';
import logoDark from '../../assets/images/logos/logo-dark.png';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';

const formatCurrency = (value) => {
  const numericValue = Number.parseFloat(value ?? 0) || 0;
  return `$${numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

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
  user = { firstName: 'Trader', lastName: '' },
  isDemo = false,
  onSwitchAccount = () => {},
  onSelectSymbol = () => {},
  onShowStatement = () => {},
  instruments = [],
  marketData = {},
}) => {
  const { theme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMetrics, setShowMobileMetrics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const pool = query
      ? instruments.filter((instrument) => (
        instrument.symbol?.toLowerCase().includes(query)
        || instrument.name?.toLowerCase().includes(query)
        || instrument.category?.toLowerCase().includes(query)
      ))
      : instruments;

    return pool.slice(0, 7);
  }, [instruments, searchQuery]);

  const headerMetrics = [
    { label: 'Balance', value: portfolio.totalBalance },
    { label: 'Equity', value: portfolio.equity },
    {
      label: 'P/L',
      value: formatCurrency(portfolio.dailyPnL),
      raw: true,
      tone: (portfolio.dailyPnL || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300',
    },
    { label: 'Free Margin', value: portfolio.freeMargin },
    { label: 'Used Margin', value: portfolio.margin },
    { label: 'Margin Level', value: `${Number(portfolio.marginLevel || 0).toFixed(2)}%`, raw: true },
    { label: 'Credit', value: portfolio.credit },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0d1420]/92">
      <div className="px-3 sm:px-5 lg:px-6">
        <div className="flex min-h-[72px] flex-wrap items-center gap-3 py-3 sm:flex-nowrap sm:py-0">
          <button
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            title="Open menu"
          >
            <FaSlidersH size={15} />
          </button>

          <div className="hidden shrink-0 items-center rounded-2xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900 sm:flex">
            <img
              src={theme === 'dark' ? logoDark : logoLight}
              alt="TikTrades"
              className="h-7 w-auto object-contain"
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 sm:hidden">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                {isDemo ? 'Demo account' : 'Live account'}
              </div>
            </div>
          </div>

          <div className="relative hidden min-w-0 flex-1 xl:block" ref={searchRef}>
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch size={13} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && searchResults[0]) {
                  onSelectSymbol(searchResults[0].symbol);
                  setSearchFocused(false);
                  setSearchQuery('');
                }
              }}
              placeholder="Search markets, assets, news..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-600 dark:focus:bg-slate-950"
            />

            {searchFocused && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {searchResults.length ? 'Suggested markets' : 'No matching instruments'}
                </div>
                {searchResults.map((instrument) => {
                  const liveInstrument = buildInstrumentSnapshot({
                    symbol: instrument.symbol,
                    instrument,
                    marketData,
                  });

                  return (
                    <button
                      key={instrument.symbol}
                      onClick={() => {
                        onSelectSymbol(instrument.symbol);
                        setSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{instrument.symbol}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{instrument.name}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                        {formatCurrency(liveInstrument.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onDepositFunds}
              className="hidden h-11 items-center rounded-2xl bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300 sm:inline-flex"
            >
              Deposit
            </button>
            <button
              onClick={onWithdrawFunds}
              className="hidden h-11 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
            >
              Withdrawal
            </button>
            <div className="shrink-0">
              <ThemeToggle />
            </div>
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((current) => !current)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                title="Notifications"
              >
                <FaBell size={15} />
                {unreadNotifications > 0 && (
                  <span className="absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white dark:bg-emerald-400 dark:text-slate-950">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-[20rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{unreadNotifications} unread</p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No notifications yet.
                      </div>
                    ) : notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => onMarkNotificationRead(notification.id)}
                        className="w-full border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70"
                      >
                        <p className={`text-sm ${notification.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {notification.message}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu((current) => !current)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-amber-300 dark:text-slate-950">
                  {user?.firstName?.charAt(0) || 'T'}
                </span>
                <div className="hidden min-w-0 lg:block">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${isDemo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    {isDemo ? 'Demo account' : 'Live account'}
                  </div>
                </div>
                <FaChevronDown size={11} className="hidden text-slate-400 lg:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isDemo ? 'Demo environment' : 'Live trading account'}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        onSwitchAccount(isDemo ? 'real' : 'demo');
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <FaExchangeAlt size={12} />
                      {isDemo ? 'Switch to live' : 'Switch to demo'}
                    </button>
                    <button
                      onClick={() => {
                        onShowStatement();
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <FaFileAlt size={12} />
                      Account statement
                    </button>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <FaSignOutAlt size={12} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pb-3 sm:hidden">
          <button
            onClick={onDepositFunds}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Deposit
          </button>
          <button
            onClick={onWithdrawFunds}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Withdrawal
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="sm:hidden">
          <button
            onClick={() => setShowMobileMetrics((current) => !current)}
            className="flex w-full items-center justify-between px-3 py-3 text-left"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Account Summary</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                {showBalance ? formatCurrency(portfolio.equity) : 'â€¢â€¢â€¢â€¢â€¢â€¢'}
              </p>
            </div>
            <FaChevronDown
              size={13}
              className={`text-slate-400 transition-transform ${showMobileMetrics ? 'rotate-180' : ''}`}
            />
          </button>
          {showMobileMetrics && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-3 pb-3">
              {headerMetrics.map((metric) => (
                <div key={metric.label} className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className={`mt-1 text-sm font-semibold tabular-nums ${metric.tone || 'text-slate-900 dark:text-white'}`}>
                    {showBalance
                      ? (metric.raw ? metric.value : formatCurrency(metric.value))
                      : 'â€¢â€¢â€¢â€¢â€¢â€¢'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="hidden sm:flex sm:gap-6 sm:overflow-x-auto sm:px-5 sm:py-3 lg:px-6">
          {headerMetrics.map((metric) => (
            <div key={metric.label} className="min-w-fit">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className={`mt-1 text-sm font-semibold tabular-nums ${metric.tone || 'text-slate-900 dark:text-white'}`}>
                {showBalance
                  ? (metric.raw ? metric.value : formatCurrency(metric.value))
                  : '••••••'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
