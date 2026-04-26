// backend/src/models/KyCSubmission.js
const db = require('../config/database');

class KyCSubmission {
    static async findAll(status = null) {
        let query = `
            SELECT ks.*, u.email as user_email, u.first_name, u.last_name, 
                   admins.email as admin_email
            FROM kyc_submissions ks
            JOIN users u ON ks.user_id = u.id
            LEFT JOIN admins ON ks.reviewed_by = admins.id
        `;
        const values = [];
        
        if (status && status !== 'all') {
            query += ' WHERE ks.status = $1';
            values.push(status);
        }
        
        query += ' ORDER BY ks.created_at DESC';
        
        const { rows } = await db.query(query, values);
        return rows;
    }

    static async findById(id) {
        const query = `
            SELECT ks.*, u.email as user_email, u.first_name, u.last_name
            FROM kyc_submissions ks
            JOIN users u ON ks.user_id = u.id
            WHERE ks.id = $1
        `;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async findByUserId(userId) {
        const query = 'SELECT * FROM kyc_submissions WHERE user_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async create(userId, docData) {
        const { document_type, document_number, file_path } = docData;
        
        const query = `
            INSERT INTO kyc_submissions (user_id, document_type, document_number, file_path, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *
        `;
        const values = [userId, document_type, document_number, file_path];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updateStatus(id, statusData) {
        const { reviewed_by, rejection_reason } = statusData;
        const status = statusData.status === 'approved' ? 'verified' : statusData.status;
        
        const query = `
            UPDATE kyc_submissions 
            SET status = $1, 
                reviewed_by = $2, 
                rejection_reason = $3, 
                reviewed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;
        const values = [status, reviewed_by, rejection_reason, id];

        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            // Older/live schemas may still enforce reviewed_by -> users(id),
            // while admin reviews use admins.id. Retry without reviewed_by so
            // the KYC status update can still succeed.
            if (reviewed_by != null && error.code === '23503') {
                const fallbackValues = [status, null, rejection_reason, id];
                const { rows } = await db.query(query, fallbackValues);
                return rows[0];
            }

            throw error;
        }
    }
}

module.exports = KyCSubmission;
