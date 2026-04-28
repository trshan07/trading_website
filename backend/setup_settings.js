const db = require('./src/config/database');

async function setupPlatformSettings() {
    console.log('=== SETTING UP PLATFORM SETTINGS ===');

    try {
        // Create table
        await db.query(`
            CREATE TABLE IF NOT EXISTS platform_settings (
                key VARCHAR(100) PRIMARY KEY,
                value JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('  platform_settings table: OK');

        // Initial settings
        const initialSettings = {
            platform_name: "Tik Trades Platform",
            support_email: "support@tiktrades.com",
            min_deposit: 100,
            max_withdrawal: 50000,
            max_credit_per_user: 50000,
            maintenance_mode: false,
            trading_enabled: true,
            deposits_enabled: true,
            withdrawals_enabled: true,
            default_leverage: "100",
            max_leverage: "500",
            default_account_type: "Standard",
            two_fa_required: true,
            email_notifications: true,
            sms_alerts: false,
            alert_triggers: {
                large_deposit: true,
                withdrawal_pending: true,
                kyc_submitted: true,
                account_suspended: false,
                failed_login: true
            }
        };

        for (const [key, value] of Object.entries(initialSettings)) {
            await db.query(`
                INSERT INTO platform_settings (key, value)
                VALUES ($1, $2)
                ON CONFLICT (key) DO NOTHING
            `, [key, JSON.stringify(value)]);
        }
        console.log('  Initial settings: OK');

    } catch (e) {
        console.error('  Setup failed:', e.message);
    }
    process.exit(0);
}

setupPlatformSettings();
