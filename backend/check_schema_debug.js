const db = require('./src/config/database');
const fs = require('fs');

async function checkSchema() {
    try {
        const users = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        const accounts = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'accounts'");
        
        const output = {
            users: users.rows,
            accounts: accounts.rows
        };
        
        fs.writeFileSync('schema_dump.json', JSON.stringify(output, null, 2));
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('schema_error.txt', err.stack);
        process.exit(1);
    }
}

checkSchema();
