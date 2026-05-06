const db = require('../src/config/database');

async function update() {
    try {
        console.log('Starting update...');
        const r1 = await db.query("UPDATE instruments SET data_symbol = 'WTI/USD' WHERE symbol IN ('WTI', 'CL1!')");
        console.log(`Updated WTI/CL1!: ${r1.rowCount} rows`);
        
        const r2 = await db.query("UPDATE instruments SET data_symbol = 'XBR/USD' WHERE symbol = 'BRENT'");
        console.log(`Updated BRENT: ${r2.rowCount} rows`);
        
        console.log('Database update completed successfully');
    } catch (error) {
        console.error('Database update failed:', error);
    } finally {
        process.exit();
    }
}

update();
