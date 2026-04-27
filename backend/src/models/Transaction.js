// backend/src/models/Transaction.js
const db = require('../config/database');
const { isMissingColumnError } = require('../utils/dbCompat');

class Transaction {
    static async findByUserId(userId, limit = 50) {
        const query = `
            SELECT * 
            FROM transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;
        const { rows } = await db.query(query, [userId, limit]);
        return rows;
    }

    static async findByAccountId(accountId, limit = 50) {
        const query = `
            SELECT * 
            FROM transactions 
            WHERE account_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;
        const { rows } = await db.query(query, [accountId, limit]);
        return rows;
    }

    static async create(userId, transactionData) {
        const { account_id, type, amount, balance_before, balance_after, reference_id, description } = transactionData;

        const query = `
            INSERT INTO transactions (user_id, account_id, type, amount, balance_before, balance_after, reference_id, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const legacyQuery = `
            INSERT INTO transactions (user_id, account_id, type, amount, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            userId,
            account_id,
            type.toLowerCase(),
            amount,
            balance_before || 0,
            balance_after || 0,
            reference_id || null,
            description
        ];

        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            if (!isMissingColumnError(error)) {
                throw error;
            }

            const { rows } = await db.query(legacyQuery, [
                userId,
                account_id,
                type.toLowerCase(),
                amount,
                description,
            ]);
            return rows[0];
        }
    }
}

module.exports = Transaction;
