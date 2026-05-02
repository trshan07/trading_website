import React, { useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus, FaTimes } from 'react-icons/fa';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';
import {
  calculateUsdFromLots,
  calculateMarginRequired,
  calculateQuantityFromLots,
  getInstrumentTradingMeta,
  getLotPrecision,
  getLotStep,
  getMinLot,
  formatLots,
} from '../../utils/tradingUtils';
import { MARKET_INSTRUMENTS } from '../../constants/marketData';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol, normalizeSymbol } from '../../utils/marketSymbols';

const clamp = (value, minimum, maximum = Number.POSITIVE_INFINITY) => Math.min(Math.max(value, minimum), maximum);

const formatMoney = (value, digits = 2) => `$${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
})}`;

const getPendingOrderType = ({ side, triggerPrice, referencePrice }) => {
  if (!Number.isFinite(triggerPrice) || triggerPrice <= 0 || !Number.isFinite(referencePrice) || referencePrice <= 0) {
    return 'limit';
  }

  if (side === 'buy') {
    return triggerPrice <= referencePrice ? 'limit' : 'stop';
  }

  return triggerPrice >= referencePrice ? 'limit' : 'stop';
};

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
  orders = [],
}) => {
  const [mode, setMode] = useState('market');
  const [selectedSide, setSelectedSide] = useState('buy');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [lots, setLots] = useState(1);
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slEnabled, setSlEnabled] = useState(false);
  const [tpValue, setTpValue] = useState('');
  const [slValue, setSlValue] = useState('');

  const fallbackInstrument = useMemo(
    () => MARKET_INSTRUMENTS.find((item) => item.symbol === symbol) || {},
    [symbol]
  );

  const instrument = useMemo(
    () => buildInstrumentSnapshot({
      symbol,
      instrument: selectedInstrument?.symbol === symbol ? selectedInstrument : fallbackInstrument,
      marketData,
    }),
    [fallbackInstrument, marketData, selectedInstrument, symbol]
  );

  const category = instrument.category || 'General';
  const precision = Number.isInteger(instrument.precision) ? instrument.precision : 2;
  const tradingMeta = useMemo(
    () => getInstrumentTradingMeta({ symbol, category, instrument }),
    [category, instrument, symbol]
  );

  const quoteSnapshot = useMemo(() => getDisplayQuoteSnapshot({
    symbol,
    instrument,
    marketData,
  }), [instrument, marketData, symbol]);

  const bidPrice = Number.parseFloat(quoteSnapshot.bid) || 0;
  const askPrice = Number.parseFloat(quoteSnapshot.ask) || 0;
  const bidLabel = quoteSnapshot.bidLabel;
  const askLabel = quoteSnapshot.askLabel;
  const spreadLabel = Number.isFinite(quoteSnapshot.spread)
    ? Number(quoteSnapshot.spread).toFixed(precision)
    : '0.00';

  const isPendingOrder = mode === 'pending';
  const referencePrice = selectedSide === 'buy' ? askPrice : bidPrice;
  const normalizedTriggerPrice = Number.parseFloat(triggerPrice);
  const derivedOrderType = isPendingOrder
    ? getPendingOrderType({
        side: selectedSide,
        triggerPrice: normalizedTriggerPrice,
        referencePrice,
      })
    : 'market';
  const finalPrice = isPendingOrder ? normalizedTriggerPrice : referencePrice;

  const lotStep = getLotStep(category, symbol, instrument);
  const minLot = getMinLot(category, symbol, instrument);
  const lotPrecision = getLotPrecision(category, symbol, instrument);
  const quantity = calculateQuantityFromLots(lots, symbol, category, instrument);
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
  const equity = Number(portfolio?.equity ?? 0);
  const activePositions = positions.filter((position) => normalizeSymbol(position?.symbol) === normalizeSymbol(symbol));
  const pendingOrders = orders.filter((order) => normalizeSymbol(order?.symbol) === normalizeSymbol(symbol));

  const hasLiveReferencePrice = Number.isFinite(referencePrice) && referencePrice > 0;
  const hasValidTriggerPrice = !isPendingOrder || (Number.isFinite(normalizedTriggerPrice) && normalizedTriggerPrice > 0);
  const hasEnoughMargin = requiredMargin > 0 && requiredMargin <= freeMargin;
  const canPlaceMarketOrder = !isPendingOrder && hasLiveReferencePrice;
  const canPlacePendingOrder = isPendingOrder && hasValidTriggerPrice;
  const canSubmit = lots >= minLot && quantity > 0 && hasEnoughMargin && (canPlaceMarketOrder || canPlacePendingOrder);

  useEffect(() => {
    if (!isPendingOrder || !hasLiveReferencePrice) {
      return;
    }

    setTriggerPrice((current) => {
      if (current && Number.isFinite(Number.parseFloat(current))) {
        return current;
      }
      return referencePrice.toFixed(precision);
    });
  }, [hasLiveReferencePrice, isPendingOrder, precision, referencePrice]);

  useEffect(() => {
    onIntentChange?.({
      side: selectedSide,
      type: derivedOrderType,
      price: finalPrice,
      tp: tpEnabled ? Number.parseFloat(tpValue) : null,
      sl: slEnabled ? Number.parseFloat(slValue) : null,
    });
  }, [derivedOrderType, finalPrice, onIntentChange, selectedSide, slEnabled, slValue, tpEnabled, tpValue]);

  const nudgeLots = (direction) => {
    setLots((current) => {
      const baseValue = Number.isFinite(current) ? current : minLot;
      const nextValue = baseValue + (direction * lotStep);
      return Number(clamp(nextValue, minLot).toFixed(lotPrecision));
    });
  };

  const nudgeTriggerPrice = (direction) => {
    const step = 1 / (10 ** precision);
    setTriggerPrice((current) => {
      const currentValue = Number.parseFloat(current);
      const baseValue = Number.isFinite(currentValue) && currentValue > 0
        ? currentValue
        : (hasLiveReferencePrice ? referencePrice : step);
      const nextValue = clamp(baseValue + (direction * step), step);
      return nextValue.toFixed(precision);
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    const success = await Promise.resolve(onSubmit({
      symbol,
      type: derivedOrderType,
      side: selectedSide,
      amount: Number.parseFloat(notionalValue.toFixed(2)),
      lots,
      quantity,
      category,
      leverage: maxLeverage,
      takeProfit: tpEnabled && tpValue ? Number.parseFloat(tpValue) : null,
      stopLoss: slEnabled && slValue ? Number.parseFloat(slValue) : null,
      price: finalPrice,
    }));

    if (success !== false && isPendingOrder) {
      setTriggerPrice(referencePrice ? referencePrice.toFixed(precision) : '');
    }
  };

  const orderTitle = formatInstrumentDisplaySymbol(symbol, { withSlash: false });
  const pendingLabel = `${selectedSide.toUpperCase()} when`;
  const helperMessage = !hasLiveReferencePrice
    ? 'Live execution price is unavailable. Pending orders may still be placed when trigger pricing is available.'
    : isPendingOrder
      ? `${selectedSide === 'buy' ? 'Buy' : 'Sell'} pending orders automatically switch between limit and stop based on your trigger price.`
      : 'Market orders execute from the live bid and ask used by your trading backend.';
  const quickLotOptions = Array.from(new Set([
    minLot,
    Math.max(minLot, Number((minLot * 5).toFixed(lotPrecision))),
    Math.max(minLot, Number((minLot * 10).toFixed(lotPrecision))),
  ])).slice(0, 3);
  const executionLabel = isPendingOrder ? derivedOrderType.toUpperCase() : 'MARKET';
  const quantityLabel = tradingMeta.quantityLabel || 'units';
  const submitLabel = isPendingOrder
    ? `Place ${selectedSide === 'buy' ? 'Buy' : 'Sell'} Pending Order`
    : `Place ${selectedSide === 'buy' ? 'Buy' : 'Sell'} Market Order`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-700/70 bg-gradient-to-b from-[#202536] to-[#171b28] font-sans text-white shadow-[0_24px_56px_rgba(0,0,0,0.34)]">
      <div className="border-b border-slate-700/60 bg-[#161b27]/75 px-4 py-3.5 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl border border-slate-700/70 bg-[#111620] text-[8px] font-black uppercase leading-none text-slate-200">
              <span>{orderTitle.slice(0, 3)}</span>
              <span>{orderTitle.slice(-3)}</span>
            </div>
            <div>
              <p className="text-xl font-semibold uppercase tracking-tight text-white">{orderTitle}.</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300/70">{category}</span>
                <span className="rounded-full border border-slate-700 bg-[#111620] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Spread {spreadLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="rounded-full border border-slate-700 bg-[#111620] px-3 py-1 text-[11px] font-semibold text-slate-300">
              1:{maxLeverage}
            </div>
            <div className="rounded-full border border-slate-700 bg-[#111620] px-3 py-1 text-[11px] font-semibold text-slate-300">
              {activePositions.length} open
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-700/60 bg-[#161b27] p-1">
          {[
            { id: 'market', label: 'Market' },
            { id: 'pending', label: 'Pending Order' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`rounded-[0.8rem] px-3 py-2.5 text-[13px] font-semibold transition-all ${
                mode === item.id
                  ? 'bg-gradient-to-r from-slate-100 to-white text-[#171a26] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 custom-scrollbar">
        <div className="rounded-[1.1rem] border border-slate-700/60 bg-[#151a26] p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Execution Side</p>
              <p className="mt-1 text-[12px] font-medium text-slate-400">Choose buy or sell before setting price and size.</p>
            </div>
            <span className="rounded-full border border-slate-700 bg-[#0f1521] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
              {executionLabel}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setSelectedSide('sell')}
              className={`rounded-[1rem] border px-3.5 py-3.5 text-left transition-all ${
                selectedSide === 'sell'
                  ? 'border-rose-400/50 bg-gradient-to-br from-rose-500/18 to-rose-500/8 shadow-[0_18px_40px_rgba(244,63,94,0.12)]'
                  : 'border-slate-700 bg-[#1a2030] hover:border-rose-500/40'
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200/80">Sell</p>
              <p className="mt-2 text-[1.35rem] font-semibold leading-none tabular-nums text-rose-300">{bidLabel}</p>
              <p className="mt-2 text-xs text-slate-400">Live bid execution price.</p>
            </button>

            <button
              onClick={() => setSelectedSide('buy')}
              className={`rounded-[1rem] border px-3.5 py-3.5 text-left transition-all ${
                selectedSide === 'buy'
                  ? 'border-teal-300/50 bg-gradient-to-br from-teal-400/18 to-teal-400/8 shadow-[0_18px_40px_rgba(45,212,191,0.12)]'
                  : 'border-slate-700 bg-[#1a2030] hover:border-teal-400/40'
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-100/80">Buy</p>
              <p className="mt-2 text-[1.35rem] font-semibold leading-none tabular-nums text-teal-200">{askLabel}</p>
              <p className="mt-2 text-xs text-slate-400">Live ask execution price.</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-700/60 bg-[#151a26] px-3.5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Side</p>
            <p className={`mt-1.5 text-sm font-semibold uppercase ${selectedSide === 'buy' ? 'text-teal-200' : 'text-rose-300'}`}>{selectedSide}</p>
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-[#151a26] px-3.5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Execution</p>
            <p className="mt-1.5 text-sm font-semibold text-white">{executionLabel}</p>
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-[#151a26] px-3.5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Lot Size</p>
            <p className="mt-1.5 text-sm font-semibold text-white">{formatLots(lots, category, symbol, instrument)}</p>
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-[#151a26] px-3.5 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Units</p>
            <p className="mt-1.5 text-sm font-semibold text-white">{quantityLabel}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-[1.1rem] border border-slate-700/60 bg-[#151a26] p-3.5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Ticket Inputs</p>
            <p className="mt-1 text-[12px] text-slate-400">Set the trigger price for pending orders and choose the position size.</p>
          </div>

          {isPendingOrder && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-200">{pendingLabel}</label>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{derivedOrderType}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-xl border border-slate-700/70 bg-[#111620]">
                <div className="px-3.5 py-3">
                  <input
                    type="number"
                    step={1 / (10 ** precision)}
                    min="0"
                    value={triggerPrice}
                    onChange={(event) => setTriggerPrice(event.target.value)}
                    className="w-full bg-transparent text-[1.25rem] font-semibold tabular-nums text-white outline-none"
                  />
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Trigger price</p>
                </div>
                <div className="flex w-14 flex-col border-l border-slate-700">
                  <button
                    onClick={() => nudgeTriggerPrice(1)}
                    className="flex flex-1 items-center justify-center text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <FaPlus size={12} />
                  </button>
                  <button
                    onClick={() => nudgeTriggerPrice(-1)}
                    className="flex flex-1 items-center justify-center border-t border-slate-700 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <FaMinus size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">Amount</label>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Min {formatLots(minLot, category, symbol, instrument)} lots
              </span>
            </div>
              <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-xl border border-slate-700/70 bg-[#111620]">
              <div className="px-3.5 py-3">
                <input
                  type="number"
                  step={lotStep}
                  min={minLot}
                  value={lots}
                  onChange={(event) => {
                    const nextValue = Number.parseFloat(event.target.value);
                    if (!Number.isFinite(nextValue)) {
                      setLots(minLot);
                      return;
                    }
                    setLots(Number(clamp(nextValue, minLot).toFixed(lotPrecision)));
                  }}
                  className="w-full bg-transparent text-[1.25rem] font-semibold tabular-nums text-white outline-none"
                />
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })} {quantityLabel}
                </p>
              </div>
              <div className="flex w-14 flex-col border-l border-slate-700">
                <button
                  onClick={() => nudgeLots(1)}
                  className="flex flex-1 items-center justify-center text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <FaPlus size={12} />
                </button>
                <button
                  onClick={() => nudgeLots(-1)}
                  className="flex flex-1 items-center justify-center border-t border-slate-700 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <FaMinus size={12} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickLotOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setLots(Number(option.toFixed(lotPrecision)))}
                className={`rounded-lg border px-3 py-2 text-[12px] font-semibold transition-colors ${
                    Number(lots) === Number(option)
                      ? 'border-sky-400/50 bg-sky-400/12 text-sky-100'
                      : 'border-slate-700 bg-[#111620] text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {formatLots(option, category, symbol, instrument)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1rem] border border-slate-700/60 bg-[#151a26] px-3.5 py-3.5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Estimated Value</p>
            <p className="mt-1.5 text-lg font-semibold tabular-nums text-white">{formatMoney(notionalValue)}</p>
            <p className="mt-1 text-xs text-slate-500">Total notional for this order size.</p>
          </div>
          <div className="rounded-[1rem] border border-slate-700/60 bg-[#151a26] px-3.5 py-3.5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Required Margin</p>
            <p className={`mt-1.5 text-lg font-semibold tabular-nums ${hasEnoughMargin ? 'text-cyan-300' : 'text-rose-400'}`}>
              {formatMoney(requiredMargin)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Compared against your current free margin.</p>
          </div>
        </div>

        <div className="space-y-3 rounded-[1.1rem] border border-slate-700/60 bg-[#151a26] p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Risk Controls</p>
              <p className="mt-1 text-[12px] text-slate-400">Attach optional take profit and stop loss levels.</p>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {tpEnabled || slEnabled ? 'Enabled' : 'Optional'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`rounded-xl border px-3.5 py-3 transition-colors ${tpEnabled ? 'border-teal-400/40 bg-teal-400/8' : 'border-slate-700 bg-[#111620]'}`}>
              <label className="flex items-center gap-3 text-sm font-semibold text-white">
                <input
                  type="checkbox"
                  checked={tpEnabled}
                  onChange={() => setTpEnabled((current) => !current)}
                  className="h-5 w-5 rounded border-slate-500 bg-transparent text-teal-400 focus:ring-teal-400"
                />
                <span>Take Profit</span>
              </label>
              <p className="mt-2 text-xs text-slate-400">Close in profit at your target price.</p>
              {tpEnabled && (
                <input
                  type="number"
                  value={tpValue}
                  onChange={(event) => setTpValue(event.target.value)}
                  placeholder="Target price"
                  className="mt-3 w-full rounded-lg border border-teal-400/25 bg-[#0f1521] px-3 py-2.5 text-sm font-semibold tabular-nums text-white outline-none focus:border-teal-400"
                />
              )}
            </div>

            <div className={`rounded-xl border px-3.5 py-3 transition-colors ${slEnabled ? 'border-rose-400/40 bg-rose-500/8' : 'border-slate-700 bg-[#111620]'}`}>
              <label className="flex items-center gap-3 text-sm font-semibold text-white">
                <input
                  type="checkbox"
                  checked={slEnabled}
                  onChange={() => setSlEnabled((current) => !current)}
                  className="h-5 w-5 rounded border-slate-500 bg-transparent text-rose-400 focus:ring-rose-400"
                />
                <span>Stop Loss</span>
              </label>
              <p className="mt-2 text-xs text-slate-400">Limit downside with a protective exit.</p>
              {slEnabled && (
                <input
                  type="number"
                  value={slValue}
                  onChange={(event) => setSlValue(event.target.value)}
                  placeholder="Protection price"
                  className="mt-3 w-full rounded-lg border border-rose-400/25 bg-[#0f1521] px-3 py-2.5 text-sm font-semibold tabular-nums text-white outline-none focus:border-rose-400"
                />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[1.1rem] border border-slate-700/60 bg-[#151a26] p-3.5 text-[12px] font-medium text-slate-300">
          <div className="mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Account Snapshot</p>
            <p className="mt-1 text-[12px] text-slate-400">Live account figures used for this ticket.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-800 bg-[#111620] px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Free Margin</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-white">{formatMoney(freeMargin)}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#111620] px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Equity</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-white">{formatMoney(equity)}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#111620] px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Open Positions</p>
              <p className="mt-1 text-sm font-semibold text-white">{activePositions.length}</p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-[#111620] px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Pending Orders</p>
              <p className="mt-1 text-sm font-semibold text-white">{pendingOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.1rem] border border-slate-700/60 bg-[#111620] px-3.5 py-3.5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Execution Note</p>
          <p className="mt-2 text-[12px] leading-5 text-slate-400">{helperMessage}</p>
        </div>
      </div>

      <div className="border-t border-slate-700/60 bg-[#161b27]/85 px-4 py-3.5 backdrop-blur">
        {!hasEnoughMargin && (
          <p className="mb-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-300">
            Required margin exceeds available free margin.
          </p>
        )}

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-700 bg-[#111620] px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Ticket Value</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-white">{formatMoney(notionalValue)}</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-[#111620] px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Margin Impact</p>
            <p className={`mt-1 text-sm font-semibold tabular-nums ${hasEnoughMargin ? 'text-cyan-300' : 'text-rose-400'}`}>
              {formatMoney(requiredMargin)}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
            canSubmit
              ? 'bg-gradient-to-r from-[#3bc7bd] via-[#34d399] to-[#58d8b7] text-slate-950 shadow-[0_18px_45px_rgba(52,211,153,0.22)] hover:brightness-105'
              : 'cursor-not-allowed bg-slate-700 text-slate-400'
          }`}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default OrderPanel;
