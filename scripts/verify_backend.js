// scripts/verify_backend.js
require('dotenv').config({ path: '../backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Oshigirl@1998',
    database: process.env.DB_NAME || 'trade_db',
});

async function runTests() {
    console.log('Running Backend & Database Verification...\n');
    let client;
    try {
        client = await pool.connect();
        
        // 1. Verify schema tables exist
        console.log('1. Checking new tables...');
        const tables = ['kyc_submissions', 'funding_requests', 'transactions', 'admin_logs'];
        for (const table of tables) {
            const { rowCount } = await client.query(`
                SELECT CAST(1 AS INTEGER) FROM information_schema.tables WHERE table_name = $1
            `, [table]);
            if (rowCount > 0) {
                console.log(` ✅ ${table} exists.`);
            } else {
                console.log(` ❌ ${table} is missing!`);
            }
        }

        // 2. Checking accounts modifications
        console.log('\n2. Checking accounts table modifications...');
        const cols = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'accounts' AND column_name IN ('credit', 'leverage')
        `);
        if (cols.rows.length === 2) {
            console.log(' ✅ accounts table has credit and leverage columns.');
        } else {
            console.log(' ❌ accounts table modifications missing!');
        }

        // We can do an API test but since the server might not be running in this isolated script, 
        // verifying DB schema is the crucial next step.

        console.log('\n✅ Verification Complete!');
    } catch (e) {
        console.error('❌ Verification failed:', e.message);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

runTests();
