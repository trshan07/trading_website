const db = require('../src/config/database');
const { normalizeStoredUploadPath } = require('../src/utils/uploadPath');

const targets = [
    { table: 'bank_accounts', id: 'id', column: 'proof_file' },
    { table: 'funding_requests', id: 'id', column: 'proof_file' },
    { table: 'kyc_submissions', id: 'id', column: 'file_path' },
    { table: 'user_documents', id: 'id', column: 'file_path' }
];

async function normalizeTable(client, target) {
    const { table, id, column } = target;
    const { rows } = await client.query(
        `SELECT ${id}, ${column} FROM ${table} WHERE ${column} IS NOT NULL`
    );

    let updated = 0;

    for (const row of rows) {
        const currentValue = row[column];
        const normalizedValue = normalizeStoredUploadPath(currentValue);

        if (normalizedValue && normalizedValue !== currentValue) {
            await client.query(
                `UPDATE ${table} SET ${column} = $1 WHERE ${id} = $2`,
                [normalizedValue, row[id]]
            );
            updated += 1;
        }
    }

    return { table, updated, total: rows.length };
}

async function main() {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        const results = [];

        for (const target of targets) {
            results.push(await normalizeTable(client, target));
        }

        await client.query('COMMIT');

        console.log('Normalized upload paths:');
        for (const result of results) {
            console.log(`- ${result.table}: ${result.updated} updated out of ${result.total}`);
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to normalize upload paths:', error);
        process.exitCode = 1;
    } finally {
        client.release();
        await db.pool.end();
    }
}

main();
