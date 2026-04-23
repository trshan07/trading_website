const http = require('http');
require('dotenv').config();

const options = (path, method = 'POST') => ({
  hostname: 'localhost',
  port: 5000,
  path: path,
  method: method,
  headers: {
    'Content-Type': 'application/json'
  }
});

const makeRequest = (opts, body) => {
  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function test() {
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Q9#vL2!mT7@xR4$kP8zN';
  try {
    console.log('Testing Health Check...');
    const health = await makeRequest({ ...options('/api/health', 'GET') });
    console.log('Health:', health);

    const email = `test_${Date.now()}@test.com`;
    console.log(`Testing Registration with ${email}...`);
    const reg = await makeRequest(options('/api/auth/register'), {
      email,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '123456789',
      country: 'TestLand'
    });
    console.log('Registration:', reg);

    console.log('Testing Login...');
    const login = await makeRequest(options('/api/auth/login'), {
      email,
      password: 'password123'
    });
    console.log('Login:', login);

    console.log('Testing Admin Login...');
    const adminLogin = await makeRequest(options('/api/auth/login'), {
      email: 'info@tiktrades.com',
      password: superAdminPassword
    });
    console.log('Admin Login:', adminLogin);

  } catch (err) {
    console.error('Test Failed:', err);
  }
}

test();

