const db = require('../backend/src/config/database');
const fs = require('fs');

async function checkTradesTable() {
    try {
        const tradesSchema = await db.query("SELECT * FROM information_schema.columns WHERE table_name = 'trades'");
        fs.writeFileSync('trades_schema_check.json', JSON.stringify(tradesSchema.rows, null, 2));
        console.log(`Successfully checked trades table schema. Found ${tradesSchema.rows.length} columns.`);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('trades_schema_error.txt', err.stack);
        process.exit(1);
    }
}

checkTradesTable();
