-- seed_public_data.sql

-- Clear existing data (optional, use with caution)
-- DELETE FROM market_assets;
-- DELETE FROM promotions;
-- DELETE FROM account_types_info;

-- Seed Promotions
INSERT INTO promotions (title, description, code, icon) VALUES
('Welcome Bonus 100%', 'Get up to $5000 bonus on your first institutional deposit.', 'WELCOME100', 'FaAward'),
('Zero Commission Crypto', 'Trade all crypto pairs with absolutely zero commission for the first 30 days.', 'CRYPTOZERO', 'FaBitcoin'),
('Low Spread FX', 'Access institutional raw spreads starting from 0.0 pips on majors.', 'RAWSPREAD', 'FaGem');

-- Seed Account Types
INSERT INTO account_types_info (name, min_deposit, leverage, spreads_from, features) VALUES
('Standard Account', 100.00, '1:500', '1.0 pips', '["Zero Commission", "24/5 Support", "Mobile Trading", "Instant Execution"]'),
('Gold Pro Account', 5000.00, '1:200', '0.5 pips', '["Dedicated Account Manager", "Trading signals", "Priority Support", "Lower Spreads"]'),
('Institutional Elite', 50000.00, '1:100', '0.0 pips', '["Raw Spreads", "FIX API Access", "Custom Solutions", "DMA Execution"]');
