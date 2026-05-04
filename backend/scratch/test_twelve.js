const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function testTwelveData() {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  console.log('API Key:', apiKey);
  const params = {
    symbol: 'BTC/USD,EUR/USD,AAPL',
    apikey: apiKey,
    interval: '1min',
  };

  try {
    const response = await axios.get('https://api.twelvedata.com/quote', { params });
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Error Data:', JSON.stringify(err.response.data, null, 2));
    }
  }
}

testTwelveData();
