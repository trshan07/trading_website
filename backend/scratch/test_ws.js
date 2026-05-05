const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:5000');

ws.on('open', () => {
  console.log('Connected to backend WebSocket.');
  
  // Wait a few seconds to gather quotes
  setTimeout(() => {
    console.log('Closing connection...');
    ws.close();
  }, 5000);
});

ws.on('message', (data) => {
  const payload = JSON.parse(data.toString());
  if (payload.type === 'market-quotes') {
    const symbols = Object.keys(payload.data);
    console.log(`Received live quotes for ${symbols.length} symbols:`, symbols.join(', '));
  } else {
    console.log('Received message:', payload.type);
  }
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err.message);
});
