const db = require('./src/config/database');
const Transaction = require('./src/models/Transaction');

async function test() {
    try {
        console.log('Testing Transaction.create...');
        const res = await Transaction.create(1, {
            account_id: 1,
            type: 'deposit',
            amount: 100,
            balance_before: 1000,
            balance_after: 1100,
            description: 'Test'
        });
        console.log('Success:', res);
    } catch (err) {
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
    }
    process.exit(0);
}

test();
