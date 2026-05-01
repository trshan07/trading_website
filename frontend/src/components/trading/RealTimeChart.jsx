import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, LineStyle } from 'lightweight-charts';
import { FaChartBar, FaCompress, FaExpand, FaServer } from 'react-icons/fa';
import infraService from '../../services/infraService';
import { buildInstrumentSnapshot, formatInstrumentDisplaySymbol, getSymbolPrecision, normalizeSymbol } from '../../utils/marketSymbols';

const INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

const HISTORY_REFRESH_MS = 15000;

const formatExecutionSymbol = (symbol = '') => formatInstrumentDisplaySymbol(symbol, { withSlash: true }).replace('/', ' / ');

const toCandles = (rows = []) => rows.reduce((acc, row) => {
  const time = Number(row?.[0]) / 1000;
  const open = Number.parseFloat(row?.[1]);
  const high = Number.parseFloat(row?.[2]);
  const low = Number.parseFloat(row?.[3]);
  const close = Number.parseFloat(row?.[4]);

  if (!Number.isFinite(time) || [open, high, low, close].some((value) => !Number.isFinite(value))) {
    return acc;
  }

  acc.push({ time, open, high, low, close });
  return acc;
}, []);

const createFallbackCandles = (price = 100, interval = '15m', count = 120) => {
  const safePrice = Number.parseFloat(price) || 100;
  const intervalSecondsMap = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '1h': 3600,
    '4h': 14400,
    '1d': 86400,
    '1w': 604800,
  };
  const intervalSeconds = intervalSecondsMap[interval] || intervalSecondsMap['15m'];
  const now = Math.floor(Date.now() / 1000);

  return Array.from({ length: count }, (_, index) => {
    const time = now - ((count - index) * intervalSeconds);
    return {
      time,
      open: safePrice,
      high: safePrice,
      low: safePrice,
      close: safePrice,
    };
  });
};

const RealTimeChart = ({
  symbol = 'BTCUSDT',
  theme = 'dark',
  instrument = null,
  positions = [],
  closedTrades = [],
  activeIntent = null,
  livePrice = 0,
  initialPrice = 100,
}) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const candleTimesRef = useRef([]);
  const candleDataRef = useRef([]);
  const historyRefreshRef = useRef(null);
  const priceLinesRef = useRef([]);
  const [interval, setInterval] = useState('15m');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastPrice, setLastPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveStatus, setLiveStatus] = useState('connecting');
  const [lastQuoteAt, setLastQuoteAt] = useState(0);
  const [historySource, setHistorySource] = useState('market-provider');
  const [historyVersion, setHistoryVersion] = useState(0);

  const isDark = theme === 'dark';
  const normalizedSymbol = useMemo(() => normalizeSymbol(symbol), [symbol]);
  const instrumentSnapshot = buildInstrumentSnapshot({
    symbol,
    instrument: instrument || { symbol, price: livePrice || initialPrice },
    marketData: {
      [symbol]: {
        price: livePrice || initialPrice,
      },
    },
  });
  const pricePrecision = Number.isInteger(instrumentSnapshot.precision)
    ? instrumentSnapshot.precision
    : getSymbolPrecision({
      symbol,
      category: instrumentSnapshot.category || '',
      price: livePrice || initialPrice || 0,
    });
  const priceMinMove = pricePrecision <= 0 ? 1 : Number((1 / (10 ** pricePrecision)).toFixed(pricePrecision));

  const clearTradeLines = () => {
    if (!seriesRef.current || priceLinesRef.current.length === 0) {
      priceLinesRef.current = [];
      return;
    }

    priceLinesRef.current.forEach((priceLine) => {
      try {
        seriesRef.current.removePriceLine(priceLine);
      } catch (error) {}
    });
    priceLinesRef.current = [];
  };

  useEffect(() => {
    const handleOnline = () => setLiveStatus('connecting');
    const handleOffline = () => setLiveStatus('offline');
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setLiveStatus('offline');
      } else {
        setLiveStatus('connecting');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
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
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    let active = true;

    if (historyRefreshRef.current) {
      clearInterval(historyRefreshRef.current);
      historyRefreshRef.current = null;
    }

    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (error) {}
      chartRef.current = null;
    }
    seriesRef.current = null;
    candleTimesRef.current = [];
    candleDataRef.current = [];
    priceLinesRef.current = [];

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

    const series = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: pricePrecision,
        minMove: priceMinMove,
      },
    });
    seriesRef.current = series;

    const syncChartSize = () => {
      if (!active || !chartRef.current || !containerRef.current) {
        return;
      }

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      if (width > 0 && height > 0) {
        chartRef.current.applyOptions({ width, height });
      }
    };

    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const response = await infraService.getMarketHistory(symbol, interval, initialPrice);
        const candles = toCandles(response?.data || []);
        const canUseQuoteFallback = Boolean(response?.isSynthetic)
          && Number.isFinite(livePrice || initialPrice || instrumentSnapshot.price || 0);
        const usableCandles = candles.length > 0
          ? candles
          : canUseQuoteFallback
            ? createFallbackCandles(livePrice || initialPrice || instrumentSnapshot.price || 100, interval)
            : [];

        if (!active || !seriesRef.current) {
          return;
        }

        seriesRef.current.setData(usableCandles);
        candleDataRef.current = usableCandles;
        candleTimesRef.current = usableCandles.map((candle) => candle.time);
        setHistoryVersion((value) => value + 1);
        setHistorySource(response?.source || (candles.length > 0 ? 'market-provider' : 'unavailable'));

        if (usableCandles.length > 0) {
          chartRef.current?.timeScale().fitContent();

          const first = usableCandles[0];
          const last = usableCandles[usableCandles.length - 1];
          setLastPrice(last.close);
          setPriceChange(first?.open ? (((last.close - first.open) / first.open) * 100).toFixed(2) : null);
          setLiveStatus(candles.length > 0 ? 'live' : (canUseQuoteFallback ? 'quote-sync' : 'delayed'));

          window.dispatchEvent(new CustomEvent('active_price_update', {
            detail: { symbol, price: last.close, source: 'platform-feed' },
          }));
          return;
        }

        setLastPrice(null);
        setPriceChange(null);
        setLiveStatus(navigator.onLine ? 'delayed' : 'offline');
      } catch (error) {
        if (active) {
          setHistorySource('unavailable');
          setLiveStatus(navigator.onLine ? 'delayed' : 'offline');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadHistory();
    historyRefreshRef.current = setInterval(loadHistory, HISTORY_REFRESH_MS);

    const resizeObserver = new ResizeObserver(() => {
      syncChartSize();
    });
    resizeObserver.observe(containerRef.current);

    setTimeout(syncChartSize, 50);
    setTimeout(syncChartSize, 250);

    return () => {
      active = false;
      if (historyRefreshRef.current) {
        clearInterval(historyRefreshRef.current);
        historyRefreshRef.current = null;
      }
      resizeObserver.disconnect();

      const currentChart = chartRef.current;
      clearTradeLines();
      chartRef.current = null;
      seriesRef.current = null;
      candleTimesRef.current = [];
      candleDataRef.current = [];

      if (currentChart) {
        try {
          currentChart.remove();
        } catch (error) {}
      }
    };
  }, [interval, isDark, priceMinMove, pricePrecision, symbol]);

  useEffect(() => {
    const nextPrice = Number.parseFloat(livePrice);
    if (!Number.isFinite(nextPrice) || !seriesRef.current || candleDataRef.current.length === 0) {
      return;
    }

    const lastCandle = candleDataRef.current[candleDataRef.current.length - 1];
    if (!lastCandle) {
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
      setLastPrice(nextPrice);
      setLastQuoteAt(Date.now());
      setLiveStatus(navigator.onLine ? (historySource === 'quote-fallback' ? 'quote-sync' : 'live') : 'offline');
      window.dispatchEvent(new CustomEvent('active_price_update', {
        detail: { symbol, price: nextPrice, source: 'platform-feed' },
      }));
    } catch (error) {}
  }, [historySource, livePrice, symbol]);

  useEffect(() => {
    if (!seriesRef.current) {
      return;
    }

    const snapToNearestCandleTime = (unixTime) => {
      const times = candleTimesRef.current;
      if (!times.length) {
        return Math.floor(Date.now() / 1000);
      }

      if (unixTime <= times[0]) return times[0];
      if (unixTime >= times[times.length - 1]) return times[times.length - 1];

      let low = 0;
      let high = times.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (times[mid] === unixTime) return times[mid];
        if (times[mid] < unixTime) low = mid + 1;
        else high = mid - 1;
      }

      const lower = times[Math.max(0, high)];
      const upper = times[Math.min(times.length - 1, low)];
      return Math.abs(unixTime - lower) <= Math.abs(upper - unixTime) ? lower : upper;
    };

    clearTradeLines();

    const openPositionMarkers = positions
      .filter((position) => normalizeSymbol(position?.symbol) === normalizedSymbol)
      .map((position) => {
        const side = String(position.side || position.type || 'buy').toLowerCase();
        const isBuy = side === 'buy';
        const rawTime = position.created_at || position.createdAt || position.entryTime || position.openTime;
        const unixTime = rawTime
          ? Math.floor(new Date(rawTime).getTime() / 1000)
          : Math.floor(Date.now() / 1000);

        return {
          time: snapToNearestCandleTime(unixTime),
          position: isBuy ? 'belowBar' : 'aboveBar',
          color: isBuy ? '#10b981' : '#ef4444',
          shape: isBuy ? 'arrowUp' : 'arrowDown',
          size: 3,
          text: `${isBuy ? 'BUY' : 'SELL'} @ ${Number(position.entryPrice || position.entry_price || 0).toLocaleString()}`,
        };
      });

    const closedTradeMarkers = closedTrades
      .filter((trade) => normalizeSymbol(trade?.symbol) === normalizedSymbol)
      .flatMap((trade) => {
        const side = String(trade.side || trade.type || 'buy').toLowerCase();
        const isBuy = side === 'buy';
        const openRawTime = trade.createdAt || trade.created_at || trade.entryTime || trade.openTime;
        const closeRawTime = trade.closedAt || trade.closed_at || trade.updatedAt || trade.updated_at;
        const openUnixTime = openRawTime
          ? Math.floor(new Date(openRawTime).getTime() / 1000)
          : null;
        const closeUnixTime = closeRawTime
          ? Math.floor(new Date(closeRawTime).getTime() / 1000)
          : null;
        const markers = [];

        if (openUnixTime) {
          markers.push({
            time: snapToNearestCandleTime(openUnixTime),
            position: isBuy ? 'belowBar' : 'aboveBar',
            color: isBuy ? '#10b981' : '#ef4444',
            shape: isBuy ? 'arrowUp' : 'arrowDown',
            size: 2,
            text: `${isBuy ? 'BUY' : 'SELL'} OPEN @ ${Number(trade.entryPrice || trade.entry_price || 0).toLocaleString()}`,
          });
        }

        if (closeUnixTime) {
          markers.push({
            time: snapToNearestCandleTime(closeUnixTime),
            position: isBuy ? 'aboveBar' : 'belowBar',
            color: '#f59e0b',
            shape: 'square',
            size: 2,
            text: `CLOSE @ ${Number(trade.exitPrice || trade.close_price || 0).toLocaleString()}`,
          });
        }

        return markers;
      });

    positions
      .filter((position) => normalizeSymbol(position?.symbol) === normalizedSymbol)
      .forEach((position, index) => {
        const side = String(position.side || position.type || 'buy').toLowerCase();
        const isBuy = side === 'buy';
        const entryPrice = Number(position.entryPrice || position.entry_price || 0);
        if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
          return;
        }

        try {
          const priceLine = seriesRef.current.createPriceLine({
            price: entryPrice,
            color: isBuy ? '#10b981' : '#ef4444',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `${isBuy ? 'BUY' : 'SELL'} ${index + 1}`,
          });
          priceLinesRef.current.push(priceLine);
        } catch (error) {}
      });

    const markers = [...openPositionMarkers, ...closedTradeMarkers];

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

    try {
      seriesRef.current.setMarkers(markers);
    } catch (error) {}
  }, [activeIntent, closedTrades, historyVersion, normalizedSymbol, positions]);

  useEffect(() => {
    if (!lastQuoteAt) {
      return undefined;
    }

    const timer = setInterval(() => {
      const isFresh = Date.now() - lastQuoteAt < 20000;
      setLiveStatus((previous) => {
        if (!navigator.onLine) {
          return 'offline';
        }
        if (previous === 'connecting' || previous === 'delayed' || previous === 'quote-sync') {
          return previous;
        }
        return isFresh ? 'live' : 'delayed';
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [lastQuoteAt]);

  const isUp = Number(priceChange) >= 0;
  const liveLabel = {
    live: 'LIVE',
    connecting: 'CONNECTING',
    'quote-sync': 'QUOTE SYNC',
    delayed: 'SYNCING',
    offline: 'OFFLINE',
  }[liveStatus] || 'LIVE';
  const liveTone = liveStatus === 'live'
    ? 'text-emerald-400'
    : liveStatus === 'offline'
      ? 'text-slate-400'
      : 'text-amber-400';
  const liveDotTone = liveStatus === 'live'
    ? 'bg-emerald-500 animate-pulse'
    : liveStatus === 'offline'
      ? 'bg-slate-500'
      : 'bg-amber-400';

  return (
    <div className={`flex h-full w-full flex-col ${isDark ? 'bg-[#0a0f1c]' : 'bg-white'} ${isFullscreen ? 'fixed inset-0 z-[100]' : 'relative'}`}>
      <div className={`flex items-center justify-between border-b px-4 py-2 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaChartBar size={12} className="text-gold-500" />
            <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatExecutionSymbol(symbol)}
            </span>
          </div>
          <span className={`hidden md:flex items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-widest ${
            isDark
              ? 'border-slate-700 bg-slate-900 text-slate-300'
              : 'border-slate-200 bg-white text-slate-500'
          }`}>
            <FaServer size={9} className="text-gold-500" />
            Backend Chart Engine
          </span>
          {lastPrice !== null && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {Number(lastPrice).toLocaleString(undefined, {
                  minimumFractionDigits: pricePrecision,
                  maximumFractionDigits: pricePrecision,
                })}
              </span>
              {priceChange && (
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isUp ? '+' : ''}{priceChange}%
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {INTERVALS.map((item) => (
            <button
              key={item.value}
              onClick={() => setInterval(item.value)}
              className={`rounded-md px-2.5 py-1 text-[9px] font-black uppercase tracking-wide transition-all ${
                interval === item.value
                  ? 'bg-gold-500 text-slate-900'
                  : isDark
                    ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[8px] uppercase tracking-widest text-slate-400 animate-pulse">Loading...</span>
          )}
          <span className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest ${liveTone}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${liveDotTone}`} />
            {liveLabel}
          </span>
          <button
            onClick={() => setIsFullscreen((value) => !value)}
            className={`rounded-md p-1.5 transition-all ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FaCompress size={11} /> : <FaExpand size={11} />}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
};

export default RealTimeChart;
