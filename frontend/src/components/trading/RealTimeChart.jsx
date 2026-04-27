import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { FaExpand, FaCompress, FaChartBar } from 'react-icons/fa';
import infraService from '../../services/infraService';

const INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

const formatExecutionSymbol = (symbol = '') => {
  if (symbol.endsWith('USDT')) {
    return `${symbol.slice(0, -4)} / USDT`;
  }

  if (symbol.endsWith('USD') && symbol.length > 6) {
    return `${symbol.slice(0, -3)} / USD`;
  }

  return symbol;
};

const RealTimeChart = ({ 
  symbol = 'BTCUSDT',
  theme = 'dark',
  positions = [],
  activeIntent = null,
  livePrice = 0,
  initialPrice = 100
}) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const wsRef = useRef(null);
  const wsConnectTimerRef = useRef(null);
  const wsClosingRef = useRef(false);
  const candleTimesRef = useRef([]);
  const candleDataRef = useRef([]);
  const shouldUseLiveWsRef = useRef(true);
  const [interval, setInterval] = useState('15m');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastPrice, setLastPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState('connecting');

  const isDark = theme === 'dark';

  const applyIndicatorSeries = useCallback((data = []) => {
    if (!chartRef.current || data.length === 0) {
      return;
    }

    if (!chartRef.current.__sma20Series) {
      chartRef.current.__sma20Series = chartRef.current.addLineSeries({
        color: '#f59e0b',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
    }

    if (!chartRef.current.__ema50Series) {
      chartRef.current.__ema50Series = chartRef.current.addLineSeries({
        color: '#38bdf8',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
    }

    let rollingSum = 0;
    let ema = null;
    const multiplier = 2 / 51;
    const smaData = [];
    const emaData = [];

    data.forEach((candle, index) => {
      rollingSum += candle.close;
      if (index >= 20) {
        rollingSum -= data[index - 20].close;
      }

      if (index >= 19) {
        smaData.push({
          time: candle.time,
          value: rollingSum / 20,
        });
      }

      ema = ema == null ? candle.close : ((candle.close - ema) * multiplier) + ema;
      emaData.push({
        time: candle.time,
        value: ema,
      });
    });

    chartRef.current.__sma20Series.setData(smaData);
    chartRef.current.__ema50Series.setData(emaData);
  }, []);

  // Format symbol cleanly for Binance API
  const binanceSymbol = symbol.replace(/[^A-Z0-9]/g, '');
  const isBinanceWsCandidate = useCallback((sym) => {
    if (!sym) return false;
    const s = sym.replace(/[^A-Z0-9]/g, '');
    // Binance klines are reliable for spot-like symbols (primarily quote-paired crypto symbols)
    return s.endsWith('USDT') || s.endsWith('BTC') || s.endsWith('BUSD');
  }, []);

  const canUseLiveConnections = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine && document.visibilityState !== 'hidden';
  }, []);

  // --- Helper: Generate Mock Data ---
  const generateMockData = (basePrice, count = 300) => {
    let prev = basePrice || 100;
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    const intervalSec = 15 * 60; // 15m default
    
    for (let i = count; i > 0; i--) {
      const open = prev;
      const close = open + (Math.random() - 0.5) * (open * 0.01);
      const high = Math.max(open, close) + Math.random() * (open * 0.005);
      const low = Math.min(open, close) - Math.random() * (open * 0.005);
      
      data.push({
        time: now - (i * intervalSec),
        open, high, low, close
      });
      prev = close;
    }
    return data;
  };

  // --- Fetch Historical Kline Data via Backend Proxy ---
  const fetchData = useCallback(async (sym, iv, initPrice) => {
    try {
      setIsLoading(true);
      const res = await infraService.getMarketHistory(sym, iv, initPrice);
      
      if (!res.success || !res.data) throw new Error('Proxy error');

      const candles = res.data.map(d => ({
        time: d[0] / 1000,
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }));

      return {
        candles,
        isMock: Boolean(res.isMock)
      };
    } catch (err) {
      // Failover is handled by proxy, but we handle it here too for maximum safety
      return {
        candles: generateMockData(initPrice),
        isMock: true
      };
    } finally {
      setIsLoading(false);
    }
  }, []); // initialPrice removed from dependencies to prevent re-creating this function on every price update

  // --- Build / Rebuild chart ---
  useEffect(() => {
    if (!containerRef.current) return;
    let historyPollTimer = null;

    // Guards against the async fetchData or ResizeObserver resolver after this effect has cleaned up.
    let active = true;
    shouldUseLiveWsRef.current = true;
    setLiveStatus(canUseLiveConnections() ? 'connecting' : 'offline');

    // Cleanup previous chart/WS before creating new ones
    if (wsRef.current) {
      try {
        wsClosingRef.current = true;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close(1000, 'Chart reinit');
        }
      } catch (e) {}
      wsRef.current = null;
    }
    if (wsConnectTimerRef.current) {
      clearTimeout(wsConnectTimerRef.current);
      wsConnectTimerRef.current = null;
    }
    
    if (chartRef.current) {
      try { chartRef.current.remove(); } catch (e) {}
      chartRef.current = null;
    }
    seriesRef.current = null;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: isDark ? '#0a0f1c' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#334155',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: isDark ? '#1e2d40' : '#f1f5f9', style: 1 },
        horzLines: { color: isDark ? '#1e2d40' : '#f1f5f9', style: 1 },
      },
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: '#ffd700', style: 3, labelBackgroundColor: '#1e293b' },
        horzLine: { width: 1, color: '#ffd700', style: 3, labelBackgroundColor: '#1e293b' },
      },
      rightPriceScale: {
        borderColor: isDark ? '#1e2d40' : '#e2e8f0',
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderColor: isDark ? '#1e2d40' : '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 10,
      },
      handleScroll: true,
      handleScale: true,
    });
    chartRef.current = chart;

    // Ensure re-layout after a short delay (for CSS Transitions/Hidden switches)
    const handleInitialLayout = () => {
      if (!active || !chartRef.current || !containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w > 0 && h > 0) {
        chartRef.current.applyOptions({ width: w, height: h });
      }
    };
    setTimeout(handleInitialLayout, 50);
    setTimeout(handleInitialLayout, 250); // double check after transition

    // Candlestick series
    const candles = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: binanceSymbol.includes('USDT') ? 2 : 5,
        minMove: binanceSymbol.includes('USDT') ? 0.01 : 0.00001,
      },
    });
    seriesRef.current = candles;

    // Load historical data then open WS
    fetchData(binanceSymbol, interval, initialPrice).then(result => {
      // strict check: if not active OR chart/series already nulled, bail out.
      if (!active || !seriesRef.current || !chartRef.current) return;

      try {
        const data = result?.candles || [];
        const isMock = Boolean(result?.isMock);

        if (data.length > 0) {
          seriesRef.current.setData(data);
          candleTimesRef.current = data.map(c => c.time);
          candleDataRef.current = data;
          applyIndicatorSeries(data);
          chartRef.current.timeScale().fitContent();
          
          const last = data[data.length - 1];
          const first = data[0];
          setLastPrice(last.close);
          setPriceChange(((last.close - first.open) / first.open * 100).toFixed(2));
          window.dispatchEvent(new CustomEvent('active_price_update', {
            detail: { symbol, price: last.close }
          }));
        }

        // Don't open Binance WS for fallback/mock data or unsupported symbols.
        if (isMock || !isBinanceWsCandidate(binanceSymbol)) {
          if (!isMock) {
            historyPollTimer = setInterval(async () => {
              const refresh = await fetchData(binanceSymbol, interval, initialPrice);
              if (!active || !seriesRef.current || !chartRef.current || !refresh?.candles?.length) {
                return;
              }

              const refreshedData = refresh.candles;
              seriesRef.current.setData(refreshedData);
              candleTimesRef.current = refreshedData.map((candle) => candle.time);
              candleDataRef.current = refreshedData;
              applyIndicatorSeries(refreshedData);

              const latest = refreshedData[refreshedData.length - 1];
              const first = refreshedData[0];
              setLastPrice(latest.close);
              setPriceChange(((latest.close - first.open) / first.open * 100).toFixed(2));
              window.dispatchEvent(new CustomEvent('active_price_update', {
                detail: { symbol, price: latest.close }
              }));
              setLiveStatus('live');
            }, 15000);
          }

          setLiveStatus(isMock ? 'fallback' : 'live');
          return;
        }
        if (!canUseLiveConnections()) {
          setLiveStatus('offline');
          return;
        }

        // Open WebSocket for live kline updates
        const wsSymbol = binanceSymbol.toLowerCase();
        wsConnectTimerRef.current = setTimeout(() => {
          if (!active || wsRef.current || !shouldUseLiveWsRef.current || !canUseLiveConnections()) return;
          wsClosingRef.current = false;
          const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${interval}`);
          wsRef.current = ws;

          ws.onopen = () => {
            if (!active || wsRef.current !== ws) return;
            setLiveStatus('live');
          };
          ws.onerror = () => {
            if (!active || wsRef.current !== ws || wsClosingRef.current) return;
            setLiveStatus(canUseLiveConnections() ? 'reconnecting' : 'offline');
          };
          ws.onclose = (event) => {
            if (wsRef.current === ws) wsRef.current = null;
            if (!active) return;
            if (wsClosingRef.current || event.code === 1000) {
              setLiveStatus(canUseLiveConnections() ? 'idle' : 'offline');
              return;
            }
            setLiveStatus(canUseLiveConnections() ? 'reconnecting' : 'offline');
          };

          ws.onmessage = (event) => {
            try {
              // Re-check existence inside every async callback
              if (!active || !seriesRef.current) return;
              const { k } = JSON.parse(event.data);
              if (!k) return;
              const tick = {
                time: k.t / 1000,
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
              };
              seriesRef.current.update(tick);
              const existingIndex = candleDataRef.current.findIndex((candle) => candle.time === tick.time);
              if (existingIndex >= 0) {
                candleDataRef.current[existingIndex] = tick;
              } else {
                candleDataRef.current = [...candleDataRef.current, tick].slice(-500);
              }
              applyIndicatorSeries(candleDataRef.current);
              if (
                candleTimesRef.current.length === 0 ||
                candleTimesRef.current[candleTimesRef.current.length - 1] !== tick.time
              ) {
                candleTimesRef.current.push(tick.time);
                if (candleTimesRef.current.length > 2000) {
                  candleTimesRef.current = candleTimesRef.current.slice(-2000);
                }
              }
              setLastPrice(tick.close);
              window.dispatchEvent(new CustomEvent('active_price_update', { 
                detail: { symbol, price: tick.close } 
              }));
              setLiveStatus('live');
            } catch (e) {}
          };
        }, 120);
      } catch (err) {
        console.error('[RealTimeChart] Chart update error:', err);
      }
    });

    // --- Using ResizeObserver instead of window.resize for better local lifecycle sync ---
    const resizeObserver = new ResizeObserver((entries) => {
      if (!active || !chartRef.current || !entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return; // ignore hidden state
      
      try {
        chartRef.current.applyOptions({ width, height });
      } catch (e) {
        // "Object is disposed" usually happens here if remove() was called but RO fired one last time
      }
    });

    resizeObserver.observe(containerRef.current);

    const handleOnline = () => {
      if (!active) return;
      setLiveStatus('connecting');
    };

    const handleOffline = () => {
      if (!active) return;
      setLiveStatus('offline');
      if (wsRef.current) {
        try {
          wsClosingRef.current = true;
          wsRef.current.onmessage = null;
          wsRef.current.onerror = null;
          wsRef.current.onclose = null;
          wsRef.current.close(1000, 'Browser offline');
        } catch (e) {}
        wsRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (!active) return;
      if (document.visibilityState === 'hidden') {
        handleOffline();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      shouldUseLiveWsRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      if (wsConnectTimerRef.current) {
        clearTimeout(wsConnectTimerRef.current);
        wsConnectTimerRef.current = null;
      }
      if (historyPollTimer) {
        clearInterval(historyPollTimer);
        historyPollTimer = null;
      }
      if (wsRef.current) {
        try {
          wsClosingRef.current = true;
          // Null out all handlers FIRST to silence any incoming messages/errors during close
          wsRef.current.onmessage = null;
          wsRef.current.onerror = null;
          wsRef.current.onclose = null;
          // Only close if not already closing/closed
          if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
            wsRef.current.close();
          }
        } catch (e) {}
        wsRef.current = null;
      }
      // Null refs BEFORE calling remove() to stop pending async callbacks immediately
      const currentChart = chartRef.current;
      seriesRef.current = null;
      chartRef.current = null;
      
      if (currentChart) {
        try {
          currentChart.remove();
        } catch (e) {}
      }
      candleTimesRef.current = [];
      candleDataRef.current = [];
    };
  }, [symbol, interval, isDark, fetchData, isBinanceWsCandidate, applyIndicatorSeries]); // initialPrice removed from dependencies

  useEffect(() => {
    const nextPrice = Number.parseFloat(livePrice) || 0;
    if (!nextPrice || !seriesRef.current || candleDataRef.current.length === 0) {
      return;
    }

    const lastCandle = candleDataRef.current[candleDataRef.current.length - 1];
    if (!lastCandle || lastCandle.close === nextPrice) {
      return;
    }

    const syncedCandle = {
      ...lastCandle,
      high: Math.max(lastCandle.high, nextPrice),
      low: Math.min(lastCandle.low, nextPrice),
      close: nextPrice,
    };

    candleDataRef.current = [
      ...candleDataRef.current.slice(0, -1),
      syncedCandle,
    ];

    try {
      seriesRef.current.update(syncedCandle);
      applyIndicatorSeries(candleDataRef.current);
      setLastPrice(nextPrice);
      window.dispatchEvent(new CustomEvent('active_price_update', {
        detail: { symbol, price: nextPrice }
      }));
    } catch (error) {
      console.error('[RealTimeChart] Live price sync error:', error);
    }
  }, [applyIndicatorSeries, livePrice, symbol]);

  // --- Plot Buy/Sell markers when positions change ---
  useEffect(() => {
    if (!seriesRef.current) return;

    const snapToNearestCandleTime = (unixTime) => {
      const times = candleTimesRef.current;
      if (!times || times.length === 0) return Math.floor(Date.now() / 1000);

      if (unixTime <= times[0]) return times[0];
      if (unixTime >= times[times.length - 1]) return times[times.length - 1];

      let lo = 0;
      let hi = times.length - 1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (times[mid] === unixTime) return times[mid];
        if (times[mid] < unixTime) lo = mid + 1;
        else hi = mid - 1;
      }

      const lower = times[Math.max(0, hi)];
      const upper = times[Math.min(times.length - 1, lo)];
      return (Math.abs(unixTime - lower) <= Math.abs(upper - unixTime)) ? lower : upper;
    };

    const relevant = positions.filter(
      p => p?.symbol && p.symbol.replace(/[^A-Z0-9]/g, '') === binanceSymbol
    );

    const markers = relevant.map(pos => {
      const side = (pos.side || pos.type || 'buy').toLowerCase();
      const isBuy = side === 'buy';
      // Position times are rarely exact candle opens; snap for guaranteed marker visibility.
      const rawT = pos.created_at || pos.createdAt || pos.entryTime || pos.openTime
        ? Math.floor(new Date(pos.created_at || pos.createdAt || pos.entryTime || pos.openTime).getTime() / 1000)
        : Math.floor(Date.now() / 1000);
      const t = snapToNearestCandleTime(rawT);

      return {
        time: t,
        position: isBuy ? 'belowBar' : 'aboveBar',
        color: isBuy ? '#10b981' : '#ef4444',
        shape: isBuy ? 'arrowUp' : 'arrowDown',
        size: 3,
        text: `${isBuy ? 'BUY' : 'SELL'} @ ${Number(pos.entryPrice || pos.entry_price || 0).toLocaleString()}`,
      };
    });

    if (activeIntent?.side && candleDataRef.current.length > 0) {
      const latestCandle = candleDataRef.current[candleDataRef.current.length - 1];
      const previewIsBuy = String(activeIntent.side).toLowerCase() === 'buy';
      markers.push({
        time: latestCandle.time,
        position: previewIsBuy ? 'belowBar' : 'aboveBar',
        color: previewIsBuy ? '#22c55e' : '#f43f5e',
        shape: previewIsBuy ? 'arrowUp' : 'arrowDown',
        size: 3,
        text: `${previewIsBuy ? 'BUY' : 'SELL'} READY`,
      });
    }

    markers.sort((a, b) => a.time - b.time);
    try { seriesRef.current.setMarkers(markers); } catch (e) {}
  }, [activeIntent, positions, symbol, interval]);
// Fullscreen Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  const isUp = Number(priceChange) >= 0;
  const liveLabel = {
    live: 'LIVE',
    connecting: 'CONNECTING',
    reconnecting: 'RECONNECTING',
    offline: 'OFFLINE',
    fallback: 'SIMULATED',
    idle: 'READY',
  }[liveStatus] || 'LIVE';
  const liveTone = liveStatus === 'live'
    ? 'text-emerald-400'
    : liveStatus === 'fallback'
      ? 'text-amber-400'
      : 'text-slate-400';
  const liveDotTone = liveStatus === 'live'
    ? 'bg-emerald-500 animate-pulse'
    : liveStatus === 'fallback'
      ? 'bg-amber-400'
      : 'bg-slate-500';

  return (
    <div className={`flex flex-col h-full w-full ${isDark ? 'bg-[#0a0f1c]' : 'bg-white'} ${isFullscreen ? 'fixed inset-0 z-[100]' : 'relative'}`}>
      
      {/* ── Toolbar ── */}
      <div className={`flex items-center justify-between px-4 py-2 border-b flex-shrink-0 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        {/* Left: Symbol + Price */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaChartBar size={12} className="text-gold-500" />
            <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatExecutionSymbol(symbol)}
            </span>
          </div>
          {lastPrice && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {Number(lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {priceChange && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isUp ? '+' : ''}{priceChange}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Center: Interval buttons */}
        <div className="flex items-center gap-1">
          {INTERVALS.map(iv => (
            <button
              key={iv.value}
              onClick={() => setInterval(iv.value)}
              className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide transition-all ${
                interval === iv.value
                  ? 'bg-gold-500 text-slate-900'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Indicators</span>
          <span className="px-2 py-1 rounded-full bg-amber-500/15 text-[8px] font-black uppercase tracking-widest text-amber-400">SMA 20</span>
          <span className="px-2 py-1 rounded-full bg-sky-500/15 text-[8px] font-black uppercase tracking-widest text-sky-400">EMA 50</span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[8px] text-slate-400 uppercase tracking-widest animate-pulse">Loading...</span>
          )}
          <span className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest ${liveTone}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${liveDotTone}`} />
            {liveLabel}
          </span>
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className={`p-1.5 rounded-md transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FaCompress size={11} /> : <FaExpand size={11} />}
          </button>
        </div>
      </div>

      {/* ── Chart Canvas ── */}
      <div ref={containerRef} className="flex-1 relative min-h-0" />
    </div>
  );
};

export default RealTimeChart;


