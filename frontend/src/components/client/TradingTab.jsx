import React, { useEffect, useMemo, useState } from 'react';
import { FaBell, FaListUl, FaRegStar, FaTimes } from 'react-icons/fa';
import OrderPanel from '../trading/OrderPanel';
import PositionsTable from '../trading/PositionsTable';
import TerminalAssetList from '../trading/TerminalAssetList';
import TradingViewWidget from '../trading/TradingViewWidget';
import OpenOrders from '../trading/OpenOrders';
import PriceAlertsTab from '../trading/PriceAlertsTab';
import TradeHistory from '../trading/TradeHistory.js';
import { useTheme } from '../../context/ThemeContext';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol, normalizeSymbol } from '../../utils/marketSymbols';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';

const SlidingPanel = ({
  open = false,
  title,
  subtitle,
  side = 'right',
  onClose,
  children,
}) => {
  if (!open) {
    return null;
  }

  const sideClass = side === 'left'
    ? 'left-0 translate-x-0'
    : 'right-0 translate-x-0';

  return (
    <div className="fixed inset-0 z-[110]">
      <button
        aria-label="Close panel"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`absolute top-0 h-full w-full max-w-[28rem] border-slate-700/70 bg-gradient-to-b from-[#1f2434] to-[#171b28] shadow-[0_28px_90px_rgba(0,0,0,0.48)] ${sideClass} border-l border-r`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 bg-[#161b27]/85 px-5 py-4 backdrop-blur">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/70">{title}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-white">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-[#111620] p-2 text-slate-400 transition-colors hover:text-white"
            >
              <FaTimes size={14} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [deskTab, setDeskTab] = useState('positions');
  const [showWatchlistPanel, setShowWatchlistPanel] = useState(false);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showWatchlistPanel || showOrderPanel ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showOrderPanel, showWatchlistPanel]);

  const normalizedActiveSymbol = useMemo(() => normalizeSymbol(activeSymbol), [activeSymbol]);
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

  const bidPrice = quoteSnapshot.bidLabel;
  const askPrice = quoteSnapshot.askLabel;
  const spreadLabel = Number.isFinite(quoteSnapshot.spread)
    ? Number(quoteSnapshot.spread).toFixed(selectedInstrument.precision || 2)
    : '0.00';
  const activeSymbolLabel = formatInstrumentDisplaySymbol(activeSymbol, { withSlash: true });
  const chartChange = Number(selectedInstrument.change || 0);
  const chartTone = chartChange >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const compactTables = windowWidth < 1380;

  const filteredPositions = useMemo(
    () => positions.filter((position) => normalizeSymbol(position?.symbol) === normalizedActiveSymbol),
    [normalizedActiveSymbol, positions]
  );
  const filteredOrders = useMemo(
    () => orders.filter((order) => normalizeSymbol(order?.symbol) === normalizedActiveSymbol),
    [normalizedActiveSymbol, orders]
  );

  const deskTabs = [
    { id: 'positions', label: 'Positions', count: positions.length },
    { id: 'orders', label: 'Pending Orders', count: orders.length },
    { id: 'history', label: 'Trade History', count: closedTrades.length },
    { id: 'alerts', label: 'Price Alerts', count: priceAlerts.length },
  ];

  const openWatchlist = () => {
    setShowOrderPanel(false);
    setShowWatchlistPanel(true);
  };

  const openOrderTicket = () => {
    setShowWatchlistPanel(false);
    setShowOrderPanel(true);
  };

  const renderDeskContent = () => {
    if (deskTab === 'positions') {
      return (
        <PositionsTable
          positions={positions}
          onClose={onClosePosition}
          onModify={onModifyPosition}
          compact={compactTables}
        />
      );
    }

    if (deskTab === 'orders') {
      return (
        <OpenOrders
          orders={orders}
          onCancel={onCancelOrder}
          onModify={onModifyOrder}
          compact={compactTables}
        />
      );
    }

    if (deskTab === 'history') {
      return <TradeHistory trades={closedTrades} compact={compactTables} />;
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
    <div className="-mx-4 flex min-h-[calc(100vh-10rem)] flex-col bg-[#171a26] px-4 pb-6 pt-4 text-white md:-mx-10 md:px-10 font-sans">
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-700/70 bg-gradient-to-b from-[#1f2434] to-[#171b28] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
        <div className="flex flex-col gap-4 border-b border-slate-700/60 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="font-display text-2xl font-semibold uppercase tracking-tight text-white sm:text-3xl">{activeSymbolLabel}.</p>
              <p className={`text-lg font-semibold tabular-nums ${chartTone}`}>{chartChange >= 0 ? '+' : ''}{chartChange.toFixed(2)}%</p>
              <span className="rounded-full border border-slate-700 bg-[#111620] px-3 py-1 text-xs font-semibold text-slate-300">
                Spread {spreadLabel}
              </span>
              <span className="rounded-full border border-slate-700 bg-[#111620] px-3 py-1 text-xs font-semibold text-slate-300">
                {filteredPositions.length} open
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openWatchlist}
              className="rounded-2xl border border-slate-700 bg-[#111620] px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
            >
              <span className="inline-flex items-center gap-2">
                <FaListUl size={14} />
                Watchlist
              </span>
            </button>
            <button
              onClick={openOrderTicket}
              className="rounded-2xl bg-gradient-to-r from-[#3bc7bd] via-[#34d399] to-[#58d8b7] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_38px_rgba(52,211,153,0.18)] transition hover:brightness-105"
            >
              Open Order Ticket
            </button>
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/12 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-200/80">Sell</p>
              <p className="mt-1 text-xl font-semibold leading-none tabular-nums text-rose-300 sm:text-2xl">{bidPrice}</p>
            </div>
            <div className="rounded-2xl border border-teal-400/30 bg-teal-400/12 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-100/80">Buy</p>
              <p className="mt-1 text-xl font-semibold leading-none tabular-nums text-teal-200 sm:text-2xl">{askPrice}</p>
            </div>
          </div>
        </div>

        <div className="h-[30rem] sm:h-[36rem] xl:h-[44rem]">
          <TradingViewWidget
            key={`terminal-${activeSymbol}-${theme}`}
            symbol={activeSymbol}
            theme={theme}
            instrument={selectedInstrument}
            positions={positions}
            marketStatus="LIVE MARKET DATA"
          />
        </div>
      </section>

      <section className="mt-4 flex min-h-[24rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-700/70 bg-gradient-to-b from-[#1f2434] to-[#171b28] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
        <div className="border-b border-slate-700/60 px-4 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/70">Positions and Orders</p>
              <p className="mt-1 font-display text-xl font-semibold text-white">Trading activity under the chart</p>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {deskTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDeskTab(tab.id)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
                    deskTab === tab.id
                      ? 'bg-gradient-to-r from-slate-100 to-white text-[#171a26] shadow-lg'
                      : 'bg-[#111620] text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${deskTab === tab.id ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          {renderDeskContent()}
        </div>
      </section>

      <SlidingPanel
        open={showWatchlistPanel}
        title="Market Watch"
        subtitle="Watchlist"
        side="left"
        onClose={() => setShowWatchlistPanel(false)}
      >
        <TerminalAssetList
          activeSymbol={activeSymbol}
          onSelectSymbol={(nextSymbol) => {
            onSymbolChange(nextSymbol);
            setShowWatchlistPanel(false);
          }}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          marketData={marketData}
          instruments={instruments}
          categories={categories}
        />
      </SlidingPanel>

      <SlidingPanel
        open={showOrderPanel}
        title="Execution"
        subtitle="Order Ticket"
        side="right"
        onClose={() => setShowOrderPanel(false)}
      >
        <div className="h-full overflow-y-auto p-4 custom-scrollbar">
          <OrderPanel
            accountId={accountId}
            onSubmit={onPlaceOrder}
            symbol={activeSymbol}
            marketData={marketData}
            instrument={selectedInstrument}
            portfolio={portfolio}
            maxLeverage={maxLeverage}
            positions={positions}
            orders={orders}
          />
        </div>
      </SlidingPanel>
    </div>
  );
};

export default TradingTab;
