// backend/src/models/AdminLog.js
const db = require('../config/database');

class AdminLog {
    static async findAll(limit = 100) {
        const query = `
            SELECT al.*, a.email as admin_email, a.first_name, a.last_name
            FROM admin_logs al
            JOIN admins a ON al.admin_id = a.id
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
        const values = [adminId, action, target_id, details, ip_address];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async findByTargetId(targetId) {
        const query = 'SELECT * FROM admin_logs WHERE target_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [targetId]);
        return rows;
    }
}

module.exports = AdminLog;
