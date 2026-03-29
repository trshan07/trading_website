// frontend/src/components/trading/PositionsTable.jsx
import React from 'react';
import { FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const PositionsTable = ({ positions = [], onClose, compact = false }) => {
  if (compact) {
    return (
      <div className="space-y-6">
        {positions.map(position => (
          <div key={position.id} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 hover:border-gold-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl ${position.type === 'LONG' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500 shadow-sm'}`}>
                  {position.type === 'LONG' ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight italic uppercase">{position.symbol}</p>
                  <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">Market Position</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-black italic tracking-tighter ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {position.pnl >= 0 ? '+' : ''}{position.pnl.toLocaleString()} USD
                </p>
                <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-widest">Unrealized P&L</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                <p className="text-[8px] uppercase font-black text-slate-400 mb-1 tracking-widest">Unit Size</p>
                <p className="text-xs font-black text-slate-900 italic">{position.quantity}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                <p className="text-[8px] uppercase font-black text-slate-400 mb-1 tracking-widest">Global P&L</p>
                <p className={`text-xs font-black italic ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {position.pnl >= 0 ? '+' : ''}{position.pnlPercent?.toFixed(2) || '0.00'}%
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onClose(position.id)}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center group/btn"
            >
              <FaTimes className="mr-3 text-gold-500 group-hover/btn:text-white" />
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
          <tr className="text-[10px] uppercase font-black text-slate-400 tracking-[0.25em]">
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
            <tr key={position.id} className="group bg-slate-50/30 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1">
              <td className="px-8 py-6 rounded-l-[2rem] border-y border-l border-slate-50 group-hover:border-gold-500/20">
                <span className="text-sm font-black text-slate-900 italic uppercase tracking-tight">{position.symbol}</span>
              </td>
              <td className="px-8 py-6 border-y border-slate-50 group-hover:border-gold-500/20">
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
                  position.type === 'LONG' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                  {position.type}
                </span>
              </td>
              <td className="px-8 py-6 text-sm font-black text-right text-slate-800 border-y border-slate-50 group-hover:border-gold-500/20 italic">{position.quantity}</td>
              <td className="px-8 py-6 text-sm font-bold text-right text-slate-500 border-y border-slate-50 group-hover:border-gold-500/20">${position.entryPrice.toLocaleString()}</td>
              <td className="px-8 py-6 text-sm font-bold text-right text-slate-500 border-y border-slate-50 group-hover:border-gold-500/20">${position.currentPrice.toLocaleString()}</td>
              <td className={`px-8 py-6 text-sm font-black text-right border-y border-slate-50 group-hover:border-gold-500/20 italic ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
              </td>
              <td className={`px-8 py-6 text-sm font-black text-right border-y border-slate-50 group-hover:border-gold-500/20 italic ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {position.pnl >= 0 ? '+' : ''}{position.pnlPercent?.toFixed(2) || '0.00'}%
              </td>
              <td className="px-8 py-6 text-center rounded-r-[2rem] border-y border-r border-slate-50 group-hover:border-gold-500/20">
                <button
                  onClick={() => onClose(position.id)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95 flex items-center mx-auto"
                >
                  <FaTimes className="mr-2 text-gold-500" />
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