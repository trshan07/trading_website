const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0];
    }

    static async findById(id) {
        const { rows } = await db.query('SELECT id, email, first_name, last_name, phone, country, role, is_active FROM users WHERE id = $1', [id]);
        return rows[0];
    }

    static async create(userData) {
        const { email, password, firstName, lastName, phone, country, role } = userData;
        
        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, phone, country, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, first_name, last_name, role
        `;
        
        const values = [email, hashedPassword, firstName, lastName, phone, country, role || 'client'];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updatePassword(userId, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const query = `
            UPDATE users 
            SET password_hash = $1 
            WHERE id = $2 
            RETURNING id, email
        `;
        
        const { rows } = await db.query(query, [hashedPassword, userId]);
        return rows[0];
    }
}

module.exports = User;
