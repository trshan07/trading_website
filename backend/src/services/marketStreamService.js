const WebSocket = require('ws');
const marketSymbolMap = require('../config/marketSymbolMap.json');
const {
  hasTwelveDataApiKey,
  normalizeSymbol,
  resolveTwelveDataSymbol,
} = require('./marketDataService');

const BINANCE_STREAM_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';
const TWELVE_DATA_STREAM_URL = 'wss://ws.twelvedata.com/v1/quotes/price';
const MAX_RECONNECT_DELAY_MS = 15000;

class MarketStreamService {
  constructor() {
    this.clients = new Set();
    this.latestQuotes = {};
    this.binanceSocket = null;
    this.twelveDataSocket = null;
    this.binanceReconnectAttempts = 0;
    this.twelveDataReconnectAttempts = 0;
    this.binanceReconnectTimer = null;
    this.twelveDataReconnectTimer = null;
    this.twelveDataHeartbeatTimer = null;
    this.started = false;
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

  scheduleReconnect(kind) {
    const attempts = kind === 'binance' ? this.binanceReconnectAttempts : this.twelveDataReconnectAttempts;
    const delay = Math.min(1000 * (2 ** Math.min(attempts, 4)), MAX_RECONNECT_DELAY_MS);
    const timerField = kind === 'binance' ? 'binanceReconnectTimer' : 'twelveDataReconnectTimer';

    if (this[timerField]) {
      clearTimeout(this[timerField]);
    }

    this[timerField] = setTimeout(() => {
      this[timerField] = null;
      if (kind === 'binance') {
        this.connectBinance();
        return;
      }

      this.connectTwelveData();
    }, delay);
  }

  connectBinance() {
    if (!this.started || this.binanceSocket) {
      return;
    }

    const socket = new WebSocket(BINANCE_STREAM_URL);
    this.binanceSocket = socket;

    socket.on('open', () => {
      this.binanceReconnectAttempts = 0;
    });

    socket.on('message', (rawMessage) => {
      try {
        const payload = JSON.parse(rawMessage.toString());
        if (!Array.isArray(payload)) {
          return;
        }

        const updatedAt = Date.now();
        const quotes = payload.reduce((acc, ticker) => {
          if (!ticker?.s || !ticker?.c) {
            return acc;
          }

          acc[normalizeSymbol(ticker.s)] = {
            price: Number.parseFloat(ticker.c),
            bid: Number.parseFloat(ticker.b),
            ask: Number.parseFloat(ticker.a),
            change: Number.parseFloat(ticker.P),
            volume: Number.parseFloat(ticker.v),
            updatedAt,
            source: 'binance-stream',
          };
          return acc;
        }, {});

        this.publishQuotes(quotes);
      } catch (error) {}
    });

    socket.on('close', () => {
      if (this.binanceSocket === socket) {
        this.binanceSocket = null;
      }

      if (!this.started) {
        return;
      }

      this.binanceReconnectAttempts += 1;
      this.scheduleReconnect('binance');
    });

    socket.on('error', () => {
      try {
        socket.close();
      } catch (error) {}
    });
  }

  connectTwelveData() {
    if (!this.started || this.twelveDataSocket || !hasTwelveDataApiKey()) {
      return;
    }

    const symbols = this.getTwelveDataSymbols();
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
        const normalizedSymbol = normalizeSymbol(payload?.symbol || '');
        const price = Number.parseFloat(payload?.price ?? payload?.close);

        if (!normalizedSymbol || !Number.isFinite(price)) {
          return;
        }

        const timestamp = Number.parseInt(payload.timestamp ?? payload.time ?? 0, 10);
        this.publishQuotes({
          [normalizedSymbol]: {
            price,
            change: Number.parseFloat(payload.percent_change ?? payload.change ?? 0) || 0,
            volume: Number.parseFloat(payload.day_volume ?? payload.volume ?? 0) || null,
            updatedAt: Number.isFinite(timestamp) && timestamp > 0 ? timestamp * 1000 : Date.now(),
            source: 'twelvedata-stream',
          },
        });
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
      this.scheduleReconnect('twelvedata');
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
    this.connectBinance();
    this.connectTwelveData();
  }
}

module.exports = new MarketStreamService();
