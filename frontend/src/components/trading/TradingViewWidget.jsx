import React, { useEffect, useRef, useState } from 'react';
import { FaCompress, FaExpand } from 'react-icons/fa';

const EXPLICIT_SYMBOL_MAP = {
  BTCUSDT: 'BINANCE:BTCUSDT',
  ETHUSDT: 'BINANCE:ETHUSDT',
  BNBUSDT: 'BINANCE:BNBUSDT',
  SOLUSDT: 'BINANCE:SOLUSDT',
  ADAUSDT: 'BINANCE:ADAUSDT',
  EURUSD: 'FX:EURUSD',
  GBPUSD: 'FX:GBPUSD',
  USDJPY: 'FX:USDJPY',
  AUDUSD: 'FX:AUDUSD',
  USDCAD: 'FX:USDCAD',
  USDCHF: 'FX:USDCHF',
  NZDUSD: 'FX:NZDUSD',
  XAUUSD: 'TVC:GOLD',
  XAGUSD: 'TVC:SILVER',
  BRENT: 'TVC:UKOIL',
  US10Y: 'TVC:US10Y',
  DXY: 'TVC:DXY',
  VIX: 'TVC:VIX',
  SPX: 'SP:SPX',
  NDX: 'NASDAQ:NDX',
  DJI: 'DJ:DJI',
  IBOV: 'BMFBOVESPA:IBOV',
  SPY: 'AMEX:SPY',
  QQQ: 'NASDAQ:QQQ',
  AAPL: 'NASDAQ:AAPL',
  TSLA: 'NASDAQ:TSLA',
  MSFT: 'NASDAQ:MSFT',
  GOOGL: 'NASDAQ:GOOGL',
  'ES1!': 'CME_MINI:ES1!',
  'YM1!': 'CBOT_MINI:YM1!',
  'CL1!': 'NYMEX:CL1!',
};

const CRYPTO_QUOTES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH'];
const FOREX_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'];

const normalizeSymbol = (symbol = '') => symbol.toUpperCase().replace(/[^A-Z0-9!]/g, '');

const isForexPair = (symbol) => {
  if (symbol.length !== 6) {
    return false;
  }

  const base = symbol.slice(0, 3);
  const quote = symbol.slice(3, 6);
  return FOREX_CODES.includes(base) && FOREX_CODES.includes(quote);
};

const resolveTradingViewSymbol = ({ symbol, instrument }) => {
  if (!symbol) {
    return 'BINANCE:BTCUSDT';
  }

  if (symbol.includes(':')) {
    return symbol;
  }

  const normalizedSymbol = normalizeSymbol(symbol);
  const category = (instrument?.category || '').toLowerCase();

  if (EXPLICIT_SYMBOL_MAP[normalizedSymbol]) {
    return EXPLICIT_SYMBOL_MAP[normalizedSymbol];
  }

  if (normalizedSymbol.endsWith('!')) {
    return `TVC:${normalizedSymbol}`;
  }

  if (CRYPTO_QUOTES.some((quote) => normalizedSymbol.endsWith(quote))) {
    return `BINANCE:${normalizedSymbol}`;
  }

  if (isForexPair(normalizedSymbol) || category.includes('forex')) {
    return `FX:${normalizedSymbol}`;
  }

  if (category.includes('crypto')) {
    return `BINANCE:${normalizedSymbol}`;
  }

  if (category.includes('stock') || category.includes('share')) {
    return `NASDAQ:${normalizedSymbol}`;
  }

  if (category.includes('fund') || category.includes('etf')) {
    return `AMEX:${normalizedSymbol}`;
  }

  if (category.includes('indice') || category.includes('index')) {
    return `INDEX:${normalizedSymbol}`;
  }

  if (
    category.includes('future') ||
    category.includes('bond') ||
    category.includes('economy') ||
    category.includes('option') ||
    category.includes('commod')
  ) {
    return `TVC:${normalizedSymbol}`;
  }

  return `TVC:${normalizedSymbol}`;
};

const TradingViewWidget = ({
  symbol = 'BTCUSDT',
  instrument = null,
  theme = 'dark',
  activeIntent = null,
  positions = [],
}) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    if (!isOnline) {
      setScriptLoaded(false);
      return undefined;
    }

    const scriptId = 'tradingview-widget-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }

    return () => {
      widgetRef.current = null;
    };
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : 'unset';
  }, [isFullscreen]);

  useEffect(() => {
    if (!isOnline || !scriptLoaded || !containerRef.current || !window.TradingView || !symbol) {
      return undefined;
    }

    const widgetId = `tradingview_${Math.random().toString(36).substring(7)}`;
    containerRef.current.id = widgetId;

    const isDark = theme === 'dark';
    const tvSymbol = resolveTradingViewSymbol({ symbol, instrument });

    containerRef.current.innerHTML = '';

    try {
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: isDark ? 'dark' : 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: isDark ? '#0f172a' : '#f8fafc',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        container_id: widgetId,
        library_path: 'https://s3.tradingview.com/tv.js',
        width: '100%',
        height: '100%',
        hide_legend: false,
        save_image: false,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        gridColor: isDark ? '#1e293b' : '#f1f5f9',
        studies: [],
        overrides: isDark
          ? {
              'paneProperties.background': '#0f172a',
              'paneProperties.vertGridProperties.color': '#1e293b',
              'paneProperties.horzGridProperties.color': '#1e293b',
              'mainSeriesProperties.candleStyle.upColor': '#10b981',
              'mainSeriesProperties.candleStyle.downColor': '#f43f5e',
              'mainSeriesProperties.candleStyle.borderUpColor': '#10b981',
              'mainSeriesProperties.candleStyle.borderDownColor': '#f43f5e',
              'mainSeriesProperties.candleStyle.wickUpColor': '#10b981',
              'mainSeriesProperties.candleStyle.wickDownColor': '#f43f5e',
            }
          : {},
      });
    } catch (error) {
      console.error('TradingView widget initialization failed:', error);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      widgetRef.current = null;
    };
  }, [instrument, isOnline, scriptLoaded, symbol, theme]);

  const isDark = theme === 'dark';
  const normalizedSymbol = normalizeSymbol(symbol);
  const symbolPositions = positions.filter(
    (position) => position?.symbol && normalizeSymbol(position.symbol) === normalizedSymbol
  );

  return (
    <div
      className={`flex h-full w-full flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[100] bg-slate-900'
          : `relative ${isDark ? 'bg-slate-900' : 'bg-white'}`
      }`}
    >
      <div className="relative flex-1 min-h-[500px]">
        {isOnline ? (
          <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div
              className={`max-w-md rounded-2xl border px-6 py-5 text-center ${
                isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-300'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <div className="text-sm font-black uppercase tracking-widest">Advanced Chart Offline</div>
              <div className="mt-3 text-sm leading-6">
                TradingView needs an internet connection. Reconnect to load the advanced chart.
              </div>
            </div>
          </div>
        )}

        {symbolPositions.length > 0 && (
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 flex flex-col justify-center space-y-1.5 pl-2">
            {symbolPositions.map((position, index) => {
              const isBuy = (position.side || position.type || '').toUpperCase() === 'BUY';

              return (
                <div
                  key={position.id || index}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 shadow-lg backdrop-blur-sm ${
                    isBuy
                      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                      : 'border-rose-500/50 bg-rose-500/20 text-rose-400'
                  }`}
                >
                  <span className={`text-[14px] font-black leading-none ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isBuy ? '^' : 'v'}
                  </span>
                  <div className="flex flex-col">
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest ${
                        isBuy ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                    <span className="text-[9px] font-black tabular-nums text-white">
                      @ ${Number(position.entryPrice || position.entry_price || 0).toLocaleString()}
                    </span>
                    {position.quantity && (
                      <span className="text-[7px] font-bold text-slate-400">{position.quantity} units</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeIntent && (
          <div className="pointer-events-none absolute right-8 top-8 z-10 animate-in fade-in zoom-in duration-300">
            <div
              className={`flex items-center space-x-3 rounded-2xl border px-6 py-3 shadow-2xl backdrop-blur-md ${
                activeIntent.side === 'buy'
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-rose-500/30 bg-rose-500/10'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full animate-ping ${
                  activeIntent.side === 'buy' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <div className="flex flex-col">
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    activeIntent.side === 'buy' ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  New {activeIntent.side} Order
                </span>
                <span className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                  {activeIntent.type === 'market'
                    ? 'Market Execution'
                    : `Pending @ ${activeIntent.price || '...'}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`flex items-center justify-between border-t px-4 py-2 text-xs font-medium ${
          isDark
            ? 'border-slate-800 bg-slate-900 text-slate-400'
            : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            {isOnline ? 'LIVE MARKET DATA' : 'OFFLINE MODE'}
          </span>
          <span className="opacity-40">|</span>
          <span>POWERED BY TRADINGVIEW</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-2 rounded border px-3 py-1 transition-all hover:scale-105 active:scale-95 ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-gold-500 hover:bg-slate-700'
                : 'border-slate-200 bg-white text-gold-600 hover:bg-slate-50'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen'}
          >
            {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isFullscreen ? 'Close' : 'Expand'}
            </span>
          </button>
          <div
            className={`rounded border px-2 py-0.5 ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-gold-500'
                : 'border-slate-200 bg-white text-gold-600'
            }`}
          >
            ADVANCED ANALYSIS MODE
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewWidget;
