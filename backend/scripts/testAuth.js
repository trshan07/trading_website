const http = require('http');

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
      email: 'admin@trade.local',
      password: 'adminpassword123'
    });
    console.log('Admin Login:', adminLogin);

  } catch (err) {
    console.error('Test Failed:', err);
  }
}

test();
