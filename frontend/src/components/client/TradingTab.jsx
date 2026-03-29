// frontend/src/components/dashboard/TradingTab.jsx
import React, { useState, useEffect } from 'react';
import TradingViewWidget from '../trading/TradingViewWidget';
import OrderBook from '../trading/OrderBook';
import OrderForm from '../trading/OrderForm';
import PositionsTable from '../trading/PositionsTable';
import OpenOrders from '../trading/OpenOrders';

const TradingTab = ({ 
  positions = [],
  orders = [],
  onPlaceOrder = () => {},
  onClosePosition = () => {},
  onCancelOrder = () => {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState('positions');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Execution Terminal */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-12'} gap-8 items-start`}>
        {/* Left Column: Chart & Market Depth */}
        <div className={isMobile ? 'col-span-1' : 'lg:col-span-9 space-y-8'}>
          {/* Chart Section - Professional Glassmorphism */}
          <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 group">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center space-x-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                   <h3 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] italic">Real-Time Market Terminal</h3>
                </div>
                <div className="hidden sm:flex space-x-2">
                   {['1M', '5M', '15M', '1H', '1D'].map(t => (
                      <button key={t} className="px-3 py-1.5 text-[10px] font-black text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all">{t}</button>
                   ))}
                </div>
             </div>
             <div 
               className="relative" 
               style={{ height: isMobile ? '350px' : isTablet ? '400px' : '550px' }}
             >
               <TradingViewWidget symbol="BTCUSD" theme="light" />
             </div>
          </div>

          {/* Depth Area */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
             <OrderBook symbol="BTCUSD" />
          </div>
        </div>

        {/* Right Column: Execution Panel */}
        <div className={isMobile ? 'col-span-1' : 'lg:col-span-3 h-full'}>
          <div className="sticky top-28">
            <OrderForm 
              onSubmit={onPlaceOrder} 
              symbol="BTCUSD"
            />
          </div>
        </div>
      </div>

      {/* Operations Panel (Positions & Orders) */}
      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="border-b border-slate-50 bg-slate-50/50 p-4">
          <div className="flex space-x-2">
            {[
              { id: 'positions', label: 'Open Positions', count: positions.length },
              { id: 'orders', label: 'Limit Orders', count: orders.length },
              { id: 'history', label: 'Trade Journal', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-300 flex items-center ${
                  activeSubTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 translate-y-[-2px]'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-3 w-5 h-5 flex items-center justify-center rounded-full text-[9px] ${
                    activeSubTab === tab.id ? 'bg-slate-900 text-gold-500 shadow-2xl shadow-slate-900/40 transform scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {activeSubTab === 'positions' && (
            positions.length > 0 ? (
              <PositionsTable 
                positions={positions}
                onClose={onClosePosition}
                compact={isMobile}
              />
            ) : (
              <div className="text-center py-24 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 border-2 border-dashed border-slate-100">
                   <FaChartLine size={24} />
                </div>
                <h4 className="text-xl font-black text-slate-900 italic tracking-tight mb-1">No Active Positions</h4>
                <p className="text-slate-400 text-sm font-medium">Your terminal history is waiting for your next move.</p>
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
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No Pending Executions</p>
              </div>
            )
          )}
          {activeSubTab === 'history' && (
            <div className="text-center py-20 flex flex-col items-center">
                <h4 className="text-lg font-black text-slate-900 italic mb-2 tracking-tight uppercase">Journal coming soon</h4>
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Performance metrics are building...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingTab;