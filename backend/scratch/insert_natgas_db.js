const db = require('../src/config/database');

async function insert() {
    try {
        console.log('Starting insert...');
        const result = await db.query(`
            INSERT INTO instruments (
                symbol, name, category_name, default_price, default_change, default_volume,
                provider, quote_symbol, data_symbol, trading_view_symbol, use_bid_ask, price_precision,
                spread, contract_size, lot_step, min_lot, quantity_label
            ) VALUES (
                'NATGAS', 'Natural Gas', 'Commodities', 2.45, 0.05, '5.2B',
                'twelvedata', 'NG=F', 'NG/USD', 'TVC:NATGAS', FALSE, 3,
                0.005, 10000, 0.01, 0.01, 'mmbtu'
            ) ON CONFLICT (symbol) DO UPDATE SET 
                is_active = TRUE, 
                data_symbol = 'NG/USD',
                trading_view_symbol = 'TVC:NATGAS',
                category_name = 'Commodities'
        `);
        console.log(`Inserted/Updated NATGAS: ${result.rowCount} rows`);
        console.log('Database update completed successfully');
    } catch (error) {
        console.error('Database update failed:', error);
    } finally {
        process.exit();
    }
}

insert();
