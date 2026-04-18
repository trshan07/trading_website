const pool = require('../../config/database');

// Get all instruments and their categories
exports.getAllInstruments = async (req, res) => {
    try {
        const result = await pool.query(`
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

        // Transform into a format compatible with the frontend
        const instruments = result.rows.map(row => ({
            symbol: row.symbol,
            name: row.name,
            category: row.category_name,
            price: parseFloat(row.default_price),
            change: parseFloat(row.default_change),
            volume: row.default_volume,
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
        const result = await pool.query('SELECT name FROM instrument_categories ORDER BY name');
        const categories = result.rows.map(row => row.name);
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};
