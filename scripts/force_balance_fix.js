const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'trade_db',
});

async function forceFixBalances() {
    console.log(`Connecting to database: ${process.env.DB_NAME} as user: ${process.env.DB_USER}`);
    
    try {
        // 1. Update all existing demo accounts to exactly 1000.00
        const updateQuery = `
            UPDATE accounts 
            SET balance = 1000.00, updated_at = CURRENT_TIMESTAMP
            WHERE account_type = 'demo' OR account_type = 'DEMO'
        `;
        const res = await pool.query(updateQuery);
        console.log(`✅ Successfully updated ${res.rowCount} demo accounts to $1,000.00.`);

        // 2. Double check if any ones are still 1000000
        const checkQuery = `
            SELECT id, user_id, balance FROM accounts 
            WHERE CAST(balance AS NUMERIC) >= 1000000
        `;
        const checkRes = await pool.query(checkQuery);
        
        if (checkRes.rows.length > 0) {
            console.warn(`⚠️ WARNING: Found ${checkRes.rows.length} accounts still with balance >= 1,000,000!`);
            console.log(JSON.stringify(checkRes.rows, null, 2));
        } else {
            console.log('✅ Verified: No accounts with balance >= 1,000,000 remain in the database.');
        }

    } catch (err) {
        console.error('❌ Error executing force fix:', err);
    } finally {
        await pool.end();
    }
}

forceFixBalances();
