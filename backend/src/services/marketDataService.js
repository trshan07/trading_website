const axios = require('axios');
const db = require('../config/database');
const marketSymbolMap = require('../config/marketSymbolMap.json');
const { isMissingColumnError, isMissingRelationError } = require('../utils/dbCompat');

const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];
const DEFAULT_DEPTH_LEVELS = 15;
const INSTRUMENT_CONFIG_CACHE_MS = 60 * 1000;
const TWELVE_DATA_API_BASE = 'https://api.twelvedata.com';
const TWELVE_DATA_INTERVAL_MAP = {
    '1m': '1min',
    '5m': '5min',
    '15m': '15min',
    '1h': '1h',
    '4h': '4h',
    '1d': '1day',
    '1w': '1week',
};

let instrumentConfigCache = {
    expiresAt: 0,
    data: new Map(),
};

const normalizeSymbol = (symbol = '') => symbol.toUpperCase().replace(/[^A-Z0-9!]/g, '');

const parseQuoteNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const isForexPair = (symbol = '') => {
    if (symbol.length !== 6) {
        return false;
    }

    const base = symbol.slice(0, 3);
    const quote = symbol.slice(3, 6);
    return FOREX_CODES.includes(base) && FOREX_CODES.includes(quote);
};

const toNullableNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const mapInstrumentConfigRow = (row = {}) => ({
    symbol: normalizeSymbol(row.symbol),
    provider: row.provider || null,
    quoteSymbol: row.quote_symbol || null,
    dataSymbol: row.data_symbol || null,
    tradingViewSymbol: row.trading_view_symbol || null,
    useBidAsk: typeof row.use_bid_ask === 'boolean' ? row.use_bid_ask : null,
    precision: Number.isInteger(row.price_precision) ? row.price_precision : null,
    spread: toNullableNumber(row.spread),
    contractSize: toNullableNumber(row.contract_size),
    lotStep: toNullableNumber(row.lot_step),
    minLot: toNullableNumber(row.min_lot),
    quantityLabel: row.quantity_label || null,
    category: row.category_name || row.category || null,
    defaultPrice: toNullableNumber(row.default_price),
    defaultChange: toNullableNumber(row.default_change),
    defaultVolume: row.default_volume || null,
});

const getCachedInstrumentConfigs = async () => {
    const now = Date.now();
    if (instrumentConfigCache.expiresAt > now && instrumentConfigCache.data.size > 0) {
        return instrumentConfigCache.data;
    }

    try {
        let rows;
        try {
            ({ rows } = await db.query(`
                SELECT
                    symbol,
                    provider,
                    quote_symbol,
                    data_symbol,
                    trading_view_symbol,
                    use_bid_ask,
                    price_precision,
                    spread,
                    contract_size,
                    lot_step,
                    min_lot,
                    quantity_label,
                    category_name,
                    default_price,
                    default_change,
                    default_volume
                FROM instruments
                WHERE is_active = TRUE
            `));
        } catch (error) {
            if (!(isMissingColumnError(error) && error?.message?.includes('data_symbol'))) {
                throw error;
            }

            ({ rows } = await db.query(`
                SELECT
                    symbol,
                    provider,
                    quote_symbol,
                    NULL::text AS data_symbol,
                    trading_view_symbol,
                    use_bid_ask,
                    price_precision,
                    spread,
                    contract_size,
                    lot_step,
                    min_lot,
                    quantity_label,
                    category_name,
                    default_price,
                    default_change,
                    default_volume
                FROM instruments
                WHERE is_active = TRUE
            `));
        }

        instrumentConfigCache = {
            expiresAt: now + INSTRUMENT_CONFIG_CACHE_MS,
            data: new Map(rows.map((row) => {
                const mapped = mapInstrumentConfigRow(row);
                return [mapped.symbol, mapped];
            })),
        };
    } catch (error) {
        if (!isMissingRelationError(error) && !isMissingColumnError(error)) {
            throw error;
        }

        instrumentConfigCache = {
            expiresAt: now + INSTRUMENT_CONFIG_CACHE_MS,
            data: new Map(),
        };
    }

    return instrumentConfigCache.data;
};

const getMergedInstrumentConfig = async (symbol = '') => {
    const normalized = normalizeSymbol(symbol);
    const staticConfig = marketSymbolMap[normalized] || {};
    const cachedConfigs = await getCachedInstrumentConfigs();
    const dbConfig = cachedConfigs.get(normalized) || {};

    return {
        symbol: normalized,
        provider: staticConfig.provider || dbConfig.provider || null,
        quoteSymbol: staticConfig.quote || dbConfig.quoteSymbol || null,
        dataSymbol: staticConfig.dataSymbol || dbConfig.dataSymbol || null,
        tradingViewSymbol: staticConfig.tradingView || dbConfig.tradingViewSymbol || null,
        useBidAsk: typeof dbConfig.useBidAsk === 'boolean'
            ? dbConfig.useBidAsk
            : (typeof staticConfig.useBidAsk === 'boolean' ? staticConfig.useBidAsk : null),
        precision: Number.isInteger(dbConfig.precision)
            ? dbConfig.precision
            : (Number.isInteger(staticConfig.precision) ? staticConfig.precision : null),
        spread: dbConfig.spread ?? toNullableNumber(staticConfig.spread),
        contractSize: dbConfig.contractSize ?? toNullableNumber(staticConfig.contractSize),
        lotStep: dbConfig.lotStep ?? toNullableNumber(staticConfig.lotStep),
        minLot: dbConfig.minLot ?? toNullableNumber(staticConfig.minLot),
        quantityLabel: dbConfig.quantityLabel || staticConfig.quantityLabel || null,
        category: dbConfig.category || null,
        defaultPrice: dbConfig.defaultPrice ?? null,
        defaultChange: dbConfig.defaultChange ?? null,
        defaultVolume: dbConfig.defaultVolume ?? null,
    };
};

const resolveYahooSymbol = (symbol = '', config = {}) => {
    const normalized = normalizeSymbol(symbol);
    const explicitQuote = normalizeSymbol(config.quoteSymbol || '');

    if ((config.provider === 'yahoo' || explicitQuote) && config.quoteSymbol) {
        return config.quoteSymbol;
    }

    if (isForexPair(normalized)) {
        return `${normalized}=X`;
    }

    return normalized;
};

const hasTwelveDataApiKey = () => Boolean(process.env.TWELVEDATA_API_KEY);

const resolveTwelveDataSymbol = (symbol = '', config = {}) => {
    const explicitSymbol = String(
        config.dataSymbol
        || config.marketDataSymbol
        || config.streamSymbol
        || ''
    ).trim();
    if (explicitSymbol) {
        return explicitSymbol;
    }

    const normalized = normalizeSymbol(symbol);
    if (isForexPair(normalized)) {
        return `${normalized.slice(0, 3)}/${normalized.slice(3, 6)}`;
    }

    if (normalized === 'XAUUSD') {
        return 'XAU/USD';
    }

    if (normalized === 'XAGUSD') {
        return 'XAG/USD';
    }

    if (normalized.endsWith('USDT') && normalized.length > 4) {
        return `${normalized.slice(0, -4)}/USD`;
    }

    if (normalized.endsWith('USDC') && normalized.length > 4) {
        return `${normalized.slice(0, -4)}/USD`;
    }

    if (normalized.endsWith('BUSD') && normalized.length > 4) {
        return `${normalized.slice(0, -4)}/USD`;
    }

    if (!isForexPair(normalized) && normalized.endsWith('USD') && normalized.length > 6) {
        return `${normalized.slice(0, -3)}/USD`;
    }

    return normalized;
};

const createSyntheticDepth = ({ bid, ask, price, levels = DEFAULT_DEPTH_LEVELS }) => {
    const referencePrice = parseQuoteNumber(price) || parseQuoteNumber(ask) || parseQuoteNumber(bid) || 0;
    const bidPrice = parseQuoteNumber(bid) || referencePrice;
    const askPrice = parseQuoteNumber(ask) || referencePrice;
    const midpoint = referencePrice || ((bidPrice + askPrice) / 2) || 0;
    const spread = Math.max(Math.abs(askPrice - bidPrice), midpoint * 0.0004 || 0.01);
    const asks = [];
    const bids = [];

    for (let index = 0; index < levels; index += 1) {
        const step = spread * (index + 1);
        const sizeBase = Math.max(1, midpoint / 1000);
        const size = Number((sizeBase * (1 + (index * 0.075))).toFixed(6));

        asks.push({
            price: Number((askPrice || midpoint + step).toFixed(8)),
            size,
        });

        bids.push({
            price: Number((bidPrice || midpoint - step).toFixed(8)),
            size: Number((size * 0.98).toFixed(6)),
        });
    }

    return {
        asks,
        bids,
        synthetic: true,
    };
};

const fetchYahooBatchQuotes = async (requests = []) => {
    if (requests.length === 0) {
        return {};
    }

    const symbolsByYahoo = requests.reduce((acc, request) => {
        const yahooSymbol = resolveYahooSymbol(request.symbol, request.config);
        if (!acc[yahooSymbol]) {
            acc[yahooSymbol] = [];
        }
        acc[yahooSymbol].push(normalizeSymbol(request.symbol));
        return acc;
    }, {});
    const yahooSymbols = Object.keys(symbolsByYahoo);
    const response = await axios.get('https://query1.finance.yahoo.com/v7/finance/quote', {
        params: {
            symbols: yahooSymbols.join(','),
        },
        timeout: 5000,
    });

    const rawResults = response.data?.quoteResponse?.result || [];
    return rawResults.reduce((acc, item) => {
        const originalSymbols = symbolsByYahoo[item?.symbol] || [];
        if (originalSymbols.length === 0) {
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

        originalSymbols.forEach((originalSymbol) => {
            const matchingRequest = requests.find((request) => normalizeSymbol(request.symbol) === originalSymbol);
            const allowBidAsk = matchingRequest?.config?.useBidAsk !== false;

            acc[originalSymbol] = {
                price,
                bid: allowBidAsk ? parseQuoteNumber(item.bid) : null,
                ask: allowBidAsk ? parseQuoteNumber(item.ask) : null,
                change: parseQuoteNumber(item.regularMarketChangePercent) ?? 0,
                volume: parseQuoteNumber(item.regularMarketVolume),
                source: 'yahoo-quote',
            };
        });
        return acc;
    }, {});
};

const fetchYahooQuotes = async (requests = []) => {
    if (requests.length === 0) {
        return {};
    }

    const batchQuotes = await fetchYahooBatchQuotes(requests).catch(() => ({}));
    const unresolved = requests.filter((request) => !batchQuotes[normalizeSymbol(request.symbol)]?.price);

    if (unresolved.length === 0) {
        return batchQuotes;
    }

    const results = await Promise.all(unresolved.map(async (request) => {
        const normalizedSymbol = normalizeSymbol(request.symbol);
        const yahooSymbol = resolveYahooSymbol(normalizedSymbol, request.config);

        try {
            const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`, {
                params: {
                    interval: '1m',
                    range: '1d',
                    includePrePost: false,
                },
                timeout: 5000,
            });

            const chart = response.data?.chart?.result?.[0];
            const closes = chart?.indicators?.quote?.[0]?.close || [];
            const volumes = chart?.indicators?.quote?.[0]?.volume || [];
            const validCloses = closes
                .map((value) => Number.parseFloat(value))
                .filter((value) => Number.isFinite(value));

            if (validCloses.length === 0) {
                return [normalizedSymbol, null];
            }

            const latestClose = validCloses[validCloses.length - 1];
            const previousClose = validCloses.length > 1 ? validCloses[validCloses.length - 2] : latestClose;
            const latestVolumeRaw = Number.parseFloat(volumes[volumes.length - 1]);
            const latestVolume = Number.isFinite(latestVolumeRaw) ? latestVolumeRaw : null;
            const change = previousClose
                ? ((latestClose - previousClose) / previousClose) * 100
                : 0;

            return [normalizedSymbol, {
                price: latestClose,
                bid: null,
                ask: null,
                change,
                volume: latestVolume,
                source: 'yahoo-chart',
            }];
        } catch (error) {
            return [normalizedSymbol, null];
        }
    }));

    return {
        ...Object.fromEntries(results),
        ...batchQuotes,
    };
};

const normalizeTwelveDataQuotePayload = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return [];
    }

    if (Array.isArray(payload)) {
        return payload.filter((item) => item && typeof item === 'object');
    }

    if (payload.symbol || payload.price || payload.close) {
        return [payload];
    }

    if (Array.isArray(payload.data)) {
        return payload.data.filter((item) => item && typeof item === 'object');
    }

    return Object.entries(payload).reduce((acc, [key, value]) => {
        if (!value || typeof value !== 'object') {
            return acc;
        }

        if (['status', 'code', 'message', 'meta'].includes(key)) {
            return acc;
        }

        acc.push({
            symbol: value.symbol || key,
            ...value,
        });
        return acc;
    }, []);
};

const fetchTwelveDataQuotes = async (requests = []) => {
    if (requests.length === 0 || !hasTwelveDataApiKey()) {
        return {};
    }

    const symbolsByProvider = requests.reduce((acc, request) => {
        const providerSymbol = resolveTwelveDataSymbol(request.symbol, request.config);
        if (!acc[providerSymbol]) {
            acc[providerSymbol] = [];
        }
        acc[providerSymbol].push(normalizeSymbol(request.symbol));
        return acc;
    }, {});
    const params = {
        symbol: Object.keys(symbolsByProvider).join(','),
        apikey: process.env.TWELVEDATA_API_KEY,
        interval: '1min',
        prepost: true,
    };

    const response = await axios.get(`${TWELVE_DATA_API_BASE}/quote`, {
        params,
        timeout: 5000,
    });

    return normalizeTwelveDataQuotePayload(response.data).reduce((acc, item) => {
        const lookupKey = String(item.symbol || '').trim();
        const originalSymbols = symbolsByProvider[lookupKey] || symbolsByProvider[normalizeSymbol(lookupKey)] || [];
        if (originalSymbols.length === 0) {
            return acc;
        }

        const price = parseQuoteNumber(
            item.price
            ?? item.close
            ?? item.last
            ?? item.bid
            ?? item.ask
        );

        if (price === null) {
            return acc;
        }

        const timestamp = Number.parseInt(item.timestamp ?? item.time ?? 0, 10);
        originalSymbols.forEach((originalSymbol) => {
            acc[originalSymbol] = {
                price,
                bid: parseQuoteNumber(item.bid),
                ask: parseQuoteNumber(item.ask),
                change: parseQuoteNumber(item.percent_change ?? item.change_percent ?? item.change) ?? 0,
                volume: parseQuoteNumber(item.volume ?? item.day_volume),
                updatedAt: Number.isFinite(timestamp) && timestamp > 0 ? timestamp * 1000 : Date.now(),
                source: 'twelvedata',
            };
        });
        return acc;
    }, {});
};

const fetchTwelveDataHistory = async (symbol = '', interval = '15m', outputsize = 300, config = {}) => {
    if (!hasTwelveDataApiKey()) {
        throw new Error('Twelve Data API key not configured');
    }

    const response = await axios.get(`${TWELVE_DATA_API_BASE}/time_series`, {
        params: {
            symbol: resolveTwelveDataSymbol(symbol, config),
            interval: TWELVE_DATA_INTERVAL_MAP[interval] || '15min',
            outputsize,
            order: 'asc',
            dp: 8,
            prepost: true,
            apikey: process.env.TWELVEDATA_API_KEY,
        },
        timeout: 5000,
    });

    const values = response.data?.values || [];
    if (!Array.isArray(values) || values.length === 0) {
        throw new Error('Twelve Data history unavailable');
    }

    return values.reduce((acc, candle) => {
        const timeMs = Date.parse(candle.datetime);
        const open = parseQuoteNumber(candle.open);
        const high = parseQuoteNumber(candle.high);
        const low = parseQuoteNumber(candle.low);
        const close = parseQuoteNumber(candle.close);
        const volume = parseQuoteNumber(candle.volume) ?? 0;

        if (!Number.isFinite(timeMs) || [open, high, low, close].some((value) => value === null)) {
            return acc;
        }

        acc.push([
            timeMs,
            open.toString(),
            high.toString(),
            low.toString(),
            close.toString(),
            volume.toString(),
            timeMs,
            '0', '0', '0', '0', '0',
        ]);
        return acc;
    }, []);
};

const fetchMarketQuotes = async (symbols = []) => {
    const requestedSymbols = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
    if (requestedSymbols.length === 0) {
        return {};
    }

    const instrumentConfigs = await Promise.all(
        requestedSymbols.map(async (symbol) => ({
            symbol,
            config: await getMergedInstrumentConfig(symbol),
        }))
    );
    const twelveDataRequests = instrumentConfigs.filter(({ config }) => (
        config.provider === 'twelvedata' || hasTwelveDataApiKey()
    ));
    const legacyYahooRequests = instrumentConfigs.filter(({ config }) => (
        config.provider !== 'twelvedata' && !hasTwelveDataApiKey()
    ));

    const [twelveDataData, legacyYahooData] = await Promise.all([
        fetchTwelveDataQuotes(twelveDataRequests).catch(() => ({})),
        fetchYahooQuotes(legacyYahooRequests).catch(() => ({})),
    ]);
    const unresolvedTwelveDataRequests = twelveDataRequests.filter(
        ({ symbol }) => !twelveDataData[normalizeSymbol(symbol)]?.price
    );
    const yahooFallbackData = unresolvedTwelveDataRequests.length > 0
        ? await fetchYahooQuotes(unresolvedTwelveDataRequests).catch(() => ({}))
        : {};

    return {
        ...legacyYahooData,
        ...yahooFallbackData,
        ...twelveDataData,
    };
};

const fetchMarketHistoryCandles = async (symbol = '', interval = '15m', outputsize = 300) => {
    const normalized = normalizeSymbol(symbol);
    if (!normalized) {
        return [];
    }

    const config = await getMergedInstrumentConfig(normalized);
    const provider = config.provider || 'twelvedata';

    try {
        return await fetchTwelveDataHistory(normalized, interval, outputsize, config);
    } catch (error) {
        if (provider !== 'twelvedata') {
            throw error;
        }

        return fetchYahooHistory([{ symbol: normalized, config }], interval, outputsize);
    }
};

const fetchYahooHistory = async (requests = [], interval = '15m', outputsize = 300) => {
    if (requests.length === 0) {
        return [];
    }

    const [{ symbol, config = {} } = {}] = requests;
    const yahooSymbol = resolveYahooSymbol(symbol, config);
    const rangeMap = {
        '1m': '1d',
        '5m': '5d',
        '15m': '5d',
        '1h': '1mo',
        '4h': '3mo',
        '1d': '1y',
        '1w': '5y',
    };
    const intervalMap = {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '1h': '60m',
        '4h': '60m',
        '1d': '1d',
        '1w': '1wk',
    };

    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}`, {
        params: {
            interval: intervalMap[interval] || '15m',
            range: rangeMap[interval] || '5d',
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

    const candles = timestamps.reduce((acc, time, index) => {
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

    return candles.slice(-outputsize);
};

const fetchOrderBook = async (symbol, levels = DEFAULT_DEPTH_LEVELS) => {
    const normalized = normalizeSymbol(symbol);
    if (!normalized) {
        return { symbol: normalized, bids: [], asks: [], synthetic: true };
    }

    const config = await getMergedInstrumentConfig(normalized);
    const quotes = await fetchMarketQuotes([normalized]);
    const quote = quotes[normalized] || {};
    const depth = createSyntheticDepth({
        bid: quote.bid,
        ask: quote.ask,
        price: quote.price,
        levels,
    });

    return {
        symbol: normalized,
        ...depth,
        source: quote.source || 'synthetic',
    };
};

const getMarkPriceForSide = (quote = {}, side = 'buy') => {
    const normalizedSide = String(side).toLowerCase();
    if (normalizedSide === 'buy') {
        return parseQuoteNumber(quote.bid) ?? parseQuoteNumber(quote.price) ?? parseQuoteNumber(quote.ask) ?? 0;
    }

    return parseQuoteNumber(quote.ask) ?? parseQuoteNumber(quote.price) ?? parseQuoteNumber(quote.bid) ?? 0;
};

const getExecutionPriceForSide = (quote = {}, side = 'buy') => {
    const normalizedSide = String(side).toLowerCase();
    if (normalizedSide === 'buy') {
        return parseQuoteNumber(quote.ask) ?? parseQuoteNumber(quote.price) ?? parseQuoteNumber(quote.bid) ?? 0;
    }

    return parseQuoteNumber(quote.bid) ?? parseQuoteNumber(quote.price) ?? parseQuoteNumber(quote.ask) ?? 0;
};

module.exports = {
    normalizeSymbol,
    parseQuoteNumber,
    isForexPair,
    resolveYahooSymbol,
    resolveTwelveDataSymbol,
    fetchMarketQuotes,
    fetchMarketHistoryCandles,
    fetchOrderBook,
    getMarkPriceForSide,
    getExecutionPriceForSide,
    createSyntheticDepth,
    getMergedInstrumentConfig,
    hasTwelveDataApiKey,
};
