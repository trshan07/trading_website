import React, { useState } from 'react';
import { FaBell, FaTrash, FaPlus, FaCheckCircle, FaClock, FaArrowCircleUp, FaArrowCircleDown } from 'react-icons/fa';
import { MARKET_INSTRUMENTS } from '../../constants/marketData';

const PriceAlertsTab = ({ alerts = [], onCreateAlert, onDeleteAlert }) => {
  const [showForm, setShowForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTCUSDT',
    price: '',
    condition: 'above'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateAlert({
      ...newAlert,
      price: parseFloat(newAlert.price)
    });
    setNewAlert({ ...newAlert, price: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* List Header & Action */}
      <div className="flex justify-between items-center sm:px-4">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest italic">Price Monitoring</h3>
          <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">Active triggers for market movements</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gold-500 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/10"
          >
            <FaPlus />
            <span>Set New Alert</span>
          </button>
        )}
      </div>

      {/* Creation Form */}
      {showForm && (
        <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Instrument</label>
              <select 
                value={newAlert.symbol}
                onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value})}
                className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              >
                {MARKET_INSTRUMENTS.map(inst => (
                  <option key={inst.symbol} value={inst.symbol}>{inst.symbol}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Condition</label>
              <select 
                value={newAlert.condition}
                onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
                className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              >
                <option value="above">Price is Above ↑</option>
                <option value="below">Price is Below ↓</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Target Price</label>
              <input 
                type="text"
                value={newAlert.price}
                onChange={(e) => setNewAlert({...newAlert, price: e.target.value})}
                placeholder="0.0000"
                className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
              />
            </div>

            <div className="flex space-x-3">
              <button 
                type="submit"
                className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 hover:bg-emerald-600 transition-all"
              >
                Create
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.condition === 'above' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {alert.condition === 'above' ? <FaArrowCircleUp size={18} /> : <FaArrowCircleDown size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-black italic uppercase text-slate-900 dark:text-white">{alert.symbol}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {alert.condition === 'above' ? 'Trigger Above' : 'Trigger Below'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onDeleteAlert(alert.id)}
                className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <FaTrash size={12} />
              </button>
            </div>

            <div className="flex items-end justify-between mb-2">
              <div className="text-[20px] font-black text-slate-900 dark:text-white tabular-nums italic tracking-tighter">
                ${parseFloat(alert.price).toLocaleString()}
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-blue-500/5 text-blue-500 rounded-lg">
                <FaClock size={8} />
                <span className="text-[8px] font-black uppercase tracking-widest">{alert.status}</span>
              </div>
            </div>

            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter border-t border-slate-50 dark:border-slate-800 pt-4 mt-4">
              Created: {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        ))}

        {alerts.length === 0 && !showForm && (
          <div className="col-span-full py-20 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl">
               <FaBell className="text-slate-300" size={24} />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No price alerts active</p>
             <button onClick={() => setShowForm(true)} className="mt-4 text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] hover:text-gold-400 transition-colors">Setup First Alert</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAlertsTab;
