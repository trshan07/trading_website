// frontend/src/components/client/MarketsTab.jsx
import React from 'react';
import AdvancedRealTimeChart from '../trading/TradingViewWidget';
import { FaGlobe, FaSearch, FaChartBar, FaLayerGroup } from 'react-icons/fa';

const MarketsTab = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Global Terminal Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
               <FaGlobe className="text-gold-500 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Global Hub</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
                 Multi-Asset Liquidity Sync
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
                <input 
                  type="text" 
                  placeholder="Scan Global Assets..." 
                  className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-inner"
                />
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
             </div>
             <button className="p-3.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-gold-600 transition-all">
                <FaLayerGroup size={14} />
             </button>
          </div>
        </div>

        {/* Massive Trading Terminal */}
        <div className="p-1 min-h-[700px] relative group">
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none z-10 transition-opacity opacity-100 group-hover:opacity-0"></div>
          <div className="h-[750px] w-full rounded-[2rem] overflow-hidden border border-slate-50 shadow-inner bg-slate-50">
            <AdvancedRealTimeChart symbol="BTCUSDT" theme="light" />
          </div>
        </div>

        {/* Terminal Insight Footer */}
        <div className="p-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/20">
           <div className="flex items-center space-x-8">
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Index Latency</span>
                 <span className="text-xs font-black text-slate-900 italic">~14ms Response</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-100"></div>
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Liquidity Engine</span>
                 <span className="text-xs font-black text-emerald-500 italic">UltraHigh_v3</span>
              </div>
           </div>
           
           <div className="flex space-x-3">
              {['Heatmaps', 'Volume Triggers', 'Alert Hub'].map(label => (
                <button key={label} className="px-5 py-2.5 text-[8px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                   {label}
                </button>
              ))}
           </div>
        </div>
      </div>
      
      {/* Secondary Market Intelligence Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Market Cap', value: '$2.4T', change: '+2.4%', icon: FaChartBar },
           { label: 'Total Volume', value: '$84.2B', change: '-1.1%', icon: FaLayerGroup },
           { label: 'Dominance', value: '48.2%', change: '+0.5%', icon: FaGlobe },
           { label: 'Fear/Greed', value: '72 - Greed', change: 'Neutral', icon: FaSearch },
         ].map((stat, idx) => (
           <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:-translate-y-1 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full translate-x-8 -translate-y-8 group-hover:bg-gold-50 transition-colors"></div>
              <stat.icon className="text-gold-500 mb-6 relative" size={16} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative">{stat.label}</p>
              <h4 className="text-xl font-black text-slate-900 italic tracking-tighter relative">{stat.value}</h4>
           </div>
         ))}
      </div>
    </div>
  );
};

export default MarketsTab;
