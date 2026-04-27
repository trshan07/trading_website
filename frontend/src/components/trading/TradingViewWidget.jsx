import React, { useEffect, useRef, useState } from 'react';
import { FaCompress, FaExpand } from 'react-icons/fa';
import { normalizeSymbol, resolveTradingViewSymbol } from '../../utils/marketSymbols';

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
        // Keep the embedded chart locked to the dashboard-selected instrument
        // so the order panel, ticker, and displayed rates never drift from the chart.
        allow_symbol_change: false,
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
            ADVANCED ANALYSIS MODE · SYMBOL SYNC LOCKED
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewWidget;
