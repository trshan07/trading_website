import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaArrowUp, FaArrowDown, FaTimes, FaExchangeAlt, FaHistory, FaListUl, FaChartLine, FaShieldAlt, FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSpreads } from '../../utils/spreadCalculator';
import { calculateUsdFromLots, calculateLotsFromUsd, getLotStep, getLotUnits, calculatePips } from '../../utils/tradingUtils';
import { MARKET_INSTRUMENTS } from '../../constants/marketData';

const OrderPanel = ({ 
  onSubmit, 
  symbol = 'BTCUSDT', 
  onClose, 
  marketData = {}, 
  onIntentChange,
  maxLeverage = 500,
  positions = [],
  orders = [],
  history = []
}) => {
  const [orderType, setOrderType] = useState('market'); // market, limit, stop
  const [selectedSide, setSelectedSide] = useState('buy');
  const [lots, setLots] = useState(0.01);
  const [amount, setAmount] = useState(100); // USD
  const [leverage, setLeverage] = useState(100);
  const [useLots, setUseLots] = useState(true);
  
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slEnabled, setSlEnabled] = useState(false);
  const [tpValue, setTpValue] = useState('');
  const [slValue, setSlValue] = useState('');
  
  const [pendingPrice, setPendingPrice] = useState('');
  const [activeTab, setActiveTab] = useState('trade'); // trade, positions, orders

  const instrument = useMemo(() => MARKET_INSTRUMENTS.find(i => i.symbol === symbol) || {}, [symbol]);
  const category = instrument.category || 'Crypto';

  // Get current prices from marketData
  const liveInfo = marketData[symbol] || {};
  const currentPrice = liveInfo.price || instrument.price || 0;
  const lastDir = liveInfo.lastDir || 'none';
  const flashClass = lastDir === 'up' ? 'flash-up' : lastDir === 'down' ? 'flash-down' : '';
  
  const { bidPrice: calcBid, askPrice: calcAsk, spreadAmt: calcSpread } = calculateSpreads(symbol, currentPrice);
  const bidPrice = liveInfo.bid ? liveInfo.bid.toFixed(category.includes('Forex') ? 5 : 2) : calcBid;
  const askPrice = liveInfo.ask ? liveInfo.ask.toFixed(category.includes('Forex') ? 5 : 2) : calcAsk;
  const spreadAmt = liveInfo.bid && liveInfo.ask ? Math.abs(liveInfo.ask - liveInfo.bid) : calcSpread;
  const executionPrice = selectedSide === 'buy' ? parseFloat(askPrice) : parseFloat(bidPrice);

  // Sync Lots/USD
  useEffect(() => {
    if (useLots) {
      const usd = calculateUsdFromLots(lots, currentPrice, category);
      setAmount(usd.toFixed(2));
    } else {
      const l = calculateLotsFromUsd(amount, currentPrice, category);
      setLots(parseFloat(l.toFixed(3)));
    }
  }, [lots, amount, useLots, currentPrice, category]);

  // Handle Intent Change for Chart Visuals
  useEffect(() => {
    if (onIntentChange) {
      onIntentChange({
        side: selectedSide,
        type: orderType,
        price: orderType === 'market' ? null : parseFloat(pendingPrice) || currentPrice,
        tp: tpEnabled ? parseFloat(tpValue) : null,
        sl: slEnabled ? parseFloat(slValue) : null
      });
    }
  }, [selectedSide, orderType, pendingPrice, tpEnabled, tpValue, slEnabled, slValue, onIntentChange, currentPrice]);

  const handleExecute = () => {
    const finalPrice = orderType === 'market' ? executionPrice : parseFloat(pendingPrice);
    if (!finalPrice && orderType !== 'market') return;

    onSubmit({
      symbol,
      type: orderType,
      side: selectedSide,
      amount: parseFloat(amount),
      leverage: leverage,
      takeProfit: tpEnabled ? parseFloat(tpValue) : null,
      stopLoss: slEnabled ? parseFloat(slValue) : null,
      price: finalPrice
    });
  };

  const lotStep = getLotStep(category);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-full transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-900 dark:bg-gold-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
             <span className="text-[11px] font-black text-white dark:text-slate-900 uppercase tracking-tighter">{symbol.slice(0,3)}</span>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-widest italic leading-none">{symbol}</h3>
            <p className={`text-[10px] font-black tabular-nums mt-1.5 flex items-center ${lastDir === 'up' ? 'text-emerald-500' : lastDir === 'down' ? 'text-rose-500' : 'text-slate-400'}`}>
              {lastDir === 'up' ? <FaCaretUp className="mr-0.5" /> : lastDir === 'down' ? <FaCaretDown className="mr-0.5" /> : null}
              {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Spread: <span className="text-gold-500">{spreadAmt.toFixed(category.includes('Forex') ? 5 : 2)}</span>
          </span>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 rounded-lg transition-all">
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main View Selection (Trade / Account) */}
      <div className="flex border-b border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/50">
        {[
          { id: 'trade', icon: FaExchangeAlt, label: 'Trade' },
          { id: 'positions', icon: FaChartLine, label: 'Active' },
          { id: 'orders', icon: FaListUl, label: 'Pending' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-gold-500 text-slate-900 dark:text-gold-500 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={10} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeTab === 'trade' && (
            <motion.div 
              key="trade"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-6 space-y-6"
            >
              {/* Buy/Sell Large Selector */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setSelectedSide('buy')}
                  className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex flex-col items-center ${
                    selectedSide === 'buy'
                      ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-emerald-500'
                  }`}
                >
                  <span>BUY / LONG</span>
                  <span className="text-[8px] opacity-70 mt-1">ASK: {askPrice}</span>
                </button>
                <button
                  onClick={() => setSelectedSide('sell')}
                  className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex flex-col items-center ${
                    selectedSide === 'sell'
                      ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30'
                      : 'text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <span>SELL / SHORT</span>
                  <span className="text-[8px] opacity-70 mt-1">BID: {bidPrice}</span>
                </button>
              </div>

              {/* Order Type Tabs */}
              <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700/50">
                {['market', 'limit', 'stop'].map(type => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      orderType === type
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-100 dark:border-slate-700'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Lot / Quantity Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Volume (Lots)</label>
                  <button 
                    onClick={() => setUseLots(!useLots)}
                    className="text-[8px] font-black uppercase text-gold-500 hover:underline flex items-center space-x-1"
                  >
                    <FaExchangeAlt size={8} />
                    <span>Switch to {useLots ? 'USD' : 'Lots'}</span>
                  </button>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-300">
                    {useLots ? 'LOT' : '$'}
                  </div>
                  <input
                    type="number"
                    step={lotStep}
                    value={useLots ? lots : amount}
                    onChange={(e) => useLots ? setLots(parseFloat(e.target.value)) : setAmount(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 transition-all"
                  />
                  <div className="absolute inset-y-0 right-2 flex flex-col justify-center space-y-1">
                    <button 
                      onClick={() => useLots ? setLots(prev => +(prev + lotStep).toFixed(3)) : setAmount(prev => prev + 100)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
                    >
                      <FaCaretUp size={10} />
                    </button>
                    <button 
                      onClick={() => useLots ? setLots(prev => Math.max(0.01, +(prev - lotStep).toFixed(3))) : setAmount(prev => Math.max(0, prev - 100))}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
                    >
                      <FaCaretDown size={10} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span>≈ {useLots ? `$${amount}` : `${lots} Lots`}</span>
                  <span>Margin Required: <span className="text-white dark:text-gold-500">${(amount / leverage).toFixed(2)}</span></span>
                </div>
              </div>

              {/* Pending Price Input */}
              {orderType !== 'market' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Trigger Price</label>
                  <input
                    type="number"
                    placeholder={`Enter ${orderType} price...`}
                    value={pendingPrice}
                    onChange={(e) => setPendingPrice(e.target.value)}
                    className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl py-4 px-4 text-sm font-black text-amber-500 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              )}

              {/* Risk Management (TP/SL) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  <FaShieldAlt className="text-gold-500" />
                  <span>Risk Management</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Take Profit */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => setTpEnabled(!tpEnabled)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[8px] font-black uppercase transition-all ${
                        tpEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
                      }`}
                    >
                      <span>Take Profit</span>
                      <div className={`w-2 h-2 rounded-full ${tpEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    </button>
                    {tpEnabled && (
                      <div className="space-y-1">
                        <input
                          type="number"
                          placeholder="Price"
                          value={tpValue}
                          onChange={(e) => setTpValue(e.target.value)}
                          className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-lg py-2 px-3 text-xs font-black text-emerald-500 focus:outline-none"
                        />
                        <div className="text-[7px] text-emerald-500/70 font-bold uppercase text-right">
                          +{calculatePips(symbol, currentPrice, parseFloat(tpValue) || currentPrice).toFixed(1)} Pips
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stop Loss */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSlEnabled(!slEnabled)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-[8px] font-black uppercase transition-all ${
                        slEnabled ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'
                      }`}
                    >
                      <span>Stop Loss</span>
                      <div className={`w-2 h-2 rounded-full ${slEnabled ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
                    </button>
                    {slEnabled && (
                      <div className="space-y-1">
                        <input
                          type="number"
                          placeholder="Price"
                          value={slValue}
                          onChange={(e) => setSlValue(e.target.value)}
                          className="w-full bg-rose-500/5 border border-rose-500/20 rounded-lg py-2 px-3 text-xs font-black text-rose-500 focus:outline-none"
                        />
                        <div className="text-[7px] text-rose-500/70 font-bold uppercase text-right">
                          -{calculatePips(symbol, currentPrice, parseFloat(slValue) || currentPrice).toFixed(1)} Pips
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Leverage Selector */}
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                  <span>Leverage</span>
                  <span className="text-gold-500">1:{leverage}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={maxLeverage}
                  step="1"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
                <div className="flex justify-between text-[7px] font-bold text-slate-400 uppercase">
                  <span>1x</span>
                  <span>100x</span>
                  <span>250x</span>
                  <span>{maxLeverage}x</span>
                </div>
              </div>

              {/* Execute Button */}
              <button
                onClick={handleExecute}
                className={`w-full py-5 rounded-2xl shadow-2xl transition-all active:scale-95 flex flex-col items-center group overflow-hidden relative ${
                  selectedSide === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                }`}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white relative z-10">
                  {orderType === 'market' ? `Execute ${selectedSide}` : `Place ${orderType}`}
                </span>
                <span className="text-[9px] font-bold text-white/70 mt-1 relative z-10">
                  {lots} Lots @ {orderType === 'market' ? executionPrice : pendingPrice || '...'}
                </span>
              </button>
            </motion.div>
          )}

          {activeTab === 'positions' && (
            <motion.div 
              key="positions"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 space-y-3"
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white px-2 mb-4">
                Active Positions ({positions.length})
              </div>
              {positions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FaChartLine size={40} className="opacity-10 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Open Positions</p>
                </div>
              ) : (
                positions.map(pos => (
                  <div key={pos.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${pos.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {pos.type}
                        </span>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white">{pos.symbol}</span>
                      </div>
                      <div className={`text-xs font-black tabular-nums ${pos.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                      <span>{pos.quantity} Lots @ {pos.entryPrice}</span>
                      <span>Now: {marketData[pos.symbol]?.price || pos.currentPrice}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${pos.pnl >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: '60%' }} />
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-4 space-y-3"
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white px-2 mb-4">
                Pending Orders ({orders.length})
              </div>
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FaListUl size={40} className="opacity-10 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Pending Orders</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase">
                          {order.type}
                        </span>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white">{order.symbol}</span>
                      </div>
                      <span className={`text-[8px] font-black ${order.side === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {order.side}
                      </span>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                      <span>{order.quantity} Lots @ {order.entryPrice}</span>
                      <span className="text-gold-500 italic">WAITING</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini Footer Stats */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Active P&L</span>
          <span className={`text-xs font-black tabular-nums ${positions.reduce((acc, p) => acc + p.pnl, 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${positions.reduce((acc, p) => acc + p.pnl, 0).toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Account Equity</span>
          <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
            $94,250.00
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
