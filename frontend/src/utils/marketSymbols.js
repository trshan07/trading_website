import marketSymbolMap from '../config/marketSymbolMap.json';

const EXPLICIT_SYMBOL_MAP = Object.fromEntries(
  Object.entries(marketSymbolMap).map(([symbol, mapping]) => [symbol, mapping.tradingView])
);

const CRYPTO_QUOTES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH'];
const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];

export const normalizeSymbol = (symbol = '') => symbol.toUpperCase().replace(/[^A-Z0-9!]/g, '');

export const isForexPair = (symbol = '') => {
  if (symbol.length !== 6) {
    return false;
  }

  const base = symbol.slice(0, 3);
  const quote = symbol.slice(3, 6);
  return FOREX_CODES.includes(base) && FOREX_CODES.includes(quote);
};

export const resolveTradingViewSymbol = ({ symbol, instrument }) => {
  if (!symbol) {
    return 'BINANCE:BTCUSDT';
  }

  if (symbol.includes(':')) {
    return symbol;
  }

  const normalized = normalizeSymbol(symbol);
  const category = (instrument?.category || '').toLowerCase();

  if (EXPLICIT_SYMBOL_MAP[normalized]) {
    return EXPLICIT_SYMBOL_MAP[normalized];
  }

  if (normalized.endsWith('!')) {
    return `TVC:${normalized}`;
  }

  if (CRYPTO_QUOTES.some((quote) => normalized.endsWith(quote))) {
    return `BINANCE:${normalized}`;
  }

  if (isForexPair(normalized) || category.includes('forex')) {
    return `FX:${normalized}`;
  }

  if (category.includes('crypto')) {
    return `BINANCE:${normalized}`;
  }

  if (category.includes('stock') || category.includes('share')) {
    return `NASDAQ:${normalized}`;
  }

  if (category.includes('fund') || category.includes('etf')) {
    return `AMEX:${normalized}`;
  }

  if (category.includes('indice') || category.includes('index')) {
    return `INDEX:${normalized}`;
  }

  if (
    category.includes('future') ||
    category.includes('bond') ||
    category.includes('economy') ||
    category.includes('option') ||
    category.includes('commod')
  ) {
    return `TVC:${normalized}`;
  }

  return `TVC:${normalized}`;
};

export const getSymbolPrecision = ({ symbol = '', category = '', price = 0 }) => {
  if (isForexPair(normalizeSymbol(symbol)) || category.toLowerCase().includes('forex')) {
    return 5;
  }

  if (price > 0 && price < 1) {
    return 4;
  }

  if (price > 0 && price < 100) {
    return 4;
  }

  return 2;
};

export const buildInstrumentSnapshot = ({ symbol, instrument = {}, marketData = {} }) => {
  const normalizedSymbol = normalizeSymbol(symbol || instrument.symbol);
  const mapping = marketSymbolMap[normalizedSymbol] || {};
  const lookupSymbol = symbol || instrument.symbol;
  const liveInfo = marketData[lookupSymbol] || {};
  const price = Number.parseFloat(liveInfo.price ?? instrument.price ?? instrument.default_price ?? 0) || 0;
  const change = Number.parseFloat(liveInfo.change ?? instrument.change ?? instrument.default_change ?? 0) || 0;
  const category = instrument.category || 'General';
  const precision = Number.isInteger(mapping.precision)
    ? mapping.precision
    : getSymbolPrecision({ symbol: lookupSymbol, category, price });

  return {
    ...mapping,
    ...instrument,
    symbol: lookupSymbol,
    name: instrument.name || lookupSymbol,
    category,
    price,
    change,
    volume: liveInfo.volume ?? instrument.volume ?? instrument.default_volume ?? null,
    bid: Number.parseFloat(liveInfo.bid ?? 0) || null,
    ask: Number.parseFloat(liveInfo.ask ?? 0) || null,
    lastDir: liveInfo.lastDir || 'none',
    provider: instrument.provider || mapping.provider || null,
    quoteSymbol: instrument.quoteSymbol || instrument.quote_symbol || mapping.quote || null,
    tradingViewSymbol: instrument.tradingViewSymbol || instrument.trading_view_symbol || mapping.tradingView || null,
    useBidAsk: typeof instrument.useBidAsk === 'boolean'
      ? instrument.useBidAsk
      : (typeof instrument.use_bid_ask === 'boolean'
        ? instrument.use_bid_ask
        : (mapping.useBidAsk ?? (mapping.provider === 'binance'))),
    spread: Number.parseFloat(instrument.spread ?? mapping.spread ?? 0) || null,
    contractSize: Number.parseFloat(instrument.contractSize ?? instrument.contract_size ?? mapping.contractSize ?? 0) || null,
    lotStep: Number.parseFloat(instrument.lotStep ?? instrument.lot_step ?? mapping.lotStep ?? 0) || null,
    minLot: Number.parseFloat(instrument.minLot ?? instrument.min_lot ?? mapping.minLot ?? 0) || null,
    quantityLabel: instrument.quantityLabel || instrument.quantity_label || mapping.quantityLabel || null,
    precision,
  };
};
