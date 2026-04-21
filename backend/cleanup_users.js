const db = require('./src/config/database');

async function cleanup() {
    try {
        console.log('--- Database Cleanup Started ---');

        // 1. Identify users to delete
        const usersToCleanup = await db.query(`
            SELECT id, email FROM users 
            WHERE email ILIKE 'guest_%' 
               OR email ILIKE 'testuser_%' 
               OR first_name ILIKE 'Guest%' 
               OR first_name ILIKE 'Test%'
        `);

        const userIds = usersToCleanup.rows.map(u => u.id);
        
        if (userIds.length === 0) {
            console.log('No guest or test users found.');
            process.exit(0);
        }

        console.log(`Found ${userIds.length} users to remove:`, usersToCleanup.rows.map(u => u.email));

        const idsStr = userIds.join(',');

        // 2. Delete related data in order
        console.log('Deleting notifications...');
        await db.query(`DELETE FROM notifications WHERE user_id IN (${idsStr})`);

        console.log('Deleting activity logs...');
        await db.query(`DELETE FROM activity_logs WHERE user_id IN (${idsStr})`);

        console.log('Deleting price alerts...');
        await db.query(`DELETE FROM price_alerts WHERE user_id IN (${idsStr})`);

        console.log('Deleting KYC submissions...');
        await db.query(`DELETE FROM kyc_submissions WHERE user_id IN (${idsStr})`);

        console.log('Deleting transactions...');
        await db.query(`DELETE FROM transactions WHERE user_id IN (${idsStr})`);

        console.log('Deleting positions...');
        await db.query(`DELETE FROM positions WHERE user_id IN (${idsStr})`);

        console.log('Deleting orders...');
        await db.query(`DELETE FROM orders WHERE user_id IN (${idsStr})`);

        console.log('Deleting legacy trades...');
        await db.query(`DELETE FROM trades WHERE user_id IN (${idsStr})`);

        console.log('Deleting funding requests...');
        await db.query(`DELETE FROM funding_requests WHERE user_id IN (${idsStr})`);

        console.log('Deleting accounts...');
        await db.query(`DELETE FROM accounts WHERE user_id IN (${idsStr})`);

        console.log('Deleting users...');
        await db.query(`DELETE FROM users WHERE id IN (${idsStr})`);

        console.log('--- Cleanup Completed Successfully ---');
    } catch (error) {
        console.error('Cleanup failed:', error.message);
    }
    process.exit(0);
}

cleanup();
