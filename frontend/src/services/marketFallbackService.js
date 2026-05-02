import { normalizeSymbol } from '../utils/marketSymbols';

const CRYPTO_QUOTES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH'];
const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF', 'SGD', 'TRY'];
const BIQUOTE_BASE_URL = 'https://biquote.io/api';
const METAL_SYMBOLS = new Set(['XAUUSD', 'XAGUSD']);

const isForexPair = (symbol = '') => {
  if (symbol.length !== 6) {
    return false;
  }

  const base = symbol.slice(0, 3);
  const quote = symbol.slice(3, 6);
  return FOREX_CODES.includes(base) && FOREX_CODES.includes(quote);
};

const isCryptoSymbol = (symbol = '', category = '') => {
  const normalized = normalizeSymbol(symbol);
  return CRYPTO_QUOTES.some((quote) => normalized.endsWith(quote)) || String(category).toLowerCase().includes('crypto');
};

const isMetalSymbol = (symbol = '', category = '') => {
  const normalized = normalizeSymbol(symbol);
  return METAL_SYMBOLS.has(normalized) || String(category).toLowerCase().includes('metal');
};

const resolveYahooSymbol = (instrument = {}) => {
  const normalized = normalizeSymbol(instrument.symbol);
  const explicitQuote = String(instrument.quoteSymbol || instrument.quote_symbol || '').trim();

  if (explicitQuote) {
    return explicitQuote;
  }

  if (isForexPair(normalized)) {
    return `${normalized}=X`;
  }

  return normalized;
};

const parseQuoteNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveBiquoteSymbol = (instrument = {}) => {
  const normalized = normalizeSymbol(instrument.symbol);
  const explicitDataSymbol = String(instrument.dataSymbol || instrument.data_symbol || '').trim();
  const compactDataSymbol = explicitDataSymbol.replace('/', '').toUpperCase();

  if (compactDataSymbol) {
    if (compactDataSymbol.endsWith('USDT')) {
      return `${compactDataSymbol.slice(0, -4)}USD`;
    }

    return compactDataSymbol;
  }

  if (normalized.endsWith('USDT')) {
    return `${normalized.slice(0, -4)}USD`;
  }

  return normalized;
};

const fetchBiquoteQuotes = async (instruments = []) => {
  if (instruments.length === 0) {
    return {};
  }

  const providerToOriginalSymbol = Object.fromEntries(
    instruments.map((instrument) => [resolveBiquoteSymbol(instrument), instrument.symbol])
  );

  const query = new URLSearchParams();
  instruments.forEach((instrument) => {
    query.append('symbols', resolveBiquoteSymbol(instrument));
  });

  const response = await fetch(`${BIQUOTE_BASE_URL}/latest?${query.toString()}`);
  if (!response.ok) {
    throw new Error('BiQuote quote request failed');
  }

  const payload = await response.json();
  const ticks = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return ticks.reduce((acc, tick) => {
    const providerSymbol = normalizeSymbol(tick?.symbol || tick?.name || '');
    const originalSymbol = providerToOriginalSymbol[providerSymbol];
    if (!originalSymbol) {
      return acc;
    }

    const last = parseQuoteNumber(tick.last ?? tick.price ?? tick.close);
    if (last === null) {
      return acc;
    }

    const isoTime = tick.time || tick.timestamp || null;
    const updatedAt = isoTime ? Date.parse(isoTime) || Date.now() : Date.now();

    acc[originalSymbol] = {
      price: last,
      bid: parseQuoteNumber(tick.bid),
      ask: parseQuoteNumber(tick.ask),
      change: parseQuoteNumber(tick.changePercent ?? tick.change_percent ?? tick.change) ?? 0,
      volume: parseQuoteNumber(tick.volume),
      updatedAt,
      source: 'biquote-public',
    };
    return acc;
  }, {});
};

const fetchBinanceQuotes = async (instruments = []) => {
  if (instruments.length === 0) {
    return {};
  }

  const symbolMap = Object.fromEntries(
    instruments.map((instrument) => [normalizeSymbol(instrument.symbol), instrument.symbol])
  );
  const providerSymbols = Object.keys(symbolMap);

  const response = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(providerSymbols))}`
  );
  if (!response.ok) {
    throw new Error('Binance quote request failed');
  }

  const payload = await response.json();
  const updatedAt = Date.now();

  return (Array.isArray(payload) ? payload : []).reduce((acc, ticker) => {
    const originalSymbol = symbolMap[normalizeSymbol(ticker?.symbol)];
    if (!originalSymbol) {
      return acc;
    }

    acc[originalSymbol] = {
      price: parseQuoteNumber(ticker.lastPrice),
      bid: parseQuoteNumber(ticker.bidPrice),
      ask: parseQuoteNumber(ticker.askPrice),
      change: parseQuoteNumber(ticker.priceChangePercent),
      volume: parseQuoteNumber(ticker.volume),
      updatedAt,
      source: 'binance-public',
    };
    return acc;
  }, {});
};

const fetchYahooQuotes = async (instruments = []) => {
  if (instruments.length === 0) {
    return {};
  }

  const yahooSymbols = instruments.map(resolveYahooSymbol);
  const symbolMap = Object.fromEntries(
    instruments.map((instrument) => [resolveYahooSymbol(instrument), instrument.symbol])
  );

  const response = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooSymbols.join(','))}`
  );
  if (!response.ok) {
    throw new Error('Yahoo quote request failed');
  }

  const payload = await response.json();
  const updatedAt = Date.now();
  const rawResults = payload?.quoteResponse?.result || [];

  return rawResults.reduce((acc, item) => {
    const originalSymbol = symbolMap[item?.symbol];
    if (!originalSymbol) {
      return acc;
    }

    const price = parseQuoteNumber(
      item.regularMarketPrice
      ?? item.postMarketPrice
      ?? item.preMarketPrice
      ?? item.ask
      ?? item.bid
    );

    if (price === null) {
      return acc;
    }

    acc[originalSymbol] = {
      price,
      bid: parseQuoteNumber(item.bid),
      ask: parseQuoteNumber(item.ask),
      change: parseQuoteNumber(item.regularMarketChangePercent) ?? 0,
      volume: parseQuoteNumber(item.regularMarketVolume),
      updatedAt,
      source: 'yahoo-public',
    };
    return acc;
  }, {});
};

export const fetchPublicMarketQuotes = async (instruments = []) => {
  const filtered = instruments.filter((instrument) => instrument?.symbol);
  if (filtered.length === 0) {
    return {};
  }

  const metals = filtered.filter((instrument) => isMetalSymbol(instrument.symbol, instrument.category));
  const nonMetals = filtered.filter((instrument) => !isMetalSymbol(instrument.symbol, instrument.category));
  const biquoteQuotes = await fetchBiquoteQuotes(nonMetals).catch(() => ({}));
  const unresolvedInstruments = nonMetals.filter((instrument) => !biquoteQuotes[instrument.symbol]);
  const cryptoInstruments = unresolvedInstruments.filter((instrument) => isCryptoSymbol(instrument.symbol, instrument.category));
  const nonCryptoInstruments = unresolvedInstruments.filter((instrument) => !isCryptoSymbol(instrument.symbol, instrument.category));

  const [cryptoQuotes, yahooQuotes, metalQuotes] = await Promise.all([
    fetchBinanceQuotes(cryptoInstruments).catch(() => ({})),
    fetchYahooQuotes(nonCryptoInstruments).catch(() => ({})),
    fetchYahooQuotes(metals).catch(() => ({})),
  ]);

  return {
    ...biquoteQuotes,
    ...yahooQuotes,
    ...metalQuotes,
    ...cryptoQuotes,
  };
};
