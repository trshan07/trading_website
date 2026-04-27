import React from 'react';
import { FaBolt, FaTimes } from 'react-icons/fa';

const QuickTradeModal = ({ show, onClose, onPlaceOrder }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800 transition-colors">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic transition-colors">Execution</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-all">
            <FaTimes />
          </button>
        </div>
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-slate-900 dark:bg-gold-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-900/30 dark:shadow-gold-500/10 transition-colors">
            <FaBolt className="text-white dark:text-slate-900 text-2xl transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight mb-2 transition-colors">Instant Trade</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mb-8 transition-colors">Execute trades instantly with zero latency at current market rates.</p>
          <button 
            onClick={() => onPlaceOrder({
              symbol: 'BTCUSDT',
              type: 'market',
              side: 'buy',
              amount: 500
            })} 
            className="w-full py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/20 transform hover:-translate-y-1"
          >
            Initialize Terminal Flow
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickTradeModal;
