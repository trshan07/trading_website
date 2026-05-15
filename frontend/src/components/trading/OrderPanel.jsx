import React, { useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus, FaTimes } from 'react-icons/fa';
import { getDisplayQuoteSnapshot } from '../../utils/spreadCalculator';
import tradingService from '../../services/tradingService';
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

const normalizeLeverage = (value, fallback = 100) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  const raw = String(value ?? '').trim();
  if (!raw) {
    return fallback;
  }

  if (raw.includes(':')) {
    const [, rhs] = raw.split(':');
    const parsedRatio = Number.parseFloat(rhs);
    return Number.isFinite(parsedRatio) && parsedRatio > 0 ? parsedRatio : fallback;
  }

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const validateProtectionInputs = ({ side, entryPrice, takeProfit, stopLoss }) => {
  const normalizedSide = String(side || 'buy').toLowerCase();
  const price = Number.parseFloat(entryPrice) || 0;
  const tp = takeProfit == null ? null : Number.parseFloat(takeProfit);
  const sl = stopLoss == null ? null : Number.parseFloat(stopLoss);

  if ((tp !== null && !Number.isFinite(tp)) || (sl !== null && !Number.isFinite(sl))) {
    return 'Invalid take profit or stop loss value';
  }

  if (!price) {
    return '';
  }

  if (normalizedSide === 'buy') {
    if (tp !== null && tp <= price) {
      return 'Take profit must be above the entry price for buy orders';
    }
    if (sl !== null && sl >= price) {
      return 'Stop loss must be below the entry price for buy orders';
    }
    return '';
  }

  if (tp !== null && tp >= price) {
    return 'Take profit must be below the entry price for sell orders';
  }
  if (sl !== null && sl <= price) {
    return 'Stop loss must be above the entry price for sell orders';
  }

  return '';
};

const SideButton = ({ side, active, price, label, onClick, className = '' }) => {
  const [flash, setFlash] = useState('');
  const prevPriceRef = React.useRef(price);

  React.useEffect(() => {
    if (price > prevPriceRef.current) {
      setFlash('flash-up');
    } else if (price < prevPriceRef.current) {
      setFlash('flash-down');
    }
    prevPriceRef.current = price;

    const timer = setTimeout(() => setFlash(''), 800);
    return () => clearTimeout(timer);
  }, [price]);

  const baseColors = side === 'sell'
    ? (active ? 'border-rose-400 bg-rose-50 dark:bg-[#241b26]' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-[#242a3b]')
    : (active ? 'border-teal-400 bg-teal-50 dark:bg-[#1f4f53]' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-[#242a3b]');
  
  const textColors = side === 'sell' ? 'text-rose-600 dark:text-rose-400' : 'text-teal-700 dark:text-teal-200';

  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden border px-4 py-3 text-center transition-all duration-300 ${baseColors} ${className}`}
    >
      <div className={`absolute inset-0 transition-opacity duration-300 ${flash ? 'opacity-100' : 'opacity-0'} ${flash}`} />
      <div className="relative z-10">
        <p className={`text-[11px] font-bold ${textColors}`}>{side.charAt(0).toUpperCase() + side.slice(1)}</p>
        <p className={`mt-1 text-[1rem] font-semibold tabular-nums ${textColors}`}>{label}</p>
      </div>
    </button>
  );
};

const OrderPanel = ({
  accountId = null,
  onSubmit,
  symbol = 'BTCUSDT',
  onClose,
  mode = 'market',
  marketData = {},
  instrument: selectedInstrument,
  portfolio = {},
  onIntentChange,
  maxLeverage = 500,
}) => {
  const [selectedSide, setSelectedSide] = useState('buy');
  const [pendingType, setPendingType] = useState('limit');
  const [lots, setLots] = useState(0.01);
  const [entryValue, setEntryValue] = useState('');
  const [tpEnabled, setTpEnabled] = useState(false);
  const [slEnabled, setSlEnabled] = useState(false);
  const [tpValue, setTpValue] = useState('');
  const [slValue, setSlValue] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState('');

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
  const resolvedLeverage = normalizeLeverage(maxLeverage, 100);
  const isPendingMode = mode === 'pending';
  const resolvedOrderType = isPendingMode ? pendingType : 'market';

  const referencePrice = selectedSide === 'buy' ? askPrice : bidPrice;
  const parsedEntryPrice = Number.parseFloat(entryValue);
  const finalPrice = isPendingMode
    ? (Number.isFinite(parsedEntryPrice) ? parsedEntryPrice : 0)
    : referencePrice;

  const lotStep = getLotStep(category, symbol, instrument);
  const minLot = getMinLot(category, symbol, instrument);
  const lotPrecision = getLotPrecision(category, symbol, instrument);
  const quantity = calculateQuantityFromLots(lots, symbol, category, instrument);
  const notionalValue = calculateUsdFromLots(lots, finalPrice, category, symbol, instrument);
  const hasLiveReferencePrice = Number.isFinite(referencePrice) && referencePrice > 0;

  useEffect(() => {
    setLots((current) => {
      if (!Number.isFinite(current) || current < minLot) {
        return minLot;
      }

      return Number(current.toFixed(lotPrecision));
    });
  }, [lotPrecision, minLot, symbol]);

  useEffect(() => {
    if (!isPendingMode || !hasLiveReferencePrice) {
      return;
    }

    setEntryValue((current) => {
      if (current && Number.isFinite(Number.parseFloat(current)) && Number.parseFloat(current) > 0) {
        return current;
      }

      return Number(referencePrice).toFixed(precision);
    });
  }, [hasLiveReferencePrice, isPendingMode, precision, referencePrice, selectedSide, symbol]);

  const requiredMargin = calculateMarginRequired({
    symbol,
    category,
    instrument,
    quantity,
    lots,
    price: finalPrice,
    leverage: resolvedLeverage,
  });

  const freeMargin = Number(portfolio?.freeMargin ?? 0);
  const previewMargin = Number(preview?.requiredMargin);
  const effectiveRequiredMargin = Number.isFinite(previewMargin) && previewMargin > 0
    ? previewMargin
    : requiredMargin;
  const previewHasEnoughMargin = typeof preview?.hasEnoughMargin === 'boolean' ? preview.hasEnoughMargin : null;
  const hasEnoughMargin = previewHasEnoughMargin ?? (effectiveRequiredMargin > 0 && effectiveRequiredMargin <= freeMargin);
  const hasValidEntryPrice = Number.isFinite(finalPrice) && finalPrice > 0;
  const canSubmit = Boolean(accountId) && lots >= minLot && quantity > 0 && hasValidEntryPrice && hasEnoughMargin && !previewError;

  useEffect(() => {
    onIntentChange?.({
      side: selectedSide,
      type: resolvedOrderType,
      price: finalPrice,
      tp: tpEnabled ? Number.parseFloat(tpValue) : null,
      sl: slEnabled ? Number.parseFloat(slValue) : null,
    });
  }, [finalPrice, onIntentChange, resolvedOrderType, selectedSide, slEnabled, slValue, tpEnabled, tpValue]);

  useEffect(() => {
    if (!accountId || !hasValidEntryPrice || lots < minLot || quantity <= 0) {
      setPreview(null);
      setPreviewError('');
      return undefined;
    }

    const clientValidationError = validateProtectionInputs({
      side: selectedSide,
      entryPrice: finalPrice,
      takeProfit: tpEnabled && tpValue ? Number.parseFloat(tpValue) : null,
      stopLoss: slEnabled && slValue ? Number.parseFloat(slValue) : null,
    });

    if (clientValidationError) {
      setPreview(null);
      setPreviewError(clientValidationError);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const response = await tradingService.previewTrade({
          accountId,
          symbol,
          side: selectedSide,
          type: resolvedOrderType,
          entryPrice: finalPrice,
          price: finalPrice,
          lots,
          quantity,
          category,
          leverage: resolvedLeverage,
          takeProfit: tpEnabled && tpValue ? Number.parseFloat(tpValue) : null,
          stopLoss: slEnabled && slValue ? Number.parseFloat(slValue) : null,
        });

        if (!active) {
          return;
        }

        if (response.success) {
          setPreview(response.data || null);
          setPreviewError('');
        } else {
          setPreview(null);
          setPreviewError(response.message || 'Preview unavailable');
        }
      } catch (error) {
        if (!active) {
          return;
        }
        setPreview(null);
        setPreviewError(error.response?.data?.message || 'Preview unavailable');
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    accountId,
    category,
    finalPrice,
    hasValidEntryPrice,
    lots,
    maxLeverage,
    minLot,
    pendingType,
    quantity,
    resolvedLeverage,
    resolvedOrderType,
    selectedSide,
    slEnabled,
    slValue,
    symbol,
    tpEnabled,
    tpValue,
  ]);

  const nudgeLots = (direction) => {
    setLots((current) => {
      const baseValue = Number.isFinite(current) ? current : minLot;
      const nextValue = baseValue + (direction * lotStep);
      return Number(clamp(nextValue, minLot).toFixed(lotPrecision));
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    await Promise.resolve(onSubmit({
      symbol,
      type: resolvedOrderType,
      entryPrice: finalPrice,
      price: finalPrice,
      side: selectedSide,
      amount: Number.parseFloat(notionalValue.toFixed(2)),
      lots,
      quantity,
      category,
      leverage: resolvedLeverage,
      takeProfit: tpEnabled && tpValue ? Number.parseFloat(tpValue) : null,
      stopLoss: slEnabled && slValue ? Number.parseFloat(slValue) : null,
    }));
  };

  const orderTitle = formatInstrumentDisplaySymbol(symbol, { withSlash: false });
  const submitLabel = isPendingMode ? 'Place Pending Order' : 'Place Order';
  const displayExecutionPrice = Number(preview?.executionPrice) || finalPrice;
  const displayPipValue = Number(preview?.pipValue);
  const tpPreview = Number(preview?.projectedTakeProfitPnl);
  const slPreview = Number(preview?.projectedStopLossPnl);
  const tpMovement = Number(preview?.projectedTakeProfitMovement);
  const slMovement = Number(preview?.projectedStopLossMovement);
  const movementLabel = preview?.movementLabel || tradingMeta.movementLabel || 'Move';
  const movementValueLabel = preview?.movementValueLabel || tradingMeta.movementValueLabel || `${movementLabel} Value`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.3rem] border border-slate-200 bg-white font-sans text-slate-900 dark:border-slate-700/70 dark:bg-[#1b2030] dark:text-white">
      <div className="flex items-start justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-slate-100 text-[8px] font-bold uppercase leading-none text-slate-700 dark:bg-[#252b3c] dark:text-slate-100">
            <span>{orderTitle.slice(0, 3)}</span>
            <span>{orderTitle.slice(-3)}</span>
          </div>
          <div>
            <p className="text-xl font-semibold uppercase tracking-tight text-slate-900 dark:text-white">{orderTitle}.</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700/60 dark:bg-[#242a3b]">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
            {isPendingMode ? 'Pending Order Entry' : 'Market Execution Only'}
          </p>
          {String(instrument.source || '').includes('twelvedata') && (
            <div className="flex items-center gap-1.5 rounded-full bg-teal-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-teal-400 border border-teal-400/20">
              <span className="h-1 w-1 animate-pulse rounded-full bg-teal-400" />
              Direct Feed
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-end gap-1.5">
          <SideButton
            side="sell"
            active={selectedSide === 'sell'}
            price={bidPrice}
            label={bidLabel}
            onClick={() => setSelectedSide('sell')}
            className="rounded-tl-xl rounded-bl-xl"
          />

          <div className="pb-2 text-center">
            <p className="text-xl font-semibold leading-none text-slate-900 dark:text-white">{spreadLabel}</p>
          </div>

          <SideButton
            side="buy"
            active={selectedSide === 'buy'}
            price={askPrice}
            label={askLabel}
            onClick={() => setSelectedSide('buy')}
            className="rounded-tr-xl rounded-br-xl"
          />
        </div>

        <div className="mt-3">
          {isPendingMode && (
            <div className="mb-3 grid grid-cols-2 gap-2">
              {['limit', 'stop'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPendingType(type)}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${
                    pendingType === type
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-[#242a3b] dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-[1fr_3.25rem] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700/70 dark:bg-[#3a3f50]">
            <div className="px-3 py-2.5">
              <p className="text-xs uppercase text-slate-700 dark:text-white">Amount</p>
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
                className="mt-1 w-full bg-transparent text-[1rem] font-semibold tabular-nums text-slate-900 outline-none dark:text-white"
              />
            </div>
            <div className="flex flex-col border-l border-slate-600">
              <button
                onClick={() => nudgeLots(1)}
                className="flex flex-1 items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
              >
                <FaPlus size={12} />
              </button>
              <button
                onClick={() => nudgeLots(-1)}
                className="flex flex-1 items-center justify-center border-t border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-white/5"
              >
                <FaMinus size={12} />
              </button>
            </div>
          </div>
        </div>

        {isPendingMode && (
          <div className="mt-3">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700/70 dark:bg-[#3a3f50]">
              <div className="px-3 py-2.5">
                <p className="text-xs uppercase text-slate-700 dark:text-white">Trigger Price</p>
                <input
                  type="number"
                  step={precision >= 4 ? '0.0001' : '0.01'}
                  value={entryValue}
                  onChange={(event) => setEntryValue(event.target.value)}
                  className="mt-1 w-full bg-transparent text-[1rem] font-semibold tabular-nums text-slate-900 outline-none dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-700 dark:text-white">{isPendingMode ? 'Trigger:' : 'Est. fill:'}</span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatMoney(displayExecutionPrice, precision)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-700 dark:text-white">Total value:</span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatMoney(notionalValue)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-700 dark:text-white">Required Margin:</span>
            <span className={`font-semibold tabular-nums ${hasEnoughMargin ? 'text-slate-900 dark:text-white' : 'text-rose-400'}`}>
              {formatMoney(effectiveRequiredMargin)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-700 dark:text-white">Leverage:</span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">1:{resolvedLeverage}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-700 dark:text-white">{movementValueLabel}:</span>
            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
              {Number.isFinite(displayPipValue) ? formatMoney(displayPipValue) : '--'}
            </span>
          </div>
          {tpEnabled && (
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-700 dark:text-white">TP preview:</span>
              <span className={`font-semibold tabular-nums ${Number.isFinite(tpPreview) && tpPreview >= 0 ? 'text-emerald-300' : 'text-slate-300'}`}>
                {Number.isFinite(tpPreview)
                  ? `${formatMoney(tpPreview)}${Number.isFinite(tpMovement) ? ` • ${tpMovement.toFixed(2)} ${movementLabel}` : ''}`
                  : '--'}
              </span>
            </div>
          )}
          {slEnabled && (
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-700 dark:text-white">SL preview:</span>
              <span className={`font-semibold tabular-nums ${Number.isFinite(slPreview) && slPreview < 0 ? 'text-rose-300' : 'text-slate-300'}`}>
                {Number.isFinite(slPreview)
                  ? `${formatMoney(slPreview)}${Number.isFinite(slMovement) ? ` • ${slMovement.toFixed(2)} ${movementLabel}` : ''}`
                  : '--'}
              </span>
            </div>
          )}
          {previewError && (
            <p className="text-xs font-semibold text-amber-300">{previewError}</p>
          )}
          {!accountId && (
            <p className="text-xs font-semibold text-amber-300">No active trading account selected.</p>
          )}
          {isPendingMode && accountId && !previewError && !hasValidEntryPrice && (
            <p className="text-xs font-semibold text-amber-300">Enter a valid trigger price to place this pending order.</p>
          )}
          {accountId && !previewError && !hasEnoughMargin && (
            <p className="text-xs font-semibold text-amber-300">Insufficient free margin for this position size.</p>
          )}
        </div>

        <div className="mt-4 border-t border-slate-200 dark:border-slate-700/60">
          <label className="flex items-center gap-3 border-b border-slate-200 py-4 text-sm font-semibold text-slate-800 dark:border-slate-700/60 dark:text-white">
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
              className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold tabular-nums text-slate-900 outline-none dark:border-slate-700 dark:bg-[#242a3b] dark:text-white"
            />
          )}

          <label className="flex items-center gap-3 border-b border-slate-200 py-4 text-sm font-semibold text-slate-800 dark:border-slate-700/60 dark:text-white">
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
              className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold tabular-nums text-slate-900 outline-none dark:border-slate-700 dark:bg-[#242a3b] dark:text-white"
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
