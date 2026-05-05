const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Dinusha07@localhost:5432/trade_db' });
client.connect()
  .then(() => client.query("UPDATE instruments SET provider = 'twelvedata' WHERE is_active = true;"))
  .then(res => { console.log('Updated rows:', res.rowCount); client.end(); })
  .catch(console.error);
