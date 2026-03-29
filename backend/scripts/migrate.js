// backend/scripts/migrate.js
const db = require('../src/config/database');
require('dotenv').config();

const migrate = async () => {
    try {
        console.log('--- Starting Database Migration ---');

        // 1. Create 'users' table if it doesn't exist
        console.log('Ensuring users table exists...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(50),
                country VARCHAR(100),
                role VARCHAR(50) DEFAULT 'client',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Add missing columns to 'users' table if they don't exist
        console.log('Updating users table schema if needed...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
            ADD COLUMN IF NOT EXISTS country VARCHAR(100),
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'client',
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        `);

        // 3. Create 'accounts' table if it doesn't exist
        console.log('Ensuring accounts table exists...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS accounts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                account_number VARCHAR(50) UNIQUE NOT NULL,
                account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('demo', 'real')),
                balance DECIMAL(15,2) DEFAULT 0,
                currency VARCHAR(10) DEFAULT 'USD',
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('--- Migration Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
