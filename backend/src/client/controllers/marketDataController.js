const {
  fetchMarketHistoryCandles,
  fetchOrderBook,
  getMergedInstrumentConfig,
  normalizeSymbol,
  parseQuoteNumber,
} = require('../../services/marketDataService');
const {
  DEFAULT_MAX_AGE_MS,
  getCanonicalMarketQuotes,
  getCanonicalQuote,
  isQuoteFresh,
  readStoredQuotes,
} = require('../../services/marketSnapshotService');
const marketStreamService = require('../../services/marketStreamService');
const db = require('../../config/database');
const { isMissingColumnError, isMissingRelationError } = require('../../utils/dbCompat');

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

exports.getMarketQuotes = async (req, res) => {
  const requestedSymbols = String(req.query.symbols || '')
    .split(',')
    .map((symbol) => normalizeSymbol(symbol))
    .filter(Boolean);

  if (requestedSymbols.length === 0) {
    return res.status(400).json({ success: false, message: 'No symbols provided' });
  }

  try {
    const data = await getCanonicalMarketQuotes(Array.from(new Set(requestedSymbols)), {
      preferChartAligned: false,
      refresh: true,
    });
    return res.status(200).json({
      success: true,
      data,
      asOf: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[MarketProxy] Quote fetch failed:', error.message);
    return res.status(200).json({
      success: true,
      data: {},
      asOf: new Date().toISOString(),
      degraded: true,
    });
  }
};

exports.getChartAlignedQuotes = async (req, res) => {
  const requestedSymbols = String(req.query.symbols || '')
    .split(',')
    .map((symbol) => normalizeSymbol(symbol))
    .filter(Boolean);

  if (requestedSymbols.length === 0) {
    return res.status(400).json({ success: false, message: 'No symbols provided' });
  }

  try {
    const data = await getCanonicalMarketQuotes(Array.from(new Set(requestedSymbols)), {
      preferChartAligned: true,
      refresh: true,
    });
    return res.status(200).json({
      success: true,
      data,
      asOf: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[MarketProxy] Chart-aligned quote fetch failed:', error.message);
    return res.status(200).json({
      success: true,
      data: {},
      asOf: new Date().toISOString(),
      degraded: true,
    });
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
    const liveQuote = await getCanonicalQuote(sym, {
      preferChartAligned: true,
      refresh: true,
    }).catch(() => null);
    const quotePrice = parseQuoteNumber(liveQuote?.price);
    const fallbackData = quotePrice ? createFlatData(quotePrice, iv) : [];

    return res.status(200).json({
      success: true,
      data: fallbackData,
      isSynthetic: Boolean(quotePrice),
      source: quotePrice ? 'quote-fallback' : 'unavailable',
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

const buildDiagnosticsStatus = ({
  canonicalQuote,
  streamQuote,
  storedQuote,
  config = {},
  maxAgeMs = DEFAULT_MAX_AGE_MS,
}) => {
  const source = String(canonicalQuote?.source || '');
  const hasPrice = Number.isFinite(parseQuoteNumber(canonicalQuote?.price));
  const hasStreamPrice = Number.isFinite(parseQuoteNumber(streamQuote?.price));
  const storedFresh = Boolean(storedQuote && isQuoteFresh(storedQuote, maxAgeMs));
  const canonicalFresh = Boolean(canonicalQuote && isQuoteFresh(canonicalQuote, maxAgeMs));
  const hasConfiguredSpread = Number.isFinite(parseQuoteNumber(config.spread)) && parseQuoteNumber(config.spread) > 0;
  const hasBidAsk = Number.isFinite(parseQuoteNumber(canonicalQuote?.bid)) && Number.isFinite(parseQuoteNumber(canonicalQuote?.ask));

  if (hasStreamPrice && source.includes('stream')) {
    return {
      status: 'live',
      reason: 'Using websocket stream quote from the active market feed.',
    };
  }

  if (hasPrice && canonicalFresh && !source.includes('stream') && !['synthetic', 'history-close', 'quote-fallback'].includes(source)) {
    return {
      status: 'snapshot',
      reason: 'Using a fresh provider snapshot because no websocket tick is active for this symbol yet.',
    };
  }

  if (hasPrice && ['synthetic', 'history-close', 'quote-fallback'].includes(source)) {
    if (source === 'history-close') {
      return {
        status: 'fallback',
        reason: 'Using the latest available history close because live provider quote data was unavailable.',
      };
    }

    if (source === 'quote-fallback') {
      return {
        status: 'fallback',
        reason: 'Using quote-derived fallback data because chart/history data was unavailable.',
      };
    }

    return {
      status: 'fallback',
      reason: hasConfiguredSpread
        ? 'Using a synthetic execution quote built from last price plus configured instrument spread.'
        : 'Using a synthetic quote because neither live bid/ask nor configured spread-backed quote was available.',
    };
  }

  if (hasPrice && !canonicalFresh) {
    return {
      status: 'stale',
      reason: storedFresh
        ? 'Stored quote is present, but the canonical quote is older than the freshness threshold.'
        : 'Quote is available but older than the freshness threshold and should be refreshed.',
    };
  }

  if (hasBidAsk && hasPrice) {
    return {
      status: 'snapshot',
      reason: 'Using non-stream bid/ask quote from the provider response.',
    };
  }

  return {
    status: 'missing',
    reason: 'No usable live, stored, or fallback quote could be resolved for this instrument.',
  };
};

const readActiveInstrumentSymbols = async () => {
  try {
    const { rows } = await db.query(`
      SELECT symbol
      FROM instruments
      WHERE is_active = TRUE
      ORDER BY symbol
    `);
    return rows.map((row) => normalizeSymbol(row.symbol)).filter(Boolean);
  } catch (error) {
    if (isMissingRelationError(error) || isMissingColumnError(error)) {
      return [];
    }
    throw error;
  }
};

exports.getMarketDiagnostics = async (req, res) => {
  const requestedSymbols = String(req.query.symbols || '')
    .split(',')
    .map((symbol) => normalizeSymbol(symbol))
    .filter(Boolean);
  const refresh = String(req.query.refresh || 'true').toLowerCase() !== 'false';
  const preferChartAligned = String(req.query.chartAligned || 'true').toLowerCase() !== 'false';
  const maxAgeMs = Number.parseInt(req.query.maxAgeMs || `${DEFAULT_MAX_AGE_MS}`, 10) || DEFAULT_MAX_AGE_MS;

  try {
    const symbols = requestedSymbols.length > 0
      ? Array.from(new Set(requestedSymbols))
      : await readActiveInstrumentSymbols();

    if (symbols.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        summary: {
          total: 0,
          live: 0,
          snapshot: 0,
          fallback: 0,
          stale: 0,
          missing: 0,
        },
        asOf: new Date().toISOString(),
      });
    }

    const [storedQuotes, canonicalQuotes, configs] = await Promise.all([
      readStoredQuotes(symbols).catch(() => ({})),
      getCanonicalMarketQuotes(symbols, { preferChartAligned, refresh, maxAgeMs }).catch(() => ({})),
      Promise.all(symbols.map((symbol) => getMergedInstrumentConfig(symbol))),
    ]);

    const diagnostics = symbols.map((symbol, index) => {
      const config = configs[index] || {};
      const streamQuote = marketStreamService.getLatestQuote(symbol);
      const storedQuote = storedQuotes[symbol] || null;
      const canonicalQuote = canonicalQuotes[symbol] || null;
      const ageMs = canonicalQuote?.updatedAt ? Math.max(0, Date.now() - new Date(canonicalQuote.updatedAt).getTime()) : null;
      const { status, reason } = buildDiagnosticsStatus({
        canonicalQuote,
        streamQuote,
        storedQuote,
        config,
        maxAgeMs,
      });
      const price = parseQuoteNumber(canonicalQuote?.price);
      const bid = parseQuoteNumber(canonicalQuote?.bid);
      const ask = parseQuoteNumber(canonicalQuote?.ask);

      return {
        symbol,
        provider: config.provider || null,
        dataSymbol: config.dataSymbol || null,
        quoteSymbol: config.quoteSymbol || null,
        tradingViewSymbol: config.tradingViewSymbol || null,
        status,
        reason,
        source: canonicalQuote?.source || storedQuote?.source || streamQuote?.source || null,
        refreshRequested: refresh,
        preferChartAligned,
        freshness: {
          maxAgeMs,
          ageMs,
          isFresh: canonicalQuote ? isQuoteFresh(canonicalQuote, maxAgeMs) : false,
          hasStreamQuote: Boolean(streamQuote?.price),
          hasStoredQuote: Boolean(storedQuote?.price),
        },
        quote: {
          price,
          bid,
          ask,
          spread: Number.isFinite(bid) && Number.isFinite(ask) ? Math.abs(ask - bid) : parseQuoteNumber(config.spread),
          updatedAt: canonicalQuote?.updatedAt || storedQuote?.updatedAt || streamQuote?.updatedAt || null,
          hasBidAsk: Number.isFinite(bid) && Number.isFinite(ask),
          isSyntheticBidAsk: (!Number.isFinite(bid) || !Number.isFinite(ask)) ? false : !(streamQuote?.bid || storedQuote?.bid),
        },
      };
    });

    const summary = diagnostics.reduce((acc, item) => {
      acc.total += 1;
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {
      total: 0,
      live: 0,
      snapshot: 0,
      fallback: 0,
      stale: 0,
      missing: 0,
    });

    return res.status(200).json({
      success: true,
      data: diagnostics,
      summary,
      asOf: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[MarketProxy] Diagnostics fetch failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to build market diagnostics',
    });
  }
};
