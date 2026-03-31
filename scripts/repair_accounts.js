const db = require('../backend/src/config/database');
const Account = require('../backend/src/models/Account');

async function repairAllUsers() {
    try {
        console.log("Starting full database account repair...");
        const { rows: users } = await db.query("SELECT id, email, role FROM users WHERE role = 'client'");
        
        console.log(`Found ${users.length} clients. Checking accounts...`);
        
        for (const user of users) {
            const results = await Account.ensureAccounts(user.id);
            if (results.length > 0) {
                console.log(`[REPAIRED] User ${user.id} (${user.email}): Created ${results.length} accounts.`);
            }
        }
        
        console.log("Repair completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Repair failed:", err);
        process.exit(1);
    }
}

repairAllUsers();
