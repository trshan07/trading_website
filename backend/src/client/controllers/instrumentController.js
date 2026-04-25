const pool = require('../../config/database');
const { isMissingRelationError, isMissingColumnError, getMissingColumnName } = require('../../utils/dbCompat');

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
            } else if (!isMissingRelationError(error)) {
                throw error;
            } else {
                result = await pool.query(`
                    SELECT 
                        i.*,
                        NULL AS text_color,
                        NULL AS bg_color,
                        NULL AS border_color
                    FROM instruments i
                    WHERE i.is_active = TRUE
                    ORDER BY i.symbol
                `);
            }
        }

        // Transform into a format compatible with the frontend
        const instruments = result.rows.map(row => ({
            symbol: row.symbol,
            name: row.name,
            category: row.category_name || row.category || row.type || 'General',
            price: parseFloat(row.default_price ?? row.price ?? 0),
            change: parseFloat(row.default_change ?? row.change ?? 0),
            volume: row.default_volume ?? row.volume ?? null,
            colors: {
                text: row.text_color,
                bg: row.bg_color,
                border: row.border_color
            }
        }));

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
                const fallback = await pool.query(`
                    SELECT DISTINCT category_name AS name
                    FROM instruments
                    WHERE category_name IS NOT NULL AND is_active = TRUE
                    ORDER BY category_name
                `);
                categories = fallback.rows.map(row => row.name);
            }
        }
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};
