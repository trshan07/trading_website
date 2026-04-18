// backend/src/models/Document.js
const db = require('../config/database');

class Document {
    static async findByUserId(userId) {
        const query = 'SELECT * FROM user_documents WHERE user_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    static async create(userId, docData) {
        const { name, category, filePath, fileType, fileSize } = docData;
        
        const query = `
            INSERT INTO user_documents (user_id, name, category, file_path, file_type, file_size, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
            RETURNING *
        `;
        const values = [userId, name, category, filePath, fileType, fileSize];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updateStatus(id, status, remarks = null) {
        const query = `
            UPDATE user_documents 
            SET status = $1, 
                remarks = $2, 
                updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3 
            RETURNING *
        `;
        const { rows } = await db.query(query, [status, remarks, id]);
        return rows[0];
    }

    static async delete(id, userId) {
        const query = 'DELETE FROM user_documents WHERE id = $1 AND user_id = $2 RETURNING id, file_path';
        const { rows } = await db.query(query, [id, userId]);
        return rows[0];
    }
}

module.exports = Document;
