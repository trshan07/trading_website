import React from 'react';
import { FaPlus, FaUniversity, FaCheck, FaTrash, FaBuilding } from 'react-icons/fa';
import { maskAccountNumber } from '../utils';

const BankAccountsSection = ({
  bankAccounts = [],
  resetBankForm,
  setShowAddAccount,
  handleSetDefaultAccount,
  handleDeleteAccount,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
      <div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Bank Account Linking</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.16em] sm:tracking-[0.2em]">Verified withdrawal-ready banking profiles</p>
      </div>
      <button
        onClick={() => {
          resetBankForm();
          setShowAddAccount(true);
        }}
        className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-xl shadow-slate-900/10 dark:shadow-gold-500/10 font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 group"
      >
        <FaPlus size={10} className="text-gold-500 dark:text-slate-900 group-hover:text-white transition-colors" />
        <span>Add Account</span>
      </button>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {bankAccounts.map((account) => (
          <div key={account.id} className="group bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 hover:border-gold-500/30 transition-all">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group-hover:border-gold-500/20 transition-colors">
                <FaUniversity className="text-gold-500 text-xl" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="text-slate-900 dark:text-white font-extrabold break-words">{account.bankName}</h4>
                  {account.isVerified && (
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-tighter">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 break-words">
                  {account.accountHolderName || account.accountName} | {account.maskedAccountNumber || maskAccountNumber(account.accountNumber)}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold break-words">
                  {(account.accountType || 'account').toUpperCase()} | {account.currency || 'USD'} | {account.country || 'Global'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold break-words">
                  Swift: {account.swiftCode || 'Pending'} | Beneficiary: {account.beneficiaryName || account.accountHolderName || account.accountName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              {account.isDefault && (
                <span className="px-3 py-1 bg-gold-50 dark:bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-black rounded-lg border border-gold-100 dark:border-gold-500/20 uppercase">Default</span>
              )}
              <div className="flex gap-1.5 ml-2">
                {!account.isDefault && bankAccounts.length > 1 && (
                  <button
                    onClick={() => handleSetDefaultAccount(account.id)}
                    className="p-2 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-emerald-100 transition-all"
                  >
                    <FaCheck size={12} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-2 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-rose-100 transition-all"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {bankAccounts.length === 0 && (
      <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <FaBuilding className="mx-auto text-slate-200 dark:text-slate-700 text-5xl mb-4" />
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-sm">No Bank Accounts Linked</p>
      </div>
    )}
  </div>
);

export default BankAccountsSection;
