const db = require('../config/database');
const { isMissingRelationError, isMissingColumnError } = require('../utils/dbCompat');
const {
    normalizeSymbol,
    fetchMarketQuotes,
    fetchChartAlignedMarketQuotes,
} = require('./marketDataService');

const DEFAULT_MAX_AGE_MS = Number.parseInt(process.env.MARKET_QUOTE_MAX_AGE_MS ?? '2000', 10) || 2000;

const toNullableNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toTimestamp = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim()) {
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
};

const normalizeQuotePayload = (quote = {}, symbol = '') => {
    const normalized = normalizeSymbol(symbol);
    if (!normalized) {
        return null;
    }

    const price = toNullableNumber(quote.price);
    if (!Number.isFinite(price) || price <= 0) {
        return null;
    }

    return {
        symbol: normalized,
        price,
        bid: toNullableNumber(quote.bid),
        ask: toNullableNumber(quote.ask),
        change: toNullableNumber(quote.change) ?? 0,
        volume: quote.volume ?? null,
        updatedAt: toTimestamp(quote.updatedAt ?? quote.updated_at) ?? Date.now(),
        source: quote.source || 'canonical',
    };
};

const mergeQuotes = (...sources) => sources.reduce((acc, source) => {
    Object.entries(source || {}).forEach(([symbol, quote]) => {
        const normalized = normalizeQuotePayload(quote, symbol);
        if (normalized) {
            acc[normalized.symbol] = normalized;
        }
    });
    return acc;
}, {});

const isQuoteFresh = (quote = {}, maxAgeMs = DEFAULT_MAX_AGE_MS) => {
    const updatedAt = toTimestamp(quote.updatedAt ?? quote.updated_at);
    if (!updatedAt) {
        return false;
    }

    return (Date.now() - updatedAt) <= maxAgeMs;
};

const readStoredQuotes = async (symbols = []) => {
    const normalizedSymbols = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
    if (normalizedSymbols.length === 0) {
        return {};
    }

    try {
        const { rows } = await db.query(
            `
            SELECT symbol, price, bid, ask, change, volume, source, updated_at
            FROM market_quotes
            WHERE symbol = ANY($1::varchar[])
            `,
            [normalizedSymbols]
        );

        return rows.reduce((acc, row) => {
            const normalized = normalizeQuotePayload({
                price: row.price,
                bid: row.bid,
                ask: row.ask,
                change: row.change,
                volume: row.volume,
                source: row.source || 'db-snapshot',
                updatedAt: row.updated_at,
            }, row.symbol);
            if (normalized) {
                acc[normalized.symbol] = normalized;
            }
            return acc;
        }, {});
    } catch (error) {
        if (isMissingRelationError(error) || isMissingColumnError(error)) {
            return {};
        }
        throw error;
    }
};

const writeQuotes = async (quotes = {}) => {
    const entries = Object.entries(quotes)
        .map(([symbol, quote]) => normalizeQuotePayload(quote, symbol))
        .filter(Boolean);

    if (entries.length === 0) {
        return;
    }

    try {
        const values = [];
        const rowsSql = entries.map((entry, index) => {
            const offset = index * 7;
            values.push(
                entry.symbol,
                entry.price,
                entry.bid,
                entry.ask,
                entry.change,
                entry.volume,
                entry.source
            );
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
        });

        await db.query(
            `
            INSERT INTO market_quotes (
                symbol, price, bid, ask, change, volume, source, created_at, updated_at
            )
            VALUES ${rowsSql.join(', ')}
            ON CONFLICT (symbol) DO UPDATE
            SET price = EXCLUDED.price,
                bid = EXCLUDED.bid,
                ask = EXCLUDED.ask,
                change = EXCLUDED.change,
                volume = EXCLUDED.volume,
                source = EXCLUDED.source,
                updated_at = CURRENT_TIMESTAMP
            `,
            values
        );
    } catch (error) {
        if (isMissingRelationError(error) || isMissingColumnError(error)) {
            return;
        }
        throw error;
    }
};

const refreshQuotesFromProviders = async (symbols = [], { preferChartAligned = false } = {}) => {
    const normalizedSymbols = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
    if (normalizedSymbols.length === 0) {
        return {};
    }

    const providerQuotes = preferChartAligned
        ? await fetchChartAlignedMarketQuotes(normalizedSymbols)
        : await fetchMarketQuotes(normalizedSymbols);
    const normalizedQuotes = mergeQuotes(providerQuotes);
    await writeQuotes(normalizedQuotes);
    return normalizedQuotes;
};

const getCanonicalMarketQuotes = async (
    symbols = [],
    { preferChartAligned = false, refresh = true, maxAgeMs = DEFAULT_MAX_AGE_MS } = {}
) => {
    const normalizedSymbols = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
    if (normalizedSymbols.length === 0) {
        return {};
    }

    const storedQuotes = await readStoredQuotes(normalizedSymbols);
    const missingOrStale = normalizedSymbols.filter((symbol) => !isQuoteFresh(storedQuotes[symbol], maxAgeMs));

    let refreshedQuotes = {};
    if (refresh && missingOrStale.length > 0) {
        refreshedQuotes = await refreshQuotesFromProviders(missingOrStale, { preferChartAligned }).catch(() => ({}));
    }

    const merged = mergeQuotes(storedQuotes, refreshedQuotes);
    return normalizedSymbols.reduce((acc, symbol) => {
        if (merged[symbol]) {
            acc[symbol] = merged[symbol];
        }
        return acc;
    }, {});
};

const getCanonicalQuote = async (symbol = '', options = {}) => {
    const normalized = normalizeSymbol(symbol);
    if (!normalized) {
        return null;
    }

    const quotes = await getCanonicalMarketQuotes([normalized], options);
    return quotes[normalized] || null;
};

module.exports = {
    DEFAULT_MAX_AGE_MS,
    getCanonicalMarketQuotes,
    getCanonicalQuote,
    refreshQuotesFromProviders,
    readStoredQuotes,
    writeQuotes,
    isQuoteFresh,
};
