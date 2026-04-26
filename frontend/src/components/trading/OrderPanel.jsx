import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaMinus, FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa';
import { calculateSpreads } from '../../utils/spreadCalculator';

const OrderPanel = ({ onSubmit, symbol = 'BTCUSDT', marketData = {}, onClose, onIntentChange = () => {}, maxLeverage = 400 }) => {
  const [orderType, setOrderType] = useState('market'); // market or pending
  const [amount, setAmount] = useState(1);
  const [leverage, setLeverage] = useState(1);
  const [takeProfit, setTakeProfit] = useState(false);
  const [stopLoss, setStopLoss] = useState(false);
  const [tpValue, setTpValue] = useState('');
  const [slValue, setSlValue] = useState('');
  const [pendingPrice, setPendingPrice] = useState('');
  const [selectedSide, setSelectedSide] = useState('buy'); // 'buy' or 'sell'
  
  const prevIntentRef = useRef({});
  const safeMaxLeverage = Math.max(parseInt(maxLeverage, 10) || 1, 1);

  useEffect(() => {
    setLeverage((prev) => Math.min(Math.max(prev || 1, 1), safeMaxLeverage));
  }, [safeMaxLeverage]);
  
  // Sync intent with parent for chart labels
  useEffect(() => {
    const currentIntent = { 
      side: selectedSide, 
      type: orderType,
      price: orderType === 'pending' ? pendingPrice : null 
    };
    
    // Only update parent if actual values changed to prevent re-render loops
    if (
      prevIntentRef.current.side !== currentIntent.side ||
      prevIntentRef.current.type !== currentIntent.type ||
      prevIntentRef.current.price !== currentIntent.price
    ) {
      onIntentChange(currentIntent);
      prevIntentRef.current = currentIntent;
    }
  }, [selectedSide, orderType, pendingPrice, onIntentChange]);

  // Get current prices from marketData
  const liveInfo = marketData[symbol] || {};
  const currentPrice = liveInfo.price || 0;
  const lastDir = liveInfo.lastDir || 'none';
  const flashClass = lastDir === 'up' ? 'flash-up' : lastDir === 'down' ? 'flash-down' : '';
  
  const { bidPrice, askPrice, spreadAmt } = calculateSpreads(symbol, currentPrice);
  const executionPrice = selectedSide === 'buy' ? askPrice : bidPrice;
  const totalPositionValue = Number(amount) || 0;
  const requiredMargin = leverage > 0 ? totalPositionValue / leverage : 0;

  const getPipDistance = (target) => {
    if (!target || !currentPrice) return null;
    const diff = Math.abs(parseFloat(target) - currentPrice);
    const isForex = symbol.includes('USD') && !symbol.includes('USDT');
    const pipScale = isForex ? 0.0001 : 1;
    return (diff / pipScale).toFixed(1);
  };

  const handleAmountChange = (val) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) setAmount(num);
  };

  const incrementAmount = () => setAmount(prev => prev + 1);
  const decrementAmount = () => setAmount(prev => Math.max(0, prev - 1));

  const quickAmounts = [100, 500, 1000];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      symbol,
      type: orderType === 'market' ? 'market' : 'limit',
      side: selectedSide,
      amount: amount,
      leverage: leverage,
      takeProfit: takeProfit ? parseFloat(tpValue) : null,
      stopLoss: stopLoss ? parseFloat(slValue) : null,
      price: orderType === 'pending' ? parseFloat(pendingPrice) : executionPrice
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-900 dark:bg-gold-500 rounded-lg flex items-center justify-center shadow-lg">
             <span className="text-[10px] font-black text-white dark:text-slate-900 uppercase tracking-tighter">{symbol.slice(0,3)}</span>
          </div>
          <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest italic">{symbol}</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors">
            <FaTimes size={12} />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Order Type Tabs */}
        <div className="flex p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          {['market', 'pending'].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                orderType === type
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {type === 'market' ? 'Market' : 'Pending Order'}
            </button>
          ))}
        </div>

        {/* Buy/Sell Execution Section */}
        <div className="grid grid-cols-2 gap-3">
          {/* SELL — always red */}
          <button 
            onClick={() => setSelectedSide('sell')}
            className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
              selectedSide === 'sell' 
                ? 'bg-rose-500 border-rose-400 shadow-xl shadow-rose-500/30 scale-[1.03]' 
                : 'bg-rose-500/70 border-rose-600/50 opacity-75 hover:opacity-90 hover:scale-[1.02]'
            } text-white`}
          >
            <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">Sell</span>
            <span className={`text-sm font-black italic rounded px-1 transition-all text-white ${flashClass}`}>{bidPrice}</span>
          </button>
          
          {/* BUY — always green */}
          <button 
            onClick={() => setSelectedSide('buy')}
            className={`flex flex-col items-center p-4 rounded-2xl border transition-all ${
              selectedSide === 'buy' 
                ? 'bg-emerald-500 border-emerald-400 shadow-xl shadow-emerald-500/30 scale-[1.03]' 
                : 'bg-emerald-500/70 border-emerald-600/50 opacity-75 hover:opacity-90 hover:scale-[1.02]'
            } text-white`}
          >
            <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">Buy</span>
            <span className={`text-sm font-black italic rounded px-1 transition-all text-white ${flashClass}`}>{askPrice}</span>
          </button>
        </div>

        {/* Spread Indicator */}
        <div className="flex justify-center -mt-2 mb-2">
          <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-[8px] font-black uppercase text-slate-500 tracking-widest border border-slate-200 dark:border-slate-700">
            Spread: <span className="text-gold-500 tabular-nums">{spreadAmt > 0.01 ? spreadAmt.toFixed(2) : spreadAmt.toFixed(4)}</span>
          </span>
        </div>

        {/* Pending Price Input */}
        {orderType === 'pending' && (
           <div className="space-y-2">
             <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Trigger Price</label>
             <input 
               type="text"
               value={pendingPrice}
               onChange={(e) => setPendingPrice(e.target.value)}
               placeholder="Enter entry price..."
               className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-black italic text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
             />
           </div>
        )}

        {/* Amount Stepper */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Entry Amount</label>
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">USD Notional</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={decrementAmount}
              className="w-12 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
            >
              <FaMinus size={10} />
            </button>
            <input 
              type="text" 
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="flex-1 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-center text-sm font-black italic text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
            <button 
              onClick={incrementAmount}
              className="w-12 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
            >
              <FaPlus size={10} />
            </button>
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map(val => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className="py-2.5 bg-slate-50/50 dark:bg-slate-800/30 text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 rounded-xl border border-slate-100/50 dark:border-slate-700/50 hover:border-gold-500 hover:text-gold-500 transition-all font-sans"
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            {/* Leverage Retained Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Leverage Factor</label>
                <div className="flex items-center space-x-2">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Max 1:{safeMaxLeverage}</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white bg-gold-500 px-3 py-1 rounded-lg italic shadow-lg shadow-gold-500/10">1:{leverage}</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max={safeMaxLeverage}
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
              />
              <div className="flex justify-between mt-3 px-1 text-[8px] font-black text-slate-600 dark:text-slate-700 uppercase tracking-widest">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>

            {/* Dynamic Risk Controls */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setTakeProfit(!takeProfit)}>
                  <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${takeProfit ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700'}`}>
                        {takeProfit && <FaCheck size={7} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">Take Profit</span>
                  </div>
                </div>
                {takeProfit && (
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Target Price..."
                      value={tpValue}
                      onChange={(e) => setTpValue(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-emerald-500/30 rounded-xl text-xs font-black italic text-emerald-600 dark:text-emerald-400 placeholder-emerald-900/30 dark:placeholder-emerald-500/20 focus:outline-none"
                    />
                    {tpValue && (
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-emerald-500/60 tracking-widest">
                         {getPipDistance(tpValue)} Pips
                       </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setStopLoss(!stopLoss)}>
                  <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${stopLoss ? 'bg-rose-500 border-rose-400 text-white' : 'border-slate-700'}`}>
                        {stopLoss && <FaCheck size={7} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">Stop Loss</span>
                  </div>
                </div>
                {stopLoss && (
                   <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Stop Price..."
                      value={slValue}
                      onChange={(e) => setSlValue(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-rose-500/30 rounded-xl text-xs font-black italic text-rose-600 dark:text-rose-400 placeholder-rose-900/30 dark:placeholder-rose-500/20 focus:outline-none"
                    />
                    {slValue && (
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-rose-500/60 tracking-widest">
                         {getPipDistance(slValue)} Pips
                       </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

         {/* Order Summary */}
         <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-inner">
            <div className="flex justify-between items-center text-[9px] uppercase font-black">
               <span className="text-slate-400 dark:text-slate-500 tracking-widest">Execution Price</span>
               <span className="text-slate-900 dark:text-white italic">${executionPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] uppercase font-black">
               <span className="text-slate-400 dark:text-slate-500 tracking-widest">Total Position Value</span>
               <span className="text-slate-900 dark:text-white italic">${totalPositionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] uppercase font-black">
               <span className="text-slate-400 dark:text-slate-500 tracking-widest">Required Margin</span>
               <span className="text-gold-500 italic">${requiredMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
         </div>
      </div>

      {/* Primary Action */}
      <div className="p-6 bg-slate-800/30 border-t border-slate-800/50 pt-6">
        <button
          onClick={handleSubmit}
          className="w-full py-5 bg-gold-500 hover:bg-gold-400 text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.25em] text-[11px] shadow-2xl shadow-gold-500/20 transform active:scale-95 transition-all text-center italic"
        >
          Place {selectedSide === 'buy' ? 'Buy' : 'Sell'} Order
        </button>
      </div>
    </div>
  );
};

export default OrderPanel;
