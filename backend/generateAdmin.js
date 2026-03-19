// backend/generateAdmin.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function createAdmin() {
    try {
        // Choose your admin password
        const password = 'Admin@123'; // Change this to your desired password
        
        // Generate hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('Generated password hash:', hashedPassword);
        console.log('Use this hash in your SQL INSERT statement\n');
        
        // Check if admin already exists
        const existingAdmin = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['admin@rizalstrade.com']
        );
        
        if (existingAdmin.rows.length > 0) {
            console.log('Admin user already exists:');
            console.log('Email:', existingAdmin.rows[0].email);
            console.log('Role:', existingAdmin.rows[0].role);
            
            // Update existing user to admin if needed
            if (existingAdmin.rows[0].role !== 'admin') {
                await pool.query(
                    'UPDATE users SET role = $1 WHERE email = $2',
                    ['admin', 'admin@rizalstrade.com']
                );
                console.log('User promoted to admin successfully!');
            }
        } else {
            // Create new admin
            const result = await pool.query(`
                INSERT INTO users (
                    email, password_hash, first_name, last_name, phone, country, role, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, email, role
            `, [
                'admin@rizalstrade.com', 
                hashedPassword, 
                'Super', 
                'Admin', 
                '1234567890', 
                'USA', 
                'admin', 
                true
            ]);
            
            console.log('✅ Admin user created successfully!');
            console.log('Email:', result.rows[0].email);
            console.log('Password:', password);
            console.log('Role:', result.rows[0].role);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

createAdmin();