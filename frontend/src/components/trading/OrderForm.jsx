// frontend/src/components/trading/OrderForm.jsx
import React, { useState } from 'react';
import { FaBolt, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const OrderForm = ({ onSubmit, symbol = 'BTCUSD', compact = false }) => {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [leverage, setLeverage] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      symbol,
      type: orderType,
      side,
      amount: parseFloat(amount),
      price: orderType !== 'market' ? parseFloat(price) : undefined,
      stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
      leverage
    });
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const SideButton = ({ targetSide, label }) => (
    <button
      type="button"
      onClick={() => setSide(targetSide)}
      className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
        side === targetSide
          ? targetSide === 'buy' 
            ? 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 -translate-y-1' 
            : 'bg-rose-500 text-white shadow-2xl shadow-rose-500/30 -translate-y-1'
          : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
      }`}
    >
      {label}
    </button>
  );

  const InputField = ({ label, value, onChange, placeholder, type = "number" }) => (
    <div className="group">
      {label && <label className="block text-[9px] uppercase font-black text-slate-400 mb-2 ml-2 tracking-[0.2em]">{label}</label>}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-xs font-black italic focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-300 transition-all placeholder-slate-300 shadow-inner"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase tracking-widest">USD</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
      {/* Decorative Accents */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full ${side === 'buy' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      
      <div className="relative">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-3">
              <FaBolt className="text-gold-500" />
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-[0.2em] italic">Instant Terminal</h3>
          </div>
          <FaShieldAlt className="text-slate-200" />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Order Type Selection */}
          <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-100/50 shadow-inner">
            {['market', 'limit', 'stop'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`flex-1 py-3 text-[9px] font-black rounded-xl uppercase tracking-widest transition-all duration-300 ${
                  orderType === type
                    ? 'bg-white text-slate-900 shadow-xl shadow-slate-200/50 border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Buy/Sell Toggle */}
          <div className="flex gap-4">
            <SideButton targetSide="buy" label="BUY" />
            <SideButton targetSide="sell" label="SELL" />
          </div>

          {/* Amount Input */}
          <InputField
            label="Investment Amount"
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
          />

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickAmounts.map(qty => (
              <button
                key={qty}
                type="button"
                onClick={() => setAmount(qty)}
                className="py-3 bg-white text-slate-400 rounded-xl text-[9px] font-black border border-slate-100 hover:border-slate-900 hover:text-slate-900 uppercase transition-all shadow-sm"
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
          <div className="mt-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
            <div className="flex justify-between items-end mb-4">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]">Leverage Control</label>
              <span className="text-xs font-black text-white bg-slate-900 px-4 py-1.5 rounded-full italic shadow-lg">x{leverage}</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
            />
            <div className="flex justify-between mt-3 px-1">
              <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase">Safe</span>
              <span className="text-[8px] font-black text-slate-300 tracking-widest uppercase">Extreme</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-900 rounded-[2rem] p-8 space-y-4 shadow-2xl shadow-slate-900/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
            <div className="flex justify-between items-center relative">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Margin Required</span>
              <span className="text-sm font-black text-gold-500 italic">${amount ? (parseFloat(amount) / leverage).toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex justify-between items-center relative">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exchange Fee</span>
              <span className="text-sm font-black text-slate-300 italic">${amount ? (parseFloat(amount) * 0.001).toFixed(2) : '0.00'}</span>
            </div>
            <div className="h-[1px] bg-slate-800 my-2"></div>
            <div className="flex justify-between items-center relative">
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Total Exposure</span>
              <span className="text-lg font-black text-white italic tracking-tighter">${amount || '0.00'}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] text-white transition-all duration-500 transform active:scale-[0.95] group relative overflow-hidden ${
              side === 'buy'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-2xl shadow-emerald-600/40'
                : 'bg-rose-600 hover:bg-rose-500 shadow-2xl shadow-rose-600/40'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center">
              Execute {side === 'buy' ? 'Buy' : 'Sell'} Order
              <FaChartLine className="ml-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;