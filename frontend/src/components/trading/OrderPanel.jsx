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
} from '../../utils/tradingUtils';
import { MARKET_INSTRUMENTS } from '../../constants/marketData';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol } from '../../utils/marketSymbols';

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
  const spreadValue = Number.isFinite(quoteSnapshot.spread) ? quoteSnapshot.spread : askPrice - bidPrice;
  const spreadLabel = Number.isFinite(spreadValue) ? Number(spreadValue).toFixed(precision) : '0.00';

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

    await Promise.resolve(onSubmit({
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
  };

  const orderTitle = formatInstrumentDisplaySymbol(symbol, { withSlash: false });
  const submitLabel = isPendingOrder ? 'Place Order' : 'Place Order';
  const priceFieldLabel = selectedSide === 'buy' ? 'BUY when' : 'SELL when';

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.3rem] border border-slate-700/70 bg-[#1b2030] font-sans text-white">
      <div className="flex items-start justify-between border-b border-slate-700/60 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-[#252b3c] text-[8px] font-bold uppercase leading-none text-slate-100">
            <span>{orderTitle.slice(0, 3)}</span>
            <span>{orderTitle.slice(-3)}</span>
          </div>
          <div>
            <p className="text-xl font-semibold uppercase tracking-tight text-white">{orderTitle}.</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-700/60 bg-[#242a3b] p-1">
          {[
            { id: 'market', label: 'Market' },
            { id: 'pending', label: 'Pending Order' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                mode === item.id
                  ? 'bg-[#1b2030] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-1.5">
          <button
            onClick={() => setSelectedSide('sell')}
            className={`rounded-tl-xl rounded-bl-xl border px-4 py-3 text-center transition-all ${
              selectedSide === 'sell'
                ? 'border-rose-400 bg-[#241b26]'
                : 'border-slate-700 bg-[#242a3b]'
            }`}
          >
            <p className="text-[11px] font-bold text-rose-400">Sell</p>
            <p className="mt-1 text-[1rem] font-semibold tabular-nums text-rose-400">{bidLabel}</p>
          </button>

          <div className="pb-2 text-center">
            <p className="text-xl font-semibold leading-none text-white">{spreadLabel}</p>
          </div>

          <button
            onClick={() => setSelectedSide('buy')}
            className={`rounded-tr-xl rounded-br-xl border px-4 py-3 text-center transition-all ${
              selectedSide === 'buy'
                ? 'border-teal-400 bg-[#1f4f53]'
                : 'border-slate-700 bg-[#242a3b]'
            }`}
          >
            <p className="text-[11px] font-bold text-teal-200">Buy</p>
            <p className="mt-1 text-[1rem] font-semibold tabular-nums text-teal-200">{askLabel}</p>
          </button>
        </div>

        {isPendingOrder && (
          <div className="mt-4">
            <div className="grid grid-cols-[1fr_3.25rem] overflow-hidden rounded-lg border border-slate-700/70 bg-[#3a3f50]">
              <div className="px-3 py-2.5">
                <p className="text-xs uppercase text-white">{priceFieldLabel}</p>
                <input
                  type="number"
                  step={1 / (10 ** precision)}
                  min="0"
                  value={triggerPrice}
                  onChange={(event) => setTriggerPrice(event.target.value)}
                  className="mt-1 w-full bg-transparent text-[1rem] font-semibold tabular-nums text-white outline-none"
                />
              </div>
              <div className="flex flex-col border-l border-slate-600">
                <button
                  onClick={() => nudgeTriggerPrice(1)}
                  className="flex flex-1 items-center justify-center text-slate-200 transition-colors hover:bg-white/5"
                >
                  <FaPlus size={12} />
                </button>
                <button
                  onClick={() => nudgeTriggerPrice(-1)}
                  className="flex flex-1 items-center justify-center border-t border-slate-600 text-slate-200 transition-colors hover:bg-white/5"
                >
                  <FaMinus size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3">
          <div className="grid grid-cols-[1fr_3.25rem] overflow-hidden rounded-lg border border-slate-700/70 bg-[#3a3f50]">
            <div className="px-3 py-2.5">
              <p className="text-xs uppercase text-white">Amount</p>
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
                className="mt-1 w-full bg-transparent text-[1rem] font-semibold tabular-nums text-white outline-none"
              />
            </div>
            <div className="flex flex-col border-l border-slate-600">
              <button
                onClick={() => nudgeLots(1)}
                className="flex flex-1 items-center justify-center text-slate-200 transition-colors hover:bg-white/5"
              >
                <FaPlus size={12} />
              </button>
              <button
                onClick={() => nudgeLots(-1)}
                className="flex flex-1 items-center justify-center border-t border-slate-600 text-slate-200 transition-colors hover:bg-white/5"
              >
                <FaMinus size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-white">Total value:</span>
            <span className="font-semibold tabular-nums text-white">{formatMoney(notionalValue)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-white">Required Margin:</span>
            <span className={`font-semibold tabular-nums ${hasEnoughMargin ? 'text-white' : 'text-rose-400'}`}>
              {formatMoney(requiredMargin)}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-700/60">
          <label className="flex items-center gap-3 border-b border-slate-700/60 py-4 text-sm font-semibold text-white">
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
              placeholder="Take profit price"
              className="mt-3 w-full rounded-lg border border-slate-700 bg-[#242a3b] px-3 py-2.5 text-sm font-semibold tabular-nums text-white outline-none"
            />
          )}

          <label className="flex items-center gap-3 border-b border-slate-700/60 py-4 text-sm font-semibold text-white">
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
              placeholder="Stop loss price"
              className="mt-3 w-full rounded-lg border border-slate-700 bg-[#242a3b] px-3 py-2.5 text-sm font-semibold tabular-nums text-white outline-none"
            />
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full rounded-lg px-4 py-4 text-base font-semibold transition-all ${
            canSubmit
              ? 'bg-[#35b6ad] text-white hover:brightness-105'
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
