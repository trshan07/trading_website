const fs = require('fs');
const path = require('path');
const db = require('../config/database');

let hasRun = false;

const applyStartupMigrations = async () => {
    if (hasRun) {
        return;
    }

    const sqlPath = path.join(__dirname, '../../database/update.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying startup database migrations...');
    await db.query(sql);
    hasRun = true;
    console.log('Startup database migrations applied successfully.');
};

module.exports = applyStartupMigrations;
