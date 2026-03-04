-- database/schema.sql

-- database/schema.sql
-- Create database
CREATE DATABASE trade_db;

-- Connect to database
\c trade_db;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    country VARCHAR(100),
    date_of_birth DATE,
    account_type VARCHAR(50) DEFAULT 'standard',
    balance DECIMAL(15, 2) DEFAULT 0.00,
    equity DECIMAL(15, 2) DEFAULT 0.00,
    margin_used DECIMAL(15, 2) DEFAULT 0.00,
    free_margin DECIMAL(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    role VARCHAR(50) DEFAULT 'client',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trading accounts table
CREATE TABLE trading_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(50),
    leverage INTEGER DEFAULT 100,
    currency VARCHAR(10) DEFAULT 'USD',
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades table
CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES trading_accounts(id),
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('buy', 'sell')),
    volume DECIMAL(10, 2) NOT NULL,
    open_price DECIMAL(15, 5) NOT NULL,
    close_price DECIMAL(15, 5),
    stop_loss DECIMAL(15, 5),
    take_profit DECIMAL(15, 5),
    profit_loss DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'open',
    open_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    close_time TIMESTAMP,
    swap DECIMAL(10, 2) DEFAULT 0,
    commission DECIMAL(10, 2) DEFAULT 0
);

-- Deposit requests table
CREATE TABLE deposit_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    proof_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by INTEGER REFERENCES users(id)
);

-- Withdrawal requests table
CREATE TABLE withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    withdrawal_method VARCHAR(50),
    account_details TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by INTEGER REFERENCES users(id)
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('deposit', 'withdrawal', 'trade', 'adjustment')),
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    status VARCHAR(20),
    reference_id INTEGER,
    reference_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin logs table
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data table
CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    bid DECIMAL(15, 5),
    ask DECIMAL(15, 5),
    high DECIMAL(15, 5),
    low DECIMAL(15, 5),
    volume INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_market_data_symbol_timestamp ON market_data(symbol, timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();