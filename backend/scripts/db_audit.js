const db = require('../src/config/database');
require('dotenv').config();

async function run() {
  console.log('=== DATABASE COLUMN AUDIT ===\n');

  const tables = ['users', 'accounts', 'trades', 'transactions', 'kyc_submissions', 'funding_requests', 'admin_logs'];
  
  for (const t of tables) {
    try {
      const res = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}' AND table_schema = 'public' ORDER BY ordinal_position`);
      const cols = res.rows.map(r => r.column_name);
      console.log(`${t}: [${cols.join(', ')}]`);
    } catch(e) {
      console.log(`${t}: FAIL - ${e.message}`);
    }
  }

  console.log('\n=== MODEL vs SCHEMA CROSS-CHECK ===\n');

  // Check AdminLog model uses correct column (target_id vs target_user_id)
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'admin_logs' AND table_schema = 'public'");
    const cols = res.rows.map(r => r.column_name);
    console.log('admin_logs columns:', cols.join(', '));
    
    // Check if model uses the right insert column
    if (cols.includes('target_id')) {
      console.log('AdminLog.target_id: CORRECT COLUMN EXISTS');
    } else {
      console.log('AdminLog.target_id: MISSING! Available:', cols.join(', '));
    }
  } catch(e) { console.log('admin_logs check FAIL:', e.message); }

  // Check transactions model
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' AND table_schema = 'public'");
    const cols = res.rows.map(r => r.column_name);
    console.log('transactions columns:', cols.join(', '));
  } catch(e) { console.log('transactions check FAIL:', e.message); }

  // Check accounts model
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'accounts' AND table_schema = 'public'");
    const cols = res.rows.map(r => r.column_name);
    console.log('accounts columns:', cols.join(', '));
  } catch(e) { console.log('accounts check FAIL:', e.message); }

  // Test AdminLog create query exactly
  console.log('\n=== TESTING ADMIN LOG INSERT ===');
  try {
    const { rows } = await db.query(
      `INSERT INTO admin_logs (admin_id, action, target_id, details, ip_address) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [1, 'TEST_AUDIT', 1, 'Database audit test', '127.0.0.1']
    );
    console.log('AdminLog INSERT: OK -', rows[0]);
    // Clean up
    await db.query('DELETE FROM admin_logs WHERE action = $1', ['TEST_AUDIT']);
    console.log('AdminLog CLEANUP: OK');
  } catch(e) { console.log('AdminLog INSERT: FAIL -', e.message); }

  // Test Transaction create query
  console.log('\n=== TESTING TRANSACTION INSERT ===');
  try {
    const { rows: accounts } = await db.query('SELECT id, user_id, balance FROM accounts LIMIT 1');
    if (accounts.length > 0) {
      const acct = accounts[0];
      const { rows } = await db.query(
        `INSERT INTO transactions (user_id, account_id, type, amount, balance_before, balance_after, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [acct.user_id, acct.id, 'test', 0.01, acct.balance, acct.balance, 'audit test']
      );
      console.log('Transaction INSERT: OK - id:', rows[0].id);
      await db.query('DELETE FROM transactions WHERE description = $1', ['audit test']);
      console.log('Transaction CLEANUP: OK');
    } else {
      console.log('Transaction INSERT: SKIPPED (no accounts found)');
    }
  } catch(e) { console.log('Transaction INSERT: FAIL -', e.message); }

  console.log('\n=== DONE ===');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
