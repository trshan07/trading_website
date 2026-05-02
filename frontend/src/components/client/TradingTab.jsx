import React, { useMemo, useState } from 'react';
import { FaBell, FaBolt, FaChartLine, FaHistory, FaListUl, FaRegStar } from 'react-icons/fa';
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

const formatMetricValue = (key, value) => {
  if (key === 'marginLevel') {
    return `${Number(value || 0).toFixed(2)}%`;
  }

  return formatCurrency(value);
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
  const [activeMobileView, setActiveMobileView] = useState('chart');
  const [deskTab, setDeskTab] = useState('positions');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
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
  const showMarkets = !isMobile || activeMobileView === 'markets';
  const showChartWorkspace = !isMobile || activeMobileView === 'chart' || activeMobileView === 'portfolio';
  const showTradePanel = !isMobile || activeMobileView === 'trade';
  const showPortfolioPanel = !isMobile || activeMobileView === 'portfolio';

  const summaryMetrics = [
    { key: 'credit', label: 'Credit', value: portfolio.credit },
    { key: 'equity', label: 'Equity', value: portfolio.equity },
    { key: 'dailyPnL', label: 'P/L', value: portfolio.dailyPnL },
    { key: 'freeMargin', label: 'Free margin', value: portfolio.freeMargin },
    { key: 'margin', label: 'Used Margin', value: portfolio.margin },
    { key: 'marginLevel', label: 'Margin level', value: portfolio.marginLevel },
    { key: 'totalBalance', label: 'Balance', value: portfolio.totalBalance },
  ];

  const deskTabs = [
    { id: 'positions', label: `Positions ${positions.length ? positions.length : ''}`.trim() },
    { id: 'orders', label: 'Pending Orders' },
    { id: 'history', label: 'Positions History' },
    { id: 'alerts', label: 'Price Alerts' },
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
      <div className="mb-4 rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230] px-3 py-3 sm:px-4">
        <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
        {summaryMetrics.map((metric) => (
            <div
              key={metric.key}
              className="min-w-[9.5rem] rounded-2xl border border-slate-700/40 bg-[#171a26] px-3 py-2.5 transition-colors hover:border-slate-600/70 lg:min-w-0 lg:border-transparent lg:bg-transparent lg:px-2 lg:py-1.5"
            >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
              <p className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
              {metric.key === 'marginLevel' ? formatMetricValue(metric.key, metric.value) : `$${formatMetricValue(metric.key, metric.value)}`}
            </p>
          </div>
        ))}
        </div>
      </div>

      <div className="mb-3 rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230] px-4 py-4 lg:hidden">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Instrument</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="truncate text-2xl font-black uppercase tracking-tight text-white">{activeSymbolLabel}.</p>
              <span className={`text-lg font-black ${chartTone}`}>
                {chartChange >= 0 ? '+' : ''}{chartChange.toFixed(2)}%
              </span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-400">
              {filteredPositions.length} open position{filteredPositions.length === 1 ? '' : 's'} and {filteredOrders.length} pending order{filteredOrders.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="grid min-w-[8.5rem] grid-cols-2 gap-2">
            <div className="rounded-2xl bg-rose-500 px-3 py-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-100">Sell</p>
              <p className="mt-1 text-lg font-black leading-none text-white">{bidPrice}</p>
            </div>
            <div className="rounded-2xl bg-teal-500 px-3 py-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-100">Buy</p>
              <p className="mt-1 text-lg font-black leading-none text-white">{askPrice}</p>
            </div>
          </div>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1">
        {[
          { id: 'markets', label: 'Markets', icon: FaListUl },
          { id: 'chart', label: 'Chart', icon: FaChartLine },
          { id: 'trade', label: 'Trade', icon: FaBolt },
            { id: 'portfolio', label: 'Activity', icon: FaHistory },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveMobileView(view.id)}
              className={`flex min-w-[7.25rem] flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
              activeMobileView === view.id
                ? 'bg-teal-500 text-white'
                  : 'bg-[#171a26] text-slate-400'
            }`}
          >
            <view.icon size={11} />
            <span>{view.label}</span>
          </button>
        ))}
        </div>
      </div>

      <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)_minmax(19rem,21rem)]">
        <div className={`${showMarkets ? 'block' : 'hidden'} min-h-[28rem] overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230]`}>
          <TerminalAssetList
            activeSymbol={activeSymbol}
            onSelectSymbol={(nextSymbol) => {
              onSymbolChange(nextSymbol);
              if (isMobile) {
                setActiveMobileView('chart');
              }
            }}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            marketData={marketData}
            instruments={instruments}
            categories={categories}
          />
        </div>

        <div className={`${showChartWorkspace ? 'flex' : 'hidden'} min-h-[30rem] flex-col gap-4`}>
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230]">
            <div className="hidden flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 px-4 py-3 lg:flex">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-[#171a26] text-[9px] font-black uppercase leading-none text-slate-200">
                  <span>{activeSymbolLabel.slice(0, 3)}</span>
                  <span>{activeSymbolLabel.slice(-3)}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-2xl font-black uppercase tracking-tight">{activeSymbolLabel}.</p>
                    <p className={`text-2xl font-black ${chartTone}`}>{chartChange >= 0 ? '+' : ''}{chartChange.toFixed(2)}%</p>
                  </div>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {filteredPositions.length} open position{filteredPositions.length === 1 ? '' : 's'} and {filteredOrders.length} pending order{filteredOrders.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-2xl bg-rose-500 px-4 py-3 text-white shadow-lg shadow-rose-500/20">
                  <p className="text-xs font-black uppercase tracking-[0.18em]">Sell</p>
                  <p className="text-3xl font-black leading-none">{bidPrice}</p>
                </div>
                <div className="rounded-2xl bg-teal-500 px-4 py-3 text-white shadow-lg shadow-teal-500/20">
                  <p className="text-xs font-black uppercase tracking-[0.18em]">Buy</p>
                  <p className="text-3xl font-black leading-none">{askPrice}</p>
                </div>
                <button className="rounded-2xl border border-slate-700 px-3 py-3 text-slate-300 transition-colors hover:border-slate-500 hover:text-white">
                  <FaRegStar size={16} />
                </button>
                <button className="rounded-2xl border border-slate-700 px-3 py-3 text-slate-300 transition-colors hover:border-slate-500 hover:text-white">
                  <FaBell size={16} />
                </button>
              </div>
            </div>

            <div className="h-[22rem] sm:h-[25rem] lg:h-[32rem]">
              <TradingViewWidget
                key={`terminal-${activeSymbol}-${theme}`}
                symbol={activeSymbol}
                theme={theme}
                instrument={selectedInstrument}
                positions={positions}
                marketStatus="LIVE MARKET DATA"
              />
            </div>
          </div>

          <div className={`${showPortfolioPanel ? 'flex' : 'hidden'} min-h-[24rem] flex-col overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230]`}>
            <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-700/60 px-3 py-3">
              {deskTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDeskTab(tab.id)}
                    className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
                    deskTab === tab.id
                      ? 'bg-white text-[#171a26]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
              {renderDeskContent()}
            </div>
          </div>
        </div>

        <div className={`${showTradePanel ? 'block' : 'hidden'} min-h-[30rem] xl:sticky xl:top-4 xl:self-start`}>
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
      </div>
    </div>
  );
};

export default TradingTab;
