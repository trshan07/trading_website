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
            ORDER BY id DESC
        `;
        const { rows } = await db.query(query, [userId, accountId]);
        return rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM positions WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async close(tradeId, exitPrice, pnl) {
        const query = `
            UPDATE positions 
            SET close_price = $1, pnl = $2, status = 'closed', updated_at = CURRENT_TIMESTAMP
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

    static async findAll(statusFilter = null) {
        let query = `
            SELECT p.id, p.user_id, p.account_id, p.symbol, p.side, 
                   p.amount as usd_amount, p.quantity as amount, 
                   p.entry_price, p.close_price as exit_price, p.pnl, 
                   p.status, p.created_at, p.updated_at,
                   u.email as user_email, u.first_name, u.last_name,
                   a.account_number
            FROM positions p
            JOIN users u ON p.user_id = u.id
            JOIN accounts a ON p.account_id = a.id
        `;
        const values = [];
        if (statusFilter && statusFilter !== 'all') {
            query += ' WHERE p.status = $1';
            values.push(statusFilter);
        }
        query += ' ORDER BY p.created_at DESC';
        const { rows } = await db.query(query, values);
        return rows;
    }

    static async cancel(tradeId) {
        const query = `
            UPDATE positions
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND status = 'open'
            RETURNING *
        `;
        const { rows } = await db.query(query, [tradeId]);
        return rows[0];
    }
}

module.exports = Trade;
