import React, { useEffect, useMemo, useState } from 'react';
import { FaListUl, FaTimes } from 'react-icons/fa';
import OrderPanel from '../trading/OrderPanel';
import OpenOrders from '../trading/OpenOrders';
import PositionsTable from '../trading/PositionsTable';
import PriceAlertsTab from '../trading/PriceAlertsTab';
import TerminalAssetList from '../trading/TerminalAssetList';
import TradeHistory from '../trading/TradeHistory';
import TradingViewWidget from '../trading/TradingViewWidget';
import { useTheme } from '../../context/ThemeContext';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol, normalizeSymbol } from '../../utils/marketSymbols';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';
import { getMarketSessionState } from '../../utils/marketHours';

const activityTabs = [
  { id: 'positions', label: 'Positions' },
  { id: 'orders', label: 'Pending Orders' },
  { id: 'history', label: 'Position History' },
  { id: 'alerts', label: 'Price Alerts' },
];

const ticketTabs = [
  { id: 'market', label: 'Market' },
  { id: 'pending', label: 'Pending' },
];

const TradingTab = ({
  accountId = null,
  portfolio = {},
  positions = [],
  orders = [],
  closedTrades = [],
  marketData = {},
  onPlaceOrder = () => {},
  onClosePosition = () => {},
  onModifyPosition = () => {},
  onCancelOrder = () => {},
  onModifyOrder = () => {},
  activeSymbol = 'BTCUSDT',
  onSymbolChange = () => {},
  favorites = [],
  onToggleFavorite = () => {},
  priceAlerts = [],
  onCreateAlert = () => {},
  onDeleteAlert = () => {},
  instruments = [],
  categories = [],
  maxLeverage = 100,
}) => {
  const { theme } = useTheme();
  const [activityTab, setActivityTab] = useState('positions');
  const [orderMode, setOrderMode] = useState('market');
  const [showWatchlistPopup, setShowWatchlistPopup] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showWatchlistPopup || showOrderPopup ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showOrderPopup, showWatchlistPopup]);

  const baseInstrument = instruments.find((instrument) => instrument.symbol === activeSymbol);
  const selectedInstrument = useMemo(() => buildInstrumentSnapshot({
    symbol: activeSymbol,
    instrument: baseInstrument || {},
    marketData,
  }), [activeSymbol, baseInstrument, marketData]);

  const quoteSnapshot = useMemo(() => getDisplayQuoteSnapshot({
    symbol: activeSymbol,
    instrument: selectedInstrument,
    marketData,
  }), [activeSymbol, marketData, selectedInstrument]);
  const marketSession = useMemo(
    () => getMarketSessionState({ symbol: activeSymbol, category: selectedInstrument.category }),
    [activeSymbol, selectedInstrument.category]
  );

  const filteredPositions = useMemo(
    () => positions.filter((position) => normalizeSymbol(position?.symbol) === normalizeSymbol(activeSymbol)),
    [activeSymbol, positions]
  );

  const activeSymbolLabel = formatInstrumentDisplaySymbol(activeSymbol, { withSlash: true });
  const priceChange = Number(selectedInstrument.change || 0);
  const isPositive = priceChange >= 0;

  const handleOrderSubmit = async (payload) => {
    const result = await Promise.resolve(onPlaceOrder(payload));
    if (!result?.success) {
      return result;
    }

    setShowOrderPopup(false);
    setOrderMode('market');
    setActivityTab(result.mode === 'pending' ? 'orders' : 'positions');
    return result;
  };

  const renderActivityContent = () => {
    if (activityTab === 'positions') {
      return (
        <>
          <div className="lg:hidden">
            <PositionsTable
              positions={positions}
              onClose={onClosePosition}
              onModify={onModifyPosition}
              compact
            />
          </div>
          <div className="hidden lg:block">
            <PositionsTable
              positions={positions}
              onClose={onClosePosition}
              onModify={onModifyPosition}
              compact={false}
            />
          </div>
        </>
      );
    }

    if (activityTab === 'orders') {
      return (
        <>
          <div className="lg:hidden">
            <OpenOrders
              orders={orders}
              onCancel={onCancelOrder}
              onModify={onModifyOrder}
              compact
            />
          </div>
          <div className="hidden lg:block">
            <OpenOrders
              orders={orders}
              onCancel={onCancelOrder}
              onModify={onModifyOrder}
              compact={false}
            />
          </div>
        </>
      );
    }

    if (activityTab === 'history') {
      return (
        <>
          <div className="lg:hidden">
            <TradeHistory trades={closedTrades} compact />
          </div>
          <div className="hidden lg:block">
            <TradeHistory trades={closedTrades} compact={false} />
          </div>
        </>
      );
    }

    return (
      <PriceAlertsTab
        alerts={priceAlerts}
        onCreateAlert={onCreateAlert}
        onDeleteAlert={onDeleteAlert}
      />
    );
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:p-4 dark:border-slate-800 dark:bg-[#0d1420]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowWatchlistPopup(true)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 xl:hidden"
            >
              <FaListUl size={13} />
              Market watch
            </button>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">WebTrader</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">{activeSymbolLabel}</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                }`}>
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <span className={`inline-block h-2 w-2 rounded-full ${marketSession.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {marketSession.isOpen ? 'Market open' : 'Market closed'}
                </span>
                {!marketSession.isOpen && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    {marketSession.reason}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 lg:w-auto xl:flex">
            <button
              onClick={() => setShowWatchlistPopup(true)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Watchlist</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Open market watch</p>
            </button>
            <button
              onClick={() => setShowOrderPopup(true)}
              disabled={!marketSession.isOpen}
              className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                marketSession.isOpen
                  ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white'
                  : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500'
              }`}
            >
              <p className={`text-xs font-medium ${marketSession.isOpen ? 'text-white/70 dark:text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>Order Ticket</p>
              <p className="mt-1 text-sm font-semibold">{marketSession.isOpen ? 'Open execution panel' : 'Trading unavailable now'}</p>
            </button>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/10">
              <p className="text-xs font-medium uppercase tracking-wide text-rose-600 dark:text-rose-300">Sell</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-rose-700 sm:text-xl dark:text-rose-200">{quoteSnapshot.bidLabel}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Buy</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-700 sm:text-xl dark:text-emerald-200">{quoteSnapshot.askLabel}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-1 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Spread</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900 sm:text-xl dark:text-white">{Number(quoteSnapshot.spread || 0).toFixed(selectedInstrument.precision || 2)}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[20rem_minmax(0,1fr)_23rem]">
          <div className="min-w-0 space-y-4 xl:col-span-3">
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Chart</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Primary execution view</p>
                </div>
              </div>
              <div className="overflow-x-auto overflow-y-hidden">
                <div className="h-[28rem] min-w-[820px] sm:min-w-0 sm:h-[32rem] md:h-[44rem] xl:h-[50rem]">
                  <TradingViewWidget
                    key={`terminal-${activeSymbol}-${theme}`}
                    symbol={activeSymbol}
                    theme={theme}
                    instrument={selectedInstrument}
                    positions={positions}
                    marketStatus={marketSession.isOpen ? 'LIVE MARKET DATA' : 'MARKET CLOSED'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-[#0d1420]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Activity</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filteredPositions.length} active {activeSymbolLabel} positions
            </p>
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
            {activityTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivityTab(tab.id)}
                className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  activityTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">{renderActivityContent()}</div>
      </section>

      {showWatchlistPopup && (
        <div className="fixed inset-0 z-[90]">
          <button
            aria-label="Close watchlist"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowWatchlistPopup(false)}
          />
          <div className="absolute left-0 top-0 h-full w-full overflow-hidden border-r border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:w-[34rem] sm:max-w-[96vw] dark:border-slate-800 dark:bg-[#0d1420]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Market watch</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select an instrument</p>
              </div>
              <button
                onClick={() => setShowWatchlistPopup(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <FaTimes size={13} />
              </button>
            </div>
            <TerminalAssetList
              activeSymbol={activeSymbol}
              onSelectSymbol={(symbol) => {
                onSymbolChange(symbol);
                setShowWatchlistPopup(false);
              }}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              marketData={marketData}
              instruments={instruments}
              categories={categories}
            />
          </div>
        </div>
      )}

      {showOrderPopup && (
        <div className="fixed inset-0 z-[95]">
          <button
            aria-label="Close order ticket"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowOrderPopup(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full overflow-hidden border-l border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:w-[24rem] sm:max-w-[92vw] dark:border-slate-800 dark:bg-[#0d1420]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
              <div className="flex gap-2 overflow-x-auto">
                {ticketTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderMode(tab.id)}
                    className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                      orderMode === tab.id
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                        : 'bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowOrderPopup(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <FaTimes size={13} />
              </button>
            </div>

            <div className="h-[calc(100%-4.5rem)]">
              {orderMode === 'market' ? (
                <OrderPanel
                  accountId={accountId}
                  onSubmit={handleOrderSubmit}
                  symbol={activeSymbol}
                  onClose={() => setShowOrderPopup(false)}
                  marketData={marketData}
                  instrument={selectedInstrument}
                  portfolio={portfolio}
                  maxLeverage={maxLeverage}
                />
              ) : (
                <OrderPanel
                  accountId={accountId}
                  onSubmit={handleOrderSubmit}
                  onClose={() => setShowOrderPopup(false)}
                  mode="pending"
                  symbol={activeSymbol}
                  marketData={marketData}
                  instrument={selectedInstrument}
                  portfolio={portfolio}
                  maxLeverage={maxLeverage}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingTab;
