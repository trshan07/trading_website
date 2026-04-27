// frontend/src/utils/tradingUtils.js

import marketSymbolMap from '../config/marketSymbolMap.json';
import { normalizeSymbol } from './marketSymbols';

const DEFAULT_CONTRACT_SIZES = {
  forex: 100000,
  crypto: 1,
  stocks: 1,
  funds: 1,
  commodities: 100,
  futures: 1,
  indices: 1,
  bonds: 1000,
  economy: 1000,
  options: 100,
};

const DEFAULT_QUANTITY_LABELS = {
  forex: 'units',
  crypto: 'coins',
  stocks: 'shares',
  funds: 'shares',
  commodities: 'units',
  futures: 'contracts',
  indices: 'index units',
  bonds: 'contracts',
  economy: 'contracts',
  options: 'contracts',
};

const resolveCategoryKey = (category = '') => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('forex')) return 'forex';
  if (cat.includes('crypto')) return 'crypto';
  if (cat.includes('stock') || cat.includes('share')) return 'stocks';
  if (cat.includes('fund') || cat.includes('etf')) return 'funds';
  if (cat.includes('commod')) return 'commodities';
  if (cat.includes('future')) return 'futures';
  if (cat.includes('indice') || cat.includes('index') || cat.includes('brazilian')) return 'indices';
  if (cat.includes('bond')) return 'bonds';
  if (cat.includes('economy')) return 'economy';
  if (cat.includes('option')) return 'options';
  return 'commodities';
};

export const getInstrumentTradingMeta = ({ symbol = '', category = '', instrument = {} } = {}) => {
  const normalizedSymbol = normalizeSymbol(symbol || instrument.symbol || '');
  const mapping = marketSymbolMap[normalizedSymbol] || {};
  const categoryKey = resolveCategoryKey(instrument.category || category);

  return {
    contractSize: Number.parseFloat(instrument.contractSize ?? instrument.contract_size ?? mapping.contractSize ?? DEFAULT_CONTRACT_SIZES[categoryKey]) || 1,
    quantityLabel: instrument.quantityLabel || instrument.quantity_label || mapping.quantityLabel || DEFAULT_QUANTITY_LABELS[categoryKey],
    lotStep: Number.parseFloat(instrument.lotStep ?? instrument.lot_step ?? mapping.lotStep) || (categoryKey === 'crypto' ? 0.001 : 0.01),
    minLot: Number.parseFloat(instrument.minLot ?? instrument.min_lot ?? mapping.minLot) || (categoryKey === 'crypto' ? 0.001 : 0.01),
  };
};

export const getLotUnits = (category, symbol, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  return meta.contractSize;
};

export const calculateQuantityFromLots = (lots, symbol, category, instrument) => {
  const units = getLotUnits(category, symbol, instrument);
  return (Number.parseFloat(lots) || 0) * units;
};

export const calculateUsdFromLots = (lots, price, category, symbol, instrument) => {
  const units = getLotUnits(category, symbol, instrument);
  return lots * units * price;
};

export const calculateLotsFromUsd = (usd, price, category, symbol, instrument) => {
  const units = getLotUnits(category, symbol, instrument);
  if (!price || !units) return 0.01;
  return usd / (units * price);
};

export const getLotStep = (category, symbol, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  return meta.lotStep;
};

export const getMinLot = (category, symbol, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  return meta.minLot;
};

/**
 * Calculate Pips:
 * Forex: 1 pip = 0.0001 (except JPY: 0.01)
 * Others: 1 point = 1.00
 */
export const calculatePips = (symbol, entryPrice, targetPrice) => {
  if (!entryPrice || !targetPrice) return 0;
  const diff = Math.abs(targetPrice - entryPrice);
  
  const sym = (symbol || '').toUpperCase();
  const isJpy = sym.includes('JPY');
  const isForex = (sym.length === 6 && !sym.includes('USDT')) || sym.includes('FX:');

  if (isForex) {
    return isJpy ? diff * 100 : diff * 10000;
  }
  
  return diff; // For Crypto/Indices, pips = price points
};

export const calculateProjectedPnL = ({
  side = 'buy',
  entryPrice = 0,
  exitPrice = 0,
  quantity = 0,
}) => {
  const parsedEntry = Number.parseFloat(entryPrice) || 0;
  const parsedExit = Number.parseFloat(exitPrice) || 0;
  const parsedQuantity = Number.parseFloat(quantity) || 0;

  if (!parsedEntry || !parsedExit || !parsedQuantity) {
    return 0;
  }

  const normalizedSide = String(side).toLowerCase();
  return normalizedSide === 'sell'
    ? (parsedEntry - parsedExit) * parsedQuantity
    : (parsedExit - parsedEntry) * parsedQuantity;
};
