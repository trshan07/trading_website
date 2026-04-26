// frontend/src/components/trading/PositionsTable.jsx
import React, { useState } from 'react';
import { FaTimes, FaArrowUp, FaArrowDown, FaChartLine, FaBolt, FaShieldAlt } from 'react-icons/fa';

const PositionsTable = ({ positions = [], onClose, compact = false }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  if (compact) {
    return (
      <div className="space-y-4">
        {positions.map(position => {
          const isProfit = position.pnl >= 0;
          return (
            <div key={position.id}
              className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/50 hover:border-gold-500/30 transition-all group"
            >
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-3xl"
                style={{ background: position.type === 'BUY' ? '#10b981' : '#f43f5e' }}
              />
              <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight">{position.symbol}</p>
                  <span className={`text-[9px] font-black px-2.5 py-0.5 mt-1 inline-block rounded-full uppercase tracking-widest ${
                    position.type === 'BUY'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}>{position.type}</span>
                </div>
                <div className="text-right">
                  <p className={`text-base font-black italic tracking-tighter ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isProfit ? '+' : ''}${(position.pnl || 0).toLocaleString()}
                  </p>
                  <p className={`text-[9px] font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{(position.pnlPercent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4 pl-2">
                {[
                  { label: 'Size', value: (position.quantity || 0).toFixed(4) },
                  { label: 'Entry', value: `$${(position.entryPrice || 0).toLocaleString()}` },
                  { label: 'Market', value: `$${(position.currentPrice || 0).toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-50 dark:border-slate-800">
                    <p className="text-[7px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1 tracking-widest">{label}</p>
                    <p className="text-[11px] font-black text-slate-900 dark:text-white italic">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col space-y-2 mb-4 px-2">
                <div className="flex justify-between items-center text-[9px] uppercase font-black text-slate-400">
                  <span>Leverage:</span>
                  <span className="text-slate-900 dark:text-white">1:{position.leverage || 1}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] uppercase font-black text-slate-400">
                  <span>Take Profit:</span>
                  <span className="text-emerald-500">{position.takeProfit ? `$${position.takeProfit.toLocaleString()}` : 'Off'}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] uppercase font-black text-slate-400">
                  <span>Stop Loss:</span>
                  <span className="text-rose-500">{position.stopLoss ? `$${position.stopLoss.toLocaleString()}` : 'Off'}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] uppercase font-black text-slate-400">
                  <span>Swap:</span>
                  <span className="text-slate-900 dark:text-white">${(position.swap || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] uppercase font-black text-slate-400">
                  <span>Commission:</span>
                  <span className="text-rose-500">${(position.commission || 0).toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => onClose(position.id)}
                className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-2xl text-[9px] uppercase tracking-[0.2em] hover:bg-rose-600 dark:hover:bg-rose-500 transition-all flex items-center justify-center group/btn"
              >
                <FaTimes className="mr-2 text-gold-500 group-hover/btn:text-white transition-colors" />
                Terminate Position
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Column headers */}
      <div className="grid items-center text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] px-6 pb-4 border-b border-slate-100 dark:border-slate-800 mb-2"
        style={{ gridTemplateColumns: '2.3fr 1fr 1fr 1fr 1.1fr 1.1fr 1.1fr 1fr 1fr 1.2fr 1.2fr 1.2fr 1.2fr' }}
      >
        <span>Instrument</span>
        <span>Direction</span>
        <span className="text-right">Size</span>
        <span className="text-right">Avg. Entry</span>
        <span className="text-right">Market Price</span>
        <span className="text-right">Lev</span>
        <span className="text-right">TP</span>
        <span className="text-right">SL</span>
        <span className="text-right">Swap</span>
        <span className="text-right">Comm</span>
        <span className="text-right">P&amp;L</span>
        <span className="text-right">Return</span>
        <span className="text-right">Action</span>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {positions.map((position, idx) => {
          const isProfit = position.pnl >= 0;
          const isBuy = position.type === 'BUY';
          const isHovered = hoveredRow === idx;

          return (
            <div
              key={position.id}
              onMouseEnter={() => setHoveredRow(idx)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`relative grid items-center rounded-2xl px-6 py-4 transition-all duration-300 cursor-default border overflow-hidden ${
                isHovered
                  ? 'bg-white dark:bg-slate-800 border-gold-500/20 dark:border-gold-500/20 shadow-xl shadow-slate-200/50 dark:shadow-black/30 -translate-y-0.5'
                  : 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent'
              }`}
              style={{ gridTemplateColumns: '2.3fr 1fr 1fr 1fr 1.1fr 1.1fr 1.1fr 1fr 1fr 1.2fr 1.2fr 1.2fr 1.2fr' }}
            >
              {/* Side accent bar */}
              <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              } ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`} />

              {/* Instrument */}
              <div className="flex items-center space-x-3 pl-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border transition-colors ${
                  isBuy
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
                    : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'
                }`}>
                  {isBuy
                    ? <FaArrowUp size={11} className="text-emerald-500" />
                    : <FaArrowDown size={11} className="text-rose-500" />
                  }
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight leading-none">{position.symbol}</p>
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Market</p>
                </div>
              </div>

              {/* Direction */}
              <div>
                <span className={`inline-flex items-center text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border ${
                  isBuy
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20'
                }`}>
                  {isBuy ? <FaArrowUp size={7} className="mr-1.5" /> : <FaArrowDown size={7} className="mr-1.5" />}
                  {position.type}
                </span>
              </div>

              {/* Size */}
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 italic tabular-nums">{(position.quantity || 0).toFixed(4)}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">units</p>
              </div>

              {/* Avg Entry */}
              <div className="text-right">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">${(position.entryPrice || 0).toLocaleString()}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">entry</p>
              </div>

              {/* Market Price */}
              <div className="text-right">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">${(position.currentPrice || 0).toLocaleString()}</p>
                <div className="flex items-center justify-end space-x-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">live</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">1:{position.leverage || 1}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">lev</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-emerald-500 tabular-nums">{position.takeProfit ? `$${position.takeProfit.toLocaleString()}` : 'Off'}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">tp</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-rose-500 tabular-nums">{position.stopLoss ? `$${position.stopLoss.toLocaleString()}` : 'Off'}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">sl</p>
              </div>

              {/* Swap */}
              <div className="text-right">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">${(position.swap || 0).toFixed(2)}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">swap</p>
              </div>

              {/* Commission */}
              <div className="text-right">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">${(position.commission || 0).toFixed(2)}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">comm</p>
              </div>

              {/* P&L */}
              <div className="text-right">
                <p className={`text-sm font-black italic tabular-nums ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isProfit ? '+' : ''}${(position.pnl || 0).toLocaleString()}
                </p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">usd</p>
              </div>

              {/* Return % */}
              <div className="text-right">
                <p className={`text-sm font-black italic tabular-nums ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isProfit ? '+' : ''}{(position.pnlPercent || 0).toFixed(2)}%
                </p>
                <div className={`h-1 w-full rounded-full mt-1 overflow-hidden bg-slate-100 dark:bg-slate-700`}>
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(Math.abs(position.pnlPercent || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => onClose(position.id)}
                  className="group/btn flex items-center space-x-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-600 hover:bg-rose-500 hover:text-white hover:border-rose-500 dark:hover:bg-rose-500 dark:hover:text-white dark:hover:border-rose-500 transition-all duration-200 active:scale-95"
                >
                  <FaTimes size={8} />
                  <span>Close</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      {positions.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
          {[
            {
              icon: FaChartLine,
              label: 'Total Positions',
              value: positions.length,
              color: 'text-gold-500',
              bg: 'bg-gold-50 dark:bg-gold-500/10',
              border: 'border-gold-100 dark:border-gold-500/20'
            },
            {
              icon: FaBolt,
              label: 'Total P&L',
              value: `${positions.reduce((s, p) => s + (p.pnl || 0), 0) >= 0 ? '+' : ''}$${positions.reduce((s, p) => s + (p.pnl || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              color: positions.reduce((s, p) => s + (p.pnl || 0), 0) >= 0 ? 'text-emerald-500' : 'text-rose-500',
              bg: positions.reduce((s, p) => s + (p.pnl || 0), 0) >= 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10',
              border: positions.reduce((s, p) => s + (p.pnl || 0), 0) >= 0 ? 'border-emerald-100 dark:border-emerald-500/20' : 'border-rose-100 dark:border-rose-500/20',
            },
            {
              icon: FaShieldAlt,
              label: 'Long / Short',
              value: `${positions.filter(p => p.type === 'BUY').length} / ${positions.filter(p => p.type === 'SELL').length}`,
              color: 'text-slate-700 dark:text-slate-300',
              bg: 'bg-slate-50 dark:bg-slate-800',
              border: 'border-slate-100 dark:border-slate-700'
            },
          ].map(({ icon: Icon, label, value, color, bg, border }) => (
            <div key={label} className={`flex items-center space-x-4 p-4 rounded-2xl border ${bg} ${border}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
                <Icon size={12} className={color} />
              </div>
              <div>
                <p className="text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-0.5">{label}</p>
                <p className={`text-sm font-black italic tracking-tight ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PositionsTable;
