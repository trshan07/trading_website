import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaCheck, FaTimes, FaUpload } from 'react-icons/fa';
import { DEPOSIT_METHODS } from './config';

const DepositFundsModal = ({
  open = false,
  onClose = () => {},
  onDeposit = async () => false,
  platformInfo = null,
}) => {
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositReference, setDepositReference] = useState('');
  const [depositProof, setDepositProof] = useState(null);
  const [depositProofName, setDepositProofName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedMethod('bank');
      setDepositAmount('');
      setDepositReference('');
      setDepositProof(null);
      setDepositProofName('');
      setIsSubmitting(false);
      setErrorMessage('');
    }
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    if (selectedMethod === 'bank' && !depositReference.trim()) {
      setErrorMessage('Transfer reference is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const success = await onDeposit(
        depositAmount,
        selectedMethod,
        depositReference,
        depositProof
      );

      if (!success) {
        setErrorMessage('Deposit request failed. Please try again.');
        return;
      }

      onClose();
    } catch {
      setErrorMessage('Deposit request failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase transition-colors">Deposit Funds</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.2em] transition-colors">Add money to your account</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl flex items-center justify-center transition-all border border-slate-100 dark:border-slate-700">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="space-y-8">
          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] ml-2">Payment Method</label>
            <div className="grid grid-cols-1 gap-3">
              {DEPOSIT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-6 rounded-[1.5rem] border flex items-center justify-between transition-all duration-300 ${
                    selectedMethod === method.id
                      ? 'border-slate-900 dark:border-gold-500 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 shadow-xl scale-[1.02]'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-5">
                    <method.icon className={selectedMethod === method.id ? 'text-gold-500 dark:text-slate-900' : 'text-slate-500 dark:text-slate-600'} size={24} />
                    <div className="text-left font-black uppercase italic tracking-widest text-[10px]">
                      <p className={selectedMethod === method.id ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white transition-colors'}>{method.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 opacity-70 transition-colors">{method.processing} | {method.fee} Fee</p>
                    </div>
                  </div>
                  {selectedMethod === method.id && <FaCheck className="text-gold-500 dark:text-slate-900" />}
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
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full pl-12 pr-6 py-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-3xl font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-8 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {selectedMethod === 'bank' && platformInfo && (
            <div className="bg-gradient-to-br from-white via-slate-50 to-amber-50/60 dark:from-slate-900 dark:to-slate-800 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] italic">Bank Details</h4>
                <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 text-[8px] font-black uppercase tracking-widest border border-gold-500/20">Verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Bank Name</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white italic">{platformInfo.bank_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Account Name</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white italic">{platformInfo.account_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">IBAN / Account No</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white italic tracking-tighter">{platformInfo.iban || platformInfo.account_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SWIFT / BIC</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white italic">{platformInfo.swift_bic}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Transfer Reference *</label>
                  <input
                    type="text"
                    value={depositReference}
                    onChange={(e) => setDepositReference(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                    placeholder="RT-XXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] ml-1">Proof of Transfer *</label>
                  <label className="flex items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-gold-500/50 transition-all">
                    <div className="flex items-center gap-3">
                      <FaUpload className="text-gold-500 text-xs" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                        {depositProofName || 'Upload transaction receipt'}
                      </span>
                    </div>
                    <span className="text-[8px] font-black text-gold-500 uppercase tracking-widest">Select File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setDepositProof(file);
                        setDepositProofName(file?.name || '');
                      }}
                      accept="image/*,.pdf"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleDeposit}
              disabled={!depositAmount || isSubmitting}
              className="flex-1 px-8 py-5 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-gold-600 dark:hover:bg-gold-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all shadow-2xl shadow-slate-900/10 dark:shadow-gold-500/10"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Deposit'}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DepositFundsModal;
