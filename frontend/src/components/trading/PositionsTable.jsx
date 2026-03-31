// frontend/src/components/trading/PositionsTable.jsx
import React from 'react';
import { FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const PositionsTable = ({ positions = [], onClose, compact = false }) => {
  if (compact) {
    return (
      <div className="space-y-6">
        {positions.map(position => (
          <div key={position.id} className="bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 hover:border-gold-500/20 dark:hover:border-gold-500/30 transition-all group transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl transition-colors ${position.type === 'LONG' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 shadow-sm'}`}>
                  {position.type === 'LONG' ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight italic uppercase transition-colors">{position.symbol}</p>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase transition-colors">Market Position</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-black italic tracking-tighter transition-colors ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {position.pnl >= 0 ? '+' : ''}{(position.pnl || 0).toLocaleString()} USD
                </p>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-widest transition-colors">Unrealized P&L</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-black/20 transition-colors">
                <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1 tracking-widest transition-colors">Unit Size</p>
                <p className="text-xs font-black text-slate-900 dark:text-white italic transition-colors">{(position.quantity || 0).toFixed(4)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 shadow-sm dark:shadow-black/20 transition-colors">
                <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1 tracking-widest transition-colors">Global P&L</p>
                <p className={`text-xs font-black italic transition-colors ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {position.pnl >= 0 ? '+' : ''}{(position.pnlPercent || 0).toFixed(2)}%
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onClose(position.id)}
              className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 dark:hover:bg-rose-500 transition-all shadow-xl shadow-slate-900/10 dark:shadow-black/40 flex items-center justify-center group/btn"
            >
              <FaTimes className="mr-3 text-gold-500 group-hover/btn:text-white transition-colors" />
              Terminate Position
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-4">
        <thead>
          <tr className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.25em] transition-colors">
            <th className="px-8 py-4 text-left font-black">Instrument</th>
            <th className="px-8 py-4 text-left font-black">Type</th>
            <th className="px-8 py-4 text-right font-black">Exposure</th>
            <th className="px-8 py-4 text-right font-black">Avg. Entry</th>
            <th className="px-8 py-4 text-right font-black">Market</th>
            <th className="px-8 py-4 text-right font-black">Total P&L</th>
            <th className="px-8 py-4 text-right font-black">Return</th>
            <th className="px-8 py-4 text-center font-black">Status</th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {positions.map(position => (
            <tr key={position.id} className="group bg-slate-50/30 dark:bg-slate-800/10 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/40 transition-all duration-300 transform hover:-translate-y-1">
              <td className="px-8 py-6 rounded-l-[2rem] border-y border-l border-slate-50 dark:border-slate-800 group-hover:border-gold-500/20 transition-colors">
                <span className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight transition-colors">{position.symbol}</span>
              </td>
              <td className="px-8 py-6 border-y border-slate-50 dark:border-slate-800 group-hover:border-gold-500/20 transition-colors">
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm transition-colors ${
                  position.type === 'LONG' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
                }`}>
                  {position.type}
                </span>
              </td>
              <td className="px-8 py-6 text-sm font-black text-right text-slate-800 dark:text-slate-200 border-y border-slate-50 dark:border-slate-800 group-hover:border-gold-500/20 italic transition-colors">{position.quantity}</td>
              <td className="px-8 py-6 text-sm font-bold text-right text-slate-500 dark:text-slate-400 border-y border-slate-50 dark:border-slate-800 group-hover:border-gold-500/20 transition-colors">${position.entryPrice.toLocaleString()}</td>
              <td className="px-8 py-6 text-sm font-bold text-right text-slate-500 dark:text-slate-400 border-y border-slate-50 dark:border-slate-800 group-hover:border-gold-500/20 transition-colors">${position.currentPrice.toLocaleString()}</td>
              <td className={`px-8 py-6 text-sm font-black text-right border-y border-slate-50 dark:border-slate-800 group-hover:border-gold-500/20 italic transition-colors ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
              </td>
              <td className={`px-8 py-6 text-sm font-black text-right border-y border-slate-50 dark:border-slate-800 group-hover:border-gold-500/20 italic transition-colors ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {position.pnl >= 0 ? '+' : ''}{position.pnlPercent?.toFixed(2) || '0.00'}%
              </td>
              <td className="px-8 py-6 text-center rounded-r-[2rem] border-y border-r border-slate-50 dark:border-slate-800 group-hover:border-gold-500/20 transition-colors">
                <button
                  onClick={() => onClose(position.id)}
                  className="px-6 py-2 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-500 transition-all shadow-lg active:scale-95 flex items-center mx-auto"
                >
                  <FaTimes className="mr-2 text-gold-500 dark:text-slate-900 transition-colors" />
                  Close
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PositionsTable;