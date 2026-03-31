const db = require('./src/config/database');

async function checkSchema() {
    try {
        const users = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log('--- USERS TABLE ---');
        console.table(users.rows);

        const accounts = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'accounts'");
        console.log('--- ACCOUNTS TABLE ---');
        console.table(accounts.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
