const db = require('../config/database');

class Account {
    static async create(userId, type, currency = 'USD') {
        // Generate random account number for demo purposes
        const min = 10000000;
        const max = 99999999;
        const accountNumber = Math.floor(Math.random() * (max - min + 1) + min).toString();
        
        // Initial balance: 10,000 for demo, 0 for real
        const initialBalance = type === 'demo' ? 10000.00 : 0.00;

        const query = `
            INSERT INTO trading_accounts (user_id, account_number, account_type, currency, balance)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, account_number, account_type, balance, currency
        `;

        const values = [userId, accountNumber, type, currency, initialBalance];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByUserId(userId) {
        const query = `
            SELECT id, account_number, account_type, balance, currency, leverage
            FROM trading_accounts
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }
}

module.exports = Account;
