const db = require('../backend/src/config/database');

async function createTradesTable() {
    console.log("🚀 Starting 'trades' table migration...");
    
    const query = `
        CREATE TABLE IF NOT EXISTS trades (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
            symbol VARCHAR(20) NOT NULL,
            side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
            type VARCHAR(20) DEFAULT 'market',
            amount DECIMAL(15,8) NOT NULL,
            entry_price DECIMAL(15,8) NOT NULL,
            exit_price DECIMAL(15,8),
            pnl DECIMAL(15,8) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for trades for performance
        CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
        CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
        CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);

        -- Create trigger for trades updated_at
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_trades_updated_at') THEN
                CREATE TRIGGER update_trades_updated_at
                    BEFORE UPDATE ON trades
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            END IF;
        END $$;
    `;

    try {
        await db.query(query);
        console.log("✅ 'trades' table created or already exists.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

createTradesTable();
