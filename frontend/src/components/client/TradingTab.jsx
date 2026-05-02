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
      <div className="mb-4 grid gap-3 rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230] px-4 py-3 lg:grid-cols-7">
        {summaryMetrics.map((metric) => (
          <div key={metric.key} className="rounded-2xl border border-transparent px-2 py-1.5 transition-colors hover:border-slate-700/70">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-white">
              {metric.key === 'marginLevel' ? formatMetricValue(metric.key, metric.value) : `$${formatMetricValue(metric.key, metric.value)}`}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-3 flex gap-2 lg:hidden">
        {[
          { id: 'markets', label: 'Markets', icon: FaListUl },
          { id: 'chart', label: 'Chart', icon: FaChartLine },
          { id: 'trade', label: 'Trade', icon: FaBolt },
          { id: 'portfolio', label: 'Orders', icon: FaHistory },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveMobileView(view.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
              activeMobileView === view.id
                ? 'bg-teal-500 text-white'
                : 'bg-[#1f2230] text-slate-400'
            }`}
          >
            <view.icon size={11} />
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      <div className="grid flex-1 gap-4 lg:grid-cols-[28rem_minmax(0,1fr)_20rem]">
        <div className={`${activeMobileView === 'markets' || !isMobile ? 'block' : 'hidden'} min-h-[28rem] overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230]`}>
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

        <div className={`${activeMobileView === 'chart' || activeMobileView === 'portfolio' || !isMobile ? 'flex' : 'hidden'} min-h-[30rem] flex-col gap-4`}>
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-[#171a26] text-[9px] font-black uppercase leading-none text-slate-200">
                  <span>{activeSymbolLabel.slice(0, 3)}</span>
                  <span>{activeSymbolLabel.slice(-3)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-black uppercase tracking-tight">{activeSymbolLabel}.</p>
                    <p className={`text-2xl font-black ${chartTone}`}>{chartChange >= 0 ? '+' : ''}{chartChange.toFixed(2)}%</p>
                  </div>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {filteredPositions.length} open position{filteredPositions.length === 1 ? '' : 's'} on this symbol
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

            <div className="h-[27rem] lg:h-[32rem]">
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

          <div className={`${activeMobileView === 'portfolio' || !isMobile ? 'flex' : 'hidden'} min-h-[24rem] flex-col overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-[#1f2230]`}>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/60 px-3 py-3">
              {deskTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDeskTab(tab.id)}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-black transition-all ${
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

        <div className={`${activeMobileView === 'trade' || !isMobile ? 'block' : 'hidden'} min-h-[30rem]`}>
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
