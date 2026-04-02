import React from 'react';
import { FaArrowDown, FaArrowUp, FaExchangeAlt, FaDownload } from 'react-icons/fa';

const TransactionHistorySection = ({ transactions = [], isMobile = false }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Transaction History</h3>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-black tracking-widest">Recent Activity Logs</p>
    </div>

    {isMobile ? (
      <div className="p-4 space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {tx.type === 'Deposit' && <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-lg"><FaArrowDown size={10} /></div>}
                {tx.type === 'Withdrawal' && <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-lg"><FaArrowUp size={10} /></div>}
                {tx.type === 'Transfer' && <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg"><FaExchangeAlt size={10} /></div>}
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight truncate">{tx.type}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{tx.date}</p>
                </div>
              </div>
              <span className={`text-sm font-black ${
                tx.type === 'Deposit' ? 'text-emerald-500' :
                tx.type === 'Withdrawal' ? 'text-rose-500' : 'text-slate-900 dark:text-white'
              }`}>
                {tx.type === 'Withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight truncate">{tx.method}</p>
              <span className={`px-2 py-1 text-[9px] font-black rounded-full uppercase tracking-wider shrink-0 ${
                tx.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20' :
                tx.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20' :
                'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20'
              }`}>
                {tx.status}
              </span>
            </div>

            <div className="flex justify-end">
              <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg hover:bg-gold-500 hover:text-white transition-all">
                <FaDownload size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="p-2 sm:p-6 overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">
            <th className="px-6 py-4 text-left font-black">Date</th>
            <th className="px-6 py-4 text-left font-black">Type</th>
            <th className="px-6 py-4 text-right font-black">Amount</th>
            <th className="px-6 py-4 text-left font-black">Method</th>
            {!isMobile && <th className="px-6 py-4 text-left font-black">Reference</th>}
            <th className="px-6 py-4 text-center font-black">Status</th>
            <th className="px-6 py-4 text-center font-black">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="group bg-white dark:bg-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800">
              <td className="px-6 py-4 first:rounded-l-xl border-y border-l border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{tx.date}</span>
              </td>
              <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20">
                <div className="flex items-center space-x-2">
                  {tx.type === 'Deposit' && <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-lg"><FaArrowDown size={10} /></div>}
                  {tx.type === 'Withdrawal' && <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-lg"><FaArrowUp size={10} /></div>}
                  {tx.type === 'Transfer' && <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg"><FaExchangeAlt size={10} /></div>}
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tighter transition-colors">{tx.type}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20">
                <span className={`text-sm font-black ${
                  tx.type === 'Deposit' ? 'text-emerald-500' :
                  tx.type === 'Withdrawal' ? 'text-rose-500' : 'text-slate-900 dark:text-white'
                }`}>
                  {tx.type === 'Withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20 uppercase tracking-tighter">{tx.method}</td>
              {!isMobile && <td className="px-6 py-4 text-[10px] font-bold text-slate-300 dark:text-slate-600 border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20">{tx.reference}</td>}
              <td className="px-6 py-4 border-y border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20 text-center">
                <span className={`px-2 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                  tx.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20' :
                  tx.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20' :
                  'bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20'
                }`}>
                  {tx.status}
                </span>
              </td>
              <td className="px-6 py-4 last:rounded-r-xl border-y border-r border-slate-100 dark:border-slate-800 group-hover:border-gold-500/20 text-center">
                <button className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg hover:bg-gold-500 hover:text-white transition-all">
                  <FaDownload size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    )}
  </div>
);

export default TransactionHistorySection;
