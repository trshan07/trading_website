import React, { useCallback, useMemo, useState } from 'react';
import { FaBolt, FaChartLine, FaHistory, FaListUl } from 'react-icons/fa';
import RealTimeChart from '../trading/RealTimeChart';
import OrderPanel from '../trading/OrderPanel';
import PositionsTable from '../trading/PositionsTable';
import TerminalAssetList from '../trading/TerminalAssetList';
import { useTheme } from '../../context/ThemeContext';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol, normalizeSymbol } from '../../utils/marketSymbols';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';

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
  const quoteSnapshot = useMemo(() => getDisplayQuoteSnapshot({
    symbol: activeSymbol,
    instrument: selectedInstrument,
    marketData,
  }), [activeSymbol, marketData, selectedInstrument]);
  const bidPrice = quoteSnapshot.bidLabel;
  const askPrice = quoteSnapshot.askLabel;
  const activeSymbolLabel = formatInstrumentDisplaySymbol(activeSymbol, { withSlash: true });

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[500px] lg:min-h-[1220px] -mx-4 md:-mx-10 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
      <div className="lg:hidden flex items-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 p-2">
        {[
          { id: 'markets', label: 'Markets', icon: FaListUl },
          { id: 'chart', label: 'Chart', icon: FaChartLine },
          { id: 'trade', label: 'Trade', icon: FaBolt },
          { id: 'portfolio', label: 'Positions', icon: FaHistory }
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
            <div className="flex-1 flex flex-col px-4 py-4 min-w-0">
              <div className={`flex-1 min-h-[520px] rounded-[2rem] overflow-hidden border shadow-2xl ${
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
                  closedTrades={closedTrades}
                  activeIntent={activeOrderIntent}
                  livePrice={Number(selectedInstrument.price || 0)}
                  initialPrice={Number(selectedInstrument.price || baseInstrument?.price || 100)}
                  isVisible={!isMobile || activeMobileView === 'chart'}
                />
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
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  Bid {bidPrice} | Ask {askPrice}
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20 text-[9px] font-black uppercase tracking-widest">
                1:{maxLeverage}
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
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <FaChartLine size={11} className="text-gold-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
              Positions
            </span>
          </div>
          <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-black uppercase tracking-widest">
            {positions.length} open
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {positions.length > 0 ? (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingTab;
