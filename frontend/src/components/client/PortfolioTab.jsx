// frontend/src/components/client/PortfolioTab.jsx
import React from 'react';
import AdvancedRealTimeChart from '../trading/TradingViewWidget';
import { FaChartPie, FaWallet, FaArrowUp, FaArrowDown, FaCube, FaHistory, FaCheckCircle } from 'react-icons/fa';

const PortfolioTab = ({ portfolio = {}, portfolioHistory = [], positions = [] }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Equity Perspective Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
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
            
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-800">
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Free Liquidity</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">${(portfolio?.availableBalance ?? 0).toLocaleString()}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Used Core</p>
                  <p className="text-xl font-black text- gold-500 italic tracking-tighter">${(portfolio?.usedMargin ?? 0).toLocaleString()}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
               <FaCube className="text-gold-500 mb-6 text-2xl" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asset Diversity</p>
               <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">14.2% Ratio</h4>
            </div>
            <div className="flex space-x-4 mt-6">
                {[1, 2, 3].map(i => (
                   <div key={i} className={`h-1.5 rounded-full flex-1 ${i === 1 ? 'bg-slate-900 w-1/2' : 'bg-slate-100'}`}></div>
                ))}
            </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
            <div>
               <FaHistory className="text-slate-900 mb-6 text-2xl" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Journal Activity</p>
               <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">{positions.length + 8} Actions</h4>
            </div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-6">Last entry: 4 mins ago</p>
        </div>
      </div>

      {/* Portfolio Charts & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Market Sync Chart (Requested) */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 group">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center space-x-3">
                    <FaChartPie className="text-gold-500" />
                    <h3 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] italic">Portfolio Market Sync</h3>
                 </div>
                 <div className="hidden sm:flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-100">
                    <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Global Indexes</span>
                 </div>
              </div>
              <div className="h-[500px] w-full bg-slate-50">
                <AdvancedRealTimeChart symbol="BTCUSDT" theme="light" />
              </div>
           </div>
           
           {/* Recent Position Snapshot */}
           <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-10 italic">Core Holdings Hub</h4>
              <div className="space-y-4">
                 {positions.slice(0, 3).map((pos, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] gap-6 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1">
                       <div className="flex items-center space-x-6">
                          <div className={`p-4 rounded-2xl ${pos.type === 'LONG' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} shadow-sm border border-transparent group-hover:border-gold-500/20 transition-all`}>
                             {pos.type === 'LONG' ? <FaArrowUp /> : <FaArrowDown />}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{pos.symbol}</p>
                             <p className="text-[10px] font-black text-slate-400 italic lowercase tracking-tighter">Quantity: {pos.quantity}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-12">
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Value</p>
                             <p className="text-sm font-black text-slate-900 tabular-nums italic">${(pos.quantity * pos.currentPrice).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Unrealized</p>
                             <p className={`text-sm font-black tabular-nums italic ${pos.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {pos.pnl >= 0 ? '+' : ''}{pos.pnl?.toLocaleString()}
                             </p>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {positions.length === 0 && (
                   <div className="text-center py-10 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Holdings To Display</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Portfolio Integrity Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
              <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.4em] mb-10 italic">Integrity Nodes</h4>
              <div className="space-y-8">
                 {[
                   { id: 1, label: 'Vault Verification', status: 'Secured', color: 'text-emerald-400' },
                   { id: 2, label: 'Asset Custody', status: 'Distributed', color: 'text-gold-500' },
                   { id: 3, label: 'Audit Compliance', status: 'Verified_v2', color: 'text-emerald-400' }
                 ].map(item => (
                   <div key={item.id} className="flex items-center justify-between group/node pb-6 border-b border-white/5 last:border-0">
                      <div className="flex items-center space-x-4">
                         <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/node:bg-gold-500 group-hover/node:text-white transition-all">
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
           
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-8 italic">Journal Stream</h4>
              <div className="space-y-6">
                 {[
                    { label: 'Manual Order Initiate', time: '12m ago', type: 'EXECUTION' },
                    { label: 'Global Sink Verified', time: '1h ago', type: 'NETWORK' },
                    { label: 'Capital Injection Complete', time: '4h ago', type: 'ASSET' }
                 ].map((log, idx) => (
                    <div key={idx} className="flex flex-col space-y-1">
                       <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{log.label}</p>
                       <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{log.time}</span>
                          <span className="text-[8px] font-black text-gold-600 uppercase tracking-widest">{log.type}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTab;
