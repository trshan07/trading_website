import React, { useState, useCallback } from 'react';
import RealTimeChart from '../trading/RealTimeChart';
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
  const [chartMode, setChartMode] = useState('advanced');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const { theme } = useTheme();

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 1024;
  const selectedInstrument = instruments.find((instrument) => instrument.symbol === activeSymbol);
  const handleIntentChange = useCallback((intent) => setActiveOrderIntent(intent), []);
  const matchingPositionCount = positions.filter(
    (position) => position?.symbol?.replace(/[^A-Z]/g, '') === activeSymbol.replace(/[^A-Z]/g, '')
  ).length;

  const switchChartMode = (mode) => {
    setChartMode(mode);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setActiveMobileView('chart');
    }
  };

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
            <div className={`flex items-center justify-end gap-2 px-3 py-1.5 border-b flex-shrink-0 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`text-[8px] font-black uppercase tracking-widest ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}>Chart Mode:</span>
              <button
                onClick={() => switchChartMode('advanced')}
                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                  chartMode === 'advanced'
                    ? 'bg-gold-500 text-slate-900 shadow-md'
                    : theme === 'dark'
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                Advanced
              </button>
              <button
                onClick={() => switchChartMode('execution')}
                title="Execution chart"
                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                  chartMode === 'execution'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : theme === 'dark'
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-200 text-slate-500 hover:text-slate-900'
                }`}
              >
                Execution {matchingPositionCount > 0 && (
                  <span className="ml-1 bg-white text-emerald-600 text-[7px] px-1 rounded-full font-black">
                    {matchingPositionCount}
                  </span>
                )}
              </button>
            </div>

            {chartMode === 'advanced' ? (
              <div className="flex-1 flex flex-col">
                <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b ${
                  theme === 'dark'
                    ? 'bg-gold-500/10 text-gold-300 border-gold-500/20'
                    : 'bg-gold-50 text-gold-700 border-gold-200'
                }`}>
                  Advanced mode is TradingView for analysis. Use execution mode when you need the chart, markets list, and order panel locked to the same live platform price.
                </div>
                <TradingViewWidget
                  key={`advanced-${activeSymbol}-${theme}`}
                  symbol={activeSymbol}
                  instrument={selectedInstrument}
                  theme={theme}
                  activeIntent={activeOrderIntent}
                  positions={positions}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b ${
                  theme === 'dark'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Execution mode is the live trading chart. It uses the same Yahoo/Binance platform feed as the markets list and order panel for the tightest sync available in the app.
                </div>
                <RealTimeChart
                  key={`execution-${activeSymbol}-${theme}`}
                  symbol={activeSymbol}
                  theme={theme}
                  instrument={selectedInstrument}
                  positions={positions}
                  activeIntent={activeOrderIntent}
                  livePrice={marketData[activeSymbol]?.price || selectedInstrument?.price || 0}
                  initialPrice={instruments.find((instrument) => instrument.symbol === activeSymbol)?.price || 100}
                />
              </div>
            )}
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
