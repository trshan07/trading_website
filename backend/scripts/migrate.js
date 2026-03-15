// backend/scripts/migrate.js
const db = require('../src/config/database');
require('dotenv').config();

const migrate = async () => {
    try {
        console.log('--- Starting Database Migration ---');

        // 1. Add missing columns to 'users' table if they don't exist
        console.log('Updating users table schema...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
            ADD COLUMN IF NOT EXISTS country VARCHAR(100),
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
        `);

        // 2. Create 'trading_accounts' table if it doesn't exist
        console.log('Ensuring trading_accounts table exists...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS trading_accounts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                account_number VARCHAR(20) UNIQUE NOT NULL,
                account_type VARCHAR(20) CHECK (account_type IN ('demo', 'real')),
                balance DECIMAL(20, 2) DEFAULT 0.00,
                currency VARCHAR(10) DEFAULT 'USD',
                leverage INTEGER DEFAULT 100,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
