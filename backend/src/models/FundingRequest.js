// backend/src/models/FundingRequest.js
const db = require('../config/database');

class FundingRequest {
    static async findAll(status = null) {
        let query = `
            SELECT fr.*, u.email as user_email, u.first_name, u.last_name, a.account_number,
                   admins.email as admin_email
            FROM funding_requests fr
            JOIN users u ON fr.user_id = u.id
            JOIN accounts a ON fr.account_id = a.id
            LEFT JOIN admins ON fr.processed_by = admins.id
        `;
        const values = [];
        
        if (status && status !== 'all') {
            query += ' WHERE fr.status = $1';
            values.push(status);
        }
        
        query += ' ORDER BY fr.created_at DESC';
        
        const { rows } = await db.query(query, values);
        return rows;
    }

    static async findById(id) {
        const query = `
            SELECT fr.*, u.email as user_email, u.first_name, u.last_name, a.account_number 
            FROM funding_requests fr
            JOIN users u ON fr.user_id = u.id
            JOIN accounts a ON fr.account_id = a.id
            WHERE fr.id = $1
        `;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async findByUserId(userId) {
        const query = 'SELECT * FROM funding_requests WHERE user_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async create(requestData) {
        const { user_id, account_id, type, amount, method, proof_file, bank_reference } = requestData;
        
        const query = `
            INSERT INTO funding_requests (user_id, account_id, type, amount, method, proof_file, bank_reference, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [user_id, account_id, type, amount, method, proof_file, bank_reference, 'pending'];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updateStatus(id, statusData) {
        const { status, processed_by, rejection_reason } = statusData;
        
        const query = `
            UPDATE funding_requests 
            SET status = $1, 
                processed_by = $2, 
                rejection_reason = $3, 
                processed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        const values = [status, processed_by, rejection_reason, id];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = FundingRequest;
