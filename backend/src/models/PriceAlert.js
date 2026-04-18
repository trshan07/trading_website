// backend/src/models/PriceAlert.js
const db = require('../config/database');

class PriceAlert {
    static async findByUserId(userId) {
        const query = 'SELECT * FROM price_alerts WHERE user_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async create(userId, alertData) {
        const { symbol, price, condition } = alertData;
        
        const query = `
            INSERT INTO price_alerts (user_id, symbol, price, condition, status)
            VALUES ($1, $2, $3, $4, 'active')
            RETURNING *
        `;
        const values = [userId, symbol, price, condition];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updateStatus(id, userId, status) {
        const query = 'UPDATE price_alerts SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *';
        const { rows } = await db.query(query, [status, id, userId]);
        return rows[0];
    }

    static async delete(id, userId) {
        const query = 'DELETE FROM price_alerts WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
}

module.exports = PriceAlert;
