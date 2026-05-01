import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaExchangeAlt, FaListUl, FaChartLine, FaShieldAlt, FaCaretUp, FaCaretDown, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateSpreads } from '../../utils/spreadCalculator';
import {
  calculateUsdFromLots,
  calculateLotsFromUsd,
  calculateMarginRequired,
  getLotStep,
  getLotPrecision,
  calculatePips,
  calculateProjectedPnL,
  calculateQuantityFromLots,
  getInstrumentTradingMeta,
  getMinLot,
  formatLots
} from '../../utils/tradingUtils';
import { MARKET_INSTRUMENTS } from '../../constants/marketData';
import { buildInstrumentSnapshot } from '../../utils/marketSymbols';

const formatOrderType = (value = '') => value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const OrderPanel = ({
  onSubmit,
  symbol = 'BTCUSDT',
  onClose,
  marketData = {},
  instrument: selectedInstrument,
  portfolio = {},
  onIntentChange,
  maxLeverage = 500,
  positions = [],
  orders = []
}) => {
  const [orderType, setOrderType] = useState('market');
  const [selectedSide, setSelectedSide] = useState('buy');
  const [lots, setLots] = useState(0.01);
  const [amount, setAmount] = useState(100);
  const [useLots, setUseLots] = useState(true);
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slEnabled, setSlEnabled] = useState(false);
  const [tpValue, setTpValue] = useState('');
  const [slValue, setSlValue] = useState('');
  const [activeTab, setActiveTab] = useState('trade');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fallbackInstrument = useMemo(() => MARKET_INSTRUMENTS.find((item) => item.symbol === symbol) || {}, [symbol]);
  const instrument = useMemo(
    () => buildInstrumentSnapshot({
      symbol,
      instrument: selectedInstrument?.symbol === symbol ? selectedInstrument : fallbackInstrument,
      marketData,
    }),
    [fallbackInstrument, marketData, selectedInstrument, symbol]
  );

  const category = instrument.category || 'Crypto';
  const currentPrice = instrument.price || 0;
  const lastDir = instrument.lastDir || 'none';
  const tradingMeta = useMemo(() => getInstrumentTradingMeta({ symbol, category, instrument }), [category, instrument, symbol]);
  const symbolPositions = useMemo(() => positions.filter((position) => position?.symbol === symbol), [positions, symbol]);
  const symbolOrders = useMemo(() => orders.filter((order) => order?.symbol === symbol), [orders, symbol]);
  const activePnl = symbolPositions.reduce((sum, position) => sum + (Number(position?.pnl) || 0), 0);

  const { bidPrice: calcBid, askPrice: calcAsk, spreadAmt: calcSpread } = calculateSpreads(symbol, currentPrice, {
    category,
    precision: instrument.precision,
  });

  const hasRealBidAsk = instrument.useBidAsk !== false
    && Number.isFinite(instrument.bid)
    && Number.isFinite(instrument.ask);

  const bidPrice = hasRealBidAsk
    ? instrument.bid.toFixed(instrument.precision)
    : Number(currentPrice || calcBid).toFixed(instrument.precision);
  const askPrice = hasRealBidAsk
    ? instrument.ask.toFixed(instrument.precision)
    : Number(currentPrice || calcAsk).toFixed(instrument.precision);
  const spreadAmt = hasRealBidAsk ? Math.abs(instrument.ask - instrument.bid) : Number(calcSpread) || 0;

  const executionPrice = selectedSide === 'buy' ? parseFloat(askPrice) : parseFloat(bidPrice);
  const lotStep = getLotStep(category, symbol, instrument);
  const minLot = getMinLot(category, symbol, instrument);
  const lotPrecision = getLotPrecision(category, symbol, instrument);
  const quantity = calculateQuantityFromLots(lots, symbol, category, instrument);
  const finalPrice = executionPrice;
  const notionalValue = calculateUsdFromLots(lots, finalPrice, category, symbol, instrument);
  const requiredMargin = calculateMarginRequired({
    symbol,
    category,
    instrument,
    quantity,
    lots,
    price: finalPrice,
    leverage: maxLeverage,
  });
  const freeMargin = Number(portfolio?.freeMargin ?? 0);
  const marginLoaded = portfolio?.freeMargin != null;
  const projectedFreeMargin = marginLoaded ? freeMargin - requiredMargin : null;
  const hasMarginLevel = Number(portfolio?.margin || 0) > 0;
  const marginLevelLabel = hasMarginLevel ? `${Number(portfolio?.marginLevel || 0).toFixed(2)}%` : 'N/A';
  const formattedLots = formatLots(lots, category, symbol, instrument);

  const tpPrice = tpEnabled ? parseFloat(tpValue) : null;
  const slPrice = slEnabled ? parseFloat(slValue) : null;
  const hasValidSize = Number.isFinite(lots) && lots >= minLot && Number.isFinite(amount) && amount > 0 && Number.isFinite(quantity) && quantity > 0;
  const hasValidPendingPrice = Number.isFinite(finalPrice) && finalPrice > 0;
  const hasValidTp = !tpEnabled || Number.isFinite(tpPrice);
  const hasValidSl = !slEnabled || Number.isFinite(slPrice);
  const hasEnoughMargin = !marginLoaded || requiredMargin <= freeMargin;
  const canReview = hasValidSize && hasValidPendingPrice && hasValidTp && hasValidSl && requiredMargin > 0 && hasEnoughMargin;

  const projectedTakeProfit = tpPrice ? calculateProjectedPnL({
    symbol,
    category,
    instrument,
    side: selectedSide,
    entryPrice: finalPrice,
    exitPrice: tpPrice,
    quantity,
  }) : null;

  const projectedStopLoss = slPrice ? calculateProjectedPnL({
    symbol,
    category,
    instrument,
    side: selectedSide,
    entryPrice: finalPrice,
    exitPrice: slPrice,
    quantity,
  }) : null;

  useEffect(() => {
    if (useLots) {
      const usd = calculateUsdFromLots(lots, currentPrice, category, symbol, instrument);
      setAmount(Number.isFinite(usd) ? Number(usd.toFixed(2)) : 0);
    }
  }, [lots, useLots, currentPrice, category, symbol, instrument]);

  useEffect(() => {
    if (!useLots) {
      const derivedLots = calculateLotsFromUsd(amount, currentPrice, category, symbol, instrument);
      setLots(Number.isFinite(derivedLots) ? parseFloat(derivedLots.toFixed(lotPrecision)) : minLot);
    }
  }, [amount, useLots, currentPrice, category, symbol, instrument, minLot, lotPrecision]);

  useEffect(() => {
    if (onIntentChange) {
      onIntentChange({
        side: selectedSide,
        type: orderType,
        price: finalPrice,
        tp: tpEnabled ? parseFloat(tpValue) : null,
        sl: slEnabled ? parseFloat(slValue) : null,
      });
    }
  }, [selectedSide, orderType, finalPrice, tpEnabled, tpValue, slEnabled, slValue, onIntentChange]);

  const handleSideSelect = (side) => {
    setSelectedSide(side);
    if (orderType === 'buy_limit' || orderType === 'sell_limit') {
      setOrderType(side === 'buy' ? 'buy_limit' : 'sell_limit');
    }
    if (orderType === 'buy_stop' || orderType === 'sell_stop') {
      setOrderType(side === 'buy' ? 'buy_stop' : 'sell_stop');
    }
    setShowConfirmation(false);
  };

  const handleReview = () => {
    if (!canReview) {
      return;
    }
    setShowConfirmation(true);
  };

  const handleExecute = async () => {
    if (!canReview) {
      return;
    }

    const submissionResult = await Promise.resolve(onSubmit({
      symbol,
      type: orderType,
      side: selectedSide,
      amount: parseFloat(amount),
      lots,
      quantity,
      category,
      leverage: maxLeverage,
      takeProfit: tpEnabled ? parseFloat(tpValue) : null,
      stopLoss: slEnabled ? parseFloat(slValue) : null,
      price: finalPrice,
    }));

    if (submissionResult !== false) {
      setShowConfirmation(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-full transition-all duration-300">
      <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-900 dark:bg-gold-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="text-[11px] font-black text-white dark:text-slate-900 uppercase tracking-tighter">{symbol.slice(0, 3)}</span>
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
            Spread: <span className="text-gold-500">{spreadAmt.toFixed(instrument.precision)}</span>
          </span>
          {!hasRealBidAsk && (
            <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
              Last Price Sync
            </span>
          )}
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 rounded-lg transition-all">
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/50">
        {[
          { id: 'trade', icon: FaExchangeAlt, label: 'Trade' },
          { id: 'positions', icon: FaChartLine, label: 'Active' },
          { id: 'orders', icon: FaListUl, label: 'Pending' }
        ].map((tab) => (
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
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleSideSelect('buy')}
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
                  onClick={() => handleSideSelect('sell')}
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

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Execution</p>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white mt-1">Market Only</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Live Entry</p>
                  <p className="text-[11px] font-black tabular-nums text-gold-500 mt-1">
                    {finalPrice.toLocaleString(undefined, { minimumFractionDigits: instrument.precision, maximumFractionDigits: instrument.precision })}
                  </p>
                </div>
              </div>

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
                    step={useLots ? lotStep : 100}
                    min={useLots ? minLot : 0}
                    value={useLots ? lots : amount}
                    onChange={(event) => {
                      const nextValue = parseFloat(event.target.value) || 0;
                      if (useLots) {
                        setLots(nextValue);
                      } else {
                        setAmount(nextValue);
                      }
                      setShowConfirmation(false);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-gold-500 transition-all"
                  />
                  <div className="absolute inset-y-0 right-2 flex flex-col justify-center space-y-1">
                    <button
                      onClick={() => useLots ? setLots((prev) => +(prev + lotStep).toFixed(lotPrecision)) : setAmount((prev) => prev + 100)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
                    >
                      <FaCaretUp size={10} />
                    </button>
                    <button
                      onClick={() => useLots ? setLots((prev) => Math.max(0, +(prev - lotStep).toFixed(lotPrecision))) : setAmount((prev) => Math.max(0, prev - 100))}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
                    >
                      <FaCaretDown size={10} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  <span>~ {useLots ? `$${Number(amount || 0).toFixed(2)}` : `${formattedLots} Lots`}</span>
                  <span>{quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tradingMeta.quantityLabel}</span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  <FaShieldAlt className="text-gold-500" />
                  <span>Risk Management</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => { setTpEnabled(!tpEnabled); setShowConfirmation(false); }}
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
                          onChange={(event) => { setTpValue(event.target.value); setShowConfirmation(false); }}
                          className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-lg py-2 px-3 text-xs font-black text-emerald-500 focus:outline-none"
                        />
                        <div className="text-[7px] text-emerald-500/70 font-bold uppercase text-right">
                          +{calculatePips({
                            symbol,
                            category,
                            instrument,
                            entryPrice: finalPrice,
                            exitPrice: parseFloat(tpValue) || finalPrice,
                          }).toFixed(1)} {tradingMeta.movementLabel}
                        </div>
                        {projectedTakeProfit !== null && (
                          <div className="text-[7px] text-emerald-500/70 font-bold uppercase text-right">
                            P/L {projectedTakeProfit >= 0 ? '+' : ''}${projectedTakeProfit.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => { setSlEnabled(!slEnabled); setShowConfirmation(false); }}
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
                          onChange={(event) => { setSlValue(event.target.value); setShowConfirmation(false); }}
                          className="w-full bg-rose-500/5 border border-rose-500/20 rounded-lg py-2 px-3 text-xs font-black text-rose-500 focus:outline-none"
                        />
                        <div className="text-[7px] text-rose-500/70 font-bold uppercase text-right">
                          -{calculatePips({
                            symbol,
                            category,
                            instrument,
                            entryPrice: finalPrice,
                            exitPrice: parseFloat(slValue) || finalPrice,
                          }).toFixed(1)} {tradingMeta.movementLabel}
                        </div>
                        {projectedStopLoss !== null && (
                          <div className="text-[7px] text-rose-500/70 font-bold uppercase text-right">
                            P/L {projectedStopLoss >= 0 ? '+' : ''}${projectedStopLoss.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Notional', value: `$${notionalValue.toFixed(2)}`, tone: 'text-slate-900 dark:text-white' },
                  { label: 'Required Margin', value: `$${requiredMargin.toFixed(2)}`, tone: freeMargin >= requiredMargin ? 'text-emerald-500' : 'text-rose-500' },
                  { label: 'Free Margin', value: `$${freeMargin.toFixed(2)}`, tone: 'text-slate-900 dark:text-white' },
                  { label: 'Post-Trade Free', value: projectedFreeMargin != null ? `$${projectedFreeMargin.toFixed(2)}` : '--', tone: projectedFreeMargin != null && projectedFreeMargin >= 0 ? 'text-emerald-500' : 'text-rose-500' },
                  { label: 'Leverage', value: `1:${maxLeverage}`, tone: 'text-slate-900 dark:text-white' },
                  { label: 'Margin Level', value: marginLevelLabel, tone: hasMarginLevel && Number(portfolio?.marginLevel || 0) < 100 ? 'text-rose-500' : 'text-gold-500' },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                    <p className={`text-sm font-black ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Contract Size', value: `${tradingMeta.contractSize.toLocaleString()} ${tradingMeta.quantityLabel}` },
                  { label: 'Lot Step', value: `${formatLots(lotStep, category, symbol, instrument)} lots` },
                  { label: 'Min Lot', value: `${formatLots(minLot, category, symbol, instrument)} lots` },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              {!hasValidSize && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-amber-500">
                  Minimum size is {formatLots(minLot, category, symbol, instrument)} lots and the order quantity must be greater than zero.
                </div>
              )}

              {!hasValidPendingPrice && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-amber-500">
                  Live market price is unavailable right now.
                </div>
              )}

              {(!hasValidTp || !hasValidSl) && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-amber-500">
                  Enter valid numeric values for take profit and stop loss.
                </div>
              )}

              {!hasEnoughMargin && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-rose-500">
                  Required margin exceeds available free margin.
                </div>
              )}

              <button
                onClick={handleReview}
                disabled={!canReview}
                className={`w-full py-5 rounded-2xl shadow-2xl transition-all active:scale-95 flex flex-col items-center group overflow-hidden relative ${
                  selectedSide === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'
                } ${!canReview ? 'cursor-not-allowed opacity-50 shadow-none' : ''}`}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white relative z-10">
                  Review Order
                </span>
                <span className="text-[9px] font-bold text-white/70 mt-1 relative z-10">
                  {formattedLots} Lots | {quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tradingMeta.quantityLabel} @ {finalPrice.toLocaleString(undefined, { minimumFractionDigits: instrument.precision, maximumFractionDigits: instrument.precision })}
                </span>
              </button>

              {showConfirmation && (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-gold-500/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gold-500">
                    <FaCheckCircle />
                    <span>Order Confirmation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    {[ 
                      { label: 'Instrument', value: symbol },
                      { label: 'Type', value: formatOrderType(orderType) },
                      { label: 'Side', value: selectedSide.toUpperCase() },
                      { label: 'Lots', value: formattedLots },
                      { label: 'Quantity', value: quantity.toLocaleString(undefined, { maximumFractionDigits: 4 }) },
                      { label: 'Notional', value: `$${notionalValue.toFixed(2)}` },
                      { label: 'Entry Price', value: finalPrice ? finalPrice.toLocaleString(undefined, { minimumFractionDigits: instrument.precision, maximumFractionDigits: instrument.precision }) : '--' },
                      { label: 'Stop Loss', value: slEnabled && slValue ? slValue : 'Off' },
                      { label: 'Take Profit', value: tpEnabled && tpValue ? tpValue : 'Off' },
                      { label: 'Required Margin', value: `$${requiredMargin.toFixed(2)}` },
                      { label: 'Free Margin', value: `$${freeMargin.toFixed(2)}` },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                        <p className="font-black text-slate-900 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setShowConfirmation(false)}
                      className="py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecute}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        selectedSide === 'buy'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      Confirm Order
                    </button>
                  </div>
                </div>
              )}
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
                Active Positions ({symbolPositions.length})
              </div>
              {symbolPositions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FaChartLine size={40} className="opacity-10 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Open Positions For {symbol}</p>
                </div>
              ) : (
                symbolPositions.map((position) => (
                  <div key={position.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${position.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {position.type}
                        </span>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white">{position.symbol}</span>
                      </div>
                      <div className={`text-xs font-black tabular-nums ${position.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                      <span>{formatLots(position.lots, position.category, position.symbol, position.instrument)} lots | {Number(position.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })} {position.instrument?.quantityLabel || tradingMeta.quantityLabel}</span>
                      <span>SL: {position.stopLoss ?? 'Off'} / TP: {position.takeProfit ?? 'Off'}</span>
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
                Pending Orders ({symbolOrders.length})
              </div>
              {symbolOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <FaListUl size={40} className="opacity-10 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Pending Orders For {symbol}</p>
                </div>
              ) : (
                symbolOrders.map((order) => (
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
                      <span>{formatLots(order.lots, order.category, order.symbol, order.instrument)} lots | {Number(order.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })} {order.instrument?.quantityLabel || tradingMeta.quantityLabel}</span>
                      <span className="text-gold-500 italic">WAITING</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Active P&L</span>
          <span className={`text-xs font-black tabular-nums ${activePnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${activePnl.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Account Equity</span>
          <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">
            ${(Number(portfolio?.equity) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;
