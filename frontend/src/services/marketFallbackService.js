import { normalizeSymbol } from '../utils/marketSymbols';

const CRYPTO_QUOTES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH'];
const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];

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

  const cryptoInstruments = filtered.filter((instrument) => isCryptoSymbol(instrument.symbol, instrument.category));
  const nonCryptoInstruments = filtered.filter((instrument) => !isCryptoSymbol(instrument.symbol, instrument.category));

  const [cryptoQuotes, yahooQuotes] = await Promise.all([
    fetchBinanceQuotes(cryptoInstruments).catch(() => ({})),
    fetchYahooQuotes(nonCryptoInstruments).catch(() => ({})),
  ]);

  return {
    ...yahooQuotes,
    ...cryptoQuotes,
  };
};
