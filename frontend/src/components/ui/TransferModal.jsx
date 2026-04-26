import React, { useState, useEffect } from 'react';
import { FaExchangeAlt, FaTimes, FaWallet, FaArrowRight } from 'react-icons/fa';

const TransferModal = ({ show, onClose, onTransfer, walletData, accounts = [] }) => {
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');

  useEffect(() => {
    if (accounts.length > 0) {
      if (!fromAccount) setFromAccount(accounts[0].id);
      if (!toAccount && accounts.length > 1) setToAccount(accounts[1].id);
      else if (!toAccount) setToAccount(accounts[0].id);
    }
  }, [accounts, show]);

  if (!show) return null;

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    if (fromAccount === toAccount) return;
    onTransfer(amount, fromAccount, toAccount);
    setAmount('');
    onClose();
  };

  const swapWallets = () => {
    const temp = fromAccount;
    setFromAccount(toAccount);
    setToAccount(temp);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800 transition-colors">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight transition-colors">Internal Transfer</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-all">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleTransfer} className="p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">From Account</p>
              <select 
                value={fromAccount} 
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight focus:outline-none"
              >
                {accounts.map(acc => (
                  <option key={`from-${acc.id}`} value={acc.id} className="text-slate-900">
                    {(acc.account_type || acc.type || 'Account').toUpperCase()} (${parseFloat(acc.balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="button"
              onClick={swapWallets}
              className="p-3 bg-gold-500 text-slate-900 rounded-full shadow-lg shadow-gold-500/20 hover:scale-110 transition-transform"
            >
              <FaExchangeAlt size={12} />
            </button>
            <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">To Account</p>
              <select 
                value={toAccount} 
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight focus:outline-none"
              >
                {accounts.map(acc => (
                  <option key={`to-${acc.id}`} value={acc.id} className="text-slate-900">
                    {(acc.account_type || acc.type || 'Account').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block px-2">Transfer Amount</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500 font-bold">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-black italic focus:outline-none focus:ring-4 focus:ring-gold-500/10 transition-all placeholder-slate-300 dark:placeholder-slate-600"
                required
              />
            </div>
            <div className="mt-2 flex justify-between px-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider italic">
                Available: ${accounts.find(a => a.id == fromAccount)?.balance ? parseFloat(accounts.find(a => a.id == fromAccount)?.balance).toLocaleString() : '0.00'}
              </span>
              <button 
                type="button"
                onClick={() => {
                  const maxAmt = accounts.find(a => a.id == fromAccount)?.balance || 0;
                  setAmount(maxAmt);
                }}
                className="text-[9px] font-black text-gold-500 uppercase tracking-wider hover:underline"
              >
                Max Amount
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-gold-500/20 flex items-center justify-center space-x-3 group"
          >
            <span>Execute Transfer Flow</span>
            <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
