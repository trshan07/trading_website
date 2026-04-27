const axios = require('axios');
const marketSymbolMap = require('../../config/marketSymbolMap.json');

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

const fetchBinanceQuotes = async (symbols = []) => {
  if (symbols.length === 0) {
    return {};
  }

  const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr', {
    params: {
      symbols: JSON.stringify(symbols),
    },
    timeout: 5000,
  });

  return (response.data || []).reduce((acc, ticker) => {
    if (!ticker?.symbol) {
      return acc;
    }

    acc[ticker.symbol] = {
      price: parseQuoteNumber(ticker.lastPrice),
      bid: parseQuoteNumber(ticker.bidPrice),
      ask: parseQuoteNumber(ticker.askPrice),
      change: parseQuoteNumber(ticker.priceChangePercent),
      volume: parseQuoteNumber(ticker.volume),
      source: 'binance',
    };
    return acc;
  }, {});
};

const fetchYahooQuotes = async (symbols = []) => {
  if (symbols.length === 0) {
    return {};
  }

  const symbolMap = symbols.reduce((acc, symbol) => {
    acc[resolveYahooSymbol(symbol)] = symbol;
    return acc;
  }, {});

  const response = await axios.get('https://query1.finance.yahoo.com/v7/finance/quote', {
    params: {
      symbols: Object.keys(symbolMap).join(','),
    },
    timeout: 5000,
  });

  const results = response.data?.quoteResponse?.result || [];
  return results.reduce((acc, quote) => {
    const appSymbol = symbolMap[quote.symbol];
    if (!appSymbol) {
      return acc;
    }

    const price = parseQuoteNumber(
      quote.regularMarketPrice
      ?? quote.postMarketPrice
      ?? quote.preMarketPrice
    );
    const bid = parseQuoteNumber(quote.bid);
    const ask = parseQuoteNumber(quote.ask);
    const change = parseQuoteNumber(quote.regularMarketChangePercent);
    const volume = parseQuoteNumber(
      quote.regularMarketVolume
      ?? quote.averageDailyVolume3Month
      ?? quote.averageDailyVolume10Day
    );

    if (price === null) {
      return acc;
    }

    acc[appSymbol] = {
      price,
      bid,
      ask,
      change: change ?? 0,
      volume,
      source: 'yahoo',
    };
    return acc;
  }, {});
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

  const uniqueSymbols = Array.from(new Set(requestedSymbols));
  const binanceSymbols = uniqueSymbols.filter(isBinanceSymbol);
  const yahooSymbols = uniqueSymbols.filter((symbol) => !isBinanceSymbol(symbol));

  try {
    const [binanceData, yahooData] = await Promise.all([
      fetchBinanceQuotes(binanceSymbols).catch(() => ({})),
      fetchYahooQuotes(yahooSymbols).catch(() => ({})),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...yahooData,
        ...binanceData,
      },
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
    // Failover to mock data silently to keep frontend clean and functional
    console.log(`[MarketProxy] Falling back to mock data for ${sym} due to: ${error.message}`);
    const mockData = generateMockData(req.query.initialPrice || 100);
    return res.status(200).json({
      success: true,
      data: mockData,
      isMock: true
    });
  }
};
