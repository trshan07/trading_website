import React, { useState } from 'react';
import { FaFileAlt, FaTimes, FaCalendarAlt, FaDownload, FaSpinner } from 'react-icons/fa';

const AccountStatementModal = ({ show, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '2024-03-01',
    end: new Date().toISOString().split('T')[0]
  });

  if (!show) return null;

  const handleGenerate = () => {
    setLoading(true);
    // Simulate generation delay
    setTimeout(() => {
      setLoading(false);
      // In a real app, this would trigger a download
      alert('Account Statement Generated Successfully! Download starting...');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic leading-tight">Statement</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Activity Reporting</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-all">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-8">
          <div className="w-20 h-20 bg-slate-900 dark:bg-gold-500 rounded-[2.2rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-900/30 dark:shadow-gold-500/10">
            <FaFileAlt className="text-white dark:text-slate-900 text-2xl" />
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
                     onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                     className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-900 dark:text-white focus:outline-none"
                   />
                 </div>
                 <div className="relative">
                   <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                   <input 
                     type="date"
                     value={dateRange.end}
                     onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                     className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-900 dark:text-white focus:outline-none"
                   />
                 </div>
               </div>
             </div>

             <div className="space-y-3">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Report Level</label>
               <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <button className="flex-1 py-3 bg-white dark:bg-slate-900 text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">Standard</button>
                 <button className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Detailed</button>
               </div>
             </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 shadow-2xl ${loading ? 'opacity-70 cursor-wait' : 'shadow-slate-900/20 dark:shadow-gold-500/10'}`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            <span>{loading ? 'Generating...' : 'Generate Statement'}</span>
          </button>
          
          <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-300 dark:text-slate-600 text-center">
            Supported Formats: PDF · XLS · CSV
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountStatementModal;
