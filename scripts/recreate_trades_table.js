const db = require('../backend/src/config/database');

async function recreateTradesTable() {
    console.log("⚠️ WARNING: Recreating 'trades' table to fix schema mismatch...");
    
    const dropQuery = "DROP TABLE IF EXISTS trades CASCADE;";
    
    const createQuery = `
        CREATE TABLE trades (
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

        -- Create indexes for performance
        CREATE INDEX idx_trades_user_id ON trades(user_id);
        CREATE INDEX idx_trades_account_id ON trades(account_id);
        CREATE INDEX idx_trades_status ON trades(status);

        -- Add trigger for updated_at
        CREATE TRIGGER update_trades_updated_at
            BEFORE UPDATE ON trades
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
        await db.query(dropQuery);
        console.log("✅ Dropped old 'trades' table.");
        
        await db.query(createQuery);
        console.log("✅ Created new 'trades' table with correct schema.");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to recreate table:", error);
        process.exit(1);
    }
}

recreateTradesTable();
