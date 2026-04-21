const db = require('./src/config/database');

async function test() {
    try {
        console.log('Testing stats query...');
        const stats = await db.query(`
            SELECT 
                (SELECT SUM(balance) FROM accounts) as total_balance,
                (SELECT SUM(credit) FROM accounts) as total_credit,
                (SELECT COUNT(*) FROM trades) as total_trades,
                (SELECT SUM(amount) FROM trades) as total_volume
        `);
        console.log('Stats OK:', stats.rows[0]);

        console.log('Testing growth query...');
        const userGrowth = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon') as m,
                COUNT(*) as u
            FROM users
            WHERE created_at > CURRENT_DATE - INTERVAL '7 months'
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `);
        console.log('User Growth OK:', userGrowth.rows);

        const tradingVolume = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon') as m,
                SUM(amount) as v
            FROM trades
            WHERE created_at > CURRENT_DATE - INTERVAL '7 months'
            GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `);
        console.log('Trading Volume OK:', tradingVolume.rows);

    } catch (e) {
        console.error('Query failed:', e.message);
    }
    process.exit(0);
}

test();
