// backend/src/public/models/Promotion.js
const db = require('../../config/database');

class Promotion {
    static async findAllActive() {
        const { rows } = await db.query('SELECT * FROM promotions WHERE is_active = true ORDER BY created_at DESC');
        return rows;
    }
}

module.exports = Promotion;
