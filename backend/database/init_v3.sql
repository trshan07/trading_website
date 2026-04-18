-- 1. Instrument Categories
CREATE TABLE IF NOT EXISTS instrument_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    text_color VARCHAR(50),
    bg_color VARCHAR(50),
    border_color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Instruments
CREATE TABLE IF NOT EXISTS instruments (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_name VARCHAR(50) REFERENCES instrument_categories(name) ON DELETE SET NULL,
    default_price NUMERIC(18, 8),
    default_change NUMERIC(18, 2),
    default_volume VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
INSERT INTO instruments (symbol, name, category_name, default_price, default_change, default_volume) VALUES
('BTCUSDT', 'Bitcoin', 'Crypto', 43250.00, 2.5, '$28.4B'),
('ETHUSDT', 'Ethereum', 'Crypto', 2820.00, 1.8, '$14.1B'),
('BNBUSDT', 'Binance Coin', 'Crypto', 380.00, -0.5, '$1.2B'),
('EURUSD', 'Euro / USD', 'Forex', 1.0875, 0.23, '$3.2T'),
('GBPUSD', 'GBP / USD', 'Forex', 1.265, -0.12, '$0.8T'),
('AAPL', 'Apple Inc.', 'Stocks', 185.2, 1.2, '$4.5B'),
('TSLA', 'Tesla', 'Stocks', 195.3, 3.5, '$6.1B'),
('SPX', 'S&P 500', 'Indices', 4850, 0.32, '—'),
('XAUUSD', 'Gold', 'Commodities', 2340.5, 0.85, '$42.1B'),
('BRENT', 'Brent Oil', 'Commodities', 82.4, -0.6, '$12.1B')
ON CONFLICT (symbol) DO NOTHING;
