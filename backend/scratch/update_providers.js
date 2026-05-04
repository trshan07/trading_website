const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Dinusha07',
  database: process.env.DB_NAME || 'trade_db',
});

async function updateProviders() {
  try {
    const symbolsToUpdate = ['AAPL', 'EURUSD', 'BTCUSD'];
    const res = await pool.query(
      "UPDATE instruments SET provider = 'twelvedata' WHERE symbol = ANY($1::varchar[]) RETURNING symbol, provider;",
      [symbolsToUpdate]
    );
    console.log("Updated symbols:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

updateProviders();
