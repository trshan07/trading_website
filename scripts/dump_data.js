const db = require('../backend/src/config/database');
const fs = require('fs');

async function checkData() {
    try {
        const users = await db.query("SELECT id, email, role FROM users");
        const accounts = await db.query("SELECT id, user_id, account_type, account_number FROM accounts");
        
        const output = {
            users: users.rows,
            accounts: accounts.rows
        };
        
        fs.writeFileSync('data_dump.json', JSON.stringify(output, null, 2));
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('data_error.txt', err.stack);
        process.exit(1);
    }
}

checkData();
