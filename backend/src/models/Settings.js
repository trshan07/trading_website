// backend/src/models/Settings.js
const db = require('../config/database');
const { isMissingColumnError, isMissingRelationError } = require('../utils/dbCompat');

class Settings {
    static async findByUserId(userId) {
        try {
            const query = 'SELECT * FROM user_settings WHERE user_id = $1';
            const { rows } = await db.query(query, [userId]);

            if (rows.length === 0) {
                return this.createDefault(userId);
            }
            return rows[0];
        } catch (error) {
            if (isMissingRelationError(error) || isMissingColumnError(error)) {
                console.warn('Settings schema mismatch detected, returning fallback settings:', error.message);
                return this.getFallbackSettings(userId);
            }
            throw error;
        }
    }

    static async createDefault(userId) {
        try {
            const query = `
                INSERT INTO user_settings (user_id, theme, chart_preferences, notification_settings)
                VALUES ($1, 'dark', '{}', '{"email": true, "browser": true}')
                ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;
            const { rows } = await db.query(query, [userId]);
            return rows[0];
        } catch (error) {
            if (isMissingColumnError(error)) {
                const legacyQuery = `
                    INSERT INTO user_settings (user_id, theme, chart_preferences)
                    VALUES ($1, 'dark', '{}')
                    ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                    RETURNING *
                `;
                const { rows } = await db.query(legacyQuery, [userId]);
                return this.normalizeSettings(rows[0]);
            }
            if (isMissingRelationError(error)) {
                return this.getFallbackSettings(userId);
            }
            throw error;
        }
    }

    static async update(userId, updateData) {
        const { theme, chartPreferences, notificationSettings } = updateData;

        const values = [
            userId,
            theme || 'dark',
            chartPreferences ? JSON.stringify(chartPreferences) : '{}',
            notificationSettings ? JSON.stringify(notificationSettings) : '{"email": true, "browser": true}'
        ];

        try {
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
            const { rows } = await db.query(query, values);
            return rows[0];
        } catch (error) {
            if (isMissingColumnError(error)) {
                const legacyQuery = `
                    INSERT INTO user_settings (user_id, theme, chart_preferences)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id) DO UPDATE SET 
                        theme = EXCLUDED.theme,
                        chart_preferences = EXCLUDED.chart_preferences,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING *
                `;
                const { rows } = await db.query(legacyQuery, values.slice(0, 3));
                return this.normalizeSettings(rows[0], notificationSettings);
            }
            if (isMissingRelationError(error)) {
                return this.getFallbackSettings(userId, {
                    theme,
                    chart_preferences: chartPreferences,
                    notification_settings: notificationSettings,
                });
            }
            throw error;
        }
    }

    static normalizeSettings(row = {}, notificationSettingsOverride) {
        return {
            ...row,
            theme: row?.theme || 'dark',
            chart_preferences: row?.chart_preferences || {},
            notification_settings:
                row?.notification_settings ||
                notificationSettingsOverride ||
                { email: true, browser: true },
        };
    }

    static getFallbackSettings(userId, overrides = {}) {
        return this.normalizeSettings({
            id: null,
            user_id: userId,
            created_at: null,
            updated_at: null,
            ...overrides,
        });
    }
}

module.exports = Settings;
