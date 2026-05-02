ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS chart_preferences JSONB DEFAULT '{}'::jsonb;

ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email": true, "browser": true}'::jsonb;

ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(100);

ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS iban VARCHAR(50);

ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS beneficiary_name VARCHAR(100);

ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS relationship VARCHAR(100);

ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS proof_file TEXT;

ALTER TABLE credit_cards
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

ALTER TABLE credit_cards
ADD COLUMN IF NOT EXISTS billing_address TEXT;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS balance_before NUMERIC(18, 8) DEFAULT 0;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS balance_after NUMERIC(18, 8) DEFAULT 0;

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS reference_id INTEGER;

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(18, 8),
    quantity NUMERIC(18, 8),
    entry_price NUMERIC(18, 8),
    leverage NUMERIC(10, 2) DEFAULT 100,
    take_profit NUMERIC(18, 8),
    stop_loss NUMERIC(18, 8),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS leverage NUMERIC(10, 2) DEFAULT 100;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS take_profit NUMERIC(18, 8);

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stop_loss NUMERIC(18, 8);

ALTER TABLE admins
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);

ALTER TABLE admins
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

ALTER TABLE admins
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

ALTER TABLE admins
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

ALTER TABLE admins
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

DO $$ 
BEGIN
    -- Migrate admins data if legacy columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='name') THEN
        UPDATE admins
        SET first_name = COALESCE(first_name, NULLIF(name, ''))
        WHERE first_name IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='password') THEN
        UPDATE admins
        SET password_hash = COALESCE(password_hash, password)
        WHERE password_hash IS NULL;
    END IF;
END $$;

UPDATE admins
SET last_name = COALESCE(last_name, '')
WHERE last_name IS NULL;

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS side VARCHAR(10);

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS amount NUMERIC(18, 8);

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS quantity NUMERIC(18, 8);

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS entry_price NUMERIC(18, 8);

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS pnl NUMERIC(18, 8) DEFAULT 0;

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS margin NUMERIC(18, 8) DEFAULT 0;

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS close_price NUMERIC(18, 8);

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS leverage NUMERIC(10, 2) DEFAULT 100;

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS take_profit NUMERIC(18, 8);

ALTER TABLE positions
ADD COLUMN IF NOT EXISTS stop_loss NUMERIC(18, 8);

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
ADD COLUMN IF NOT EXISTS data_symbol VARCHAR(50);

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

CREATE TABLE IF NOT EXISTS market_quotes (
    symbol VARCHAR(20) PRIMARY KEY,
    price NUMERIC(18, 8) NOT NULL,
    bid NUMERIC(18, 8),
    ask NUMERIC(18, 8),
    change NUMERIC(18, 8) DEFAULT 0,
    volume TEXT,
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_market_quotes_updated_at ON market_quotes(updated_at DESC);

DO $$ 
BEGIN
    -- Migrate positions data if legacy columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='positions' AND column_name='opened_at') THEN
        UPDATE positions
        SET created_at = COALESCE(created_at, opened_at, CURRENT_TIMESTAMP)
        WHERE created_at IS NULL;
        
        UPDATE positions
        SET updated_at = COALESCE(updated_at, created_at, opened_at, CURRENT_TIMESTAMP)
        WHERE updated_at IS NULL;
    ELSE
        UPDATE positions
        SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP)
        WHERE created_at IS NULL;
        
        UPDATE positions
        SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
        WHERE updated_at IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='positions' AND column_name='type') THEN
        UPDATE positions
        SET side = COALESCE(side, type)
        WHERE side IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='positions' AND column_name='volume') THEN
        UPDATE positions
        SET quantity = COALESCE(quantity, volume)
        WHERE quantity IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='positions' AND column_name='open_price') THEN
        UPDATE positions
        SET entry_price = COALESCE(entry_price, open_price)
        WHERE entry_price IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='positions' AND column_name='profit_loss') THEN
        UPDATE positions
        SET pnl = COALESCE(pnl, profit_loss, 0)
        WHERE pnl IS NULL;
    ELSE
        UPDATE positions
        SET pnl = COALESCE(pnl, 0)
        WHERE pnl IS NULL;
    END IF;
    
    -- Migrate instruments data if legacy column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='instruments' AND column_name='category') THEN
        UPDATE instruments
        SET category_name = COALESCE(category_name, category)
        WHERE category_name IS NULL;
    END IF;
END $$;

UPDATE positions
SET amount = COALESCE(amount, quantity * entry_price, 0)
WHERE amount IS NULL;

UPDATE instruments
SET default_price = COALESCE(default_price, 0)
WHERE default_price IS NULL;

UPDATE instruments
SET default_change = COALESCE(default_change, 0)
WHERE default_change IS NULL;

UPDATE instruments
SET default_volume = COALESCE(default_volume, 'N/A')
WHERE default_volume IS NULL;

INSERT INTO instruments (
    symbol, name, category_name, default_price, default_change, default_volume,
    provider, quote_symbol, data_symbol, trading_view_symbol, use_bid_ask, price_precision,
    spread, contract_size, lot_step, min_lot, quantity_label, is_active
) VALUES
('BTCUSDT', 'Bitcoin', 'Crypto', 43250.00, 2.5, '28.4B', 'twelvedata', 'BTCUSDT', 'BTC/USD', 'BINANCE:BTCUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins', TRUE),
('ETHUSDT', 'Ethereum', 'Crypto', 2820.00, 1.8, '14.1B', 'twelvedata', 'ETHUSDT', 'ETH/USD', 'BINANCE:ETHUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins', TRUE),
('BNBUSDT', 'Binance Coin', 'Crypto', 380.00, -0.5, '1.2B', 'twelvedata', 'BNBUSDT', 'BNB/USD', 'BINANCE:BNBUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins', TRUE),
('SOLUSDT', 'Solana', 'Crypto', 105.00, 5.2, '3.8B', 'twelvedata', 'SOLUSDT', 'SOL/USD', 'BINANCE:SOLUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins', TRUE),
('ADAUSDT', 'Cardano', 'Crypto', 0.58, 1.1, '0.9B', 'twelvedata', 'ADAUSDT', 'ADA/USD', 'BINANCE:ADAUSDT', TRUE, 4, NULL, 1, 0.001, 0.001, 'coins', TRUE),
('EURUSD', 'Euro / USD', 'Forex', 1.0875, 0.23, '3.2T', 'twelvedata', 'EURUSD=X', 'EUR/USD', 'FX:EURUSD', FALSE, 5, 0.0002, 100000, 0.01, 0.01, 'units', TRUE),
('GBPUSD', 'GBP / USD', 'Forex', 1.265, -0.12, '0.8T', 'twelvedata', 'GBPUSD=X', 'GBP/USD', 'FX:GBPUSD', FALSE, 5, 0.0002, 100000, 0.01, 0.01, 'units', TRUE),
('USDJPY', 'USD / JPY', 'Forex', 148.5, 0.05, '1.1T', 'twelvedata', 'USDJPY=X', 'USD/JPY', 'FX:USDJPY', FALSE, 3, 0.02, 100000, 0.01, 0.01, 'units', TRUE),
('AUDUSD', 'AUD / USD', 'Forex', 0.6584, 0.09, '0.6T', 'twelvedata', 'AUDUSD=X', 'AUD/USD', 'FX:AUDUSD', FALSE, 5, 0.00014, 100000, 0.01, 0.01, 'units', TRUE),
('USDCAD', 'USD / CAD', 'Forex', 1.3621, -0.03, '0.5T', 'twelvedata', 'USDCAD=X', 'USD/CAD', 'FX:USDCAD', FALSE, 5, 0.00016, 100000, 0.01, 0.01, 'units', TRUE),
('USDCHF', 'USD / CHF', 'Forex', 0.9114, 0.04, '0.4T', 'twelvedata', 'USDCHF=X', 'USD/CHF', 'FX:USDCHF', FALSE, 5, 0.00014, 100000, 0.01, 0.01, 'units', TRUE),
('NZDUSD', 'NZD / USD', 'Forex', 0.6015, 0.06, '0.2T', 'twelvedata', 'NZDUSD=X', 'NZD/USD', 'FX:NZDUSD', FALSE, 5, 0.00016, 100000, 0.01, 0.01, 'units', TRUE),
('AAPL', 'Apple Inc.', 'Stocks', 185.2, 1.2, '4.5B', 'twelvedata', 'AAPL', 'AAPL', 'NASDAQ:AAPL', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares', TRUE),
('MSFT', 'Microsoft', 'Stocks', 410.5, -0.4, '2.8B', 'twelvedata', 'MSFT', 'MSFT', 'NASDAQ:MSFT', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares', TRUE),
('TSLA', 'Tesla', 'Stocks', 195.3, 3.5, '6.1B', 'twelvedata', 'TSLA', 'TSLA', 'NASDAQ:TSLA', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares', TRUE),
('GOOGL', 'Alphabet Inc.', 'Stocks', 141.8, 0.6, '1.9B', 'twelvedata', 'GOOGL', 'GOOGL', 'NASDAQ:GOOGL', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares', TRUE),
('SPX', 'S&P 500', 'Indices', 4850, 0.32, 'N/A', 'twelvedata', '^GSPC', 'SPX', 'SP:SPX', FALSE, 2, 1, 10, 0.01, 0.01, 'index units', TRUE),
('NDX', 'Nasdaq 100', 'Indices', 16800, 0.45, 'N/A', 'twelvedata', '^NDX', 'NDX', 'NASDAQ:NDX', FALSE, 2, 1, 10, 0.01, 0.01, 'index units', TRUE),
('DJI', 'Dow Jones', 'Indices', 38500, 0.18, 'N/A', 'twelvedata', '^DJI', 'DJI', 'DJ:DJI', FALSE, 2, 3, 10, 0.01, 0.01, 'index units', TRUE),
('SPY', 'SPDR S&P 500 ETF', 'Funds', 484.5, 0.31, '18.2B', 'twelvedata', 'SPY', 'SPY', 'AMEX:SPY', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares', TRUE),
('QQQ', 'Invesco QQQ', 'Funds', 412.3, 0.42, '9.8B', 'twelvedata', 'QQQ', 'QQQ', 'NASDAQ:QQQ', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares', TRUE),
('US10Y', 'US 10-Yr Treasury', 'Bonds', 4.15, -0.02, 'N/A', 'twelvedata', '^TNX', 'US10Y', 'TVC:US10Y', FALSE, 3, 0.01, 1000, 0.01, 0.01, 'contracts', TRUE),
('DXY', 'US Dollar Index', 'Economy', 104.2, 0.15, 'N/A', 'twelvedata', 'DX-Y.NYB', 'DXY', 'TVC:DXY', FALSE, 3, 0.01, 1000, 0.01, 0.01, 'contracts', TRUE),
('VIX', 'Volatility Index', 'Options', 13.5, -2.5, 'N/A', 'twelvedata', '^VIX', 'VIX', 'CBOE:VIX', FALSE, 2, 0.01, 100, 0.01, 0.01, 'contracts', TRUE),
('XAUUSD', 'Gold', 'Commodities', 2340.5, 0.85, '42.1B', 'twelvedata', 'XAUUSD=X', 'XAU/USD', 'OANDA:XAUUSD', FALSE, 2, 0.42, 100, 0.01, 0.01, 'oz', TRUE),
('XAGUSD', 'Silver', 'Commodities', 28.45, 1.2, '8.4B', 'twelvedata', 'XAGUSD=X', 'XAG/USD', 'OANDA:XAGUSD', FALSE, 3, 0.094, 5000, 0.01, 0.01, 'oz', TRUE),
('BRENT', 'Brent Oil', 'Commodities', 82.4, -0.6, '12.1B', 'twelvedata', 'BZ=F', 'BRENT', 'ICEEUR:BRN1!', FALSE, 3, 0.08, 1000, 0.01, 0.01, 'bbl', TRUE),
('IBOV', 'BOVESPA', 'Brazilian Index', 128500, 0.45, '24.1B', 'twelvedata', '^BVSP', 'IBOV', 'BMFBOVESPA:IBOV', FALSE, 2, 15, 1, 0.01, 0.01, 'index units', TRUE),
('ES1!', 'S&P 500 E-Mini Future', 'Futures', 4890, 0.25, 'N/A', 'twelvedata', 'ES=F', 'ES1!', 'CME_MINI:ES1!', FALSE, 2, 0.5, 50, 0.01, 0.01, 'contracts', TRUE),
('YM1!', 'Dow 30 Future', 'Futures', 38650, 0.15, 'N/A', 'twelvedata', 'YM=F', 'YM1!', 'CBOT_MINI:YM1!', FALSE, 2, 5, 5, 0.01, 0.01, 'contracts', TRUE),
('CL1!', 'Crude Oil Future', 'Futures', 81.25, -0.45, 'N/A', 'twelvedata', 'CL=F', 'CL1!', 'NYMEX:CL1!', FALSE, 3, 0.04, 1000, 0.01, 0.01, 'bbl', TRUE)
ON CONFLICT (symbol) DO UPDATE SET
    name = EXCLUDED.name,
    category_name = COALESCE(instruments.category_name, EXCLUDED.category_name),
    default_price = COALESCE(instruments.default_price, EXCLUDED.default_price),
    default_change = COALESCE(instruments.default_change, EXCLUDED.default_change),
    default_volume = COALESCE(instruments.default_volume, EXCLUDED.default_volume),
    provider = COALESCE(instruments.provider, EXCLUDED.provider),
    quote_symbol = COALESCE(instruments.quote_symbol, EXCLUDED.quote_symbol),
    data_symbol = COALESCE(instruments.data_symbol, EXCLUDED.data_symbol),
    trading_view_symbol = COALESCE(instruments.trading_view_symbol, EXCLUDED.trading_view_symbol),
    use_bid_ask = COALESCE(instruments.use_bid_ask, EXCLUDED.use_bid_ask),
    price_precision = COALESCE(instruments.price_precision, EXCLUDED.price_precision),
    spread = COALESCE(instruments.spread, EXCLUDED.spread),
    contract_size = COALESCE(instruments.contract_size, EXCLUDED.contract_size),
    lot_step = COALESCE(instruments.lot_step, EXCLUDED.lot_step),
    min_lot = COALESCE(instruments.min_lot, EXCLUDED.min_lot),
    quantity_label = COALESCE(instruments.quantity_label, EXCLUDED.quantity_label);

CREATE TABLE IF NOT EXISTS instrument_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    text_color VARCHAR(50),
    bg_color VARCHAR(50),
    border_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
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

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'info',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    price NUMERIC(18, 8) NOT NULL,
    condition VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
