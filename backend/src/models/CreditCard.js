// backend/src/models/CreditCard.js
const db = require('../config/database');

class CreditCard {
    static async findByUserId(userId) {
        const query = 'SELECT * FROM credit_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM credit_cards WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async create(userId, cardData) {
        const { cardType, last4, expiryDate, cardholderName, isDefault } = cardData;
        
        const existing = await this.findByUserId(userId);
        const setAsDefault = isDefault || existing.length === 0;

        if (setAsDefault) {
            await this.clearDefaults(userId);
        }

        const query = `
            INSERT INTO credit_cards (user_id, card_type, last4, expiry_date, cardholder_name, is_default)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [userId, cardType, last4, expiryDate, cardholderName, setAsDefault];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async setDefault(userId, id) {
        await this.clearDefaults(userId);
        const query = 'UPDATE credit_cards SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }

    static async clearDefaults(userId) {
        const query = 'UPDATE credit_cards SET is_default = false WHERE user_id = $1';
        await db.query(query, [userId]);
    }

    static async delete(id, userId) {
        const query = 'DELETE FROM credit_cards WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
}

module.exports = CreditCard;
