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
INSERT INTO instruments (
    symbol, name, category_name, default_price, default_change, default_volume,
    provider, quote_symbol, trading_view_symbol, use_bid_ask, price_precision,
    spread, contract_size, lot_step, min_lot, quantity_label
) VALUES
-- Crypto
('BTCUSDT', 'Bitcoin', 'Crypto', 43250.00, 2.5, '28.4B', 'binance', 'BTCUSDT', 'BINANCE:BTCUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('ETHUSDT', 'Ethereum', 'Crypto', 2820.00, 1.8, '14.1B', 'binance', 'ETHUSDT', 'BINANCE:ETHUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('BNBUSDT', 'Binance Coin', 'Crypto', 380.00, -0.5, '1.2B', 'binance', 'BNBUSDT', 'BINANCE:BNBUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('SOLUSDT', 'Solana', 'Crypto', 105.00, 5.2, '3.8B', 'binance', 'SOLUSDT', 'BINANCE:SOLUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('ADAUSDT', 'Cardano', 'Crypto', 0.58, 1.1, '0.9B', 'binance', 'ADAUSDT', 'BINANCE:ADAUSDT', TRUE, 4, NULL, 1, 0.001, 0.001, 'coins'),
-- Forex
('EURUSD', 'Euro / USD', 'Forex', 1.0875, 0.23, '3.2T', 'yahoo', 'EURUSD=X', 'FX:EURUSD', FALSE, 5, 0.0002, 100000, 0.01, 0.01, 'units'),
('GBPUSD', 'GBP / USD', 'Forex', 1.265, -0.12, '0.8T', 'yahoo', 'GBPUSD=X', 'FX:GBPUSD', FALSE, 5, 0.0002, 100000, 0.01, 0.01, 'units'),
('USDJPY', 'USD / JPY', 'Forex', 148.5, 0.05, '1.1T', 'yahoo', 'USDJPY=X', 'FX:USDJPY', FALSE, 3, 0.02, 100000, 0.01, 0.01, 'units'),
-- Stocks
('AAPL', 'Apple Inc.', 'Stocks', 185.2, 1.2, '4.5B', 'yahoo', 'AAPL', 'NASDAQ:AAPL', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('MSFT', 'Microsoft', 'Stocks', 410.5, -0.4, '2.8B', 'yahoo', 'MSFT', 'NASDAQ:MSFT', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('TSLA', 'Tesla', 'Stocks', 195.3, 3.5, '6.1B', 'yahoo', 'TSLA', 'NASDAQ:TSLA', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('GOOGL', 'Alphabet Inc.', 'Stocks', 141.8, 0.6, '1.9B', 'yahoo', 'GOOGL', 'NASDAQ:GOOGL', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
-- Indices
('SPX', 'S&P 500', 'Indices', 4850, 0.32, 'N/A', 'yahoo', '^GSPC', 'SP:SPX', FALSE, 2, 1, 1, 0.01, 0.01, 'index units'),
('NDX', 'Nasdaq 100', 'Indices', 16800, 0.45, 'N/A', 'yahoo', '^NDX', 'NASDAQ:NDX', FALSE, 2, 1, 1, 0.01, 0.01, 'index units'),
('DJI', 'Dow Jones', 'Indices', 38500, 0.18, 'N/A', 'yahoo', '^DJI', 'DJ:DJI', FALSE, 2, 1, 1, 0.01, 0.01, 'index units'),
-- Funds
('SPY', 'SPDR S&P 500 ETF', 'Funds', 484.5, 0.31, '18.2B', 'yahoo', 'SPY', 'AMEX:SPY', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('QQQ', 'Invesco QQQ', 'Funds', 412.3, 0.42, '9.8B', 'yahoo', 'QQQ', 'NASDAQ:QQQ', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
-- Bonds
('US10Y', 'US 10-Yr Treasury', 'Bonds', 4.15, -0.02, 'N/A', 'yahoo', '^TNX', 'TVC:US10Y', FALSE, 3, 0.01, 1000, 0.01, 0.01, 'contracts'),
-- Economy
('DXY', 'US Dollar Index', 'Economy', 104.2, 0.15, 'N/A', 'yahoo', 'DX-Y.NYB', 'TVC:DXY', FALSE, 3, 0.01, 1000, 0.01, 0.01, 'contracts'),
-- Options
('VIX', 'Volatility Index', 'Options', 13.5, -2.5, 'N/A', 'yahoo', '^VIX', 'CBOE:VIX', FALSE, 2, 0.01, 100, 0.01, 0.01, 'contracts'),
-- Commodities
('XAUUSD', 'Gold', 'Commodities', 2340.5, 0.85, '42.1B', 'yahoo', 'GC=F', 'OANDA:XAUUSD', FALSE, 3, 0.1, 100, 0.01, 0.01, 'units'),
('XAGUSD', 'Silver', 'Commodities', 28.45, 1.2, '8.4B', 'yahoo', 'SI=F', 'OANDA:XAGUSD', FALSE, 3, 0.05, 100, 0.01, 0.01, 'units'),
('BRENT', 'Brent Oil', 'Commodities', 82.4, -0.6, '12.1B', 'yahoo', 'BZ=F', 'ICEEUR:BRN1!', FALSE, 3, 0.05, 100, 0.01, 0.01, 'units'),
-- Brazilian Index
('IBOV', 'BOVESPA', 'Brazilian Index', 128500, 0.45, '24.1B', 'yahoo', '^BVSP', 'BMFBOVESPA:IBOV', FALSE, 2, 5, 1, 0.01, 0.01, 'index units'),
-- Futures
('ES1!', 'S&P 500 E-Mini Future', 'Futures', 4890, 0.25, 'N/A', 'yahoo', 'ES=F', 'CME_MINI:ES1!', FALSE, 2, 1, 1, 0.01, 0.01, 'contracts'),
('YM1!', 'Dow 30 Future', 'Futures', 38650, 0.15, 'N/A', 'yahoo', 'YM=F', 'CBOT_MINI:YM1!', FALSE, 2, 1, 1, 0.01, 0.01, 'contracts'),
('CL1!', 'Crude Oil Future', 'Futures', 81.25, -0.45, 'N/A', 'yahoo', 'CL=F', 'NYMEX:CL1!', FALSE, 3, 0.05, 1, 0.01, 0.01, 'contracts');
