import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { WITHDRAWAL_METHODS } from './config';

const WithdrawalFundsModal = ({
  open = false,
  onClose = () => {},
  onWithdraw = async () => false,
  walletBalance = 0,
  isDemo = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedMethod('bank');
      setWithdrawAmount('');
      setIsSubmitting(false);
      setErrorMessage('');
    }
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const numericBalance = Number.parseFloat(walletBalance) || 0;

  const handleWithdraw = async () => {
    const amount = Number.parseFloat(withdrawAmount);

    if (isDemo) {
      setErrorMessage('Withdrawals are not available for demo accounts.');
      return;
    }

    if (!withdrawAmount || !Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (amount > numericBalance) {
      setErrorMessage('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const success = await onWithdraw(withdrawAmount, selectedMethod);

      if (!success) {
        setErrorMessage('Withdrawal request failed. Please try again.');
        return;
      }

      onClose();
    } catch {
      setErrorMessage('Withdrawal request failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase transition-colors">Withdraw Funds</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.2em] transition-colors">Send money from your account</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="space-y-8">
          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {isDemo ? (
            <div className="rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-6 py-10 text-center">
              <p className="text-sm font-black italic text-slate-900 dark:text-white">Withdrawals are not available for demo accounts.</p>
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">Switch to a live account to submit a real withdrawal request.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Payout Method</label>
                <div className="grid grid-cols-1 gap-3">
                  {WITHDRAWAL_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full p-6 rounded-[1.5rem] border flex items-center justify-between transition-all duration-300 ${
                        selectedMethod === method.id
                          ? 'border-rose-500 bg-rose-500 text-white shadow-xl scale-[1.02]'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 hover:border-rose-300 dark:hover:border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-center space-x-5">
                        <method.icon className={selectedMethod === method.id ? 'text-white' : 'text-slate-500 dark:text-slate-600'} size={24} />
                        <div className="text-left font-black uppercase italic tracking-widest text-[10px]">
                          <p className={selectedMethod === method.id ? 'text-white' : 'text-slate-900 dark:text-white transition-colors'}>{method.name}</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-1 opacity-70 transition-colors">{method.processing} | {method.fee} Fee</p>
                        </div>
                      </div>
                      {selectedMethod === method.id && <FaCheck className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400 dark:text-slate-700 italic">$</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-12 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-3xl font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-rose-500/10 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Available balance: ${numericBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {!isDemo && (
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || isSubmitting}
                className="flex-1 px-8 py-5 bg-rose-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-rose-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-2xl shadow-rose-500/20"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-8 py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {isDemo ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WithdrawalFundsModal;
