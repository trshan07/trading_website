import React, { useState, useCallback, useMemo } from 'react';
import TradingViewWidget from '../trading/TradingViewWidget';
import OrderPanel from '../trading/OrderPanel';
import PositionsTable from '../trading/PositionsTable';
import OpenOrders from '../trading/OpenOrders';
import OrderBook from '../trading/OrderBook';
import TerminalAssetList from '../trading/TerminalAssetList';
import { useTheme } from '../../context/ThemeContext';
import { FaChartLine, FaHistory, FaListUl, FaBell, FaBolt } from 'react-icons/fa';
import TradeHistory from '../trading/TradeHistory';
import PriceAlertsTab from '../trading/PriceAlertsTab';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol } from '../../utils/marketSymbols';
import { calculateSpreads } from '../../utils/spreadCalculator';

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
  const baseInstrument = instruments.find((instrument) => instrument.symbol === activeSymbol);
  const selectedInstrument = useMemo(() => buildInstrumentSnapshot({
    symbol: activeSymbol,
    instrument: baseInstrument || {},
    marketData,
  }), [activeSymbol, baseInstrument, marketData]);
  const handleIntentChange = useCallback((intent) => setActiveOrderIntent(intent), []);
  const matchingPositionCount = positions.filter(
    (position) => position?.symbol?.replace(/[^A-Z]/g, '') === activeSymbol.replace(/[^A-Z]/g, '')
  ).length;
  const { bidPrice: calcBid, askPrice: calcAsk, spreadAmt: calcSpread } = calculateSpreads(activeSymbol, selectedInstrument.price || 0, {
    category: selectedInstrument.category,
    precision: selectedInstrument.precision,
  });
  const hasRealBidAsk = selectedInstrument.useBidAsk !== false
    && Number.isFinite(selectedInstrument.bid)
    && Number.isFinite(selectedInstrument.ask);
  const bidPrice = hasRealBidAsk
    ? selectedInstrument.bid.toFixed(selectedInstrument.precision)
    : Number(selectedInstrument.price || calcBid).toFixed(selectedInstrument.precision);
  const askPrice = hasRealBidAsk
    ? selectedInstrument.ask.toFixed(selectedInstrument.precision)
    : Number(selectedInstrument.price || calcAsk).toFixed(selectedInstrument.precision);
  const spreadLabel = (hasRealBidAsk ? Math.abs(selectedInstrument.ask - selectedInstrument.bid) : Number(calcSpread) || 0)
    .toFixed(selectedInstrument.precision);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[500px] lg:min-h-[1050px] -mx-4 md:-mx-10 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
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

          <div className="flex-1 relative group flex flex-col">
            <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b flex-shrink-0 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <p className={`text-[8px] font-black uppercase tracking-widest ${
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }`}>Execution Workspace</p>
                <div className="mt-1 flex items-center gap-3 flex-wrap">
                  <span className={`text-sm font-black uppercase tracking-widest ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>{formatInstrumentDisplaySymbol(activeSymbol, { withSlash: true })}</span>
                  <span className={`text-sm font-black tabular-nums ${
                    selectedInstrument.lastDir === 'up'
                      ? 'text-emerald-500'
                      : selectedInstrument.lastDir === 'down'
                        ? 'text-rose-500'
                        : theme === 'dark'
                          ? 'text-slate-200'
                          : 'text-slate-700'
                  }`}>
                    {Number(selectedInstrument.price || 0).toLocaleString(undefined, {
                      minimumFractionDigits: selectedInstrument.precision,
                      maximumFractionDigits: selectedInstrument.precision,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: 'Bid', value: bidPrice },
                  { label: 'Ask', value: askPrice },
                  { label: 'Spread', value: spreadLabel },
                  { label: 'Open', value: matchingPositionCount },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`px-3 py-2 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <p className={`text-[8px] font-black uppercase tracking-widest ${
                      theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                    }`}>{item.label}</p>
                    <p className={`text-[11px] font-black mt-1 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b ${
                theme === 'dark'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Trading chart, market list, order ticket, and positions are locked to the same selected instrument for {formatInstrumentDisplaySymbol(activeSymbol, { withSlash: true })}.
              </div>
              <TradingViewWidget
                key={`terminal-${activeSymbol}-${theme}`}
                symbol={activeSymbol}
                theme={theme}
                instrument={selectedInstrument}
                positions={positions}
                marketStatus={selectedInstrument?.provider ? `${String(selectedInstrument.provider).toUpperCase()} / BINANCE FEED` : 'LIVE EXTERNAL MARKET FEED'}
              />
            </div>
          </div>
        </div>

        <div className={`
          ${activeMobileView === 'trade' ? 'block' : 'hidden'}
          lg:block lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 lg:overflow-y-auto custom-scrollbar
        `}>
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
