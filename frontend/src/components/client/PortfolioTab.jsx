// frontend/src/components/client/PortfolioTab.jsx
import React from 'react';
import AdvancedRealTimeChart from '../trading/TradingViewWidget';
import { FaChartPie, FaWallet, FaArrowUp, FaArrowDown, FaCube, FaHistory, FaCheckCircle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const PortfolioTab = ({ portfolio = {}, positions = [], activityLogs = [] }) => {
  const { theme } = useTheme();
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors">
      {/* Equity Perspective Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="md:col-span-2 bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-slate-800 dark:border-slate-700 shadow-2xl shadow-slate-900/40 dark:shadow-black/40 relative overflow-hidden group transition-colors duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 blur-[100px] rounded-full translate-x-32 -translate-y-32"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h3 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-2.5 flex items-center italic">
                     <FaWallet className="mr-3" />
                     Capital Projection
                  </h3>
                  <p className="text-4xl font-black text-white italic tracking-tighter">
                     ${(portfolio?.equity ?? 0).toLocaleString()}
                  </p>
               </div>
               <div className="bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-2xl flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+6.5% Growth</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-800 dark:border-slate-700">
               <div>
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5">Free Liquidity</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">${(portfolio?.availableBalance ?? 0).toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5">Used Core</p>
                  <p className="text-xl font-black text-gold-500 italic tracking-tighter">${(portfolio?.margin ?? 0).toLocaleString()}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-between transition-colors duration-300">
            <div>
               <FaCube className="text-gold-500 mb-6 text-2xl" />
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Asset Diversity</p>
               <h4 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">14.2% Ratio</h4>
            </div>
            <div className="flex space-x-4 mt-6">
                {[1, 2, 3].map(i => (
                   <div key={i} className={`h-1.5 rounded-full flex-1 ${i === 1 ? 'bg-slate-900 dark:bg-gold-500 w-1/2' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                ))}
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 flex flex-col justify-between transition-colors duration-300">
            <div>
               <FaHistory className="text-slate-900 dark:text-gold-500 mb-6 text-2xl transition-colors" />
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Journal Activity</p>
               <h4 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">{activityLogs.length} Actions</h4>
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-6">
              Last entry: {activityLogs[0] ? new Date(activityLogs[0].created_at).toLocaleTimeString() : 'No entries'}
            </p>
        </div>
      </div>

      {/* Portfolio Charts & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Market Sync Chart (Requested) */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8 text-left">
           <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/20 group transition-colors duration-300">
              <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                 <div className="flex items-center space-x-3">
                    <FaChartPie className="text-gold-500" />
                    <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em] italic transition-colors">Portfolio Market Sync</h3>
                 </div>
                 <div className="hidden sm:flex items-center space-x-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                    <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tracking Global Indexes</span>
                 </div>
              </div>
              <div className={`${isMobile ? 'h-[350px]' : 'h-[500px]'} w-full bg-slate-50 dark:bg-slate-900 transition-colors`}>
                <AdvancedRealTimeChart symbol="BTCUSDT" theme={theme} />
              </div>
           </div>
           
           {/* Recent Position Snapshot */}
           <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-8 sm:mb-10 italic transition-colors">Core Holdings Hub</h4>
              <div className="space-y-4">
                 {positions.slice(0, 3).map((pos, idx) => {
                    const isBuy = (pos.type || pos.side || '').toUpperCase() === 'BUY';

                    return (
                    <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] gap-4 sm:gap-6 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300 transform hover:-translate-y-1">
                       <div className="flex items-center space-x-6">
                          <div className={`p-4 rounded-2xl ${isBuy ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'} shadow-sm border border-transparent group-hover:border-gold-500/20 transition-all`}>
                             {isBuy ? <FaArrowUp /> : <FaArrowDown />}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest transition-colors">{pos.symbol}</p>
                             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 italic lowercase tracking-tighter transition-colors">Quantity: {pos.quantity}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-12">
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">Value</p>
                             <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums italic transition-colors">${(pos.quantity * pos.currentPrice).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">Unrealized</p>
                             <p className={`text-sm font-black tabular-nums italic ${pos.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {pos.pnl >= 0 ? '+' : ''}{pos.pnl?.toLocaleString()}
                             </p>
                          </div>
                       </div>
                    </div>
                    );
                 })}
                 
                 {positions.length === 0 && (
                    <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">No Active Holdings To Display</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Portfolio Integrity Sidebar */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
           <div className="bg-slate-900 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-slate-800 dark:border-slate-700 shadow-2xl shadow-slate-900/40 dark:shadow-black/40 relative overflow-hidden group transition-colors duration-300 text-left">
              <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-8 sm:mb-10 italic">Integrity Nodes</h4>
              <div className="space-y-8">
                 {[
                    { id: 1, label: 'Vault Verification', status: 'Secured', color: 'text-emerald-400' },
                    { id: 2, label: 'Asset Custody', status: 'Distributed', color: 'text-gold-500' },
                    { id: 3, label: 'Audit Compliance', status: 'Verified_v2', color: 'text-emerald-400' }
                 ].map(item => (
                    <div key={item.id} className="flex items-center justify-between group/node pb-6 border-b border-white/5 dark:border-white/5 last:border-0">
                       <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/node:bg-gold-500 group-hover/node:text-white dark:group-hover/node:text-slate-900 transition-all">
                             {item.id}
                          </div>
                          <span className="text-[11px] font-black text-white italic tracking-tighter uppercase">{item.label}</span>
                       </div>
                       <div className={`flex items-center space-x-2 ${item.color}`}>
                          <FaCheckCircle size={10} className="animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest">{item.status}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300 text-left">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] mb-6 sm:mb-8 italic transition-colors">Journal Stream</h4>
              <div className="space-y-6">
                 {activityLogs.slice(0, 10).map((log, idx) => (
                    <div key={idx} className="flex flex-col space-y-1">
                       <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight transition-colors">{log.message}</p>
                       <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest italic transition-colors">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[8px] font-black text-gold-600 dark:text-gold-500 uppercase tracking-widest transition-colors">{log.type}</span>
                       </div>
                    </div>
                 ))}
                 {activityLogs.length === 0 && (
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">No Recent Activity</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTab;
