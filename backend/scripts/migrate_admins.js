
const db = require('../src/config/database');
require('dotenv').config();

const migrateAdmins = async () => {
    try {
        console.log('🚀 Starting Admin Migration...');

        // 1. Create admins table
        console.log('Creating admins table...');
        await db.query('DROP TABLE IF EXISTS admins');
        await db.query(`
            CREATE TABLE admins (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(50),
                country VARCHAR(100),
                role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Admins table ready.');

        // 2. Move existing admins from users to admins
        console.log('Moving existing admins...');
        const { rows: adminsToMove } = await db.query(`
            SELECT email, password_hash, first_name, last_name, phone, country, role, is_active 
            FROM users 
            WHERE role IN ('admin', 'super_admin')
        `);

        console.log(`Found ${adminsToMove.length} admins to migrate.`);

        for (const admin of adminsToMove) {
            await db.query(`
                INSERT INTO admins (email, password_hash, first_name, last_name, phone, country, role, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
            `, [admin.email, admin.password_hash, admin.first_name, admin.last_name, admin.phone, admin.country, admin.role, admin.is_active]);
            console.log(`Migrated: ${admin.email}`);
        }

        // 3. Remove admins from users table
        if (adminsToMove.length > 0) {
            await db.query(`
                DELETE FROM users 
                WHERE role IN ('admin', 'super_admin')
            `);
            console.log('✅ Old admin records removed from users table.');
        }

        console.log('✨ Migration completed successfully.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit(0);
    }
};

migrateAdmins();
