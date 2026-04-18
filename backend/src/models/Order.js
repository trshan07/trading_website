// backend/src/models/Order.js
const db = require('../config/database');

class Order {
    static async findByUserId(userId, limit = 50) {
        const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2';
        const { rows } = await db.query(query, [userId, limit]);
        return rows;
    }

    static async findByAccountId(accountId, status = 'pending') {
        let query = 'SELECT * FROM orders WHERE account_id = $1';
        const values = [accountId];
        
        if (status) {
            query += ' AND status = $2';
            values.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        const { rows } = await db.query(query, values);
        return rows;
    }

    static async create(userId, orderData) {
        const { accountId, symbol, side, type, amount, quantity, entryPrice, status = 'pending' } = orderData;
        
        const query = `
            INSERT INTO orders (user_id, account_id, symbol, side, type, amount, quantity, entry_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [userId, accountId, symbol, side, type, amount, quantity, entryPrice, status];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updateStatus(id, status) {
        const query = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
        const { rows } = await db.query(query, [status, id]);
        return rows[0];
    }

    static async delete(id, userId) {
        const query = 'DELETE FROM orders WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
}

module.exports = Order;
