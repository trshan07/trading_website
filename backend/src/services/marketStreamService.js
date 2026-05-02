const WebSocket = require('ws');
const marketSymbolMap = require('../config/marketSymbolMap.json');
const {
  hasTwelveDataApiKey,
  normalizeSymbol,
  resolveTwelveDataSymbol,
} = require('./marketDataService');

const TWELVE_DATA_STREAM_URL = 'wss://ws.twelvedata.com/v1/quotes/price';
const MAX_RECONNECT_DELAY_MS = 15000;

class MarketStreamService {
  constructor() {
    this.clients = new Set();
    this.latestQuotes = {};
    this.twelveDataSocket = null;
    this.twelveDataReconnectAttempts = 0;
    this.twelveDataReconnectTimer = null;
    this.twelveDataHeartbeatTimer = null;
    this.started = false;
  }

  getTwelveDataSymbolMap() {
    return Object.entries(marketSymbolMap).reduce((acc, [symbol, config]) => {
      if (config?.provider !== 'twelvedata') {
        return acc;
      }

      const providerSymbol = String(resolveTwelveDataSymbol(symbol, config) || '').trim();
      if (!providerSymbol) {
        return acc;
      }

      const normalizedInternalSymbol = normalizeSymbol(symbol);
      if (!acc[providerSymbol]) {
        acc[providerSymbol] = [];
      }
      if (!acc[normalizeSymbol(providerSymbol)]) {
        acc[normalizeSymbol(providerSymbol)] = [];
      }
      acc[providerSymbol].push(normalizedInternalSymbol);
      acc[normalizeSymbol(providerSymbol)].push(normalizedInternalSymbol);
      return acc;
    }, {});
  }

  getTwelveDataSymbols() {
    return Array.from(new Set(
      Object.entries(marketSymbolMap)
        .filter(([, config]) => config?.provider === 'twelvedata')
        .map(([symbol, config]) => resolveTwelveDataSymbol(symbol, config))
        .filter(Boolean)
    ));
  }

  attachWebSocketServer(wss) {
    wss.on('connection', (client) => {
      this.clients.add(client);

      this.send(client, {
        type: 'connected',
        message: 'Market stream connected',
        asOf: new Date().toISOString(),
      });

      if (Object.keys(this.latestQuotes).length > 0) {
        this.send(client, {
          type: 'market-quotes',
          data: this.latestQuotes,
          asOf: new Date().toISOString(),
        });
      }

      client.on('message', (rawMessage) => {
        try {
          const message = JSON.parse(rawMessage.toString());
          if (message?.type === 'ping') {
            this.send(client, {
              type: 'pong',
              asOf: new Date().toISOString(),
            });
          }
        } catch (error) {
          this.send(client, {
            type: 'error',
            message: 'Invalid websocket payload',
          });
        }
      });

      client.on('close', () => {
        this.clients.delete(client);
      });

      client.on('error', () => {
        this.clients.delete(client);
      });
    });
  }

  send(client, payload) {
    if (!client || client.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.send(JSON.stringify(payload));
    } catch (error) {}
  }

  broadcast(payload) {
    this.clients.forEach((client) => this.send(client, payload));
  }

  publishQuotes(quotes = {}) {
    if (!quotes || Object.keys(quotes).length === 0) {
      return;
    }

    Object.assign(this.latestQuotes, quotes);
    this.broadcast({
      type: 'market-quotes',
      data: quotes,
      asOf: new Date().toISOString(),
    });
  }

  getLatestQuote(symbol = '') {
    const normalized = normalizeSymbol(symbol);
    return this.latestQuotes[normalized] || null;
  }

  getLatestQuotes(symbols = []) {
    return symbols.reduce((acc, symbol) => {
      const normalized = normalizeSymbol(symbol);
      if (!normalized) {
        return acc;
      }

      const quote = this.latestQuotes[normalized];
      if (quote) {
        acc[normalized] = quote;
      }
      return acc;
    }, {});
  }

  scheduleReconnect() {
    const delay = Math.min(
      1000 * (2 ** Math.min(this.twelveDataReconnectAttempts, 4)),
      MAX_RECONNECT_DELAY_MS
    );

    if (this.twelveDataReconnectTimer) {
      clearTimeout(this.twelveDataReconnectTimer);
    }

    this.twelveDataReconnectTimer = setTimeout(() => {
      this.twelveDataReconnectTimer = null;
      this.connectTwelveData();
    }, delay);
  }

  connectTwelveData() {
    if (!this.started || this.twelveDataSocket || !hasTwelveDataApiKey()) {
      return;
    }

    const symbols = this.getTwelveDataSymbols();
    const symbolMap = this.getTwelveDataSymbolMap();
    if (symbols.length === 0) {
      return;
    }

    const socket = new WebSocket(`${TWELVE_DATA_STREAM_URL}?apikey=${encodeURIComponent(process.env.TWELVEDATA_API_KEY)}`);
    this.twelveDataSocket = socket;

    socket.on('open', () => {
      this.twelveDataReconnectAttempts = 0;
      socket.send(JSON.stringify({
        action: 'subscribe',
        params: {
          symbols: symbols.join(','),
        },
      }));

      if (this.twelveDataHeartbeatTimer) {
        clearInterval(this.twelveDataHeartbeatTimer);
      }

      this.twelveDataHeartbeatTimer = setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          return;
        }

        try {
          socket.send(JSON.stringify({ action: 'heartbeat' }));
        } catch (error) {}
      }, 10000);
    });

    socket.on('message', (rawMessage) => {
      try {
        const payload = JSON.parse(rawMessage.toString());
        const providerSymbol = String(payload?.symbol || '').trim();
        const normalizedProviderSymbol = normalizeSymbol(providerSymbol);
        const internalSymbols = symbolMap[providerSymbol] || symbolMap[normalizedProviderSymbol] || [normalizedProviderSymbol];
        const price = Number.parseFloat(payload?.price ?? payload?.close);

        if (internalSymbols.length === 0 || !Number.isFinite(price)) {
          return;
        }

        const timestamp = Number.parseInt(payload.timestamp ?? payload.time ?? 0, 10);
        const quotePayload = internalSymbols.reduce((acc, internalSymbol) => {
          acc[internalSymbol] = {
            price,
            bid: Number.parseFloat(payload.bid) || null,
            ask: Number.parseFloat(payload.ask) || null,
            change: Number.parseFloat(payload.percent_change ?? payload.change ?? 0) || 0,
            volume: Number.parseFloat(payload.day_volume ?? payload.volume ?? 0) || null,
            updatedAt: Number.isFinite(timestamp) && timestamp > 0 ? timestamp * 1000 : Date.now(),
            source: 'twelvedata-stream',
          };
          return acc;
        }, {});
        this.publishQuotes(quotePayload);
      } catch (error) {}
    });

    socket.on('close', () => {
      if (this.twelveDataSocket === socket) {
        this.twelveDataSocket = null;
      }

      if (this.twelveDataHeartbeatTimer) {
        clearInterval(this.twelveDataHeartbeatTimer);
        this.twelveDataHeartbeatTimer = null;
      }

      if (!this.started || !hasTwelveDataApiKey()) {
        return;
      }

      this.twelveDataReconnectAttempts += 1;
      this.scheduleReconnect();
    });

    socket.on('error', () => {
      try {
        socket.close();
      } catch (error) {}
    });
  }

  start() {
    if (this.started) {
      return;
    }

    this.started = true;
    this.connectTwelveData();
  }
}

module.exports = new MarketStreamService();
