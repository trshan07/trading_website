import marketSymbolMap from '../config/marketSymbolMap.json';
import { isForexPair, normalizeSymbol } from './marketSymbols';

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

const DEFAULT_LOT_STEP = {
  forex: 0.01,
  crypto: 0.001,
  stocks: 0.01,
  funds: 0.01,
  commodities: 0.01,
  futures: 0.01,
  indices: 0.01,
  bonds: 0.01,
  economy: 0.01,
  options: 0.01,
};

const DEFAULT_MIN_LOT = {
  ...DEFAULT_LOT_STEP,
};

const DEFAULT_MOVEMENT_LABELS = {
  forex: 'Pips',
  commodities: 'Points',
  futures: 'Points',
  indices: 'Points',
  bonds: 'Points',
  economy: 'Points',
  options: 'Points',
  stocks: 'Price Move',
  funds: 'Price Move',
  crypto: 'Price Move',
};

export const resolveCategoryKey = (category = '', symbol = '') => {
  const cat = String(category || '').toLowerCase();
  const normalizedSymbol = normalizeSymbol(symbol);

  if (cat.includes('forex') || isForexPair(normalizedSymbol)) return 'forex';
  if (cat.includes('crypto') || normalizedSymbol.endsWith('USDT')) return 'crypto';
  if (cat.includes('stock') || cat.includes('share')) return 'stocks';
  if (cat.includes('fund') || cat.includes('etf')) return 'funds';
  if (cat.includes('commod') || normalizedSymbol.startsWith('XAU') || normalizedSymbol.startsWith('XAG') || ['BRENT', 'CL1!'].includes(normalizedSymbol)) return 'commodities';
  if (cat.includes('future')) return 'futures';
  if (cat.includes('indice') || cat.includes('index') || cat.includes('brazilian')) return 'indices';
  if (cat.includes('bond')) return 'bonds';
  if (cat.includes('economy')) return 'economy';
  if (cat.includes('option')) return 'options';
  return 'commodities';
};

const inferPrecision = ({ symbol = '', categoryKey = '', instrument = {}, mapping = {}, price = 0 }) => {
  if (Number.isInteger(instrument.precision)) {
    return instrument.precision;
  }

  if (Number.isInteger(mapping.precision)) {
    return mapping.precision;
  }

  if (categoryKey === 'forex') {
    return normalizeSymbol(symbol).includes('JPY') ? 3 : 5;
  }

  if (price > 0 && price < 1) {
    return 4;
  }

  if (price > 0 && price < 100) {
    return 4;
  }

  return 2;
};

const getMovementSize = ({ symbol = '', categoryKey = '', precision = 2, instrument = {}, mapping = {} }) => {
  const explicitPointSize = Number.parseFloat(
    instrument.pointSize
    ?? instrument.point_size
    ?? mapping.pointSize
    ?? mapping.point_size
  );

  if (Number.isFinite(explicitPointSize) && explicitPointSize > 0) {
    return explicitPointSize;
  }

  if (categoryKey === 'forex') {
    return normalizeSymbol(symbol).includes('JPY') ? 0.01 : 0.0001;
  }

  if (['commodities', 'futures', 'indices', 'bonds', 'economy', 'options'].includes(categoryKey)) {
    return 10 ** (-Math.max(0, precision));
  }

  return 1;
};

export const getInstrumentTradingMeta = ({ symbol = '', category = '', instrument = {} } = {}) => {
  const normalizedSymbol = normalizeSymbol(symbol || instrument.symbol || '');
  const mapping = marketSymbolMap[normalizedSymbol] || {};
  const categoryKey = resolveCategoryKey(instrument.category || category, normalizedSymbol);
  const price = Number.parseFloat(instrument.price ?? mapping.defaultPrice ?? 0) || 0;
  const precision = inferPrecision({
    symbol: normalizedSymbol,
    categoryKey,
    instrument,
    mapping,
    price,
  });

  return {
    categoryKey,
    contractSize: Number.parseFloat(instrument.contractSize ?? mapping.contractSize ?? DEFAULT_CONTRACT_SIZES[categoryKey]) || 1,
    quantityLabel: instrument.quantityLabel || mapping.quantityLabel || DEFAULT_QUANTITY_LABELS[categoryKey],
    lotStep: Number.parseFloat(instrument.lotStep ?? mapping.lotStep ?? DEFAULT_LOT_STEP[categoryKey]) || 0.01,
    minLot: Number.parseFloat(instrument.minLot ?? mapping.minLot ?? DEFAULT_MIN_LOT[categoryKey]) || 0.01,
    precision,
    movementLabel: DEFAULT_MOVEMENT_LABELS[categoryKey] || 'Price Move',
    movementSize: getMovementSize({
      symbol: normalizedSymbol,
      categoryKey,
      precision,
      instrument,
      mapping,
    }),
  };
};

const getForexLegs = (symbol = '') => {
  const normalized = normalizeSymbol(symbol);
  if (!isForexPair(normalized)) {
    return null;
  }

  return {
    base: normalized.slice(0, 3),
    quote: normalized.slice(3, 6),
  };
};

const calculateAccountCurrencyNotional = ({
  symbol = '',
  category = '',
  instrument = {},
  quantity = 0,
  price = 0,
  accountCurrency = 'USD',
}) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  const parsedQuantity = Number.parseFloat(quantity) || 0;
  const parsedPrice = Number.parseFloat(price) || 0;
  const normalizedAccountCurrency = String(accountCurrency || 'USD').toUpperCase();

  if (parsedQuantity <= 0) {
    return 0;
  }

  if (meta.categoryKey === 'forex') {
    const legs = getForexLegs(symbol);
    if (legs?.quote === normalizedAccountCurrency) {
      return parsedQuantity * parsedPrice;
    }

    if (legs?.base === normalizedAccountCurrency) {
      return parsedQuantity;
    }
  }

  return parsedQuantity * parsedPrice;
};

const convertQuotePnlToAccountCurrency = ({
  symbol = '',
  category = '',
  instrument = {},
  pnl = 0,
  conversionPrice = 0,
  accountCurrency = 'USD',
}) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  const normalizedAccountCurrency = String(accountCurrency || 'USD').toUpperCase();
  const parsedPnl = Number.parseFloat(pnl) || 0;
  const parsedConversionPrice = Number.parseFloat(conversionPrice) || 0;

  if (parsedPnl === 0) {
    return 0;
  }

  if (meta.categoryKey === 'forex') {
    const legs = getForexLegs(symbol);
    if (legs?.quote === normalizedAccountCurrency) {
      return parsedPnl;
    }

    if (legs?.base === normalizedAccountCurrency && parsedConversionPrice > 0) {
      return parsedPnl / parsedConversionPrice;
    }
  }

  return parsedPnl;
};

export const calculateQuantityFromLots = (lots, symbol, category, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  return (Number.parseFloat(lots) || 0) * meta.contractSize;
};

export const calculateNotionalValue = ({
  quantity = 0,
  price = 0,
}) => {
  const parsedQuantity = Number.parseFloat(quantity) || 0;
  const parsedPrice = Number.parseFloat(price) || 0;
  return parsedQuantity * parsedPrice;
};

export const calculateUsdFromLots = (lots, price, category, symbol, instrument) =>
  calculateAccountCurrencyNotional({
    symbol,
    category,
    instrument,
    quantity: calculateQuantityFromLots(lots, symbol, category, instrument),
    price,
  });

export const calculateLotsFromUsd = (usd, price, category, symbol, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  const parsedUsd = Number.parseFloat(usd) || 0;
  const contractNotional = calculateAccountCurrencyNotional({
    symbol,
    category,
    instrument,
    quantity: meta.contractSize,
    price,
  });

  if (parsedUsd <= 0 || contractNotional <= 0 || !meta.contractSize) {
    return 0;
  }

  return parsedUsd / contractNotional;
};

export const calculateLotsFromQuantity = (quantity, symbol, category, instrument) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  const parsedQuantity = Number.parseFloat(quantity) || 0;
  if (!meta.contractSize) {
    return 0;
  }
  return parsedQuantity / meta.contractSize;
};

export const calculateMarginRequired = ({
  symbol = '',
  category = '',
  instrument = {},
  quantity = 0,
  lots = null,
  price = 0,
  leverage = 100,
}) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  const parsedLeverage = Number.parseFloat(leverage) || 0;
  const resolvedQuantity = Number.isFinite(Number.parseFloat(quantity)) && Number.parseFloat(quantity) > 0
    ? Number.parseFloat(quantity)
    : calculateQuantityFromLots(lots ?? 0, symbol, category, instrument);

  if (!parsedLeverage || resolvedQuantity <= 0) {
    return 0;
  }

  return calculateAccountCurrencyNotional({
    symbol,
    category,
    instrument,
    quantity: resolvedQuantity,
    price,
  }) / parsedLeverage;
};

export const calculateMovementValue = ({
  symbol = '',
  category = '',
  instrument = {},
  entryPrice = 0,
  exitPrice = 0,
}) => {
  const meta = getInstrumentTradingMeta({ symbol, category, instrument });
  const parsedEntry = Number.parseFloat(entryPrice) || 0;
  const parsedExit = Number.parseFloat(exitPrice) || 0;

  if (!parsedEntry || !parsedExit) {
    return 0;
  }

  return Math.abs(parsedExit - parsedEntry) / meta.movementSize;
};

export const calculateProjectedPnL = ({
  symbol = '',
  category = '',
  instrument = {},
  side = 'buy',
  entryPrice = 0,
  exitPrice = 0,
  quantity = 0,
  lots = null,
}) => {
  const parsedEntry = Number.parseFloat(entryPrice) || 0;
  const parsedExit = Number.parseFloat(exitPrice) || 0;
  const resolvedQuantity = Number.isFinite(Number.parseFloat(quantity)) && Number.parseFloat(quantity) > 0
    ? Number.parseFloat(quantity)
    : calculateQuantityFromLots(lots ?? 0, symbol, category, instrument);

  if (!parsedEntry || !parsedExit || !resolvedQuantity) {
    return 0;
  }

  const normalizedSide = String(side).toLowerCase();
  const priceDelta = normalizedSide === 'sell'
    ? parsedEntry - parsedExit
    : parsedExit - parsedEntry;

  return convertQuotePnlToAccountCurrency({
    symbol,
    category,
    instrument,
    pnl: priceDelta * resolvedQuantity,
    conversionPrice: parsedExit || parsedEntry,
  });
};
