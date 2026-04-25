// backend/src/models/Position.js
const db = require('../config/database');
const { isMissingColumnError, getMissingColumnName } = require('../utils/dbCompat');

class Position {
    static async findByUserId(userId, limit = 50) {
        try {
            const query = 'SELECT * FROM positions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2';
            const { rows } = await db.query(query, [userId, limit]);
            return rows;
        } catch (error) {
            if (isMissingColumnError(error) && getMissingColumnName(error) === 'created_at') {
                const legacyQuery = 'SELECT * FROM positions WHERE user_id = $1 ORDER BY opened_at DESC LIMIT $2';
                const { rows } = await db.query(legacyQuery, [userId, limit]);
                return rows;
            }
            throw error;
        }
    }

    static async findByAccountId(accountId, status = 'open') {
        try {
            let query = 'SELECT * FROM positions WHERE account_id = $1';
            const values = [accountId];

            if (status) {
                query += ' AND status = $2';
                values.push(status);
            }

            query += ' ORDER BY created_at DESC';
            const { rows } = await db.query(query, values);
            return rows;
        } catch (error) {
            if (isMissingColumnError(error) && getMissingColumnName(error) === 'created_at') {
                let legacyQuery = 'SELECT * FROM positions WHERE account_id = $1';
                const legacyValues = [accountId];

                if (status) {
                    legacyQuery += ' AND status = $2';
                    legacyValues.push(status);
                }

                legacyQuery += ' ORDER BY opened_at DESC';
                const { rows } = await db.query(legacyQuery, legacyValues);
                return rows;
            }
            throw error;
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM positions WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async create(userId, positionData) {
        const { accountId, symbol, side, amount, quantity, entryPrice, margin } = positionData;
        
        const query = `
            INSERT INTO positions (user_id, account_id, symbol, side, amount, quantity, entry_price, current_price, margin, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'open')
            RETURNING *
        `;
        const values = [userId, accountId, symbol, side, amount, quantity, entryPrice, entryPrice, margin];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async close(id, closePrice, pnl) {
        const query = `
            UPDATE positions 
            SET status = 'closed', 
                close_price = $1, 
                pnl = $2, 
                closed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING *
        `;
        const { rows } = await db.query(query, [closePrice, pnl, id]);
        return rows[0];
    }

    static async updatePrices(updates) {
        // updates = [{id, current_price, pnl}]
        // This could be a bulk update in a real system, for now we'll do it individually if needed
    }
}

module.exports = Position;
