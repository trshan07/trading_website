import React, { useState } from 'react';
import { FaBolt, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const SideButton = ({ side, targetSide, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${side === targetSide
        ? targetSide === 'buy'
          ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 -translate-y-1'
          : 'bg-rose-500 text-white shadow-2xl shadow-rose-500/30 -translate-y-1'
        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
  >
    {label}
  </button>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', inputMode = 'decimal', min, step, error }) => (
  <div className="group">
    {label && <label className="block text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 mb-2 ml-2 tracking-[0.2em] transition-colors">{label}</label>}
    <div className="relative">
      <input
        type={type}
        inputMode={inputMode}
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-slate-900 dark:text-white text-xs font-black italic focus:outline-none focus:ring-4 focus:bg-white dark:focus:bg-slate-800 transition-all placeholder-slate-300 dark:placeholder-slate-600 shadow-inner ${error
            ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-100 dark:border-slate-700 focus:ring-slate-900/5 dark:focus:ring-gold-500/10 focus:border-slate-300 dark:focus:border-gold-500/30'
          }`}
      />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest transition-colors">USD</div>
    </div>
    {error && <p className="mt-2 ml-2 text-[10px] font-bold text-rose-500">{error}</p>}
  </div>
);

const OrderForm = ({ onSubmit, symbol = 'BTCUSD', compact = false }) => {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [amountError, setAmountError] = useState('');

  const sanitizeCurrencyInput = (value) => value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');

  const handleAmountChange = (value) => {
    const sanitizedValue = sanitizeCurrencyInput(value);
    setAmount(sanitizedValue);

    if (!sanitizedValue) {
      setAmountError('');
      return;
    }

    const parsedAmount = Number(sanitizedValue);
    setAmountError(Number.isFinite(parsedAmount) && parsedAmount > 0 ? '' : 'Enter a valid amount greater than 0.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Enter a valid amount greater than 0.');
      return;
    }

    setAmountError('');
    onSubmit({
      symbol,
      type: orderType,
      side,
      amount: parsedAmount,
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
      leverage
    });
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 relative overflow-hidden transition-colors">
      {/* Decorative Accents */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full transition-colors ${side === 'buy' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

      <div className="relative">
        <div className="flex justify-between items-center mb-10 border-b border-slate-50 dark:border-slate-800/50 pb-6 transition-colors">
          <div className="flex items-center space-x-3">
            <FaBolt className="text-gold-500" />
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em] italic transition-colors">Instant Terminal</h3>
          </div>
          <FaShieldAlt className="text-slate-200 dark:text-slate-700 transition-colors" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Order Type Selection */}
          <div className="flex bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-100/50 dark:border-slate-700/50 shadow-inner transition-colors">
            {['market', 'limit', 'stop'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`flex-1 py-3 text-[9px] font-black rounded-xl uppercase tracking-widest transition-all duration-300 ${orderType === type
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Buy/Sell Toggle */}
          <div className="flex gap-4">
            <SideButton side={side} targetSide="buy" label="BUY" onClick={() => setSide('buy')} />
            <SideButton side={side} targetSide="sell" label="SELL" onClick={() => setSide('sell')} />
          </div>

          {/* Amount Input */}
          <InputField
            label="Investment Amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            error={amountError}
          />

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickAmounts.map(qty => (
              <button
                key={qty}
                type="button"
                onClick={() => handleAmountChange(String(qty))}
                className="py-3 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-xl text-[9px] font-black border border-slate-100 dark:border-slate-800 hover:border-slate-900 dark:hover:border-gold-500 hover:text-slate-900 dark:hover:text-white uppercase transition-all shadow-sm transition-colors"
              >
                ${qty}
              </button>
            ))}
          </div>

          {/* Price Input for Limit Orders */}
          {orderType !== 'market' && (
            <InputField
              label={orderType === 'limit' ? 'Execution Price' : 'Stop Price Trigger'}
              value={orderType === 'limit' ? price : stopPrice}
              onChange={orderType === 'limit' ? setPrice : setStopPrice}
              placeholder="0.00"
            />
          )}

          {/* Leverage Slider */}
          <div className="mt-4 bg-slate-50/50 dark:bg-slate-800/10 p-6 rounded-3xl border border-slate-50 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-end mb-4">
              <label className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] transition-colors">Leverage Control</label>
              <span className="text-xs font-black text-white dark:text-slate-900 bg-slate-900 dark:bg-gold-500 px-4 py-1.5 rounded-full italic shadow-lg transition-colors">x{leverage}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
            <div className="flex justify-between mt-3 px-1">
              <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 tracking-widest uppercase transition-colors">Safe</span>
              <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 tracking-widest uppercase transition-colors">Extreme</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-[2rem] p-8 space-y-4 shadow-2xl shadow-slate-900/30 dark:shadow-black/40 relative overflow-hidden border border-slate-800/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
            <div className="flex justify-between items-center relative">
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest transition-colors">Margin Required</span>
              <span className="text-sm font-black text-gold-500 italic transition-colors">${amount ? (parseFloat(amount) / leverage).toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex justify-between items-center relative">
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest transition-colors">Exchange Fee</span>
              <span className="text-sm font-black text-slate-300 dark:text-slate-400 italic transition-colors">${amount ? (parseFloat(amount) * 0.001).toFixed(2) : '0.00'}</span>
            </div>
            <div className="h-[1px] bg-slate-800 dark:bg-slate-900 my-2 transition-colors"></div>
            <div className="flex justify-between items-center relative">
              <span className="text-[9px] font-black text-white uppercase tracking-widest transition-colors">Total Exposure</span>
              <span className="text-lg font-black text-white italic tracking-tighter transition-colors">${amount || '0.00'}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full min-h-[72px] px-6 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[10px] sm:text-[11px] text-white transition-all duration-500 transform active:scale-[0.95] group relative overflow-hidden ${side === 'buy'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-2xl shadow-emerald-600/40'
                : 'bg-rose-600 hover:bg-rose-500 shadow-2xl shadow-rose-600/40'
              }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3 text-center leading-tight">
              <span className="block">
                Execute {side === 'buy' ? 'Buy' : 'Sell'} Order
              </span>
              <FaChartLine className="hidden sm:block shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
