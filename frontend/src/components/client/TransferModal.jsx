import React, { useState } from 'react';
import { FaTimes, FaExchangeAlt, FaWallet, FaChartLine, FaArrowRight, FaSync } from 'react-icons/fa';

const TransferModal = ({ isOpen, onClose, walletData, onConfirm }) => {
  const [fromAccount, setFromAccount] = useState('wallet');
  const [toAccount, setToAccount] = useState('trading');
  const [transferAmount, setTransferAmount] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsSyncing(true);
    // Simulate a brief delay for a premium feel
    setTimeout(() => {
      onConfirm({ from: fromAccount, to: toAccount, amount: transferAmount });
      onClose();
      setTransferAmount('');
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4 sm:p-8">
      <div className="bg-white rounded-[3rem] border border-slate-100 p-12 w-full max-w-2xl shadow-[0_0_120px_rgba(0,0,0,0.15)] relative overflow-hidden ring-1 ring-slate-100">
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full translate-x-32 -translate-y-32"></div>
        
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Migration Protocol</h3>
            <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-[0.3em] flex items-center">
              <FaSync className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> Asset Redistribution Matrix
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-[1.5rem] flex items-center justify-center transition-all border border-slate-100 hover:shadow-xl group"
          >
            <FaTimes size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
        
        <div className="space-y-10 relative z-10">
          {/* Transition Logic - From */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Source Origin</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setFromAccount('wallet')}
                className={`p-6 rounded-[2rem] border transition-all duration-300 text-left group ${
                  fromAccount === 'wallet' 
                    ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02]' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'
                }`}
              >
                <FaWallet className={`mb-4 text-xl ${fromAccount === 'wallet' ? 'text-gold-500' : 'text-slate-300'}`} />
                <p className={`text-[11px] font-black uppercase tracking-widest ${fromAccount === 'wallet' ? 'text-white' : 'text-slate-900'}`}>Primary Vault</p>
                <p className="text-[9px] font-medium opacity-60 mt-1">${walletData.mainWallet?.toLocaleString()}</p>
              </button>

              <button
                onClick={() => setFromAccount('trading')}
                className={`p-6 rounded-[2rem] border transition-all duration-300 text-left group ${
                  fromAccount === 'trading' 
                    ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02]' 
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'
                }`}
              >
                <FaChartLine className={`mb-4 text-xl ${fromAccount === 'trading' ? 'text-gold-500' : 'text-slate-300'}`} />
                <p className={`text-[11px] font-black uppercase tracking-widest ${fromAccount === 'trading' ? 'text-white' : 'text-slate-900'}`}>Active Margin</p>
                <p className="text-[9px] font-medium opacity-60 mt-1">${walletData.tradingWallet?.toLocaleString()}</p>
              </button>
            </div>
          </div>

          {/* Transfer Visualiser */}
          <div className="flex items-center justify-center -my-4 relative">
             <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white shadow-lg shadow-gold-500/30 z-20">
                <FaArrowRight className="rotate-90 sm:rotate-0" size={14} />
             </div>
             <div className="absolute w-[1px] h-10 sm:w-20 sm:h-[1px] bg-slate-100 -z-10"></div>
          </div>

          {/* Destination Target */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Destination Vector</label>
            <div className="relative">
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-xs font-black italic text-slate-900 focus:outline-none focus:ring-8 focus:ring-slate-900/5 transition-all appearance-none"
              >
                <option value="trading">Trading Environment (MT5 Cloud)</option>
                <option value="wallet">Personal Liquidity Vault</option>
                <option value="bonus">Operational Incentive Wallet</option>
              </select>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gold-500">
                 <FaExchangeAlt size={14} />
              </div>
            </div>
          </div>

          {/* Magnitude Control */}
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Injection Magnitude</label>
            <div className="relative group">
              <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-200 italic transition-colors group-focus-within:text-gold-500">$</span>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-16 pr-8 py-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-4xl font-black italic text-slate-900 focus:outline-none focus:ring-12 focus:ring-slate-900/5 transition-all"
              />
            </div>
          </div>

          {/* Deployment Actions */}
          <div className="flex flex-col sm:flex-row gap-6 pt-6 translate-y-4">
            <button
              onClick={handleConfirm}
              disabled={!transferAmount || isSyncing}
              className="flex-1 px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-gold-600 disabled:bg-slate-200 transition-all duration-500 shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1"
            >
              {isSyncing ? 'Synchronizing Nodes...' : 'Execute Redistribution'}
            </button>
            <button
              onClick={onClose}
              className="px-10 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-slate-100 transition-all border border-slate-100"
            >
              Abort
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;