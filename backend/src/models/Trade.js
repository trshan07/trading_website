// backend/src/models/Trade.js
const db = require('../config/database');

class Trade {
    static async create(tradeData) {
        const { userId, accountId, symbol, side, type, amount, entryPrice } = tradeData;
        const query = `
            INSERT INTO trades (user_id, account_id, symbol, side, type, amount, entry_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'open')
            RETURNING *
        `;
        const values = [userId, accountId, symbol, side, type, amount, entryPrice];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findActiveByUserId(userId, accountId) {
        const query = `
            SELECT * FROM trades 
            WHERE user_id = $1 AND account_id = $2 AND status = 'open'
            ORDER BY created_at DESC
        `;
        const { rows } = await db.query(query, [userId, accountId]);
        return rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM trades WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async close(tradeId, exitPrice, pnl) {
        const query = `
            UPDATE trades 
            SET exit_price = $1, pnl = $2, status = 'closed', updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING *
        `;
        const { rows } = await db.query(query, [exitPrice, pnl, tradeId]);
        return rows[0];
    }

    static async getHistory(userId, accountId) {
        const query = `
            SELECT * FROM trades 
            WHERE user_id = $1 AND account_id = $2 AND status = 'closed'
            ORDER BY updated_at DESC
        `;
        const { rows } = await db.query(query, [userId, accountId]);
        return rows;
    }
}

module.exports = Trade;
