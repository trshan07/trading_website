// frontend/src/components/trading/OpenOrders.jsx
import React from 'react';
import { FaTimes, FaClock, FaExchangeAlt } from 'react-icons/fa';

const OpenOrders = ({ orders = [], onCancel, compact = false }) => {
  if (compact) {
    return (
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 hover:border-gold-500/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-50">
                  <FaExchangeAlt className="text-gold-500" size={14} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight italic uppercase">{order.symbol}</p>
                  <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase flex items-center">
                    <FaClock className="mr-1.5 opacity-50" /> {new Date(order.created).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-black px-4 py-1.5 bg-gold-50 text-gold-600 border border-gold-100 rounded-full uppercase tracking-widest shadow-sm">
                {order.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                <p className="text-[8px] uppercase font-black text-slate-400 mb-1 tracking-widest">Order Type</p>
                <p className="text-xs font-black text-slate-900 italic uppercase">{order.type}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                <p className="text-[8px] uppercase font-black text-slate-400 mb-1 tracking-widest">Direction</p>
                <p className={`text-xs font-black italic uppercase ${order.side === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {order.side}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                <p className="text-[8px] uppercase font-black text-slate-400 mb-1 tracking-widest">Amount</p>
                <p className="text-xs font-black text-slate-900 italic">{order.quantity}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                <p className="text-[8px] uppercase font-black text-slate-400 mb-1 tracking-widest">Price</p>
                <p className="text-xs font-black text-slate-900 italic">${order.price.toLocaleString()}</p>
              </div>
            </div>
            
            <button
              onClick={() => onCancel(order.id)}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center group/btn"
            >
              <FaTimes className="mr-3 text-gold-500 group-hover/btn:text-white" />
              Cancel Execution
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
            <th className="px-8 py-4 text-left font-black">Side</th>
            <th className="px-8 py-4 text-right font-black">Quantity</th>
            <th className="px-8 py-4 text-right font-black">Price</th>
            <th className="px-8 py-4 text-right font-black">Time</th>
            <th className="px-8 py-4 text-center font-black">Status</th>
            <th className="px-8 py-4 text-center font-black">Actions</th>
          </tr>
        </thead>
        <tbody className="space-y-4">
          {orders.map(order => (
            <tr key={order.id} className="group bg-slate-50/30 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1">
              <td className="px-8 py-6 rounded-l-[2rem] border-y border-l border-slate-50 group-hover:border-gold-500/20">
                <span className="text-sm font-black text-slate-900 italic uppercase tracking-tight">{order.symbol}</span>
              </td>
              <td className="px-8 py-6 border-y border-slate-50 group-hover:border-gold-500/20 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{order.type}</td>
              <td className="px-8 py-6 border-y border-slate-50 group-hover:border-gold-500/20">
                <span className={`text-[10px] font-black uppercase tracking-widest ${order.side === 'BUY' ? 'text-emerald-500 shadow-[0_0_10px_#10b98120]' : 'text-rose-500 shadow-[0_0_10px_#f43f5e20]'}`}>
                  {order.side}
                </span>
              </td>
              <td className="px-8 py-6 text-sm font-black text-right text-slate-800 border-y border-slate-50 group-hover:border-gold-500/20 italic">{order.quantity}</td>
              <td className="px-8 py-6 text-sm font-bold text-right text-slate-500 border-y border-slate-50 group-hover:border-gold-500/20">${order.price.toLocaleString()}</td>
              <td className="px-8 py-6 text-[10px] font-bold text-right text-slate-300 border-y border-slate-50 group-hover:border-gold-500/20 uppercase tracking-tighter">
                {new Date(order.created).toLocaleTimeString()}
              </td>
              <td className="px-8 py-6 text-center border-y border-slate-50 group-hover:border-gold-500/20">
                <span className="text-[9px] font-black px-4 py-1.5 bg-gold-50 text-gold-600 border border-gold-100 rounded-full uppercase tracking-widest shadow-sm">
                  {order.status}
                </span>
              </td>
              <td className="px-8 py-6 text-center rounded-r-[2rem] border-y border-r border-slate-50 group-hover:border-gold-500/20">
                <button
                  onClick={() => onCancel(order.id)}
                  className="px-6 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 border border-slate-100 transition-all shadow-sm active:scale-95 flex items-center mx-auto"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpenOrders;