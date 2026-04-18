
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
    static async findByEmail(email) {
        const { rows } = await db.query('SELECT * FROM admins WHERE email = $1', [email]);
        return rows[0];
    }

    static async findById(id) {
        const { rows } = await db.query(
            'SELECT id, email, first_name, last_name, phone, country, role, is_active, created_at FROM admins WHERE id = $1', 
            [id]
        );
        return rows[0];
    }

    static async findAll() {
        const { rows } = await db.query('SELECT id, email, first_name, last_name, phone, country, role, is_active, created_at FROM admins ORDER BY created_at DESC');
        return rows;
    }

    static async create(adminData) {
        const { email, password, firstName, lastName, phone, country, role = 'admin', is_active = true } = adminData;
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO admins (email, password_hash, first_name, last_name, phone, country, role, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, email, first_name, last_name, role, is_active, created_at
        `;
        
        const values = [email, hashedPassword, firstName, lastName, phone, country, role, is_active];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async update(adminId, updateData) {
        const { firstName, lastName, phone, country, is_active, role } = updateData;
        
        const query = `
            UPDATE admins 
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone = COALESCE($3, phone),
                country = COALESCE($4, country),
                is_active = COALESCE($5, is_active),
                role = COALESCE($6, role),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING id, email, first_name, last_name, phone, country, role, is_active
        `;
        
        const values = [firstName, lastName, phone, country, is_active, role, adminId];
        const { rows } = await db.query(query, values);
        return rows[0];
    }

    static async updatePassword(adminId, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const query = `
            UPDATE admins 
            SET password_hash = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING id, email
        `;
        
        const { rows } = await db.query(query, [hashedPassword, adminId]);
        return rows[0];
    }

    static async delete(adminId) {
        const query = 'DELETE FROM admins WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [adminId]);
        return rows[0];
    }
}

module.exports = Admin;
