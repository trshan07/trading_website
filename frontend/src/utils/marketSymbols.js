const EXPLICIT_SYMBOL_MAP = {
  BTCUSDT: 'BINANCE:BTCUSDT',
  ETHUSDT: 'BINANCE:ETHUSDT',
  BNBUSDT: 'BINANCE:BNBUSDT',
  SOLUSDT: 'BINANCE:SOLUSDT',
  ADAUSDT: 'BINANCE:ADAUSDT',
  EURUSD: 'FX:EURUSD',
  GBPUSD: 'FX:GBPUSD',
  USDJPY: 'FX:USDJPY',
  AUDUSD: 'FX:AUDUSD',
  USDCAD: 'FX:USDCAD',
  USDCHF: 'FX:USDCHF',
  NZDUSD: 'FX:NZDUSD',
  XAUUSD: 'TVC:GOLD',
  XAGUSD: 'TVC:SILVER',
  BRENT: 'TVC:UKOIL',
  US10Y: 'TVC:US10Y',
  DXY: 'TVC:DXY',
  VIX: 'TVC:VIX',
  SPX: 'SP:SPX',
  NDX: 'NASDAQ:NDX',
  DJI: 'DJ:DJI',
  IBOV: 'BMFBOVESPA:IBOV',
  SPY: 'AMEX:SPY',
  QQQ: 'NASDAQ:QQQ',
  AAPL: 'NASDAQ:AAPL',
  TSLA: 'NASDAQ:TSLA',
  MSFT: 'NASDAQ:MSFT',
  GOOGL: 'NASDAQ:GOOGL',
  'ES1!': 'CME_MINI:ES1!',
  'YM1!': 'CBOT_MINI:YM1!',
  'CL1!': 'NYMEX:CL1!',
};

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
  const liveInfo = marketData[symbol] || {};
  const price = Number.parseFloat(liveInfo.price ?? instrument.price ?? instrument.default_price ?? 0) || 0;
  const change = Number.parseFloat(liveInfo.change ?? instrument.change ?? instrument.default_change ?? 0) || 0;
  const category = instrument.category || 'General';

  return {
    ...instrument,
    symbol: symbol || instrument.symbol,
    name: instrument.name || symbol,
    category,
    price,
    change,
    volume: liveInfo.volume ?? instrument.volume ?? instrument.default_volume ?? null,
    bid: Number.parseFloat(liveInfo.bid ?? 0) || null,
    ask: Number.parseFloat(liveInfo.ask ?? 0) || null,
    lastDir: liveInfo.lastDir || 'none',
    precision: getSymbolPrecision({ symbol: symbol || instrument.symbol, category, price }),
  };
};
