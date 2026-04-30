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
