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
    <div className="-mx-4 flex min-h-[calc(100vh-10rem)] flex-col bg-[#171a26] px-4 pb-6 pt-4 text-white md:-mx-10 md:px-10 font-sans">
      {isMobile && (
        <section className="mb-4 rounded-[1.5rem] border border-slate-700/70 bg-gradient-to-br from-[#202537] to-[#181d2a] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
          <button
            onClick={() => setShowMobileMarkets((current) => !current)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-700/60 bg-[#161b27] px-4 py-3 text-left"
          >
            <div>
              <p className="font-display text-base font-bold tracking-tight text-white">Watchlist</p>
              <p className="mt-1 text-xs text-slate-400">Open markets and switch the active chart symbol.</p>
            </div>
            {showMobileMarkets ? <FaChevronUp className="text-slate-400" /> : <FaChevronDown className="text-slate-400" />}
          </button>

          {showMobileMarkets && (
            <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-700/60 bg-[#161b27]">
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
        <aside className="hidden min-h-[28rem] overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-gradient-to-b from-[#1f2433] to-[#171b28] shadow-[0_24px_60px_rgba(0,0,0,0.32)] lg:block">
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
          <section className="overflow-hidden rounded-[1.75rem] border border-slate-700/70 bg-gradient-to-b from-[#1f2434] to-[#171b28] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
            <div className="flex flex-col gap-4 border-b border-slate-700/60 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/70">Live Chart</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="font-display text-2xl font-semibold uppercase tracking-tight text-white">{activeSymbolLabel}.</p>
                  <p className={`text-lg font-semibold tabular-nums ${chartTone}`}>{chartChange >= 0 ? '+' : ''}{chartChange.toFixed(2)}%</p>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredPositions.length} open position{filteredPositions.length === 1 ? '' : 's'} and {filteredOrders.length} pending order{filteredOrders.length === 1 ? '' : 's'} on this symbol.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/12 px-4 py-3 text-white shadow-lg shadow-rose-500/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-200/80">Sell</p>
                  <p className="mt-1 text-2xl font-semibold leading-none tabular-nums text-rose-300">{bidPrice}</p>
                </div>
                <div className="rounded-2xl border border-teal-400/30 bg-teal-400/12 px-4 py-3 text-white shadow-lg shadow-teal-500/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-100/80">Buy</p>
                  <p className="mt-1 text-2xl font-semibold leading-none tabular-nums text-teal-200">{askPrice}</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-[#161b27] px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Spread</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-slate-100">{spreadLabel}</p>
                </div>
                <button className="rounded-2xl border border-slate-700 bg-[#161b27] px-3 py-3 text-slate-300 transition-colors hover:border-slate-500 hover:text-white">
                  <FaRegStar size={16} />
                </button>
                <button className="rounded-2xl border border-slate-700 bg-[#161b27] px-3 py-3 text-slate-300 transition-colors hover:border-slate-500 hover:text-white">
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

          <section className="flex min-h-[24rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-700/70 bg-gradient-to-b from-[#1f2434] to-[#171b28] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
            <div className="border-b border-slate-700/60 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300/70">Activity</p>
                  <p className="mt-1 font-display text-xl font-semibold text-white">Orders and trade history</p>
                </div>
                <div className="hidden rounded-full border border-slate-700 bg-[#161b27] px-3 py-1 text-xs font-semibold text-slate-400 sm:block">
                  Balance {formatCurrency(portfolio.totalBalance)}
                </div>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {deskTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDeskTab(tab.id)}
                    className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
                      deskTab === tab.id
                        ? 'bg-gradient-to-r from-slate-100 to-white text-[#171a26] shadow-lg'
                        : 'bg-[#161b27] text-slate-300 hover:bg-white/5 hover:text-white'
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
