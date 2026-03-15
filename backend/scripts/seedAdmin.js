const bcrypt = require('bcryptjs');
const db = require('../src/config/database');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@trade.local';
        const adminPassword = 'adminpassword123'; // The client should change this later

        // Check if admin already exists
        const { rows: existingRows } = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
        if (existingRows.length > 0) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, role
        `;
        const values = [adminEmail, passwordHash, 'System', 'Admin', 'admin', true];

        const { rows } = await db.query(query, values);
        
        console.log('Admin seeded successfully:', rows[0]);
        console.log(`Login Email: ${adminEmail}`);
        console.log(`Login Password: ${adminPassword}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
