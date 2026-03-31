const db = require('./src/config/database');

async function migrate() {
    const createTradesTable = `
        CREATE TABLE IF NOT EXISTS trades (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            account_id INTEGER NOT NULL,
            symbol VARCHAR(20) NOT NULL,
            side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
            type VARCHAR(20) NOT NULL DEFAULT 'market',
            amount DECIMAL NOT NULL,
            entry_price DECIMAL NOT NULL,
            exit_price DECIMAL,
            status VARCHAR(20) NOT NULL DEFAULT 'open',
            pnl DECIMAL DEFAULT 0,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
        );
    `;

    try {
        console.log('--- MIGRATING TRADES TABLE ---');
        await db.query(createTradesTable);
        console.log('✅ TRADES table created or already exists.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
