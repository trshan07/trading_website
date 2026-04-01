// frontend/src/components/trading/OpenOrders.jsx
import React, { useState } from 'react';
import { FaTimes, FaClock, FaExchangeAlt, FaArrowUp, FaArrowDown, FaChartBar, FaHourglass } from 'react-icons/fa';

const OpenOrders = ({ orders = [], onCancel, compact = false }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  if (compact) {
    return (
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id}
            className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/50 hover:border-gold-500/30 transition-all"
          >
            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${order.side === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <div className="flex justify-between items-start mb-4 pl-3">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight">{order.symbol}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${
                    order.side === 'BUY'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                  }`}>{order.side}</span>
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-100 dark:border-gold-500/20 uppercase tracking-widest">{order.type}</span>
                </div>
              </div>
              <span className="text-[9px] font-black px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-600">
                {order.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4 pl-3">
              {[
                { label: 'Qty', value: order.quantity },
                { label: 'Price', value: `$${order.price.toLocaleString()}` },
                { label: 'Time', value: new Date(order.created).toLocaleTimeString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-50 dark:border-slate-800">
                  <p className="text-[7px] uppercase font-black text-slate-400 dark:text-slate-500 mb-1 tracking-widest">{label}</p>
                  <p className="text-[11px] font-black text-slate-900 dark:text-white italic">{value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => onCancel(order.id)}
              className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-2xl text-[9px] uppercase tracking-[0.2em] hover:bg-rose-600 dark:hover:bg-rose-500 transition-all flex items-center justify-center space-x-2 group/btn"
            >
              <FaTimes className="text-gold-500 group-hover/btn:text-white transition-colors" />
              <span>Cancel Execution</span>
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Column Headers */}
      <div
        className="grid items-center text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] px-6 pb-4 border-b border-slate-100 dark:border-slate-800 mb-2"
        style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr 1.2fr 1.2fr 1fr' }}
      >
        <span>Instrument</span>
        <span>Type</span>
        <span>Side</span>
        <span className="text-right">Quantity</span>
        <span className="text-right">Limit Price</span>
        <span className="text-right">Placed At</span>
        <span className="text-center">Status</span>
        <span className="text-right">Action</span>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {orders.map((order, idx) => {
          const isBuy = order.side === 'BUY';
          const isHovered = hoveredRow === idx;

          return (
            <div
              key={order.id}
              onMouseEnter={() => setHoveredRow(idx)}
              onMouseLeave={() => setHoveredRow(null)}
              className={`relative grid items-center rounded-2xl px-6 py-4 transition-all duration-300 cursor-default border overflow-hidden ${
                isHovered
                  ? 'bg-white dark:bg-slate-800 border-gold-500/20 shadow-xl shadow-slate-200/50 dark:shadow-black/30 -translate-y-0.5'
                  : 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent'
              }`}
              style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr 1.2fr 1.2fr 1fr' }}
            >
              {/* Left Accent */}
              <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              } ${isBuy ? 'bg-emerald-500' : 'bg-rose-500'}`} />

              {/* Instrument */}
              <div className="flex items-center space-x-3 pl-3">
                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-600">
                  <FaExchangeAlt size={11} className="text-gold-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight leading-none">{order.symbol}</p>
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Pending</p>
                </div>
              </div>

              {/* Order Type */}
              <div>
                <span className="inline-flex items-center text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-100 dark:border-gold-500/20">
                  {order.type}
                </span>
              </div>

              {/* Side */}
              <div>
                <span className={`inline-flex items-center space-x-1.5 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border ${
                  isBuy
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20'
                }`}>
                  {isBuy ? <FaArrowUp size={7} /> : <FaArrowDown size={7} />}
                  <span>{order.side}</span>
                </span>
              </div>

              {/* Quantity */}
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 italic tabular-nums">{order.quantity}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">units</p>
              </div>

              {/* Limit Price */}
              <div className="text-right">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 tabular-nums">${(order.price || 0).toLocaleString()}</p>
                <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">limit</p>
              </div>

              {/* Time */}
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  {new Date(order.created).toLocaleTimeString()}
                </p>
                <div className="flex items-center justify-end space-x-1 mt-0.5">
                  <FaClock size={7} className="text-slate-300 dark:text-slate-600" />
                  <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold tracking-widest uppercase">placed</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-center">
                <span className="inline-flex items-center space-x-1.5 text-[9px] font-black px-3 py-1.5 bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-100 dark:border-gold-500/20 rounded-lg uppercase tracking-widest">
                  <FaHourglass size={7} />
                  <span>{order.status}</span>
                </span>
              </div>

              {/* Cancel */}
              <div className="flex justify-end">
                <button
                  onClick={() => onCancel(order.id)}
                  className="group/btn flex items-center space-x-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-600 hover:bg-rose-500 hover:text-white hover:border-rose-500 dark:hover:bg-rose-500 dark:hover:border-rose-500 transition-all duration-200 active:scale-95"
                >
                  <FaTimes size={8} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      {orders.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
          {[
            {
              icon: FaChartBar,
              label: 'Pending Orders',
              value: orders.length,
              color: 'text-gold-500',
              bg: 'bg-gold-50 dark:bg-gold-500/10',
              border: 'border-gold-100 dark:border-gold-500/20'
            },
            {
              icon: FaArrowUp,
              label: 'Buy Orders',
              value: orders.filter(o => o.side === 'BUY').length,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-500/10',
              border: 'border-emerald-100 dark:border-emerald-500/20'
            },
            {
              icon: FaArrowDown,
              label: 'Sell Orders',
              value: orders.filter(o => o.side === 'SELL').length,
              color: 'text-rose-500',
              bg: 'bg-rose-50 dark:bg-rose-500/10',
              border: 'border-rose-100 dark:border-rose-500/20'
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

export default OpenOrders;