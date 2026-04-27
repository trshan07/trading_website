-- 1. Instrument Categories
CREATE TABLE IF NOT EXISTS instrument_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    text_color VARCHAR(50),
    bg_color VARCHAR(50),
    border_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE instrument_categories
ADD COLUMN IF NOT EXISTS text_color VARCHAR(50);

ALTER TABLE instrument_categories
ADD COLUMN IF NOT EXISTS bg_color VARCHAR(50);

ALTER TABLE instrument_categories
ADD COLUMN IF NOT EXISTS border_color VARCHAR(50);

ALTER TABLE instrument_categories
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Instruments
CREATE TABLE IF NOT EXISTS instruments (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_name VARCHAR(50) REFERENCES instrument_categories(name) ON DELETE SET NULL,
    default_price NUMERIC(18, 8),
    default_change NUMERIC(18, 2),
    default_volume VARCHAR(50),
    provider VARCHAR(20),
    quote_symbol VARCHAR(50),
    trading_view_symbol VARCHAR(50),
    use_bid_ask BOOLEAN,
    price_precision INTEGER,
    spread NUMERIC(18, 8),
    contract_size NUMERIC(18, 8),
    lot_step NUMERIC(18, 8),
    min_lot NUMERIC(18, 8),
    quantity_label VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS category_name VARCHAR(50);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS default_price NUMERIC(18, 8);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS default_change NUMERIC(18, 2);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS default_volume VARCHAR(50);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS provider VARCHAR(20);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS quote_symbol VARCHAR(50);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS trading_view_symbol VARCHAR(50);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS use_bid_ask BOOLEAN;

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS price_precision INTEGER;

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS spread NUMERIC(18, 8);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS contract_size NUMERIC(18, 8);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS lot_step NUMERIC(18, 8);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS min_lot NUMERIC(18, 8);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS quantity_label VARCHAR(50);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. Notifications History
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Activity Logs (Journal Stream)
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'EXECUTION', 'FUNDING', 'SECURITY', 'NETWORK', 'ASSET'
    label VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS label VARCHAR(255);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'activity_logs'
          AND column_name = 'details'
    ) THEN
        UPDATE activity_logs
        SET label = LEFT(COALESCE(label, details, action, 'Activity'), 255)
        WHERE label IS NULL;
    ELSE
        UPDATE activity_logs
        SET label = LEFT(COALESCE(label, action, 'Activity'), 255)
        WHERE label IS NULL;
    END IF;
END $$;

ALTER TABLE activity_logs
ALTER COLUMN label SET NOT NULL;

-- 5. User Watchlist (Favorites)
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol)
);

-- Seeding Categories
INSERT INTO instrument_categories (name, text_color, bg_color, border_color) VALUES
('Crypto', 'text-amber-500', 'bg-amber-50 dark:bg-amber-500/10', 'border-amber-100 dark:border-amber-500/20'),
('Forex', 'text-blue-500', 'bg-blue-50 dark:bg-blue-500/10', 'border-blue-100 dark:border-blue-500/20'),
('Stocks', 'text-emerald-500', 'bg-emerald-50 dark:bg-emerald-500/10', 'border-emerald-100 dark:border-emerald-500/20'),
('Indices', 'text-purple-500', 'bg-purple-50 dark:bg-purple-500/10', 'border-purple-100 dark:border-purple-500/20'),
('Funds', 'text-indigo-500', 'bg-indigo-50 dark:bg-indigo-500/10', 'border-indigo-100 dark:border-indigo-500/20'),
('Bonds', 'text-slate-500', 'bg-slate-50 dark:bg-slate-800', 'border-slate-100 dark:border-slate-700'),
('Economy', 'text-gold-500', 'bg-gold-50 dark:bg-gold-500/10', 'border-gold-100 dark:border-gold-500/20'),
('Options', 'text-rose-500', 'bg-rose-50 dark:bg-rose-500/10', 'border-rose-100 dark:border-rose-500/20'),
('Commodities', 'text-orange-500', 'bg-orange-50 dark:bg-orange-500/10', 'border-orange-100 dark:border-orange-500/20'),
('Futures', 'text-cyan-500', 'bg-cyan-50 dark:bg-cyan-500/10', 'border-cyan-100 dark:border-cyan-500/20'),
('Brazilian Index', 'text-green-500', 'bg-green-50 dark:bg-green-500/10', 'border-green-100 dark:border-green-500/20')
ON CONFLICT (name) DO NOTHING;

-- Seeding Instruments
INSERT INTO instruments (
    symbol, name, category_name, default_price, default_change, default_volume,
    provider, quote_symbol, trading_view_symbol, use_bid_ask, price_precision,
    spread, contract_size, lot_step, min_lot, quantity_label
) VALUES
('BTCUSDT', 'Bitcoin', 'Crypto', 43250.00, 2.5, '$28.4B', 'binance', 'BTCUSDT', 'BINANCE:BTCUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('ETHUSDT', 'Ethereum', 'Crypto', 2820.00, 1.8, '$14.1B', 'binance', 'ETHUSDT', 'BINANCE:ETHUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('BNBUSDT', 'Binance Coin', 'Crypto', 380.00, -0.5, '$1.2B', 'binance', 'BNBUSDT', 'BINANCE:BNBUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('EURUSD', 'Euro / USD', 'Forex', 1.0875, 0.23, '$3.2T', 'yahoo', 'EURUSD=X', 'FX:EURUSD', FALSE, 5, 0.0002, 100000, 0.01, 0.01, 'units'),
('GBPUSD', 'GBP / USD', 'Forex', 1.265, -0.12, '$0.8T', 'yahoo', 'GBPUSD=X', 'FX:GBPUSD', FALSE, 5, 0.0002, 100000, 0.01, 0.01, 'units'),
('AAPL', 'Apple Inc.', 'Stocks', 185.2, 1.2, '$4.5B', 'yahoo', 'AAPL', 'NASDAQ:AAPL', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('TSLA', 'Tesla', 'Stocks', 195.3, 3.5, '$6.1B', 'yahoo', 'TSLA', 'NASDAQ:TSLA', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('SPX', 'S&P 500', 'Indices', 4850, 0.32, 'N/A', 'yahoo', '^GSPC', 'SP:SPX', FALSE, 2, 1, 1, 0.01, 0.01, 'index units'),
('XAUUSD', 'Gold', 'Commodities', 2340.5, 0.85, '$42.1B', 'yahoo', 'XAUUSD=X', 'OANDA:XAUUSD', FALSE, 3, 0.1, 100, 0.01, 0.01, 'units'),
('BRENT', 'Brent Oil', 'Commodities', 82.4, -0.6, '$12.1B', 'yahoo', 'BZ=F', 'ICEEUR:BRN1!', FALSE, 3, 0.05, 100, 0.01, 0.01, 'units')
ON CONFLICT (symbol) DO NOTHING;
