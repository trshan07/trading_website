import React, { useEffect, useRef, memo } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const TradingViewWidget = memo(({ 
  symbol = 'BTCUSDT',
  theme = 'dark',
  height = '100%',
  width = '100%',
  positions = []
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Map symbols to Binance format (e.g. BTCUSD -> BTCUSDT)
  const getBinanceSymbol = (s) => {
      const upper = (s || 'BTCUSD').toUpperCase();
      if (upper === 'BTCUSD') return 'BTCUSDT';
      if (upper === 'ETHUSD') return 'ETHUSDT';
      return upper;
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chartOptions = {
      layout: {
        background: { color: theme === 'dark' ? '#0f172a' : '#ffffff' },
        textColor: theme === 'dark' ? '#94a3b8' : '#334155',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
        horzLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
      },
      crosshair: {
        mode: 0,
      },
      priceScale: {
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
    };

    let isMounted = true;

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    // v4.2 API: use addCandlestickSeries
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    seriesRef.current = candlestickSeries;

    // Fetch historical data
    const fetchHistory = async () => {
        try {
            const apiSymbol = getBinanceSymbol(symbol);
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${apiSymbol}&interval=1m&limit=500`);
            const data = await response.json();
            
            if (isMounted && Array.isArray(data)) {
                const cdata = data.map(d => ({
                    time: d[0] / 1000,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                }));
                candlestickSeries.setData(cdata);
                chart.timeScale().fitContent();
            }
        } catch (error) {
            if (isMounted) console.error('[Trading Error]:', error);
        }
    };

    fetchHistory();

    // WebSocket logic
    const apiSymbol = getBinanceSymbol(symbol).toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${apiSymbol}@kline_1m`);

    ws.onmessage = (event) => {
        if (!isMounted) return;
        const data = JSON.parse(event.data);
        const kline = data.k;
        if (candlestickSeries) {
            candlestickSeries.update({
                time: kline.t / 1000,
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
            });
        }
    };

    ws.onerror = (err) => {
        if (isMounted) console.error('[WS Error]:', err);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      
      if (ws) {
          ws.onmessage = null;
          ws.onerror = null;
          ws.onclose = null;
          
          if (ws.readyState === WebSocket.OPEN) {
              ws.close();
          } else if (ws.readyState === WebSocket.CONNECTING) {
              // Subtle trick: if it's still connecting, wait for it to open then close 
              // to avoid the "closed before connection established" console error.
              ws.onopen = () => ws.close();
          }
      }
      
      if (chart) chart.remove();
    };
  }, [symbol]); // Only re-run if symbol changes

  // Dynamic Theme/Options Update
  useEffect(() => {
    if (chartRef.current) {
        chartRef.current.applyOptions({
            layout: {
                background: { color: theme === 'dark' ? '#0f172a' : '#ffffff' },
                textColor: theme === 'dark' ? '#94a3b8' : '#334155',
            },
            grid: {
                vertLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
                horzLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
            },
            priceScale: {
                borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
            },
            timeScale: {
                borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
            },
        });
    }
  }, [theme]);

  // Update Markers (Positions)
  useEffect(() => {
      if (!seriesRef.current || !positions || positions.length === 0) {
          if (seriesRef.current) seriesRef.current.setMarkers([]);
          return;
      }

      try {
          // Filter positions for this symbol
          const filtered = positions
              .filter(pos => {
                  if (!pos.chartMarker) return false;
                  const posSym = (pos.symbol || '').toUpperCase();
                  const chartSym = (symbol || '').toUpperCase();
                  return posSym === chartSym || getBinanceSymbol(posSym) === getBinanceSymbol(chartSym);
              })
              .map(pos => ({ ...pos.chartMarker }));

          // Sort by time ascending
          filtered.sort((a, b) => a.time - b.time);

          // ENFORCE STRICT ASCENDING ORDER (LIGHTWEIGHT CHARTS REQUIREMENT)
          // If two markers have the same time, we'll increment the later one by 1 second
          const strictMarkers = filtered.reduce((acc, current, idx) => {
              if (idx > 0) {
                  const prev = acc[idx - 1];
                  if (current.time <= prev.time) {
                    current.time = prev.time + 1;
                  }
              }
              acc.push(current);
              return acc;
          }, []);

          console.log('[Chart] Applying markers:', strictMarkers);
          seriesRef.current.setMarkers(strictMarkers);
      } catch (err) {
          console.error('[Chart Error] Failed to set markers:', err);
      }
  }, [positions, symbol]);

  return (
    <div 
      ref={chartContainerRef}
      id="lightweight-chart-container"
      style={{ 
        height, 
        width,
        position: 'relative'
      }}
    />
  );
});

export default TradingViewWidget;