const axios = require('axios');
const marketSymbolMap = require('../../config/marketSymbolMap.json');
const { fetchMarketQuotes, fetchOrderBook } = require('../../services/marketDataService');

const BINANCE_QUOTES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH'];
const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];

const normalizeSymbol = (symbol = '') => symbol.toUpperCase().replace(/[^A-Z0-9!]/g, '');

const isForexPair = (symbol = '') => {
  if (symbol.length !== 6) {
    return false;
  }

  const base = symbol.slice(0, 3);
  const quote = symbol.slice(3, 6);
  return FOREX_CODES.includes(base) && FOREX_CODES.includes(quote);
};

const isBinanceSymbol = (symbol = '') => BINANCE_QUOTES.some((quote) => symbol.endsWith(quote));

const resolveYahooSymbol = (symbol = '') => {
  const normalized = normalizeSymbol(symbol);
  const sharedMapping = marketSymbolMap[normalized];

  if (sharedMapping?.provider === 'yahoo' && sharedMapping.quote) {
    return sharedMapping.quote;
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

const createFlatData = (basePrice, interval = '15m', count = 300) => {
  const anchor = parseFloat(basePrice) || 100;
  const intervalMsMap = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
  };
  const candleMs = intervalMsMap[interval] || intervalMsMap['15m'];
  const now = Date.now();

  return Array.from({ length: count }, (_, index) => {
    const openTime = now - ((count - index) * candleMs);
    return [
      openTime,
      anchor.toString(),
      anchor.toString(),
      anchor.toString(),
      anchor.toString(),
      '0',
      openTime + candleMs,
      '0', '0', '0', '0', '0',
    ];
  });
};

/**
 * Helper to generate mock data for failover or non-Binance symbols
 */
const generateMockData = (basePrice, count = 300) => {
  let prev = parseFloat(basePrice) || 100;
  const data = [];
  const now = Math.floor(Date.now() / 1000);
  const intervalSec = 15 * 60; // 15m default
  
  for (let i = count; i > 0; i--) {
    const open = prev;
    const close = open + (Math.random() - 0.5) * (open * 0.01);
    const high = Math.max(open, close) + Math.random() * (open * 0.005);
    const low = Math.min(open, close) - Math.random() * (open * 0.005);
    
    data.push([
      (now - (i * intervalSec)) * 1000, // time in ms to match Binance format
      open.toString(),
      high.toString(),
      low.toString(),
      close.toString(),
      "100", // volume mock
      (now - ((i-1) * intervalSec)) * 1000,
      "0", "0", "0", "0", "0"
    ]);
    prev = close;
  }
  return data;
};

const INTERVAL_MAP = {
  '1m': { interval: '1m', range: '1d' },
  '5m': { interval: '5m', range: '5d' },
  '15m': { interval: '15m', range: '5d' },
  '1h': { interval: '60m', range: '1mo' },
  '4h': { interval: '60m', range: '3mo' },
  '1d': { interval: '1d', range: '1y' },
  '1w': { interval: '1wk', range: '5y' },
};

const fetchYahooHistory = async (symbol, interval) => {
  const yahooSymbol = resolveYahooSymbol(symbol);
  const config = INTERVAL_MAP[interval] || INTERVAL_MAP['15m'];
  const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`, {
    params: {
      interval: config.interval,
      range: config.range,
      includePrePost: false,
      events: 'div,splits',
    },
    timeout: 5000,
  });

  const result = response.data?.chart?.result?.[0];
  const timestamps = result?.timestamp || [];
  const quote = result?.indicators?.quote?.[0];

  if (!timestamps.length || !quote) {
    throw new Error('Yahoo history unavailable');
  }

  return timestamps.reduce((acc, time, index) => {
    const open = parseQuoteNumber(quote.open?.[index]);
    const high = parseQuoteNumber(quote.high?.[index]);
    const low = parseQuoteNumber(quote.low?.[index]);
    const close = parseQuoteNumber(quote.close?.[index]);
    const volume = parseQuoteNumber(quote.volume?.[index]) ?? 0;

    if ([open, high, low, close].some((value) => value === null)) {
      return acc;
    }

    acc.push([
      time * 1000,
      open.toString(),
      high.toString(),
      low.toString(),
      close.toString(),
      volume.toString(),
      time * 1000,
      '0', '0', '0', '0', '0',
    ]);
    return acc;
  }, []);
};

exports.getMarketQuotes = async (req, res) => {
  const requestedSymbols = String(req.query.symbols || '')
    .split(',')
    .map((symbol) => normalizeSymbol(symbol))
    .filter(Boolean);

  if (requestedSymbols.length === 0) {
    return res.status(400).json({ success: false, message: 'No symbols provided' });
  }

  try {
    const data = await fetchMarketQuotes(Array.from(new Set(requestedSymbols)));
    return res.status(200).json({
      success: true,
      data,
      asOf: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch live quotes' });
  }
};

exports.getMarketHistory = async (req, res) => {
  const { symbol, interval } = req.query;
  const iv = interval || '15m';
  const sym = normalizeSymbol(symbol || 'BTCUSDT');
  
  try {
    if (!isBinanceSymbol(sym)) {
      const yahooData = await fetchYahooHistory(sym, iv);
      if (yahooData.length > 0) {
        return res.status(200).json({
          success: true,
          data: yahooData,
          source: 'yahoo',
        });
      }
      throw new Error('Yahoo history unavailable');
    }
    
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: sym,
        interval: iv,
        limit: 300
      },
      timeout: 5000
    });

    return res.status(200).json({
      success: true,
      data: response.data,
      source: 'binance',
    });
  } catch (error) {
    console.log(`[MarketProxy] History fallback for ${sym} due to: ${error.message}`);
    const liveQuote = await fetchYahooQuotes([sym]).catch(() => ({}));
    const quotePrice = parseQuoteNumber(liveQuote?.[sym]?.price);
    const fallbackData = quotePrice
      ? createFlatData(quotePrice, iv)
      : generateMockData(req.query.initialPrice || 100);
    return res.status(200).json({
      success: true,
      data: fallbackData,
      isMock: !quotePrice,
      isSynthetic: Boolean(quotePrice),
      source: quotePrice ? 'quote-fallback' : 'mock',
    });
  }
};

exports.getOrderBook = async (req, res) => {
  const symbol = normalizeSymbol(req.query.symbol || 'BTCUSDT');
  const levels = Number.parseInt(req.query.levels || '15', 10) || 15;

  try {
    const data = await fetchOrderBook(symbol, levels);
    return res.status(200).json({
      success: true,
      data,
      asOf: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order book',
    });
  }
};
