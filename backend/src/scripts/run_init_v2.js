// backend/src/scripts/run_init_v2.js
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

const runInit = async () => {
    try {
        console.log('🚀 Starting Database Initialization v2...');
        
        const sqlPath = path.join(__dirname, '../../database/init_v2.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📖 Reading SQL file...');
        
        // Split by semicolon but handle potential issues with triggers/functions if any
        // For simplicity, we'll run the whole block
        await db.query(sql);
        
        console.log('✅ Database Initialization v2 Completed Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during database initialization:', error);
        process.exit(1);
    }
};

runInit();
