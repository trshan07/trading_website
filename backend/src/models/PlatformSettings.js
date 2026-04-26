// backend/src/models/PlatformSettings.js
const db = require('../config/database');

class PlatformSettings {
    static async ensureTable() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS platform_settings (
                key VARCHAR(100) PRIMARY KEY,
                value JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    static async getAll() {
        await this.ensureTable();
        const query = 'SELECT key, value FROM platform_settings';
        const { rows } = await db.query(query);
        
        const settings = {};
        rows.forEach(row => {
            let parsedValue = row.value;
            if (typeof parsedValue === 'string') {
                try {
                    parsedValue = JSON.parse(parsedValue);
                } catch (_) {
                    // Keep legacy plain strings as-is.
                }
            }
            settings[row.key] = parsedValue;
        });
        return settings;
    }

    static async update(key, value) {
        await this.ensureTable();
        const query = `
            INSERT INTO platform_settings (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE SET 
                value = EXCLUDED.value,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        const { rows } = await db.query(query, [key, JSON.stringify(value)]);
        return rows[0];
    }

    static async updateBatch(settings) {
        await this.ensureTable();
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            for (const [key, value] of Object.entries(settings)) {
                await client.query(`
                    INSERT INTO platform_settings (key, value)
                    VALUES ($1, $2)
                    ON CONFLICT (key) DO UPDATE SET 
                        value = EXCLUDED.value,
                        updated_at = CURRENT_TIMESTAMP
                `, [key, JSON.stringify(value)]);
            }
            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = PlatformSettings;
