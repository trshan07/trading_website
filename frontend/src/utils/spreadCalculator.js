// frontend/src/utils/spreadCalculator.js
import { MARKET_INSTRUMENTS } from '../constants/marketData';
import { getSymbolPrecision } from './marketSymbols';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const resolveCategory = (symbol, explicitCategory) => {
  if (explicitCategory) {
    return explicitCategory;
  }

  const instrument = MARKET_INSTRUMENTS.find((item) => item.symbol === symbol);
  return instrument?.category || 'Unknown';
};

const getSpreadAmount = ({ symbol, category, currentPrice }) => {
  const normalizedCategory = (category || '').toLowerCase();
  const upperSymbol = (symbol || '').toUpperCase();

  if (normalizedCategory.includes('crypto')) {
    return clamp(currentPrice * 0.00015, 0.01, currentPrice * 0.002);
  }

  if (normalizedCategory.includes('forex')) {
    return upperSymbol.includes('JPY') ? 0.02 : 0.0002;
  }

  if (normalizedCategory.includes('stock') || normalizedCategory.includes('fund')) {
    return clamp(currentPrice * 0.0002, 0.02, 0.25);
  }

  if (
    normalizedCategory.includes('indice') ||
    normalizedCategory.includes('future') ||
    normalizedCategory.includes('brazilian index')
  ) {
    return clamp(currentPrice * 0.00008, 0.5, 8);
  }

  if (normalizedCategory.includes('commod')) {
    return clamp(currentPrice * 0.00015, 0.05, 0.5);
  }

  return clamp(currentPrice * 0.0001, 0.01, currentPrice * 0.002);
};

export const calculateSpreads = (symbol, currentPrice, options = {}) => {
  if (!currentPrice) {
    return { bidPrice: 0, askPrice: 0, spreadAmt: 0 };
  }

  const category = resolveCategory(symbol, options.category);
  const precision = Number.isInteger(options.precision)
    ? options.precision
    : getSymbolPrecision({ symbol, category, price: currentPrice });

  const spreadAmt = getSpreadAmount({ symbol, category, currentPrice });
  const bidPrice = Number(currentPrice - (spreadAmt / 2));
  const askPrice = Number(currentPrice + (spreadAmt / 2));

  return {
    bidPrice: bidPrice.toFixed(precision),
    askPrice: askPrice.toFixed(precision),
    spreadAmt,
  };
};
