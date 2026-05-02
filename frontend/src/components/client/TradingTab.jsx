import React, { useMemo, useState } from 'react';
import { FaBell, FaChevronDown, FaChevronUp, FaRegStar } from 'react-icons/fa';
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

const formatCurrency = (value = 0) => Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatMetricValue = (metric) => {
  if (metric.type === 'percent') {
    return `${Number(metric.value || 0).toFixed(2)}%`;
  }

  const prefix = metric.currency === false ? '' : '$';
  return `${prefix}${formatCurrency(metric.value)}`;
};

const TradingTab = ({
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
  const [showMobileMarkets, setShowMobileMarkets] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const { theme } = useTheme();

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 1024;
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
  const filteredPositions = useMemo(
    () => positions.filter((position) => normalizeSymbol(position?.symbol) === normalizedActiveSymbol),
    [normalizedActiveSymbol, positions]
  );
  const filteredOrders = useMemo(
    () => orders.filter((order) => normalizeSymbol(order?.symbol) === normalizedActiveSymbol),
    [normalizedActiveSymbol, orders]
  );

  const summaryMetrics = [
    { key: 'balance', label: 'Balance', value: portfolio.totalBalance },
    { key: 'equity', label: 'Equity', value: portfolio.equity },
    { key: 'freeMargin', label: 'Free Margin', value: portfolio.freeMargin },
    { key: 'usedMargin', label: 'Used Margin', value: portfolio.margin },
    { key: 'openPnl', label: 'Open P/L', value: portfolio.dailyPnL },
    { key: 'marginLevel', label: 'Margin Level', value: portfolio.marginLevel, type: 'percent' },
  ];

  const quickCards = [
    { key: 'symbol', label: 'Instrument', value: `${activeSymbolLabel}.`, tone: 'text-white' },
    { key: 'sell', label: 'Sell', value: bidPrice, tone: 'text-rose-300' },
    { key: 'buy', label: 'Buy', value: askPrice, tone: 'text-teal-300' },
    { key: 'spread', label: 'Spread', value: spreadLabel, tone: 'text-slate-200' },
  ];

  const deskTabs = [
    { id: 'positions', label: 'Positions', count: positions.length },
    { id: 'orders', label: 'Pending Orders', count: orders.length },
    { id: 'history', label: 'Trade History', count: closedTrades.length },
    { id: 'alerts', label: 'Price Alerts', count: priceAlerts.length },
  ];

  const renderDeskContent = () => {
    if (deskTab === 'positions') {
      return (
        <PositionsTable
          positions={positions}
          onClose={onClosePosition}
          onModify={onModifyPosition}
          compact={isMobile}
        />
      );
    }

    if (deskTab === 'orders') {
      return (
        <OpenOrders
          orders={orders}
          onCancel={onCancelOrder}
          onModify={onModifyOrder}
          compact={isMobile}
        />
      );
    }

    if (deskTab === 'history') {
      return <TradeHistory trades={closedTrades} />;
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
    <div className="-mx-4 flex min-h-[calc(100vh-10rem)] flex-col bg-[#171a26] px-4 pb-6 pt-4 text-white md:-mx-10 md:px-10">
      <section className="mb-4 rounded-[1.75rem] border border-slate-700/70 bg-[#1f2230] p-4 sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Trading Workspace</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Trade faster with one clean screen
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Pick an instrument, follow the live chart, place an order, and review your activity without jumping between crowded panels.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickCards.map((card) => (
              <div key={card.key} className="rounded-2xl border border-slate-700/60 bg-[#171a26] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                <p className={`mt-2 truncate text-lg font-black sm:text-xl ${card.tone}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
          {summaryMetrics.map((metric) => (
            <div
              key={metric.key}
              className="min-w-[10.5rem] rounded-2xl border border-slate-700/50 bg-[#171a26] px-4 py-3"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
              <p className="mt-2 text-xl font-black text-white">{formatMetricValue(metric)}</p>
            </div>
          ))}
        </div>
      </section>

      {isMobile && (
        <section className="mb-4 rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230] p-4">
          <button
            onClick={() => setShowMobileMarkets((current) => !current)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-700/60 bg-[#171a26] px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-black text-white">Browse Markets</p>
              <p className="mt-1 text-xs text-slate-400">Open the instruments list and switch the active symbol.</p>
            </div>
            {showMobileMarkets ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
          </button>

          {showMobileMarkets && (
            <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-700/60 bg-[#171a26]">
              <TerminalAssetList
                activeSymbol={activeSymbol}
                onSelectSymbol={(nextSymbol) => {
                  onSymbolChange(nextSymbol);
                  setShowMobileMarkets(false);
                }}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                marketData={marketData}
                instruments={instruments}
                categories={categories}
              />
            </div>
          )}
        </section>
      )}

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] xl:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)_minmax(19rem,22rem)]">
        <aside className="hidden min-h-[28rem] overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230] lg:block">
          <div className="border-b border-slate-700/60 px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Market Watch</p>
            <p className="mt-2 text-lg font-black text-white">Choose a symbol</p>
            <p className="mt-1 text-sm text-slate-400">The chart and order ticket update together when you switch instruments.</p>
          </div>
          <TerminalAssetList
            activeSymbol={activeSymbol}
            onSelectSymbol={onSymbolChange}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            marketData={marketData}
            instruments={instruments}
            categories={categories}
          />
        </aside>

        <div className="flex min-h-[30rem] flex-col gap-4">
          <section className="overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230]">
            <div className="flex flex-col gap-4 border-b border-slate-700/60 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Live Chart</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="text-2xl font-black uppercase tracking-tight text-white">{activeSymbolLabel}.</p>
                  <p className={`text-xl font-black ${chartTone}`}>{chartChange >= 0 ? '+' : ''}{chartChange.toFixed(2)}%</p>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredPositions.length} open position{filteredPositions.length === 1 ? '' : 's'} and {filteredOrders.length} pending order{filteredOrders.length === 1 ? '' : 's'} on this symbol.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-2xl bg-rose-500 px-4 py-3 text-white shadow-lg shadow-rose-500/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-100">Sell</p>
                  <p className="mt-1 text-2xl font-black leading-none">{bidPrice}</p>
                </div>
                <div className="rounded-2xl bg-teal-500 px-4 py-3 text-white shadow-lg shadow-teal-500/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-100">Buy</p>
                  <p className="mt-1 text-2xl font-black leading-none">{askPrice}</p>
                </div>
                <button className="rounded-2xl border border-slate-700 px-3 py-3 text-slate-300 transition-colors hover:border-slate-500 hover:text-white">
                  <FaRegStar size={16} />
                </button>
                <button className="rounded-2xl border border-slate-700 px-3 py-3 text-slate-300 transition-colors hover:border-slate-500 hover:text-white">
                  <FaBell size={16} />
                </button>
              </div>
            </div>

            <div className="h-[22rem] sm:h-[28rem] xl:h-[34rem]">
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

          <section className="flex min-h-[24rem] flex-col overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230]">
            <div className="border-b border-slate-700/60 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Activity</p>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {deskTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDeskTab(tab.id)}
                    className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
                      deskTab === tab.id
                        ? 'bg-white text-[#171a26]'
                        : 'bg-[#171a26] text-slate-300 hover:bg-white/5 hover:text-white'
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

            <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
              {renderDeskContent()}
            </div>
          </section>
        </div>

        <aside className="min-h-[30rem] lg:col-span-2 xl:col-span-1 xl:col-start-3">
          <div className="mb-4 rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230] px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Order Ticket</p>
            <p className="mt-2 text-lg font-black text-white">Place a trade with fewer steps</p>
            <p className="mt-1 text-sm text-slate-400">Execution price, margin, and order type stay in sync with the selected instrument.</p>
          </div>

          <div className="xl:sticky xl:top-4">
            <OrderPanel
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
        </aside>
      </div>
    </div>
  );
};

export default TradingTab;
