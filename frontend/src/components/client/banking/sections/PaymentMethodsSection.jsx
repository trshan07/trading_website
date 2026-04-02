import React from 'react';
import { FaPaypal, FaMoneyBillWave, FaCheck, FaTimes } from 'react-icons/fa';

const PaymentMethodsSection = ({ paymentMethods = [] }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300 mt-8">
    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-8 sm:mb-10">Digital Processors</h3>

    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <div key={method.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 gap-4 sm:gap-6 group hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center space-x-4 sm:space-x-5 min-w-0">
            <div className="p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-50 dark:border-slate-600 group-hover:border-gold-500/20 transition-colors">
              {method.method === 'PayPal' && <FaPaypal className="text-blue-500 text-2xl" />}
              {method.method === 'Skrill' && <FaMoneyBillWave className="text-orange-500 text-2xl" />}
              {method.method === 'Neteller' && <FaMoneyBillWave className="text-emerald-500 text-2xl" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{method.method}</p>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 italic lowercase break-all">{method.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {method.isVerified ? (
              <span className="flex items-center px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                <FaCheck size={8} className="mr-1.5" /> Verified Sink
              </span>
            ) : (
              <span className="flex items-center px-3 py-1 bg-rose-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                <FaTimes size={8} className="mr-1.5" /> Unverified Sink
              </span>
            )}
            {method.isDefault && (
              <span className="px-3 py-1 bg-slate-900 dark:bg-gold-500 text-gold-500 dark:text-slate-900 text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">Master Link</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PaymentMethodsSection;
