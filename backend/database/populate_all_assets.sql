-- backend/database/populate_all_assets.sql

-- Clear existing to ensure clean sync
TRUNCATE TABLE instruments CASCADE;
TRUNCATE TABLE instrument_categories CASCADE;

-- 1. Insert Categories with original branding
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
('Brazilian Index', 'text-green-500', 'bg-green-50 dark:bg-green-500/10', 'border-green-100 dark:border-green-500/20');

-- 2. Insert Instruments
INSERT INTO instruments (symbol, name, category_name, default_price, default_change, default_volume) VALUES
-- Crypto
('BTCUSDT', 'Bitcoin', 'Crypto', 43250.00, 2.5, '28.4B'),
('ETHUSDT', 'Ethereum', 'Crypto', 2820.00, 1.8, '14.1B'),
('BNBUSDT', 'Binance Coin', 'Crypto', 380.00, -0.5, '1.2B'),
('SOLUSDT', 'Solana', 'Crypto', 105.00, 5.2, '3.8B'),
('ADAUSDT', 'Cardano', 'Crypto', 0.58, 1.1, '0.9B'),
-- Forex
('EURUSD', 'Euro / USD', 'Forex', 1.0875, 0.23, '3.2T'),
('GBPUSD', 'GBP / USD', 'Forex', 1.265, -0.12, '0.8T'),
('USDJPY', 'USD / JPY', 'Forex', 148.5, 0.05, '1.1T'),
-- Stocks
('AAPL', 'Apple Inc.', 'Stocks', 185.2, 1.2, '4.5B'),
('MSFT', 'Microsoft', 'Stocks', 410.5, -0.4, '2.8B'),
('TSLA', 'Tesla', 'Stocks', 195.3, 3.5, '6.1B'),
('GOOGL', 'Alphabet Inc.', 'Stocks', 141.8, 0.6, '1.9B'),
-- Indices
('SPX', 'S&P 500', 'Indices', 4850, 0.32, '—'),
('NDX', 'Nasdaq 100', 'Indices', 16800, 0.45, '—'),
('DJI', 'Dow Jones', 'Indices', 38500, 0.18, '—'),
-- Funds
('SPY', 'SPDR S&P 500 ETF', 'Funds', 484.5, 0.31, '18.2B'),
('QQQ', 'Invesco QQQ', 'Funds', 412.3, 0.42, '9.8B'),
-- Bonds
('US10Y', 'US 10-Yr Treasury', 'Bonds', 4.15, -0.02, '—'),
-- Economy
('DXY', 'US Dollar Index', 'Economy', 104.2, 0.15, '—'),
-- Options
('VIX', 'Volatility Index', 'Options', 13.5, -2.5, '—'),
-- Commodities
('XAUUSD', 'Gold', 'Commodities', 2340.5, 0.85, '42.1B'),
('XAGUSD', 'Silver', 'Commodities', 28.45, 1.2, '8.4B'),
('BRENT', 'Brent Oil', 'Commodities', 82.4, -0.6, '12.1B'),
-- Brazilian Index
('IBOV', 'BOVESPA', 'Brazilian Index', 128500, 0.45, '24.1B'),
-- Futures
('ES1!', 'S&P 500 E-Mini Future', 'Futures', 4890, 0.25, '—'),
('YM1!', 'Dow 30 Future', 'Futures', 38650, 0.15, '—'),
('CL1!', 'Crude Oil Future', 'Futures', 81.25, -0.45, '—');
