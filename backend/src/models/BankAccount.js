// backend/src/models/BankAccount.js
const db = require('../config/database');
const { isMissingColumnError, isMissingRelationError } = require('../utils/dbCompat');

class BankAccount {
    static async findByUserId(userId) {
        console.log('DB Debug - Fetching Bank Accounts for User ID:', userId);
        try {
            const query = 'SELECT * FROM bank_accounts WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC';
            const { rows } = await db.query(query, [userId]);
            return rows;
        } catch (error) {
            if (isMissingColumnError(error)) {
                const legacyQuery = 'SELECT * FROM bank_accounts WHERE user_id = $1 ORDER BY created_at DESC';
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
        const query = 'SELECT * FROM bank_accounts WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async create(userId, accountData) {
        const { 
            bankName, 
            branchName, 
            accountNumber, 
            accountHolderName, 
            accountName, // fallback
            currency, 
            swiftCode, 
            iban,
            beneficiaryName,
            relationship,
            proof_file,
            isDefault 
        } = accountData;
        
        const finalAccountName = accountHolderName || accountName;
        
        // If this is the first account, make it default
        const existing = await this.findByUserId(userId);
        const setAsDefault = isDefault || existing.length === 0;

        if (setAsDefault) {
            await this.clearDefaults(userId);
        }

        const values = [
            userId, bankName, branchName, accountNumber, finalAccountName,
            finalAccountName, currency || 'USD', swiftCode, iban,
            beneficiaryName, relationship, proof_file, setAsDefault
        ];

        try {
            const query = `
                INSERT INTO bank_accounts (
                    user_id, bank_name, branch_name, account_number, account_name, 
                    account_holder_name, currency, swift_code, iban, 
                    beneficiary_name, relationship, proof_file, is_default
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `;
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            if (isMissingColumnError(error)) {
                const legacyQuery = `
                    INSERT INTO bank_accounts (
                        user_id, bank_name, branch_name, account_number, account_name, 
                        currency, swift_code, is_verified
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
                    RETURNING *
                `;
                const legacyValues = [
                    userId,
                    bankName,
                    branchName,
                    accountNumber,
                    finalAccountName,
                    currency || 'USD',
                    swiftCode,
                ];
                const { rows } = await db.query(legacyQuery, legacyValues);
                return { ...rows[0], is_default: setAsDefault };
            }
            throw error;
        }
    }

    static async update(id, updateData) {
        const fields = Object.keys(updateData);
        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
        const values = Object.values(updateData);
        
        const query = `UPDATE bank_accounts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        const { rows } = await db.query(query, [id, ...values]);
        return rows[0];
    }

    static async setDefault(userId, id) {
        await this.clearDefaults(userId);
        try {
            const query = 'UPDATE bank_accounts SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *';
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
            const query = 'UPDATE bank_accounts SET is_default = false WHERE user_id = $1';
            await db.query(query, [userId]);
        } catch (error) {
            if (isMissingColumnError(error) || isMissingRelationError(error)) {
                return;
            }
            throw error;
        }
    }

    static async delete(id, userId) {
        const query = 'DELETE FROM bank_accounts WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
}

module.exports = BankAccount;
