const {
  fetchMarketHistoryCandles,
  fetchMarketQuotes,
  fetchOrderBook,
  normalizeSymbol,
  parseQuoteNumber,
} = require('../../services/marketDataService');

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

const generateMockData = (basePrice, count = 300) => {
  let prev = parseFloat(basePrice) || 100;
  const data = [];
  const now = Math.floor(Date.now() / 1000);
  const intervalSec = 15 * 60;

  for (let i = count; i > 0; i -= 1) {
    const open = prev;
    const close = open + (Math.random() - 0.5) * (open * 0.01);
    const high = Math.max(open, close) + Math.random() * (open * 0.005);
    const low = Math.min(open, close) - Math.random() * (open * 0.005);

    data.push([
      (now - (i * intervalSec)) * 1000,
      open.toString(),
      high.toString(),
      low.toString(),
      close.toString(),
      '100',
      (now - ((i - 1) * intervalSec)) * 1000,
      '0', '0', '0', '0', '0',
    ]);
    prev = close;
  }

  return data;
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
  const iv = req.query.interval || '15m';
  const sym = normalizeSymbol(req.query.symbol || 'BTCUSDT');

  try {
    const data = await fetchMarketHistoryCandles(sym, iv, 300);
    return res.status(200).json({
      success: true,
      data,
      source: 'market-provider',
    });
  } catch (error) {
    console.log(`[MarketProxy] History fallback for ${sym} due to: ${error.message}`);
    const liveQuote = await fetchMarketQuotes([sym]).catch(() => ({}));
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
