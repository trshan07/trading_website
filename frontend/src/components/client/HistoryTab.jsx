import React, { useState } from 'react';
import { FaHistory, FaSearch, FaFilter, FaFileDownload, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const HistoryTab = ({ transactions = [] }) => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = transactions.filter(item => {
    const matchesFilter = filter === 'All' || item.type === filter;
    const matchesSearch = !searchQuery.trim() || 
      item.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-colors">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 focus:outline-none transition-all cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Trade">Trades Only</option>
              <option value="Deposit">Deposits</option>
              <option value="Withdrawal">Withdrawals</option>
              <option value="Transfer">Transfers</option>
            </select>
            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={10} />
          </div>
        </div>
        
        <button className="flex items-center space-x-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white dark:text-gold-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 hover:text-slate-900 transition-all shadow-lg">
          <FaFileDownload />
          <span>Export CSV</span>
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Date & Ref</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Type</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Asset/Method</th>
                <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Amount</th>
                <th className="px-8 py-5 text-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredHistory.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-6">
                    <p className="text-[11px] font-black text-slate-900 dark:text-white italic">{item.date}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{item.reference}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                      item.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500' : 
                      item.type === 'Withdrawal' ? 'bg-rose-500/10 text-rose-500' : 
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{item.method || item.symbol || 'System'}</p>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <p className={`text-xs font-black italic tabular-nums ${item.type === 'Deposit' ? 'text-emerald-500' : item.type === 'Withdrawal' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                      {item.type === 'Withdrawal' ? '-' : '+'}${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center space-x-1.5 text-emerald-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[9px] font-black uppercase tracking-widest">{item.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredHistory.length === 0 && (
          <div className="px-8 py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHistory className="text-slate-300" size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No transaction history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTab;
