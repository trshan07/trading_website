// backend/src/models/CreditCard.js
const db = require('../config/database');
const { isMissingColumnError, isMissingRelationError, getMissingColumnName } = require('../utils/dbCompat');

class CreditCard {
    static async findByUserId(userId) {
        try {
            const query = 'SELECT * FROM credit_cards WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC';
            const { rows } = await db.query(query, [userId]);
            return rows;
        } catch (error) {
            if (isMissingColumnError(error)) {
                const legacyQuery = 'SELECT * FROM credit_cards WHERE user_id = $1 ORDER BY created_at DESC';
                const { rows } = await db.query(legacyQuery, [userId]);
                return rows.map((row, index) => ({ ...row, is_default: index === 0 }));
            }
            if (isMissingRelationError(error)) {
                return [];
            }
            throw error;
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM credit_cards WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async create(userId, cardData) {
        const { 
            cardNumber, 
            expiry, 
            expiryDate, // fallback
            cardholderName, 
            billingAddress,
            cardType,
            isDefault 
        } = cardData;
        
        // Extract last4 from card number
        const last4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : '0000';
        const finalExpiry = expiry || expiryDate;
        
        const existing = await this.findByUserId(userId);
        const setAsDefault = isDefault || existing.length === 0;

        if (setAsDefault) {
            await this.clearDefaults(userId);
        }

        const values = [userId, cardType || 'Visa', last4, finalExpiry, cardholderName, billingAddress, setAsDefault];
        try {
            const query = `
                INSERT INTO credit_cards (user_id, card_type, last4, expiry_date, cardholder_name, billing_address, is_default)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            if (isMissingColumnError(error)) {
                const missingColumn = getMissingColumnName(error);

                if (missingColumn === 'billing_address') {
                    const noBillingQuery = `
                        INSERT INTO credit_cards (user_id, card_type, last4, expiry_date, cardholder_name, is_default)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *
                    `;
                    const { rows } = await db.query(noBillingQuery, [userId, cardType || 'Visa', last4, finalExpiry, cardholderName, setAsDefault]);
                    return { ...rows[0], billing_address: billingAddress };
                }

                if (missingColumn === 'last4') {
                    const noLast4Query = `
                        INSERT INTO credit_cards (user_id, card_type, expiry_date, cardholder_name, is_verified)
                        VALUES ($1, $2, $3, $4, FALSE)
                        RETURNING *
                    `;
                    const { rows } = await db.query(noLast4Query, [userId, cardType || 'Visa', finalExpiry, cardholderName]);
                    return { ...rows[0], last4, billing_address: billingAddress, is_default: setAsDefault };
                }

                const legacyQuery = `
                    INSERT INTO credit_cards (user_id, card_type, last4, expiry_date, cardholder_name, is_verified)
                    VALUES ($1, $2, $3, $4, $5, FALSE)
                    RETURNING *
                `;
                const { rows } = await db.query(legacyQuery, values.slice(0, 5));
                return { ...rows[0], billing_address: billingAddress, is_default: setAsDefault };
            }
            throw error;
        }
    }

    static async setDefault(userId, id) {
        await this.clearDefaults(userId);
        try {
            const query = 'UPDATE credit_cards SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *';
            const { rows } = await db.query(query, [id, userId]);
            return rows[0];
        } catch (error) {
            if (isMissingColumnError(error) || isMissingRelationError(error)) {
                return this.findById(id);
            }
            throw error;
        }
    }

    static async clearDefaults(userId) {
        try {
            const query = 'UPDATE credit_cards SET is_default = false WHERE user_id = $1';
            await db.query(query, [userId]);
        } catch (error) {
            if (isMissingColumnError(error) || isMissingRelationError(error)) {
                return;
            }
            throw error;
        }
    }

    static async delete(id, userId) {
        const query = 'DELETE FROM credit_cards WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
}

module.exports = CreditCard;
