// frontend/src/utils/tradingUtils.js

/**
 * Standard Lot Sizes:
 * Forex: 1 Lot = 100,000 units
 * Crypto: 1 Lot = 1 unit (e.g. 1 BTC)
 * Commodities/Indices: 1 Lot = 100 units (Standardized)
 */

export const getLotUnits = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('forex')) return 100000;
  if (cat.includes('crypto')) return 1;
  return 100; // Default for Stocks, Commodities, Indices
};

export const calculateUsdFromLots = (lots, price, category) => {
  const units = getLotUnits(category);
  return lots * units * price;
};

export const calculateLotsFromUsd = (usd, price, category) => {
  const units = getLotUnits(category);
  if (!price || !units) return 0.01;
  return usd / (units * price);
};

export const getLotStep = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('forex')) return 0.01;
  if (cat.includes('crypto')) return 0.001; // Allow smaller crypto lots
  return 0.1; // Stocks/Indices
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
