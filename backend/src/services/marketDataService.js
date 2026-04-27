const axios = require('axios');
const db = require('../config/database');
const marketSymbolMap = require('../config/marketSymbolMap.json');
const { isMissingColumnError, isMissingRelationError } = require('../utils/dbCompat');

const BINANCE_QUOTES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH'];
const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];
const DEFAULT_DEPTH_LEVELS = 15;
const INSTRUMENT_CONFIG_CACHE_MS = 60 * 1000;

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

const isBinanceSymbol = (symbol = '') => BINANCE_QUOTES.some((quote) => symbol.endsWith(quote));

const toNullableNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const mapInstrumentConfigRow = (row = {}) => ({
    symbol: normalizeSymbol(row.symbol),
    provider: row.provider || null,
    quoteSymbol: row.quote_symbol || null,
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
        const { rows } = await db.query(`
            SELECT
                symbol,
                provider,
                quote_symbol,
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
        `);

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
        provider: dbConfig.provider || staticConfig.provider || null,
        quoteSymbol: dbConfig.quoteSymbol || staticConfig.quote || null,
        tradingViewSymbol: dbConfig.tradingViewSymbol || staticConfig.tradingView || null,
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

const fetchBinanceQuotes = async (requests = []) => {
    if (requests.length === 0) {
        return {};
    }

    const symbolMap = Object.fromEntries(
        requests.map((request) => [normalizeSymbol(request.quoteSymbol || request.symbol), normalizeSymbol(request.symbol)])
    );
    const providerSymbols = Object.keys(symbolMap);

    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr', {
        params: {
            symbols: JSON.stringify(providerSymbols),
        },
        timeout: 5000,
    });

    return (response.data || []).reduce((acc, ticker) => {
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
            source: 'binance',
        };
        return acc;
    }, {});
};

const fetchYahooBatchQuotes = async (requests = []) => {
    if (requests.length === 0) {
        return {};
    }

    const yahooSymbols = requests.map((request) => resolveYahooSymbol(request.symbol, request.config));
    const response = await axios.get('https://query1.finance.yahoo.com/v7/finance/quote', {
        params: {
            symbols: yahooSymbols.join(','),
        },
        timeout: 5000,
    });

    const rawResults = response.data?.quoteResponse?.result || [];
    const symbolByYahoo = Object.fromEntries(
        requests.map((request) => [resolveYahooSymbol(request.symbol, request.config), normalizeSymbol(request.symbol)])
    );

    return rawResults.reduce((acc, item) => {
        const originalSymbol = symbolByYahoo[item?.symbol];
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
    const binanceRequests = instrumentConfigs.filter(({ symbol, config }) => {
        if (config.provider) {
            return config.provider === 'binance';
        }
        return isBinanceSymbol(normalizeSymbol(config.quoteSymbol || symbol));
    });
    const yahooRequests = instrumentConfigs.filter(({ symbol, config }) => {
        if (config.provider) {
            return config.provider !== 'binance';
        }
        return !isBinanceSymbol(normalizeSymbol(config.quoteSymbol || symbol));
    });

    const [binanceData, yahooData] = await Promise.all([
        fetchBinanceQuotes(binanceRequests).catch(() => ({})),
        fetchYahooQuotes(yahooRequests).catch(() => ({})),
    ]);

    return {
        ...yahooData,
        ...binanceData,
    };
};

const fetchOrderBook = async (symbol, levels = DEFAULT_DEPTH_LEVELS) => {
    const normalized = normalizeSymbol(symbol);
    if (!normalized) {
        return { symbol: normalized, bids: [], asks: [], synthetic: true };
    }

    const config = await getMergedInstrumentConfig(normalized);
    const quoteSymbol = normalizeSymbol(config.quoteSymbol || normalized);
    const provider = config.provider || (isBinanceSymbol(quoteSymbol) ? 'binance' : 'yahoo');

    if (provider === 'binance' && isBinanceSymbol(quoteSymbol)) {
        try {
            const response = await axios.get('https://api.binance.com/api/v3/depth', {
                params: {
                    symbol: quoteSymbol,
                    limit: Math.min(Math.max(levels, 5), 100),
                },
                timeout: 5000,
            });

            const bids = (response.data?.bids || []).map(([price, size]) => ({
                price: Number(price),
                size: Number(size),
            }));
            const asks = (response.data?.asks || []).map(([price, size]) => ({
                price: Number(price),
                size: Number(size),
            }));

            return {
                symbol: normalized,
                bids,
                asks,
                synthetic: false,
                source: 'binance',
            };
        } catch (error) {
            // fall through to synthetic depth
        }
    }

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
    isBinanceSymbol,
    resolveYahooSymbol,
    fetchMarketQuotes,
    fetchOrderBook,
    getMarkPriceForSide,
    getExecutionPriceForSide,
    createSyntheticDepth,
    getMergedInstrumentConfig,
};
