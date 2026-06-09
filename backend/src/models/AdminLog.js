// backend/src/models/AdminLog.js
const db = require('../config/database');
const { isMissingColumnError } = require('../utils/dbCompat');

class AdminLog {
    static async findAll(limit = 100) {
        const query = `
            SELECT al.*,
                   COALESCE(a.email, u.email) as admin_email,
                   COALESCE(a.first_name, u.first_name) as first_name,
                   COALESCE(a.last_name, u.last_name) as last_name
            FROM admin_logs al
            LEFT JOIN admins a ON al.admin_id = a.id
            LEFT JOIN users u ON al.admin_id = u.id
            ORDER BY al.created_at DESC
            LIMIT $1
        `;
        const { rows } = await db.query(query, [limit]);
        return rows;
    }

    static async create(adminId, actionData) {
        const { action, target_id, details, ip_address } = actionData;
        
        const query = `
            INSERT INTO admin_logs (admin_id, action, target_id, details, ip_address)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const legacyQuery = `
            INSERT INTO admin_logs (admin_id, action, target_id, details, ip_address)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [adminId, action, target_id, details, ip_address];

        try {
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            if (error?.code === '23503') {
                const { rows } = await db.query(legacyQuery, [null, action, target_id, details, ip_address]);
                return rows[0];
            }

            if (isMissingColumnError(error)) {
                throw error;
            }

            throw error;
        }
    }

    static async findByTargetId(targetId) {
        const query = 'SELECT * FROM admin_logs WHERE target_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [targetId]);
        return rows;
    }
}

module.exports = AdminLog;
