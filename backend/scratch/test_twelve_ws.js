const WebSocket = require('ws');
require('dotenv').config({ path: '../.env' });

const symbols = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'ETH/USD', 'XAG/USD', 'TSLA', 'AAPL', 'BTC/USD', 'XAU/USD'
];

const socket = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${process.env.TWELVEDATA_API_KEY}`);

socket.on('open', () => {
  console.log('Connected to TwelveData WebSocket');
  socket.send(JSON.stringify({
    action: 'subscribe',
    params: {
      symbols: symbols.join(',')
    }
  }));
});

socket.on('message', (data) => {
  console.log('Received:', data.toString());
});

socket.on('error', (err) => {
  console.error('WS Error:', err);
});
