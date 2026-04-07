const path = require('path');
const fs = require('fs');

// Path to the .env file in the backend folder
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Pool } = require('pg');

async function runFix() {
    console.log('--- DB Fix Final Started ---');
    
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log(`Connecting to: ${process.env.DB_NAME}`);
        
        // Fix for demo balances
        const updateQuery = "UPDATE accounts SET balance = 1000.00 WHERE LOWER(account_type) = 'demo'";
        const res = await pool.query(updateQuery);
        console.log(`✅ Updated ${res.rowCount} demo accounts.`);

        // Final check
        const checkQuery = "SELECT id, user_id, balance FROM accounts WHERE balance >= 1000000";
        const checkRes = await pool.query(checkQuery);
        console.log(`❌ Remaining >= 1M: ${checkRes.rows.length}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
        console.log('--- DB Fix Final Finished ---');
    }
}

runFix();
