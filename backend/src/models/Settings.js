// backend/src/models/Settings.js
const db = require('../config/database');

class Settings {
    static async findByUserId(userId) {
        const query = 'SELECT * FROM user_settings WHERE user_id = $1';
        const { rows } = await db.query(query, [userId]);
        
        if (rows.length === 0) {
            // Create default settings if none exist
            return this.createDefault(userId);
        }
        return rows[0];
    }

    static async createDefault(userId) {
        const query = `
            INSERT INTO user_settings (user_id, theme, chart_preferences, notification_settings)
            VALUES ($1, 'dark', '{}', '{"email": true, "browser": true}')
            ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const { rows } = await db.query(query, [userId]);
        return rows[0];
    }

    static async update(userId, updateData) {
        const { theme, chartPreferences, notificationSettings } = updateData;
        
        const query = `
            INSERT INTO user_settings (user_id, theme, chart_preferences, notification_settings)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id) DO UPDATE SET 
                theme = EXCLUDED.theme,
                chart_preferences = EXCLUDED.chart_preferences,
                notification_settings = EXCLUDED.notification_settings,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const values = [
            userId, 
            theme || 'dark', 
            chartPreferences ? JSON.stringify(chartPreferences) : '{}', 
            notificationSettings ? JSON.stringify(notificationSettings) : '{"email": true, "browser": true}'
        ];
        
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = Settings;
