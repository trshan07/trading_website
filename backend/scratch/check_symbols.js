const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Dinusha07',
  database: process.env.DB_NAME || 'trade_db',
});

async function checkSymbols() {
  try {
    const res = await pool.query("SELECT symbol, provider, data_symbol, contract_size, is_active FROM instruments WHERE symbol IN ('AAPL', 'EURUSD', 'BTCUSD');");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSymbols();
