// backend/scripts/test_register.js
const { register } = require('../src/controllers/authController');
const db = require('../src/config/database');
const User = require('../src/models/User');

const test = async () => {
    try {
        console.log('Testing Registration Logic...');
        
        // Clean up test user if exists
        await db.query('DELETE FROM users WHERE email = $1', ['test_debug@trade.com']);

        // Mock request/response
        const req = {
            body: {
                email: 'test_debug@trade.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'Debug',
                phone: '123456789',
                country: 'TestLand'
            }
        };

        const res = {
            status: function(code) {
                console.log('Status Response:', code);
                return this;
            },
            json: function(data) {
                console.log('JSON Output:', JSON.stringify(data, null, 2));
                return this;
            }
        };

        await register(req, res);
        
        console.log('Test Complete.');
        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

test();
