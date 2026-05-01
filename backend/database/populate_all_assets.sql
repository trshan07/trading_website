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
    provider, quote_symbol, data_symbol, trading_view_symbol, use_bid_ask, price_precision,
    spread, contract_size, lot_step, min_lot, quantity_label
) VALUES
-- Crypto
('BTCUSDT', 'Bitcoin', 'Crypto', 43250.00, 2.5, '28.4B', 'twelvedata', 'BTCUSDT', 'BTC/USD', 'BINANCE:BTCUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('ETHUSDT', 'Ethereum', 'Crypto', 2820.00, 1.8, '14.1B', 'twelvedata', 'ETHUSDT', 'ETH/USD', 'BINANCE:ETHUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('BNBUSDT', 'Binance Coin', 'Crypto', 380.00, -0.5, '1.2B', 'twelvedata', 'BNBUSDT', 'BNB/USD', 'BINANCE:BNBUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('SOLUSDT', 'Solana', 'Crypto', 105.00, 5.2, '3.8B', 'twelvedata', 'SOLUSDT', 'SOL/USD', 'BINANCE:SOLUSDT', TRUE, 2, NULL, 1, 0.001, 0.001, 'coins'),
('ADAUSDT', 'Cardano', 'Crypto', 0.58, 1.1, '0.9B', 'twelvedata', 'ADAUSDT', 'ADA/USD', 'BINANCE:ADAUSDT', TRUE, 4, NULL, 1, 0.001, 0.001, 'coins'),
-- Forex
('EURUSD', 'Euro / USD', 'Forex', 1.0875, 0.23, '3.2T', 'twelvedata', 'EURUSD=X', 'EUR/USD', 'FX:EURUSD', FALSE, 5, 0.0002, 100000, 0.01, 0.01, 'units'),
('GBPUSD', 'GBP / USD', 'Forex', 1.265, -0.12, '0.8T', 'twelvedata', 'GBPUSD=X', 'GBP/USD', 'FX:GBPUSD', FALSE, 5, 0.0002, 100000, 0.01, 0.01, 'units'),
('USDJPY', 'USD / JPY', 'Forex', 148.5, 0.05, '1.1T', 'twelvedata', 'USDJPY=X', 'USD/JPY', 'FX:USDJPY', FALSE, 3, 0.02, 100000, 0.01, 0.01, 'units'),
('AUDUSD', 'AUD / USD', 'Forex', 0.6584, 0.09, '0.6T', 'twelvedata', 'AUDUSD=X', 'AUD/USD', 'FX:AUDUSD', FALSE, 5, 0.00014, 100000, 0.01, 0.01, 'units'),
('USDCAD', 'USD / CAD', 'Forex', 1.3621, -0.03, '0.5T', 'twelvedata', 'USDCAD=X', 'USD/CAD', 'FX:USDCAD', FALSE, 5, 0.00016, 100000, 0.01, 0.01, 'units'),
('USDCHF', 'USD / CHF', 'Forex', 0.9114, 0.04, '0.4T', 'twelvedata', 'USDCHF=X', 'USD/CHF', 'FX:USDCHF', FALSE, 5, 0.00014, 100000, 0.01, 0.01, 'units'),
('NZDUSD', 'NZD / USD', 'Forex', 0.6015, 0.06, '0.2T', 'twelvedata', 'NZDUSD=X', 'NZD/USD', 'FX:NZDUSD', FALSE, 5, 0.00016, 100000, 0.01, 0.01, 'units'),
-- Stocks
('AAPL', 'Apple Inc.', 'Stocks', 185.2, 1.2, '4.5B', 'twelvedata', 'AAPL', 'AAPL', 'NASDAQ:AAPL', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('MSFT', 'Microsoft', 'Stocks', 410.5, -0.4, '2.8B', 'twelvedata', 'MSFT', 'MSFT', 'NASDAQ:MSFT', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('TSLA', 'Tesla', 'Stocks', 195.3, 3.5, '6.1B', 'twelvedata', 'TSLA', 'TSLA', 'NASDAQ:TSLA', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('GOOGL', 'Alphabet Inc.', 'Stocks', 141.8, 0.6, '1.9B', 'twelvedata', 'GOOGL', 'GOOGL', 'NASDAQ:GOOGL', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
-- Indices
('SPX', 'S&P 500', 'Indices', 4850, 0.32, 'N/A', 'twelvedata', '^GSPC', 'SPX', 'SP:SPX', FALSE, 2, 1, 1, 0.01, 0.01, 'index units'),
('NDX', 'Nasdaq 100', 'Indices', 16800, 0.45, 'N/A', 'twelvedata', '^NDX', 'NDX', 'NASDAQ:NDX', FALSE, 2, 1, 1, 0.01, 0.01, 'index units'),
('DJI', 'Dow Jones', 'Indices', 38500, 0.18, 'N/A', 'twelvedata', '^DJI', 'DJI', 'DJ:DJI', FALSE, 2, 1, 1, 0.01, 0.01, 'index units'),
-- Funds
('SPY', 'SPDR S&P 500 ETF', 'Funds', 484.5, 0.31, '18.2B', 'twelvedata', 'SPY', 'SPY', 'AMEX:SPY', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
('QQQ', 'Invesco QQQ', 'Funds', 412.3, 0.42, '9.8B', 'twelvedata', 'QQQ', 'QQQ', 'NASDAQ:QQQ', FALSE, 2, 0.02, 1, 0.01, 0.01, 'shares'),
-- Bonds
('US10Y', 'US 10-Yr Treasury', 'Bonds', 4.15, -0.02, 'N/A', 'twelvedata', '^TNX', 'US10Y', 'TVC:US10Y', FALSE, 3, 0.01, 1000, 0.01, 0.01, 'contracts'),
-- Economy
('DXY', 'US Dollar Index', 'Economy', 104.2, 0.15, 'N/A', 'twelvedata', 'DX-Y.NYB', 'DXY', 'TVC:DXY', FALSE, 3, 0.01, 1000, 0.01, 0.01, 'contracts'),
-- Options
('VIX', 'Volatility Index', 'Options', 13.5, -2.5, 'N/A', 'twelvedata', '^VIX', 'VIX', 'CBOE:VIX', FALSE, 2, 0.01, 100, 0.01, 0.01, 'contracts'),
-- Commodities
('XAUUSD', 'Gold', 'Commodities', 2340.5, 0.85, '42.1B', 'twelvedata', 'XAUUSD=X', 'XAU/USD', 'OANDA:XAUUSD', FALSE, 3, 0.1, 100, 0.01, 0.01, 'units'),
('XAGUSD', 'Silver', 'Commodities', 28.45, 1.2, '8.4B', 'twelvedata', 'XAGUSD=X', 'XAG/USD', 'OANDA:XAGUSD', FALSE, 3, 0.05, 5000, 0.01, 0.01, 'oz'),
('BRENT', 'Brent Oil', 'Commodities', 82.4, -0.6, '12.1B', 'twelvedata', 'BZ=F', 'BRENT', 'ICEEUR:BRN1!', FALSE, 3, 0.05, 1000, 0.01, 0.01, 'bbl'),
-- Brazilian Index
('IBOV', 'BOVESPA', 'Brazilian Index', 128500, 0.45, '24.1B', 'twelvedata', '^BVSP', 'IBOV', 'BMFBOVESPA:IBOV', FALSE, 2, 5, 1, 0.01, 0.01, 'index units'),
-- Futures
('ES1!', 'S&P 500 E-Mini Future', 'Futures', 4890, 0.25, 'N/A', 'twelvedata', 'ES=F', 'ES1!', 'CME_MINI:ES1!', FALSE, 2, 1, 50, 0.01, 0.01, 'contracts'),
('YM1!', 'Dow 30 Future', 'Futures', 38650, 0.15, 'N/A', 'twelvedata', 'YM=F', 'YM1!', 'CBOT_MINI:YM1!', FALSE, 2, 5, 5, 0.01, 0.01, 'contracts'),
('CL1!', 'Crude Oil Future', 'Futures', 81.25, -0.45, 'N/A', 'twelvedata', 'CL=F', 'CL1!', 'NYMEX:CL1!', FALSE, 3, 0.05, 1000, 0.01, 0.01, 'bbl');
