import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaCompress, FaExpand } from 'react-icons/fa';
import { normalizeSymbol, resolveTradingViewSymbol } from '../../utils/marketSymbols';

const EMBED_SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';

const TradingViewWidget = ({
  symbol = 'BTCUSDT',
  instrument = null,
  theme = 'dark',
  positions = [],
  marketStatus = 'LIVE MARKET DATA',
}) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const instrumentCategory = instrument?.category || '';
  const instrumentTradingViewSymbol = instrument?.tradingViewSymbol || instrument?.trading_view_symbol || '';
  const tvSymbol = useMemo(
    () => resolveTradingViewSymbol({
      symbol,
      instrument: {
        category: instrumentCategory,
        tradingViewSymbol: instrumentTradingViewSymbol,
      },
    }),
    [instrumentCategory, instrumentTradingViewSymbol, symbol]
  );

  useEffect(() => {
    if (!isOnline) {
      return undefined;
    }

    return undefined;
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
    if (!isOnline || !containerRef.current || !symbol) {
      return undefined;
    }

    const isDark = theme === 'dark';
    containerRef.current.innerHTML = '';

    const widgetRoot = document.createElement('div');
    widgetRoot.className = 'tradingview-widget-container__widget';
    widgetRoot.style.height = '100%';
    widgetRoot.style.width = '100%';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = EMBED_SCRIPT_SRC;
    script.text = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: '15',
      timezone: 'exchange',
      theme: isDark ? 'dark' : 'light',
      style: '1',
      locale: 'en',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      details: true,
      hotlist: true,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(widgetRoot);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isOnline, symbol, theme, tvSymbol]);

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
          <div ref={containerRef} className="absolute inset-0 h-full w-full tradingview-widget-container" />
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
            {isOnline ? marketStatus : 'OFFLINE MODE'}
          </span>
          <span className="opacity-40">|</span>
          <span>POWERED BY TRADINGVIEW</span>
          {symbolPositions.length > 0 && (
            <>
              <span className="opacity-40">|</span>
              <span>{symbolPositions.length} OPEN POSITION{symbolPositions.length > 1 ? 'S' : ''}</span>
            </>
          )}
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
            TERMINAL CHART | LIVE EXTERNAL MARKET FEED
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewWidget;
