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
      : 'Market orders execute from the live bid/ask used by your trading backend.';

  return (
    <div className="flex h-full flex-col rounded-[1.75rem] border border-slate-700/70 bg-[#1f2230] text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between border-b border-slate-700/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-[#171a26] text-[9px] font-black uppercase leading-none text-slate-200">
            <span>{orderTitle.slice(0, 3)}</span>
            <span>{orderTitle.slice(-3)}</span>
          </div>
          <div>
            <p className="text-xl font-black uppercase tracking-tight">{orderTitle}.</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Spread {spreadLabel}
            </p>
          </div>
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

      <div className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#2a2d3b] p-1">
          {[
            { id: 'market', label: 'Market' },
            { id: 'pending', label: 'Pending Order' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`rounded-[0.9rem] px-4 py-3 text-sm font-black transition-all ${
                mode === item.id
                  ? 'bg-[#1f2230] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-5 px-4 py-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            onClick={() => setSelectedSide('sell')}
            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
              selectedSide === 'sell'
                ? 'border-rose-500 bg-rose-500/12'
                : 'border-slate-700 bg-[#2a2d3b] hover:border-rose-500/50'
            }`}
          >
            <p className="text-lg font-black text-rose-400">Sell</p>
            <p className="mt-2 text-[2rem] font-black leading-none text-rose-400">{bidLabel}</p>
          </button>

          <div className="text-center">
            <p className="text-2xl font-black text-white">{formatLots(lots, category, symbol, instrument)}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              {tradingMeta.quantityLabel}
            </p>
          </div>

          <button
            onClick={() => setSelectedSide('buy')}
            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
              selectedSide === 'buy'
                ? 'border-teal-400 bg-teal-400/12'
                : 'border-slate-700 bg-[#2a2d3b] hover:border-teal-400/50'
            }`}
          >
            <p className="text-lg font-black text-teal-300">Buy</p>
            <p className="mt-2 text-[2rem] font-black leading-none text-teal-300">{askLabel}</p>
          </button>
        </div>

        {isPendingOrder && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-200">{pendingLabel}</label>
            <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-2xl border border-slate-700 bg-[#343847]">
              <div className="px-4 py-3">
                <input
                  type="number"
                  step={1 / (10 ** precision)}
                  min="0"
                  value={triggerPrice}
                  onChange={(event) => setTriggerPrice(event.target.value)}
                  className="w-full bg-transparent text-3xl font-black text-white outline-none"
                />
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {derivedOrderType.toUpperCase()} trigger
                </p>
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
          <label className="text-sm font-bold text-slate-200">Amount</label>
          <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-2xl border border-slate-700 bg-[#343847]">
            <div className="px-4 py-3">
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
                className="w-full bg-transparent text-3xl font-black text-white outline-none"
              />
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                Min {formatLots(minLot, category, symbol, instrument)} lots
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
        </div>

        <div className="space-y-3 border-t border-slate-700/60 pt-1">
          <div className="flex items-center justify-between text-lg font-bold">
            <span className="text-slate-300">Total value:</span>
            <span className="text-white">${Number(notionalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold">
            <span className="text-slate-300">Required Margin:</span>
            <span className={hasEnoughMargin ? 'text-cyan-300' : 'text-rose-400'}>
              ${Number(requiredMargin || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-700/60 pt-1">
          <label className="flex items-center gap-3 text-xl font-bold text-white">
            <input
              type="checkbox"
              checked={tpEnabled}
              onChange={() => setTpEnabled((current) => !current)}
              className="h-5 w-5 rounded border-slate-500 bg-transparent text-teal-400 focus:ring-teal-400"
            />
            <span>Take Profit</span>
          </label>
          {tpEnabled && (
            <input
              type="number"
              value={tpValue}
              onChange={(event) => setTpValue(event.target.value)}
              placeholder="Target price"
              className="w-full rounded-2xl border border-slate-700 bg-[#343847] px-4 py-3 text-lg font-bold text-white outline-none focus:border-teal-400"
            />
          )}

          <label className="flex items-center gap-3 text-xl font-bold text-white">
            <input
              type="checkbox"
              checked={slEnabled}
              onChange={() => setSlEnabled((current) => !current)}
              className="h-5 w-5 rounded border-slate-500 bg-transparent text-rose-400 focus:ring-rose-400"
            />
            <span>Stop Loss</span>
          </label>
          {slEnabled && (
            <input
              type="number"
              value={slValue}
              onChange={(event) => setSlValue(event.target.value)}
              placeholder="Protection price"
              className="w-full rounded-2xl border border-slate-700 bg-[#343847] px-4 py-3 text-lg font-bold text-white outline-none focus:border-rose-400"
            />
          )}
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-[#252938] px-4 py-3 text-sm font-medium text-slate-300">
          <div className="flex items-center justify-between">
            <span>Free margin</span>
            <span className="font-black text-white">${freeMargin.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Equity</span>
            <span className="font-black text-white">${equity.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Open positions</span>
            <span className="font-black text-white">{activePositions.length}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Pending orders</span>
            <span className="font-black text-white">{pendingOrders.length}</span>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-400">{helperMessage}</p>
      </div>

      <div className="border-t border-slate-700/60 px-4 py-4">
        {!hasEnoughMargin && (
          <p className="mb-3 text-sm font-bold text-rose-400">
            Required margin exceeds available free margin.
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full rounded-2xl px-4 py-5 text-xl font-black transition-all ${
            canSubmit
              ? 'bg-teal-500 text-white hover:bg-teal-400'
              : 'cursor-not-allowed bg-slate-700 text-slate-400'
          }`}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default OrderPanel;
