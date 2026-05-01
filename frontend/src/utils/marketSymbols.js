import marketSymbolMap from '../config/marketSymbolMap.json';

const EXPLICIT_SYMBOL_MAP = Object.fromEntries(
  Object.entries(marketSymbolMap).map(([symbol, mapping]) => [symbol, mapping.tradingView])
);

const CRYPTO_QUOTES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH'];
const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];

export const normalizeSymbol = (symbol = '') => symbol.toUpperCase().replace(/[^A-Z0-9!]/g, '');

export const formatInstrumentDisplaySymbol = (symbol = '', { withSlash = false } = {}) => {
  const normalized = normalizeSymbol(symbol);

  if (normalized.endsWith('USDT')) {
    const base = normalized.slice(0, -4);
    return withSlash ? `${base}/USD` : `${base}USD`;
  }

  if (isForexPair(normalized)) {
    const base = normalized.slice(0, 3);
    const quote = normalized.slice(3, 6);
    return withSlash ? `${base}/${quote}` : normalized;
  }

  if (withSlash && normalized.endsWith('USD') && normalized.length >= 6) {
    return `${normalized.slice(0, -3)}/USD`;
  }

  return normalized;
};

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

  // If already prefixed, trust it unless it's a known problematic prefix
  if (symbol.includes(':')) {
    const restricted = ['ICEEUR:', 'SP:', 'DJ:', 'CME_MINI:', 'CBOT_MINI:', 'NYMEX:', 'BMFBOVESPA:', 'DJ:'];
    if (restricted.some(p => symbol.startsWith(p))) {
      const parts = symbol.split(':');
      const base = parts[parts.length - 1];
      
      // Special case for Oil
      if (base === 'BRN1!' || base === 'BRENT') return 'TVC:UKOIL';
      if (base === 'CL1!' || base === 'USOIL') return 'TVC:USOIL';
      
      return `TVC:${base}`;
    }
    return symbol;
  }

  const normalized = normalizeSymbol(symbol);
  const category = (instrument?.category || '').toLowerCase();

  // 1. Check explicit map first
  if (EXPLICIT_SYMBOL_MAP[normalized]) {
    return EXPLICIT_SYMBOL_MAP[normalized];
  }

  // 2. Handle common patterns
  if (normalized.endsWith('!')) {
    return `TVC:${normalized}`;
  }

  // Crypto
  if (CRYPTO_QUOTES.some((quote) => normalized.endsWith(quote)) || category.includes('crypto')) {
    return `BINANCE:${normalized}`;
  }

  // Forex
  if (isForexPair(normalized) || category.includes('forex')) {
    // Try FX: first, then FOREXCOM:
    return `FX:${normalized}`;
  }

  // Metals
  if (normalized.startsWith('XAU') || normalized.startsWith('XAG') || category.includes('metal')) {
    return `OANDA:${normalized}`;
  }

  // Indices
  if (category.includes('indice') || category.includes('index')) {
    return `TVC:${normalized}`;
  }

  // Default to TVC for everything else (Commodities, Stocks fallback)
  if (category.includes('stock') || category.includes('share')) {
    return `NASDAQ:${normalized}`;
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
    useBidAsk: mapping.useBidAsk ?? (mapping.provider === 'binance'),
    precision,
  };
};
