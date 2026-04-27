import React from 'react';
import { FaHistory } from 'react-icons/fa';

const TradeHistory = ({ trades = [] }) => {
  if (!trades.length) {
    return (
      <div className="text-center py-14">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaHistory className="text-slate-300 dark:text-slate-600" size={24} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No closed trades yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trades.map((trade) => {
        const isProfit = trade.pnl >= 0;
        return (
          <div
            key={trade.id}
            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight">
                  {trade.symbol}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                  {trade.side} | Qty {trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black italic ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isProfit ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {trade.status}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Entry', value: trade.entryPrice },
                { label: 'Exit', value: trade.exitPrice },
                { label: 'Notional', value: trade.amount },
                { label: 'Closed', value: trade.closedAt ? new Date(trade.closedAt).toLocaleString() : '--', raw: true },
              ].map((item) => (
                <div key={item.label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    {item.label}
                  </p>
                  <p className="text-[11px] font-black text-slate-900 dark:text-white">
                    {item.raw
                      ? item.value
                      : `$${Number(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TradeHistory;

