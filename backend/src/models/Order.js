// backend/src/models/Order.js
const db = require('../config/database');
const { isMissingRelationError, isMissingColumnError } = require('../utils/dbCompat');

class Order {
    static async findByUserId(userId, limit = 50) {
        try {
            const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2';
            const { rows } = await db.query(query, [userId, limit]);
            return rows;
        } catch (error) {
            if (isMissingRelationError(error)) {
                return [];
            }
            throw error;
        }
    }

    static async findByAccountId(accountId, status = 'pending') {
        try {
            let query = 'SELECT * FROM orders WHERE account_id = $1';
            const values = [accountId];
            
            if (status) {
                query += ' AND status = $2';
                values.push(status);
            }
            
            query += ' ORDER BY created_at DESC';
            const { rows } = await db.query(query, values);
            return rows;
        } catch (error) {
            if (isMissingRelationError(error)) {
                return [];
            }
            throw error;
        }
    }

    static async create(userId, orderData) {
        const {
            accountId,
            symbol,
            side,
            type,
            amount,
            quantity,
            entryPrice,
            leverage = null,
            takeProfit = null,
            stopLoss = null,
            status = 'pending'
        } = orderData;

        const query = `
            INSERT INTO orders (
                user_id, account_id, symbol, side, type, amount, quantity, entry_price,
                leverage, take_profit, stop_loss, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;
        const values = [userId, accountId, symbol, side, type, amount, quantity, entryPrice, leverage, takeProfit, stopLoss, status];
        const legacyQuery = `
            INSERT INTO orders (user_id, account_id, symbol, side, type, amount, quantity, entry_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const legacyValues = [userId, accountId, symbol, side, type, amount, quantity, entryPrice, status];
        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            if (isMissingColumnError(error)) {
                const { rows } = await db.query(legacyQuery, legacyValues);
                return rows[0];
            }
            if (isMissingRelationError(error)) {
                const friendlyError = new Error('Orders table is not available');
                friendlyError.code = error.code;
                throw friendlyError;
            }
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            const query = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
            const { rows } = await db.query(query, [status, id]);
            return rows[0];
        } catch (error) {
            if (isMissingRelationError(error)) {
                return null;
            }
            throw error;
        }
    }

    static async delete(id, userId) {
        try {
            const query = 'DELETE FROM orders WHERE id = $1 AND user_id = $2 RETURNING id';
            const { rows } = await db.query(query, [id, userId]);
            return rows[0];
        } catch (error) {
            if (isMissingRelationError(error)) {
                return null;
            }
            throw error;
        }
    }
}

module.exports = Order;
