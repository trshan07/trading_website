const db = require('../src/config/database');
require('dotenv').config();

async function run() {
  console.log('=== DATABASE SCHEMA FIXES ===\n');

  // FIX 1: Update transactions type constraint to include 'transfer'
  console.log('FIX 1: Updating transactions.type constraint...');
  try {
    await db.query('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check');
    await db.query(
      "ALTER TABLE transactions ADD CONSTRAINT transactions_type_check " +
      "CHECK (type IN ('deposit', 'withdrawal', 'trade', 'adjustment', 'transfer'))"
    );
    console.log('  transactions.type constraint: UPDATED (now includes transfer)');
  } catch(e) {
    console.log('  transactions.type constraint FIX FAILED:', e.message);
  }

  // FIX 2: Ensure admin_logs has target_id (already done but idempotent)
  console.log('FIX 2: Ensuring admin_logs.target_id exists...');
  try {
    await db.query('ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS target_id INTEGER');
    console.log('  admin_logs.target_id: OK');
  } catch(e) {
    console.log('  admin_logs.target_id FIX FAILED:', e.message);
  }

  // VERIFY ALL FIXES
  console.log('\n=== VERIFICATION ===\n');

  // Verify transactions constraint
  try {
    const { rows } = await db.query(
      "SELECT pg_get_constraintdef(c.oid) as def " +
      "FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid " +
      "WHERE t.relname = 'transactions' AND c.contype = 'c'"
    );
    console.log('transactions.type constraint:', rows[0]?.def || 'none');
  } catch(e) { console.log('constraint check failed:', e.message); }

  // Verify admin log insert works
  try {
    const { rows } = await db.query(
      'INSERT INTO admin_logs (admin_id, action, target_id, details, ip_address) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [1, 'TEST_AUDIT', 1, 'Schema fix verification', '127.0.0.1']
    );
    await db.query("DELETE FROM admin_logs WHERE action = 'TEST_AUDIT'");
    console.log('admin_logs INSERT test: OK (id=' + rows[0].id + ', cleaned up)');
  } catch(e) { console.log('admin_logs INSERT test: FAIL -', e.message); }

  // Verify transaction insert with valid types
  try {
    const { rows: accts } = await db.query('SELECT id, user_id, balance FROM accounts LIMIT 1');
    if (accts.length > 0) {
      const a = accts[0];
      for (const type of ['deposit', 'withdrawal', 'trade', 'adjustment', 'transfer']) {
        const { rows } = await db.query(
          'INSERT INTO transactions (user_id, account_id, type, amount, balance_before, balance_after, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
          [a.user_id, a.id, type, 0.01, a.balance, a.balance, 'schema_check']
        );
        await db.query("DELETE FROM transactions WHERE description = 'schema_check'");
        console.log('transactions INSERT type=' + type + ': OK');
      }
    }
  } catch(e) { console.log('transactions INSERT test: FAIL -', e.message); }

  // Final table row counts
  console.log('\n=== LIVE TABLE COUNTS ===');
  const tables = ['users','accounts','trades','transactions','kyc_submissions','funding_requests','admin_logs'];
  for (const t of tables) {
    const { rows } = await db.query('SELECT COUNT(*) as c FROM ' + t);
    console.log('  ' + t + ': ' + rows[0].c + ' rows');
  }

  console.log('\n=== ALL FIXES APPLIED ===');
  process.exit(0);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
