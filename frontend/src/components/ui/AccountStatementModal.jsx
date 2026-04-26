import React, { useMemo, useState } from 'react';
import { FaCalendarAlt, FaDownload, FaFileAlt, FaSpinner, FaTimes } from 'react-icons/fa';

const AccountStatementModal = ({
  show,
  onClose,
  transactions = [],
  accountLabel = 'Trading Account',
  customerName = 'Client',
}) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '2024-03-01',
    end: new Date().toISOString().split('T')[0],
  });

  const filteredTransactions = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    return transactions.filter((transaction) => {
      if (!transaction.createdAt) {
        return false;
      }
      const createdAt = new Date(transaction.createdAt);
      return createdAt >= start && createdAt <= end;
    });
  }, [dateRange.end, dateRange.start, transactions]);

  if (!show) return null;

  const handleGenerate = () => {
    setLoading(true);

    window.setTimeout(() => {
      const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const rows = [
        ['Customer', customerName],
        ['Account', accountLabel],
        ['Start Date', dateRange.start],
        ['End Date', dateRange.end],
        [],
        ['Date', 'Type', 'Amount', 'Method', 'Status', 'Reference', 'Description'],
        ...filteredTransactions.map((transaction) => [
          transaction.date,
          transaction.type,
          transaction.signedAmount ?? transaction.amount,
          transaction.method,
          transaction.status,
          transaction.reference,
          transaction.description,
        ]),
      ];

      const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `account-statement-${dateRange.start}-to-${dateRange.end}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800 transition-colors">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic leading-tight">Statement</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Activity Reporting</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-all">
            <FaTimes />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="w-20 h-20 bg-slate-900 dark:bg-gold-500 rounded-[2.2rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-900/30 dark:shadow-gold-500/10">
            <FaFileAlt className="text-white dark:text-slate-900 text-2xl" />
          </div>

          <div className="space-y-4 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">{customerName || 'Client'}</p>
            <p className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">{accountLabel}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {filteredTransactions.length} ledger entr{filteredTransactions.length === 1 ? 'y' : 'ies'} in range
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 px-5 py-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Export Format</p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">CSV ledger export from live dashboard data</p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 shadow-2xl ${loading ? 'opacity-70 cursor-wait' : 'shadow-slate-900/20 dark:shadow-gold-500/10'}`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            <span>{loading ? 'Generating...' : 'Download Statement'}</span>
          </button>

          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-300 dark:text-slate-600 text-center">
            Export includes banking requests and internal transfer entries
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountStatementModal;
