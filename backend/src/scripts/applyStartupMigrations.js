const fs = require('fs');
const path = require('path');
const db = require('../config/database');

let hasRun = false;

const applyStartupMigrations = async () => {
    if (hasRun) {
        return;
    }

    console.log('Applying startup database migrations...');

    const migrationFiles = [
        '../../database/init_v2.sql',
        '../../database/init_v3.sql',
        '../../database/update.sql',
    ];

    for (const relativePath of migrationFiles) {
        const sqlPath = path.join(__dirname, relativePath);
        if (!fs.existsSync(sqlPath)) {
            continue;
        }

        const sql = fs.readFileSync(sqlPath, 'utf8').trim();
        if (!sql) {
            continue;
        }

        console.log(`Applying startup migration: ${path.basename(sqlPath)}`);
        await db.query(sql);
    }

    hasRun = true;
    console.log('Startup database migrations applied successfully.');
};

module.exports = applyStartupMigrations;
