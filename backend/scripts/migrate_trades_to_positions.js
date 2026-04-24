const db = require('../src/config/database');

async function main() {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const insertQuery = `
            INSERT INTO positions (
                user_id,
                account_id,
                symbol,
                side,
                amount,
                quantity,
                entry_price,
                current_price,
                pnl,
                margin,
                status,
                close_price,
                closed_at,
                created_at,
                updated_at
            )
            SELECT
                t.user_id,
                t.account_id,
                t.symbol,
                t.side,
                t.amount,
                CASE
                    WHEN COALESCE(t.entry_price, 0) = 0 THEN 0
                    ELSE t.amount / t.entry_price
                END AS quantity,
                t.entry_price,
                COALESCE(t.exit_price, t.entry_price) AS current_price,
                COALESCE(t.pnl, 0) AS pnl,
                t.amount AS margin,
                t.status,
                t.exit_price AS close_price,
                CASE
                    WHEN t.status = 'closed' THEN COALESCE(t.updated_at, t.created_at)
                    ELSE NULL
                END AS closed_at,
                t.created_at,
                t.updated_at
            FROM trades t
            WHERE NOT EXISTS (
                SELECT 1
                FROM positions p
                WHERE p.user_id = t.user_id
                  AND p.account_id = t.account_id
                  AND p.symbol = t.symbol
                  AND p.side = t.side
                  AND p.amount = t.amount
                  AND p.entry_price = t.entry_price
                  AND p.created_at = t.created_at
            )
        `;

        const result = await client.query(insertQuery);
        await client.query('COMMIT');

        console.log(`Migrated ${result.rowCount || 0} legacy trades into positions.`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to migrate trades into positions:', error);
        process.exitCode = 1;
    } finally {
        client.release();
        await db.pool.end();
    }
}

main();
