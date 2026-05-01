// frontend/src/utils/tradingUtils.js

export {
  calculateLotsFromQuantity,
  calculateLotsFromUsd,
  calculateMarginRequired,
  calculateMovementValue as calculatePips,
  calculateNotionalValue,
  calculateProjectedPnL,
  calculateQuantityFromLots,
  calculateUsdFromLots,
  getInstrumentTradingMeta,
} from './calculators';

import { getInstrumentTradingMeta } from './calculators';

export const getLotUnits = (category, symbol, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  return meta.contractSize;
};

export const getLotStep = (category, symbol, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  return meta.lotStep;
};

export const getMinLot = (category, symbol, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  return meta.minLot;
};

export const getLotPrecision = (category, symbol, instrument) => {
  const step = getLotStep(category, symbol, instrument);
  const normalizedStep = Number.parseFloat(step) || 0.01;
  const raw = normalizedStep.toString().toLowerCase();

  if (raw.includes('e-')) {
    return Number.parseInt(raw.split('e-')[1], 10) || 0;
  }

  return raw.includes('.') ? raw.split('.')[1].length : 0;
};

export const formatLots = (lots, category, symbol, instrument) => {
  const precision = getLotPrecision(category, symbol, instrument);
  const parsedLots = Number.parseFloat(lots) || 0;

  return parsedLots.toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
};
