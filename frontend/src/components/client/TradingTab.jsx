import React, { useCallback, useMemo, useState } from 'react';
import { FaBell, FaBolt, FaChartLine, FaHistory, FaListUl, FaShieldAlt, FaSignal, FaWallet } from 'react-icons/fa';
import RealTimeChart from '../trading/RealTimeChart';
import OrderPanel from '../trading/OrderPanel';
import PositionsTable from '../trading/PositionsTable';
import OpenOrders from '../trading/OpenOrders';
import OrderBook from '../trading/OrderBook';
import TerminalAssetList from '../trading/TerminalAssetList';
import TradeHistory from '../trading/TradeHistory';
import PriceAlertsTab from '../trading/PriceAlertsTab';
import SymbolInfoWidget from '../trading/SymbolInfoWidget';
import TechnicalAnalysisWidget from '../trading/TechnicalAnalysisWidget';
import MarketQuotesWidget from '../trading/MarketQuotesWidget';
import CompanyProfileWidget from '../trading/CompanyProfileWidget';
import { useTheme } from '../../context/ThemeContext';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol, normalizeSymbol } from '../../utils/marketSymbols';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';

const formatMoney = (value = 0, digits = 2) => Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
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
  transactions = [],
  instruments = [],
  categories = [],
  maxLeverage = 100
}) => {
  const [activeSubTab, setActiveSubTab] = useState('positions');
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeMobileView, setActiveMobileView] = useState('chart');
  const [activeOrderIntent, setActiveOrderIntent] = useState({ side: 'buy', type: 'market' });
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
  const handleIntentChange = useCallback((intent) => setActiveOrderIntent(intent), []);
  const selectedSymbolPositions = useMemo(
    () => positions.filter((position) => normalizeSymbol(position?.symbol) === normalizedActiveSymbol),
    [normalizedActiveSymbol, positions]
  );
  const selectedSymbolOrders = useMemo(
    () => orders.filter((order) => normalizeSymbol(order?.symbol) === normalizedActiveSymbol),
    [normalizedActiveSymbol, orders]
  );
  const matchingPositionCount = selectedSymbolPositions.length;
  const selectedSymbolPnl = selectedSymbolPositions.reduce((sum, position) => sum + (Number(position?.pnl) || 0), 0);
  const quoteSnapshot = useMemo(() => getDisplayQuoteSnapshot({
    symbol: activeSymbol,
    instrument: selectedInstrument,
    marketData,
  }), [activeSymbol, marketData, selectedInstrument]);
  const bidPrice = quoteSnapshot.bidLabel;
  const askPrice = quoteSnapshot.askLabel;
  const spreadLabel = quoteSnapshot.spreadLabel;
  const activeSymbolLabel = formatInstrumentDisplaySymbol(activeSymbol, { withSlash: true });
  const selectedCategory = selectedInstrument.category || 'Multi-Asset';
  const isStockLike = /stock|share|fund/i.test(selectedCategory);

  const marketCards = [
    {
      label: 'Mark',
      value: formatMoney(selectedInstrument.price || 0, selectedInstrument.precision),
      tone: selectedInstrument.lastDir === 'up'
        ? 'text-emerald-500'
        : selectedInstrument.lastDir === 'down'
          ? 'text-rose-500'
          : theme === 'dark'
            ? 'text-white'
            : 'text-slate-900',
    },
    {
      label: '24H Change',
      value: `${Number(selectedInstrument.change || 0) >= 0 ? '+' : ''}${Number(selectedInstrument.change || 0).toFixed(2)}%`,
      tone: Number(selectedInstrument.change || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500',
    },
    {
      label: 'Bid / Ask',
      value: `${bidPrice} / ${askPrice}`,
      tone: theme === 'dark' ? 'text-white' : 'text-slate-900',
    },
    {
      label: 'Spread',
      value: spreadLabel,
      tone: 'text-gold-500',
    },
    {
      label: 'Open Exposure',
      value: `${matchingPositionCount} position${matchingPositionCount === 1 ? '' : 's'}`,
      tone: theme === 'dark' ? 'text-white' : 'text-slate-900',
    },
    {
      label: 'Pending Orders',
      value: `${selectedSymbolOrders.length}`,
      tone: theme === 'dark' ? 'text-white' : 'text-slate-900',
    },
  ];

  const deskStats = [
    {
      label: 'Equity',
      value: `$${formatMoney(portfolio.equity || 0)}`,
      icon: FaWallet,
      tone: 'text-white',
    },
    {
      label: 'Free Margin',
      value: `$${formatMoney(portfolio.freeMargin || 0)}`,
      icon: FaShieldAlt,
      tone: Number(portfolio.freeMargin || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500',
    },
    {
      label: `${activeSymbolLabel} P&L`,
      value: `${selectedSymbolPnl >= 0 ? '+' : ''}$${formatMoney(selectedSymbolPnl || 0)}`,
      icon: FaChartLine,
      tone: selectedSymbolPnl >= 0 ? 'text-emerald-500' : 'text-rose-500',
    },
    {
      label: 'Watchlist',
      value: `${favorites.length} symbols`,
      icon: FaListUl,
      tone: theme === 'dark' ? 'text-white' : 'text-slate-900',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[500px] lg:min-h-[1220px] -mx-4 md:-mx-10 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
      <div className="lg:hidden flex items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 p-2">
        {[
          { id: 'markets', label: 'Markets', icon: FaListUl },
          { id: 'chart', label: 'Chart', icon: FaChartLine },
          { id: 'trade', label: 'Trade', icon: FaBolt },
          { id: 'portfolio', label: 'Portfolio', icon: FaHistory }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveMobileView(view.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeMobileView === view.id
                ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-lg'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <view.icon size={10} />
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      <div className={`flex-1 flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto lg:overflow-hidden relative ${activeMobileView === 'portfolio' ? 'hidden lg:flex' : 'flex'}`}>
        <div className={`
          ${activeMobileView === 'markets' ? 'block' : 'hidden'}
          lg:flex-shrink-0 w-full border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 transition-all duration-300 overflow-hidden
          ${showSidebar ? 'lg:block lg:w-72 xl:w-80' : 'lg:hidden'}
        `}>
          <TerminalAssetList
            activeSymbol={activeSymbol}
            onSelectSymbol={(nextSymbol) => {
              onSymbolChange(nextSymbol);
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setActiveMobileView('chart');
              }
            }}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            onClose={() => setShowSidebar(false)}
            marketData={marketData}
            instruments={instruments}
            categories={categories}
          />
        </div>

        <div className={`
          flex-1 ${activeMobileView === 'chart' ? 'flex' : 'hidden lg:flex'}
          min-h-[400px] lg:min-h-0 flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative
        `}>
          {!showSidebar && (
            <div className="absolute top-4 left-4 z-50 hidden lg:block">
              <button
                onClick={() => setShowSidebar(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg text-slate-700 dark:text-slate-300 hover:text-gold-500 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer"
                title="Show Asset List"
              >
                <FaListUl size={12} />
                <span>Markets</span>
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <div className={`px-4 py-4 border-b flex-shrink-0 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`}>Professional Execution Workspace</p>
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <span className={`text-lg font-black uppercase tracking-[0.25em] ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>{activeSymbolLabel}</span>
                    <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20 text-[10px] font-black uppercase tracking-widest">
                      {selectedCategory}
                    </span>
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                      quoteSnapshot.hasRealBidAsk
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                        : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                    }`}>
                      {quoteSnapshot.hasRealBidAsk ? 'Bid / Ask Feed' : 'Last Price Sync'}
                    </span>
                  </div>
                  <p className={`mt-2 text-[11px] ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Chart, order desk, watchlist, and portfolio widgets are all focused on the same live instrument.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: 'Positions', tab: 'positions' },
                    { label: 'Pending', tab: 'orders' },
                    { label: 'Alerts', tab: 'alerts' },
                    { label: showSidebar ? 'Hide Markets' : 'Show Markets', action: () => setShowSidebar((value) => !value) },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.tab) {
                          setActiveSubTab(item.tab);
                        }
                        if (item.action) {
                          item.action();
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        theme === 'dark'
                          ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-gold-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-gold-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 xl:grid-cols-6 gap-3">
                {marketCards.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border px-4 py-3 ${
                      theme === 'dark'
                        ? 'border-slate-800 bg-slate-950/80'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className={`text-[8px] font-black uppercase tracking-widest ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`}>{item.label}</p>
                    <p className={`mt-2 text-sm font-black ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b ${
              theme === 'dark'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              Professional terminal mode active for {activeSymbolLabel}. The main chart is now driven by your own backend history and live quote feeds.
            </div>

            <div className="flex-1 flex flex-col px-4 py-4 gap-4 min-w-0">
              <div className={`rounded-[2rem] overflow-hidden border shadow-2xl ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900'
                  : 'border-slate-200 bg-white'
              }`}>
                <RealTimeChart
                  key={`terminal-${activeSymbol}-${theme}`}
                  symbol={activeSymbol}
                  theme={theme}
                  instrument={selectedInstrument}
                  positions={positions}
                  activeIntent={activeOrderIntent}
                  livePrice={Number(selectedInstrument.price || 0)}
                  initialPrice={Number(selectedInstrument.price || baseInstrument?.price || 100)}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
                <div className="grid gap-4">
                  <div className={`rounded-[2rem] border overflow-hidden ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900'
                      : 'border-slate-200 bg-white'
                  }`}>
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">TradingView Symbol Info</p>
                      <p className="mt-1 text-xs font-black text-slate-900 dark:text-white">Snapshot for {activeSymbolLabel}</p>
                    </div>
                    <div className="h-[220px]">
                      <SymbolInfoWidget
                        symbol={activeSymbol}
                        instrument={selectedInstrument}
                        theme={theme}
                        height="220"
                      />
                    </div>
                  </div>

                  <div className={`rounded-[2rem] border overflow-hidden ${
                    theme === 'dark'
                      ? 'border-slate-800 bg-slate-900'
                      : 'border-slate-200 bg-white'
                  }`}>
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {isStockLike ? 'TradingView Company Profile' : 'TradingView Market Board'}
                      </p>
                      <p className="mt-1 text-xs font-black text-slate-900 dark:text-white">
                        {isStockLike ? 'Issuer context' : `${selectedCategory} peer watch`}
                      </p>
                    </div>
                    <div className="h-[320px]">
                      {isStockLike ? (
                        <CompanyProfileWidget
                          symbol={activeSymbol}
                          instrument={selectedInstrument}
                          theme={theme}
                          height="320"
                        />
                      ) : (
                        <MarketQuotesWidget
                          category={selectedCategory}
                          theme={theme}
                          height="320"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className={`rounded-[2rem] border overflow-hidden ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900'
                    : 'border-slate-200 bg-white'
                }`}>
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">TradingView Technicals</p>
                      <p className="mt-1 text-xs font-black text-slate-900 dark:text-white">Signal stack for {activeSymbolLabel}</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest">
                      Daily Bias
                    </div>
                  </div>
                  <div className="h-[544px]">
                    <TechnicalAnalysisWidget
                      symbol={activeSymbol}
                      instrument={selectedInstrument}
                      interval="1D"
                      theme={theme}
                      height="544"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`
          ${activeMobileView === 'trade' ? 'block' : 'hidden'}
          lg:block lg:w-[23rem] xl:w-[25rem] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 lg:overflow-y-auto custom-scrollbar
        `}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Execution Desk</p>
                <p className="mt-1 text-xs font-black text-slate-900 dark:text-white">{activeSymbolLabel}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20 text-[9px] font-black uppercase tracking-widest">
                1:{maxLeverage}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {deskStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                    <item.icon size={11} className="text-gold-500" />
                  </div>
                  <p className={`mt-2 text-sm font-black ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Feed Alignment</p>
                  <p className="mt-1 text-[11px] font-black text-slate-900 dark:text-white">Bid {bidPrice} | Ask {askPrice}</p>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                  <FaSignal size={10} />
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <OrderPanel
              onSubmit={onPlaceOrder}
              symbol={activeSymbol}
              marketData={marketData}
              instrument={selectedInstrument}
              portfolio={portfolio}
              onIntentChange={handleIntentChange}
              maxLeverage={maxLeverage}
              positions={positions}
              orders={orders}
            />
          </div>
        </div>
      </div>

      <div className={`
        ${activeMobileView === 'portfolio' ? 'flex-1' : 'h-64'}
        ${activeMobileView === 'portfolio' ? 'flex' : 'hidden lg:flex'}
        flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl z-10 transition-colors
      `}>
        <div className="flex items-center space-x-1 px-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 overflow-x-auto scrollbar-hide">
          {[
            { id: 'positions', label: 'Positions', count: positions.length, icon: FaChartLine },
            { id: 'orders', label: 'Pending', count: orders.length, icon: FaListUl },
            { id: 'book', label: 'Order Book', count: 0, icon: FaBolt },
            { id: 'history', label: 'History', count: closedTrades?.length || 0, icon: FaHistory },
            { id: 'alerts', label: 'Alerts', count: priceAlerts.length, icon: FaBell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 border-b-2 transition-all ${
                activeSubTab === tab.id
                  ? 'border-gold-500 text-slate-900 dark:text-gold-500 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon size={10} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[8px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeSubTab === 'positions' && (
            positions.length > 0 ? (
              <PositionsTable
                positions={positions}
                onClose={onClosePosition}
                onModify={onModifyPosition}
                compact={isMobile}
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">No Open Positions</p>
              </div>
            )
          )}
          {activeSubTab === 'orders' && (
            orders.length > 0 ? (
              <OpenOrders
                orders={orders}
                onCancel={onCancelOrder}
                onModify={onModifyOrder}
                compact={isMobile}
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">No Pending Orders</p>
              </div>
            )
          )}
          {activeSubTab === 'book' && (
            <OrderBook symbol={activeSymbol} />
          )}
          {activeSubTab === 'history' && (
            <TradeHistory trades={closedTrades} />
          )}
          {activeSubTab === 'alerts' && (
            <PriceAlertsTab
              alerts={priceAlerts}
              onCreateAlert={onCreateAlert}
              onDeleteAlert={onDeleteAlert}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingTab;
