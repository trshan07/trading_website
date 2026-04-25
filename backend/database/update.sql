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
