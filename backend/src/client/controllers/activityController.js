const pool = require('../../config/database');
const { isMissingRelationError, isMissingColumnError, getMissingColumnName } = require('../../utils/dbCompat');

// Activity Controller Logic
exports.getActivityLogs = async (req, res) => {
    try {
        let result;

        try {
            result = await pool.query(
                'SELECT id, user_id, action, label, created_at FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
                [req.user.id]
            );
        } catch (error) {
            if (!isMissingColumnError(error)) {
                throw error;
            }

            const missingColumn = getMissingColumnName(error);
            if (missingColumn === 'label') {
                result = await pool.query(
                    'SELECT id, user_id, action, details AS label, created_at FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
                    [req.user.id]
                );
            } else {
                throw error;
            }
        }

        const data = result.rows.map((row) => ({
            ...row,
            type: row.action,
            message: row.label || row.details || '',
        }));

        res.json({ success: true, data });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.json({ success: true, data: [] });
        }
        console.error('Fetch Activity Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Internal utility to create log
exports.createActivityLog = async (userId, action, label) => {
    try {
        try {
            await pool.query(
                'INSERT INTO activity_logs (user_id, action, label) VALUES ($1, $2, $3)',
                [userId, action, label]
            );
        } catch (error) {
            if (isMissingRelationError(error)) {
                return;
            }

            if (!isMissingColumnError(error)) {
                throw error;
            }

            const missingColumn = getMissingColumnName(error);
            if (missingColumn === 'label') {
                await pool.query(
                    'INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)',
                    [userId, action, label]
                );
                return;
            }

            throw error;
        }
    } catch (error) {
        console.error('Create Activity Log Error:', error);
    }
};

// --- Favorites Controller Section (usually separate but keeping logic here for speed) ---

exports.getFavorites = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT symbol FROM user_favorites WHERE user_id = $1',
            [req.user.id]
        );
        const symbols = result.rows.map(row => row.symbol);
        res.json({ success: true, data: symbols });
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.json({ success: true, data: [] });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const { symbol } = req.body;
        
        // Check if exists
        const check = await pool.query(
            'SELECT * FROM user_favorites WHERE user_id = $1 AND symbol = $2',
            [req.user.id, symbol]
        );

        if (check.rows.length > 0) {
            // Remove
            await pool.query(
                'DELETE FROM user_favorites WHERE user_id = $1 AND symbol = $2',
                [req.user.id, symbol]
            );
            return res.json({ success: true, action: 'removed', symbol });
        } else {
            // Add
            await pool.query(
                'INSERT INTO user_favorites (user_id, symbol) VALUES ($1, $2)',
                [req.user.id, symbol]
            );
            return res.json({ success: true, action: 'added', symbol });
        }
    } catch (error) {
        if (isMissingRelationError(error)) {
            return res.status(503).json({ success: false, message: 'Favorites are unavailable until database migrations are applied' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
