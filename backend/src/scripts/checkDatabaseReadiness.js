const db = require('../config/database');

const requiredTables = [
    'users',
    'admins',
    'accounts',
    'positions',
    'instruments',
    'user_settings',
    'bank_accounts',
    'credit_cards',
    'kyc_submissions',
    'funding_requests',
    'transactions',
    'notifications',
    'activity_logs',
    'user_favorites',
    'instrument_categories',
    'admin_logs',
];

const requiredColumns = {
    admins: ['id', 'email', 'role', 'is_active', 'created_at', 'first_name', 'last_name', 'password_hash'],
    positions: ['id', 'account_id', 'status', 'created_at', 'updated_at', 'side', 'quantity', 'entry_price', 'margin', 'pnl'],
    instruments: ['id', 'symbol', 'is_active', 'category_name', 'default_price', 'default_change', 'default_volume'],
    user_settings: ['user_id', 'chart_preferences', 'notification_settings'],
    bank_accounts: ['user_id', 'is_default'],
    credit_cards: ['user_id', 'is_default'],
    notifications: ['user_id', 'message', 'is_read'],
    activity_logs: ['user_id', 'action', 'label'],
    user_favorites: ['user_id', 'symbol'],
};

const privilegeTables = [
    'users',
    'admins',
    'accounts',
    'positions',
    'instruments',
    'user_settings',
    'bank_accounts',
    'credit_cards',
    'kyc_submissions',
    'funding_requests',
    'transactions',
    'notifications',
    'activity_logs',
    'user_favorites',
    'instrument_categories',
    'admin_logs',
];

const printSection = (title) => {
    console.log(`\n=== ${title} ===`);
};

const run = async () => {
    try {
        const meta = await db.query(`
            SELECT
                current_database() AS database_name,
                current_user AS db_user,
                session_user AS session_user,
                version() AS version
        `);
        const info = meta.rows[0];

        printSection('Connection');
        console.log(`Database: ${info.database_name}`);
        console.log(`DB User: ${info.db_user}`);
        console.log(`Session User: ${info.session_user}`);
        console.log(`Version: ${info.version}`);

        const dbPrivileges = await db.query(`
            SELECT
                has_database_privilege(current_user, current_database(), 'CONNECT') AS can_connect,
                has_database_privilege(current_user, current_database(), 'CREATE') AS can_create_in_database,
                has_schema_privilege(current_user, 'public', 'USAGE') AS can_use_public_schema,
                has_schema_privilege(current_user, 'public', 'CREATE') AS can_create_in_public_schema
        `);

        printSection('Database Privileges');
        console.table(dbPrivileges.rows);

        const tables = await db.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        const existingTables = new Set(tables.rows.map((row) => row.table_name));

        printSection('Missing Tables');
        const missingTables = requiredTables.filter((table) => !existingTables.has(table));
        if (missingTables.length === 0) {
            console.log('None');
        } else {
            missingTables.forEach((table) => console.log(`- ${table}`));
        }

        printSection('Column Readiness');
        for (const [table, columns] of Object.entries(requiredColumns)) {
            const result = await db.query(
                `
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position
                `,
                [table]
            );
            const existingColumns = new Set(result.rows.map((row) => row.column_name));
            const missingColumns = columns.filter((column) => !existingColumns.has(column));
            console.log(`${table}: ${missingColumns.length === 0 ? 'OK' : `missing -> ${missingColumns.join(', ')}`}`);
        }

        const privilegeChecks = [];
        for (const table of privilegeTables) {
            const result = await db.query(
                `
                SELECT
                    $1 AS table_name,
                    has_table_privilege(current_user, $1, 'SELECT') AS can_select,
                    has_table_privilege(current_user, $1, 'INSERT') AS can_insert,
                    has_table_privilege(current_user, $1, 'UPDATE') AS can_update,
                    has_table_privilege(current_user, $1, 'DELETE') AS can_delete,
                    has_table_privilege(current_user, $1, 'TRUNCATE') AS can_truncate,
                    has_table_privilege(current_user, $1, 'REFERENCES') AS can_reference,
                    has_table_privilege(current_user, $1, 'TRIGGER') AS can_trigger
                `,
                [table]
            );
            privilegeChecks.push(result.rows[0]);
        }

        printSection('Table Privileges');
        console.table(privilegeChecks);

        printSection('Integration Verdict');
        if (missingTables.length > 0) {
            console.log('Schema is NOT fully integrated: one or more required tables are missing.');
        } else {
            const columnProblems = [];
            for (const [table, columns] of Object.entries(requiredColumns)) {
                const result = await db.query(
                    `
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = $1
                    `,
                    [table]
                );
                const existingColumns = new Set(result.rows.map((row) => row.column_name));
                const missingColumns = columns.filter((column) => !existingColumns.has(column));
                if (missingColumns.length > 0) {
                    columnProblems.push(`${table}: ${missingColumns.join(', ')}`);
                }
            }

            if (columnProblems.length > 0) {
                console.log('Schema is partially integrated: some required columns are missing.');
            } else {
                console.log('Schema shape looks compatible with the current backend.');
            }
        }
    } catch (error) {
        console.error('Database readiness check failed:', error);
        process.exitCode = 1;
    } finally {
        await db.pool.end();
    }
};

run();
