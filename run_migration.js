require('dotenv').config({ path: 'backend/.env' });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'trade_db',
});

async function migrate() {
    console.log('Running migration...');
    const sql = fs.readFileSync('database/schema.sql', 'utf8');
    try {
        await pool.query(sql);
        console.log('✅ Migration executed successfully.');
    } catch (e) {
        console.error('❌ Migration failed:', e.message);
    } finally {
        await pool.end();
    }
}

migrate();
