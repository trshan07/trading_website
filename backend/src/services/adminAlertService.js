const db = require('../config/database');
const PlatformSettings = require('../models/PlatformSettings');
const { sendAdminAlertEmail } = require('./emailService');

const sendAdminAlert = async (trigger, title, message) => {
    try {
        const settings = await PlatformSettings.getAll();
        if (settings.email_notifications !== true || settings.alert_triggers?.[trigger] !== true) return;
        const { rows } = await db.query(`
            SELECT email FROM admins WHERE is_active = true
            UNION
            SELECT email FROM users WHERE is_active = true AND role IN ('admin', 'super_admin')
        `);
        await Promise.allSettled(rows.filter(({ email }) => email).map(({ email }) =>
            sendAdminAlertEmail({ to: email, title, message })
        ));
    } catch (error) {
        console.error(`Admin alert failed (${trigger}):`, error.message);
    }
};

module.exports = { sendAdminAlert };
