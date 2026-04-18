const bcrypt = require('bcryptjs');
const db = require('../src/config/database');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@trade.local';
        const adminPassword = 'adminpassword123'; // The client should change this later

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(adminPassword, salt);

        console.log('Seeding Super Admin into admins table...');
        const query = `
            INSERT INTO admins (email, password_hash, first_name, last_name, role, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (email) DO UPDATE 
            SET role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
            RETURNING id, email, role
        `;
        const values = [adminEmail, passwordHash, 'Super', 'Admin', 'super_admin', true];
        
        const { rows } = await db.query(query, values);
        console.log('✅ Super Admin seeded successfully into admins table:');
        console.log(`Email: ${rows[0].email}`);
        console.log(`Role: ${rows[0].role}`);
        console.log('Use these credentials to create other admins via the Super Admin panel.');

    } catch (error) {
        console.error('❌ Error seeding Super Admin:', error);
    } finally {
        process.exit(0);
    }
};

seedAdmin();
