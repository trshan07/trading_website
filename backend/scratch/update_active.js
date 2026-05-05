const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Dinusha07@localhost:5432/trade_db' });

const inactiveSymbols = [
  // Failed symbols
  'WTI', 'CL1!', 
  'BRENT', 'UKOIL',
  'US30', 'DJI', 
  'JP225', 'NI225',
  'US10Y', 
  'DXY', 
  'VIX', 
  'IBOV', 
  'ES1!', 
  'YM1!',
  // Inaccurate indices
  'US500', 'SPX',
  'NAS100', 'NDX',
  'UK100', 'UKX',
  'DE40', 'DAX'
];

async function updateActive() {
  try {
    await client.connect();
    
    // Deactivate failed and inaccurate symbols
    const placeholders = inactiveSymbols.map((_, i) => `$${i + 1}`).join(', ');
    const res1 = await client.query(
      `UPDATE instruments SET is_active = false WHERE symbol IN (${placeholders})`,
      inactiveSymbols
    );
    console.log(`Deactivated ${res1.rowCount} broken/inaccurate instruments.`);
    
    // Ensure all remaining active instruments are correctly using twelvedata
    const res2 = await client.query(`UPDATE instruments SET provider = 'twelvedata' WHERE is_active = true`);
    console.log(`Verified ${res2.rowCount} active instruments are set to twelvedata.`);
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

updateActive();
