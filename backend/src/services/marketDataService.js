const axios = require('axios');
const marketSymbolMap = require('../config/marketSymbolMap.json');

const BINANCE_QUOTES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH'];
const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];
const DEFAULT_DEPTH_LEVELS = 15;

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

const fetchYahooBatchQuotes = async (symbols = []) => {
    if (symbols.length === 0) {
        return {};
    }

    const yahooSymbols = symbols.map(resolveYahooSymbol);
    const response = await axios.get('https://query1.finance.yahoo.com/v7/finance/quote', {
        params: {
            symbols: yahooSymbols.join(','),
        },
        timeout: 5000,
    });

    const rawResults = response.data?.quoteResponse?.result || [];
    const symbolByYahoo = Object.fromEntries(
        symbols.map((symbol) => [resolveYahooSymbol(symbol), symbol])
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

        const mapping = marketSymbolMap[originalSymbol] || {};
        const allowBidAsk = mapping.useBidAsk !== false;

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

const fetchYahooQuotes = async (symbols = []) => {
    if (symbols.length === 0) {
        return {};
    }

    const batchQuotes = await fetchYahooBatchQuotes(symbols).catch(() => ({}));
    const unresolved = symbols.filter((symbol) => !batchQuotes[symbol]?.price);

    if (unresolved.length === 0) {
        return batchQuotes;
    }

    const results = await Promise.all(unresolved.map(async (symbol) => {
        const yahooSymbol = resolveYahooSymbol(symbol);

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
                return [symbol, null];
            }

            const latestClose = validCloses[validCloses.length - 1];
            const previousClose = validCloses.length > 1 ? validCloses[validCloses.length - 2] : latestClose;
            const latestVolumeRaw = Number.parseFloat(volumes[volumes.length - 1]);
            const latestVolume = Number.isFinite(latestVolumeRaw) ? latestVolumeRaw : null;
            const change = previousClose
                ? ((latestClose - previousClose) / previousClose) * 100
                : 0;

            return [symbol, {
                price: latestClose,
                bid: null,
                ask: null,
                change,
                volume: latestVolume,
                source: 'yahoo-chart',
            }];
        } catch (error) {
            return [symbol, null];
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

    const binanceSymbols = requestedSymbols.filter(isBinanceSymbol);
    const yahooSymbols = requestedSymbols.filter((symbol) => !isBinanceSymbol(symbol));

    const [binanceData, yahooData] = await Promise.all([
        fetchBinanceQuotes(binanceSymbols).catch(() => ({})),
        fetchYahooQuotes(yahooSymbols).catch(() => ({})),
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

    if (isBinanceSymbol(normalized)) {
        try {
            const response = await axios.get('https://api.binance.com/api/v3/depth', {
                params: {
                    symbol: normalized,
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
};
