// src/models/Account.js
const db = require('../config/database');

class Account {
    static async create(userId, accountType) {
        const accountNumber = this.generateAccountNumber();
        const query = `
            INSERT INTO accounts (user_id, account_number, account_type, balance, credit, currency, status, leverage)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const balance = accountType === 'demo' ? 1000 : 0;
        const leverage = 50; // Default leverage
        const values = [userId, accountNumber, accountType, balance, 0, 'USD', 'active', leverage];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByUserId(userId) {
        const query = `
            SELECT * FROM accounts 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async ensureAccounts(userId) {
        const accounts = await this.findByUserId(userId);
        const types = accounts.map(a => a.account_type);
        
        const results = [];
        if (!types.includes('demo')) {
            console.log(`[Account] Creating missing demo account for user ${userId}`);
            results.push(await this.create(userId, 'demo'));
        }
        if (!types.includes('real')) {
            console.log(`[Account] Creating missing real account for user ${userId}`);
            results.push(await this.create(userId, 'real'));
        }
        
        return results;
    }

    static async findById(id) {
        const query = 'SELECT * FROM accounts WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async findByAccountNumber(accountNumber) {
        const query = 'SELECT * FROM accounts WHERE account_number = $1';
        const { rows } = await db.query(query, [accountNumber]);
        return rows[0];
    }

    static async updateBalance(accountId, newBalance) {
        const query = `
            UPDATE accounts 
            SET balance = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING *
        `;
        const { rows } = await db.query(query, [newBalance, accountId]);
        return rows[0];
    }

    static async updateCredit(accountId, newCredit) {
        const query = `
            UPDATE accounts 
            SET credit = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING *
        `;
        const { rows } = await db.query(query, [newCredit, accountId]);
        return rows[0];
    }

    static async updateLeverage(accountId, leverage) {
        const query = `
            UPDATE accounts 
            SET leverage = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING *
        `;
        const { rows } = await db.query(query, [leverage, accountId]);
        return rows[0];
    }

    static generateAccountNumber() {
        const prefix = 'RT';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
}

module.exports = Account;