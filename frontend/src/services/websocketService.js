// frontend/src/services/websocketService.js

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 8;
    this.isConnected = false;
    this.isConnecting = false;
    this.connectTimerId = null; // Holds the setTimeout ID so we can cancel it
    this.waitingForOnline = false;
    this.hasLoggedSuccessfulConnect = false;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  handleOnline = () => {
    this.waitingForOnline = false;
    if (this.listeners.size > 0 && !this.isConnected && !this.isConnecting) {
      this.connect();
    }
  };

  handleOffline = () => {
    this.waitingForOnline = true;
    this.closeCurrentSocket(1000, 'Browser offline');
  };

  handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.closeCurrentSocket(1000, 'Tab hidden');
      return;
    }

    if (this.listeners.size > 0 && !this.isConnected && !this.isConnecting) {
      this.connect();
    }
  };

  canConnect() {
    if (typeof window === 'undefined') return true;
    return navigator.onLine && document.visibilityState !== 'hidden';
  }

  closeCurrentSocket(code = 1000, reason = 'Closing socket') {
    if (this.connectTimerId) {
      clearTimeout(this.connectTimerId);
      this.connectTimerId = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        try {
          this.ws.close(code, reason);
        } catch (err) {}
      }
    }

    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  connect() {
    // If already connecting or connected, or no listeners, skip
    if (this.isConnecting || this.isConnected || this.listeners.size === 0) return;
    if (!this.canConnect()) {
      this.waitingForOnline = true;
      return;
    }
    // Prevent duplicate reconnect timers
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WebSocketService] Max reconnect attempts reached. Giving up.');
      return;
    }

    // Small delay before connecting to protect against React StrictMode double-mount
    const delay = this.reconnectAttempts === 0 ? 300 : 2000 * Math.min(this.reconnectAttempts, 4);
    this.connectTimerId = setTimeout(() => {
      // If listeners were removed while waiting, don't connect
      if (this.listeners.size === 0 || !this.canConnect()) return;

      this.isConnecting = true;
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
      this.ws = ws;

      ws.onopen = () => {
        if (this.ws !== ws) { ws.close(); return; } // Stale connection guard
        if (!this.hasLoggedSuccessfulConnect) {
          console.log('[WebSocketService] Connected to Binance Full Ticker Stream');
          this.hasLoggedSuccessfulConnect = true;
        }
        this.isConnected = true;
        this.isConnecting = false;
        this.waitingForOnline = false;
        this.reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        if (this.ws !== ws) return; // Ignore messages from stale connections
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            const formattedData = {};
            data.forEach(ticker => {
              if (ticker.s && ticker.c) {
                formattedData[ticker.s] = {
                  price: parseFloat(ticker.c),
                  bid: parseFloat(ticker.b),
                  ask: parseFloat(ticker.a),
                  change: parseFloat(ticker.P),
                  volume: parseFloat(ticker.v)
                };
              }
            });
            this.notifyListeners(formattedData);
          }
        } catch (err) {
          console.error('[WebSocketService] Message parse error:', err);
        }
      };

      ws.onclose = (event) => {
        if (this.ws !== ws) return; // Ignore events from stale connections
        this.isConnected = false;
        this.isConnecting = false;
        this.ws = null;
        this.connectTimerId = null;
        if (!this.canConnect()) {
          this.waitingForOnline = true;
          return;
        }
        // Only reconnect if we still have listeners and it wasn't a clean close
        if (this.listeners.size > 0 && event.code !== 1000) {
          this.reconnectAttempts++;
          if (this.reconnectAttempts <= 2 || this.reconnectAttempts === this.maxReconnectAttempts) {
            console.warn(`[WebSocketService] Disconnected (code ${event.code}). Retry #${this.reconnectAttempts}...`);
          }
          this.connect();
        }
      };

      ws.onerror = () => {
        // Error is always followed by onclose, so we just let it handle reconnect
        if (this.ws !== ws) return;
        this.isConnecting = false;
      };
    }, delay);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    if (!this.isConnected && !this.isConnecting) {
      this.connect();
    }
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback) {
    this.listeners.delete(callback);
    // If no more listeners, perform a clean close
    if (this.listeners.size === 0) {
      this.closeCurrentSocket(1000, 'No more listeners');
      this.reconnectAttempts = 0;
    }
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error('[WebSocketService] Listener error:', err);
      }
    });
  }
}

// Export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
