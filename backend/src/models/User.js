// models/User.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0];
    }

    static async findById(id) {
        const { rows } = await db.query(
            'SELECT id, email, first_name, last_name, phone, country, role, is_active, created_at FROM users WHERE id = $1', 
            [id]
        );
        return rows[0];
    }

    static async findAll(role = null) {
        let query = 'SELECT id, email, first_name, last_name, phone, country, role, is_active, created_at FROM users';
        const values = [];
        
        if (role) {
            query += ' WHERE role = $1';
            values.push(role);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const { rows } = await db.query(query, values);
        return rows;
    }

    static async create(userData) {
        const { email, password, firstName, lastName, phone, country, role, is_active = true } = userData;
        
        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, phone, country, role, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, email, first_name, last_name, role, is_active, created_at
        `;
        
        const values = [email, hashedPassword, firstName, lastName, phone, country, role, is_active];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async update(userId, updateData) {
        const { firstName, lastName, phone, country, is_active } = updateData;
        
        const query = `
            UPDATE users 
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone = COALESCE($3, phone),
                country = COALESCE($4, country),
                is_active = COALESCE($5, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING id, email, first_name, last_name, phone, country, role, is_active
        `;
        
        const values = [firstName, lastName, phone, country, is_active, userId];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updatePassword(userId, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const query = `
            UPDATE users 
            SET password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING id, email
        `;
        
        const { rows } = await db.query(query, [hashedPassword, userId]);
        return rows[0];
    }

    static async delete(userId) {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [userId]);
        return rows[0];
    }
}

module.exports = User;