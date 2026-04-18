
const db = require('../src/config/database');
require('dotenv').config();

const checkSchema = async () => {
    try {
        console.log('--- DATABASE STATUS ---');
        
        // Check Users
        const { rows: userCount } = await db.query('SELECT count(*) FROM users');
        const { rows: clients } = await db.query("SELECT id, email, role, is_active FROM users");
        console.log(`Total Clients (users table): ${userCount[0].count}`);
        if (clients.length > 0) console.table(clients);
        else console.log('No clients found in users table.');
        
        // Check Admins
        const { rows: adminCount } = await db.query('SELECT count(*) FROM admins');
        const { rows: admins } = await db.query("SELECT id, email, role, is_active FROM admins");
        console.log(`\nTotal Administrators (admins table): ${adminCount[0].count}`);
        if (admins.length > 0) console.table(admins);
        else console.log('No administrators found in admins table.');
        
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        process.exit(0);
    }
};

checkSchema();
