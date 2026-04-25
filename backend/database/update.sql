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

UPDATE admins
SET first_name = COALESCE(first_name, NULLIF(name, ''))
WHERE first_name IS NULL AND name IS NOT NULL;

UPDATE admins
SET last_name = COALESCE(last_name, '')
WHERE last_name IS NULL;

UPDATE admins
SET password_hash = COALESCE(password_hash, password)
WHERE password_hash IS NULL AND password IS NOT NULL;

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

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS category_name VARCHAR(50);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS default_price NUMERIC(18, 8);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS default_change NUMERIC(18, 2);

ALTER TABLE instruments
ADD COLUMN IF NOT EXISTS default_volume VARCHAR(50);

UPDATE positions
SET created_at = COALESCE(created_at, opened_at, CURRENT_TIMESTAMP)
WHERE created_at IS NULL;

UPDATE positions
SET updated_at = COALESCE(updated_at, created_at, opened_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

UPDATE positions
SET side = COALESCE(side, type)
WHERE side IS NULL AND type IS NOT NULL;

UPDATE positions
SET quantity = COALESCE(quantity, volume)
WHERE quantity IS NULL AND volume IS NOT NULL;

UPDATE positions
SET entry_price = COALESCE(entry_price, open_price)
WHERE entry_price IS NULL AND open_price IS NOT NULL;

UPDATE positions
SET pnl = COALESCE(pnl, profit_loss, 0)
WHERE pnl IS NULL;

UPDATE positions
SET amount = COALESCE(amount, quantity * entry_price, 0)
WHERE amount IS NULL;

UPDATE instruments
SET category_name = COALESCE(category_name, category)
WHERE category_name IS NULL AND category IS NOT NULL;

UPDATE instruments
SET default_price = COALESCE(default_price, 0)
WHERE default_price IS NULL;

UPDATE instruments
SET default_change = COALESCE(default_change, 0)
WHERE default_change IS NULL;

UPDATE instruments
SET default_volume = COALESCE(default_volume, 'N/A')
WHERE default_volume IS NULL;

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
