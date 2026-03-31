const db = require('../backend/src/config/database');
const Trade = require('../backend/src/models/Trade');

async function debugPositions() {
    const userId = 13; // From data_dump.json
    const accountId = 38; // From user's error message
    
    console.log(`Debugging positions for userId=${userId}, accountId=${accountId}...`);
    
    try {
        console.log("Attempting Trade.findActiveByUserId...");
        const rows = await Trade.findActiveByUserId(userId, accountId);
        console.log("Success! Rows:", rows);
        process.exit(0);
    } catch (err) {
        console.error("FAILED with error:");
        console.error(err);
        process.exit(1);
    }
}

debugPositions();
