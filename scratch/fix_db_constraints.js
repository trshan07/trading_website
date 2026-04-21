
const db = require('../backend/src/config/database');

async function fixDatabase() {
    try {
        console.log('Starting database fix...');

        // 1. Drop foreign key constraints that reference 'users' table for admin actions
        // These are likely causing 500 errors when the admin is in the 'admins' table
        
        const queries = [
            // KYC submissions
            `ALTER TABLE kyc_submissions DROP CONSTRAINT IF EXISTS kyc_submissions_reviewed_by_fkey`,
            
            // Funding requests
            `ALTER TABLE funding_requests DROP CONSTRAINT IF EXISTS funding_requests_processed_by_fkey`,
            
            // Admin logs
            `ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey`,
            
            // Re-create them without references if we want, or just leave them as integers
            // For now, removing the constraint is the safest way to unblock the UI
        ];

        for (const query of queries) {
            console.log(`Executing: ${query}`);
            await db.query(query);
        }

        console.log('✅ Database fix completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing database:', error);
        process.exit(1);
    }
}

fixDatabase();
