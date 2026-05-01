const pool = require('../../config/database');
const { isMissingRelationError, isMissingColumnError, getMissingColumnName } = require('../../utils/dbCompat');
const marketSymbolMap = require('../../config/marketSymbolMap.json');

const mapInstrumentRow = (row) => ({
    symbol: row.symbol,
    name: row.name,
    category: row.category_name || row.category || row.type || 'General',
    price: parseFloat(row.default_price ?? row.price ?? 0),
    change: parseFloat(row.default_change ?? row.change ?? 0),
    volume: row.default_volume ?? row.volume ?? null,
    provider: marketSymbolMap[row.symbol]?.provider || row.provider || null,
    quoteSymbol: marketSymbolMap[row.symbol]?.quote || row.quote_symbol || null,
    dataSymbol: marketSymbolMap[row.symbol]?.dataSymbol || row.data_symbol || null,
    tradingViewSymbol: marketSymbolMap[row.symbol]?.tradingView || row.trading_view_symbol || null,
    useBidAsk: typeof row.use_bid_ask === 'boolean'
        ? row.use_bid_ask
        : (typeof marketSymbolMap[row.symbol]?.useBidAsk === 'boolean' ? marketSymbolMap[row.symbol].useBidAsk : null),
    precision: Number.isInteger(row.price_precision)
        ? row.price_precision
        : (Number.isInteger(marketSymbolMap[row.symbol]?.precision) ? marketSymbolMap[row.symbol].precision : null),
    spread: Number.parseFloat(row.spread ?? marketSymbolMap[row.symbol]?.spread ?? 0) || null,
    contractSize: Number.parseFloat(row.contract_size ?? marketSymbolMap[row.symbol]?.contractSize ?? 0) || null,
    lotStep: Number.parseFloat(row.lot_step ?? marketSymbolMap[row.symbol]?.lotStep ?? 0) || null,
    minLot: Number.parseFloat(row.min_lot ?? marketSymbolMap[row.symbol]?.minLot ?? 0) || null,
    quantityLabel: row.quantity_label || marketSymbolMap[row.symbol]?.quantityLabel || null,
    colors: {
        text: row.text_color,
        bg: row.bg_color,
        border: row.border_color,
    },
});

// Get all instruments and their categories
exports.getAllInstruments = async (req, res) => {
    try {
        let result;
        try {
            result = await pool.query(`
                SELECT 
                    i.*, 
                    c.text_color, 
                    c.bg_color, 
                    c.border_color
                FROM instruments i
                LEFT JOIN instrument_categories c ON i.category_name = c.name
                WHERE i.is_active = TRUE
                ORDER BY i.category_name, i.symbol
            `);
        } catch (error) {
            if (isMissingColumnError(error) && getMissingColumnName(error) === 'category_name') {
                try {
                    result = await pool.query(`
                        SELECT 
                            i.*,
                            c.text_color,
                            c.bg_color,
                            c.border_color
                        FROM instruments i
                        LEFT JOIN instrument_categories c ON i.category = c.name
                        WHERE i.is_active = TRUE
                        ORDER BY i.category, i.symbol
                    `);
                } catch (legacyError) {
                    if (!isMissingRelationError(legacyError)) {
                        throw legacyError;
                    }
                    result = await pool.query(`
                        SELECT 
                            i.*,
                            NULL AS text_color,
                            NULL AS bg_color,
                            NULL AS border_color
                        FROM instruments i
                        WHERE i.is_active = TRUE
                        ORDER BY COALESCE(i.category, i.type, i.symbol), i.symbol
                    `);
                }
            } else if (!isMissingRelationError(error)) {
                throw error;
            } else {
                try {
                    result = await pool.query(`
                        SELECT 
                            i.*,
                            NULL AS text_color,
                            NULL AS bg_color,
                            NULL AS border_color
                        FROM instruments i
                        WHERE i.is_active = TRUE
                        ORDER BY i.category_name, i.symbol
                    `);
                } catch (legacyError) {
                    if (!(isMissingColumnError(legacyError) && getMissingColumnName(legacyError) === 'category_name')) {
                        throw legacyError;
                    }
                    result = await pool.query(`
                        SELECT 
                            i.*,
                            NULL AS text_color,
                            NULL AS bg_color,
                            NULL AS border_color
                        FROM instruments i
                        WHERE i.is_active = TRUE
                        ORDER BY COALESCE(i.category, i.type, i.symbol), i.symbol
                    `);
                }
            }
        }

        const instruments = result.rows.map(mapInstrumentRow);

        res.json({ success: true, data: instruments });
    } catch (error) {
        console.error('Fetch Instruments Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch instruments' });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        let categories = [];
        try {
            const result = await pool.query('SELECT name FROM instrument_categories ORDER BY name');
            categories = result.rows.map(row => row.name);
        } catch (error) {
            if (isMissingColumnError(error) && getMissingColumnName(error) === 'category_name') {
                const legacy = await pool.query(`
                    SELECT DISTINCT category AS name
                    FROM instruments
                    WHERE category IS NOT NULL AND is_active = TRUE
                    ORDER BY category
                `);
                categories = legacy.rows.map(row => row.name);
            } else if (!isMissingRelationError(error)) {
                throw error;
            } else {
                try {
                    const fallback = await pool.query(`
                        SELECT DISTINCT category_name AS name
                        FROM instruments
                        WHERE category_name IS NOT NULL AND is_active = TRUE
                        ORDER BY category_name
                    `);
                    categories = fallback.rows.map(row => row.name);
                } catch (legacyError) {
                    if (!(isMissingColumnError(legacyError) && getMissingColumnName(legacyError) === 'category_name')) {
                        throw legacyError;
                    }
                    const legacy = await pool.query(`
                        SELECT DISTINCT category AS name
                        FROM instruments
                        WHERE category IS NOT NULL AND is_active = TRUE
                        ORDER BY category
                    `);
                    categories = legacy.rows.map(row => row.name);
                }
            }
        }
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};
