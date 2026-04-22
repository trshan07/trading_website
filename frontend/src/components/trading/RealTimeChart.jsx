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

const RealTimeChart = ({ 
  symbol = 'BTCUSDT',
  theme = 'dark',
  positions = [],
  initialPrice = 100
}) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const wsRef = useRef(null);
  const [interval, setInterval] = useState('15m');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastPrice, setLastPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === 'dark';

  // Format symbol cleanly for Binance API
  const binanceSymbol = symbol.replace(/[^A-Z0-9]/g, '');

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
  const fetchData = useCallback(async (sym, iv) => {
    try {
      setIsLoading(true);
      const res = await infraService.getMarketHistory(sym, iv, initialPrice);
      
      if (!res.success || !res.data) throw new Error('Proxy error');

      return res.data.map(d => ({
        time: d[0] / 1000,
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }));
    } catch (err) {
      // Failover is handled by proxy, but we handle it here too for maximum safety
      return generateMockData(initialPrice); 
    } finally {
      setIsLoading(false);
    }
  }, [initialPrice]);

  // --- Build / Rebuild chart ---
  useEffect(() => {
    if (!containerRef.current) return;

    // Guards against the async fetchData or ResizeObserver resolver after this effect has cleaned up.
    let active = true;

    // Cleanup previous chart/WS before creating new ones
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) {}
      wsRef.current = null;
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
    fetchData(binanceSymbol, interval).then(data => {
      // strict check: if not active OR chart/series already nulled, bail out.
      if (!active || !seriesRef.current || !chartRef.current) return;

      try {
        if (data.length > 0) {
          seriesRef.current.setData(data);
          chartRef.current.timeScale().fitContent();
          
          const last = data[data.length - 1];
          const first = data[0];
          setLastPrice(last.close);
          setPriceChange(((last.close - first.open) / first.open * 100).toFixed(2));
        }

        // Open WebSocket for live kline updates
        const wsSymbol = binanceSymbol.toLowerCase();
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${interval}`);
        wsRef.current = ws;

        // Suppress errors (e.g. network close race conditions)
        ws.onerror = () => {};

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
            setLastPrice(tick.close);
          } catch (e) {}
        };
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

    return () => {
      active = false;
      resizeObserver.disconnect();
      if (wsRef.current) {
        try {
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
    };
  }, [symbol, interval, isDark, initialPrice]);

  // --- Plot Buy/Sell markers when positions change ---
  useEffect(() => {
    if (!seriesRef.current) return;
    const relevant = positions.filter(
      p => p?.symbol && p.symbol.replace(/[^A-Z0-9]/g, '') === binanceSymbol
    );
    const markers = relevant.map(pos => {
      const side = (pos.side || pos.type || 'buy').toLowerCase();
      const isBuy = side === 'buy';
      // Use recorded entry time or snap to nearest candle time (now)
      const t = pos.created_at || pos.entryTime || pos.openTime
        ? Math.floor(new Date(pos.created_at || pos.entryTime || pos.openTime).getTime() / 1000)
        : Math.floor(Date.now() / 1000);
      return {
        time: t,
        position: isBuy ? 'belowBar' : 'aboveBar',
        color: isBuy ? '#10b981' : '#ef4444',
        shape: isBuy ? 'arrowUp' : 'arrowDown',
        size: 2,
        text: `${isBuy ? '▲ BUY' : '▼ SELL'} @ ${Number(pos.entryPrice || pos.entry_price || 0).toLocaleString()}`,
      };
    });
    markers.sort((a, b) => a.time - b.time);
    try { seriesRef.current.setMarkers(markers); } catch (e) {}
  }, [positions, symbol]);

  // Fullscreen Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  const isUp = Number(priceChange) >= 0;

  return (
    <div className={`flex flex-col h-full w-full ${isDark ? 'bg-[#0a0f1c]' : 'bg-white'} ${isFullscreen ? 'fixed inset-0 z-[100]' : 'relative'}`}>
      
      {/* ── Toolbar ── */}
      <div className={`flex items-center justify-between px-4 py-2 border-b flex-shrink-0 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        {/* Left: Symbol + Price */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaChartBar size={12} className="text-gold-500" />
            <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {symbol.replace('USDT','').replace('USD','')} / USDT
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

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[8px] text-slate-400 uppercase tracking-widest animate-pulse">Loading...</span>
          )}
          <span className="flex items-center gap-1.5 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
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