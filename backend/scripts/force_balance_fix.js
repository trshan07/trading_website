const path = require('path');
const fs = require('fs');

// Path to the .env file in the backend folder
const envPath = path.join(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const { Pool } = require('pg');

async function forceFixBalances() {
    console.log('--- Force Balance Fix Script Started ---');
    console.log('ENV Path:', envPath);
    console.log('ENV Found:', fs.existsSync(envPath));
    
    if (!process.env.DB_NAME) {
        console.error('❌ Error: DB_NAME not found in environment variables. Check .env path.');
        process.exit(1);
    }

    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log(`Connecting to: ${process.env.DB_NAME}`);
        
        // Ensure decimal to numeric cast works
        const updateQuery = `
            UPDATE accounts 
            SET balance = 1000.00, updated_at = CURRENT_TIMESTAMP
            WHERE LOWER(account_type) = 'demo'
        `;
        const res = await pool.query(updateQuery);
        console.log(`✅ Successfully updated ${res.rowCount} demo accounts to $1,000.00.`);

        const checkQuery = `
            SELECT id, user_id, balance FROM accounts 
            WHERE balance >= 1000000
        `;
        const checkRes = await pool.query(checkQuery);
        
        if (checkRes.rows.length > 0) {
            console.warn(`⚠️ WARNING: Found ${checkRes.rows.length} accounts still with balance >= 1,000,000!`);
            console.log(JSON.stringify(checkRes.rows, null, 2));
        } else {
            console.log('✅ Verified: No accounts with balance >= 1,000,000 remain in the database.');
        }

    } catch (err) {
        console.error('❌ Error executing database fix:', err.message);
    } finally {
        await pool.end();
        console.log('--- Script Finished ---');
    }
}

forceFixBalances();
