// frontend/src/components/dashboard/TradingTab.jsx
import React, { useState, useEffect } from 'react';
import TradingViewWidget from '../trading/TradingViewWidget';
import OrderBook from '../trading/OrderBook';
import OrderPanel from '../trading/OrderPanel';
import PositionsTable from '../trading/PositionsTable';
import OpenOrders from '../trading/OpenOrders';
import { useTheme } from '../../context/ThemeContext';
import { FaChartLine } from 'react-icons/fa';

const TradingTab = ({ 
  positions = [],
  orders = [],
  marketData = {},
  onPlaceOrder = () => {},
  onClosePosition = () => {},
  onCancelOrder = () => {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState('positions');
  const [activeInterval, setActiveInterval] = useState('1M');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors">
      {/* Main Execution Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Main Chart Area */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Chart Section - Professional Glassmorphism */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/20 group transition-all duration-300">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                   <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em] italic transition-colors">Real-Time Market Terminal</h3>
                </div>
                <div className="hidden sm:flex space-x-2">
                   {['1M', '5M', '15M', '1H', '1D'].map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveInterval(t)}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-xl border transition-all ${
                          activeInterval === t
                            ? 'bg-slate-900 text-white dark:bg-gold-500 dark:text-slate-900 border-slate-900 dark:border-gold-500 shadow-xl'
                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 border-transparent hover:border-slate-100 dark:hover:border-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                   ))}
                </div>
             </div>
             <div 
               className="relative lg:static" 
               style={{ height: isMobile ? '350px' : isTablet ? '400px' : '550px' }}
             >
               <TradingViewWidget 
                 symbol="BTCUSD" 
                 theme={theme} 
                 interval={activeInterval}
                 onIntervalChange={setActiveInterval}
                 positions={positions} 
               />
             </div>
          </div>

          {/* Expanded Depth Terminal (Takes full width under Chart) */}
          <div className="w-full transition-all duration-300">
             <OrderBook symbol="BTCUSD" />
          </div>
        </div>

        {/* Right Column: Order Execution Panel */}
        <div className="col-span-1 lg:col-span-4 xl:col-span-3 h-full">
          <div className="lg:sticky lg:top-28">
            <OrderPanel 
              onSubmit={onPlaceOrder} 
              symbol="BTCUSD"
              marketData={marketData}
            />
          </div>
        </div>
      </div>

      {/* Operations Panel (Positions & Orders) */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-all duration-300">
        <div className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'positions', label: 'Open Positions', count: positions.length },
              { id: 'orders', label: 'Limit Orders', count: orders.length },
              { id: 'history', label: 'Trade Journal', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 sm:px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300 flex items-center whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/10 translate-y-[-2px]'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-3 w-5 h-5 flex items-center justify-center rounded-full text-[9px] ${
                    activeSubTab === tab.id ? 'bg-slate-900 dark:bg-slate-800 text-gold-500 shadow-2xl shadow-slate-900/40 transform scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {activeSubTab === 'positions' && (
            positions.length > 0 ? (
              <PositionsTable 
                positions={positions}
                onClose={onClosePosition}
                compact={isMobile}
              />
            ) : (
              <div className="text-center py-24 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-200 dark:text-slate-700 mb-6 border-2 border-dashed border-slate-100 dark:border-slate-700">
                   <FaChartLine size={24} />
                </div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tight mb-1 transition-colors">No Active Positions</h4>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium transition-colors">Your terminal history is waiting for your next move.</p>
              </div>
            )
          )}
          {activeSubTab === 'orders' && (
            orders.length > 0 ? (
              <OpenOrders 
                orders={orders}
                onCancel={onCancelOrder}
                compact={isMobile}
              />
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">No Pending Executions</p>
              </div>
            )
          )}
          {activeSubTab === 'history' && (
            <div className="text-center py-20 flex flex-col items-center">
                <h4 className="text-lg font-black text-slate-900 dark:text-white italic mb-2 tracking-tight uppercase transition-colors">Journal coming soon</h4>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold tracking-widest uppercase">Performance metrics are building...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingTab;
