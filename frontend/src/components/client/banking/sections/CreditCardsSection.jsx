import React from 'react';
import { FaPlus, FaCreditCard, FaCheck, FaTrash } from 'react-icons/fa';

const CreditCardsSection = ({
  creditCards = [],
  setShowAddCard,
  getCardIcon,
  handleDeleteCard,
  handleSetDefaultCard,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 transition-colors duration-300 mt-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
      <div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Credit Lines</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase font-black tracking-[0.16em] sm:tracking-[0.2em]">Authorized Payment Vectors</p>
      </div>
      <button
        onClick={() => setShowAddCard(true)}
        className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-gold-500 text-white dark:text-slate-900 rounded-[1.5rem] hover:bg-gold-600 dark:hover:bg-gold-400 transition-all shadow-xl shadow-slate-900/10 dark:shadow-gold-500/10 font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 group"
      >
        <FaPlus size={10} className="text-gold-500 dark:text-slate-900 group-hover:text-white transition-colors" />
        <span>Register Card</span>
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {creditCards.map((card) => (
        <div key={card.id} className="bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-5 sm:p-8 border border-slate-800 dark:border-slate-700 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[50px] rounded-full translate-x-16 -translate-y-16"></div>
          <div className="flex justify-between items-start mb-7 sm:mb-10 relative gap-3">
            {getCardIcon(card.cardType)}
            {card.isDefault && (
              <span className="px-3 py-1 bg-gold-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest italic shadow-lg shadow-gold-500/20">Primary Vector</span>
            )}
          </div>
          <p className="text-white font-mono text-lg sm:text-xl tracking-[0.12em] sm:tracking-[0.2em] relative mb-5 sm:mb-6">.... .... .... {card.last4}</p>
          <p className="text-[10px] font-black text-gold-500 uppercase tracking-[0.12em] sm:tracking-widest relative italic break-words">{card.cardholderName}</p>
          <div className="flex justify-between items-end mt-8 relative pt-6 border-t border-white/5">
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Valid Thru</p>
              <p className="text-xs font-black text-white italic">{card.expiry || `${card.expiryMonth}/${card.expiryYear}`}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Limit</p>
              <p className="text-xs font-black text-emerald-400 italic">${card.availableCredit?.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2 relative">
            {!card.isDefault && creditCards.length > 1 && (
              <button
                onClick={() => handleSetDefaultCard?.(card.id)}
                className="p-2 bg-white/10 text-slate-300 hover:text-emerald-400 rounded-lg border border-white/10 hover:border-emerald-500/30 transition-all"
                title="Set as default"
              >
                <FaCheck size={12} />
              </button>
            )}
            <button
              onClick={() => handleDeleteCard?.(card.id)}
              className="p-2 bg-white/10 text-slate-300 hover:text-rose-400 rounded-lg border border-white/10 hover:border-rose-500/30 transition-all"
              title="Delete card"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>

    {creditCards.length === 0 && (
      <div className="text-center py-8">
        <FaCreditCard className="mx-auto text-gold-500/30 text-3xl sm:text-4xl mb-3" />
        <p className="text-gold-500/50 text-sm sm:text-base">No credit cards added yet</p>
      </div>
    )}
  </div>
);

export default CreditCardsSection;
