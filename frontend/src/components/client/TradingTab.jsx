import React, { useState } from 'react';
import TradingViewWidget from '../trading/TradingViewWidget';
import OrderPanel from '../trading/OrderPanel';
import PositionsTable from '../trading/PositionsTable';
import OpenOrders from '../trading/OpenOrders';
import TerminalAssetList from '../trading/TerminalAssetList';
import { useTheme } from '../../context/ThemeContext';
import { FaChartLine, FaHistory, FaListUl, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TradingTab = ({ 
  positions = [],
  orders = [],
  marketData = {},
  onPlaceOrder = () => {},
  onClosePosition = () => {},
  onCancelOrder = () => {},
  activeSymbol = 'BTCUSDT',
  onSymbolChange = () => {},
  favorites = [],
  onToggleFavorite = () => {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState('positions');
  const [showSidebar, setShowSidebar] = useState(true);
  const { theme } = useTheme();

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[900px] lg:min-h-[1050px] -mx-4 md:-mx-10 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-500">
      {/* Top Section: Three-column Terminal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto lg:overflow-hidden">
        
        {/* Column 1: Asset List (Left) */}
        {showSidebar && (
          <div className="block w-full lg:w-72 xl:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 transition-all duration-300">
            <TerminalAssetList 
              activeSymbol={activeSymbol}
              onSelectSymbol={onSymbolChange}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              onClose={() => setShowSidebar(false)}
            />
          </div>
        )}

        {/* Column 2: Center Chart */}
        <div className="flex-1 min-h-[400px] lg:min-h-0 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 relative">
          
          {/* Asset List Open Button */}
          {!showSidebar && (
            <div className="absolute top-4 left-4 z-50">
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
          <div className="flex-1 relative group">
            <TradingViewWidget 
              symbol={activeSymbol} 
              theme={theme} 
            />
          </div>
        </div>

        {/* Column 3: Order Panel (Right) */}
        <div className="block w-full lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 lg:overflow-y-auto custom-scrollbar">
          <OrderPanel 
            onSubmit={onPlaceOrder} 
            symbol={activeSymbol}
            marketData={marketData}
          />
        </div>
      </div>

      {/* Bottom Section: Portfolio Management */}
      <div className="h-64 flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl z-10 transition-colors">
        <div className="flex items-center space-x-1 px-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          {[
            { id: 'positions', label: 'Positions', count: positions.length, icon: FaChartLine },
            { id: 'orders', label: 'Pending', count: orders.length, icon: FaListUl },
            { id: 'history', label: 'History', count: 0, icon: FaHistory }
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
              />
            ) : (
              <div className="text-center py-10">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">No Pending Orders</p>
              </div>
            )
          )}
          {activeSubTab === 'history' && (
            <div className="text-center py-10">
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest italic">Trade Journal is empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingTab;
