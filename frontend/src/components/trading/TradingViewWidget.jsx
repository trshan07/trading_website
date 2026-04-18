import React, { useEffect, useRef, useState } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';

const TradingViewWidget = ({ 
  symbol = 'BTCUSDT', 
  theme = 'dark',
  activeIntent = null,
  positions = []
}) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load TradingView Script
  useEffect(() => {
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
      // Cleanup widget on unmount if needed
      if (widgetRef.current) {
        widgetRef.current = null;
      }
    };
  }, []);

  // Handle Escape key for fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isFullscreen]);

  // Initialize/Update Widget
  useEffect(() => {
    // Safety check for dependencies
    if (!scriptLoaded || !containerRef.current || !window.TradingView || !symbol) return;

    const widgetId = `tradingview_${Math.random().toString(36).substring(7)}`;
    containerRef.current.id = widgetId;

    const isDark = theme === 'dark';
    
    // Smart Symbol Mapping for Global Hub
    let tvSymbol = symbol;
    if (!symbol.includes(':')) {
      const sym = symbol.replace(/[^A-Z0-9!]/g, ''); // Keep ! for futures
      
      // 1. Specific Fixes / Overrides
      const overrides = {
        'US10Y': 'TVC:US10Y',
        'DXY': 'TVC:DXY',
        'SPX': 'INDEX:SPX',
        'NDX': 'INDEX:NDX',
        'DJI': 'INDEX:DJI',
        'VIX': 'TVC:VIX',
        'BRENT': 'TVC:UKOIL',
        'XAUUSD': 'TVC:GOLD',
        'XAGUSD': 'TVC:SILVER',
        'IBOV': 'BMFBOVESPA:IBOV',
        'ES1!': 'CME_MINI:ES1!',
        'YM1!': 'CBOT:YM1!',
        'CL1!': 'NYMEX:CL1!',
        'SPY': 'AMEX:SPY',
        'QQQ': 'NASDAQ:QQQ',
        'AAPL': 'NASDAQ:AAPL',
        'TSLA': 'NASDAQ:TSLA',
        'MSFT': 'NASDAQ:MSFT',
        'GOOGL': 'NASDAQ:GOOGL'
      };

      if (overrides[sym]) {
        tvSymbol = overrides[sym];
      } else if (['BTC', 'ETH', 'SOL', 'ADA', 'BNB'].some(s => sym.startsWith(s))) {
        tvSymbol = `BINANCE:${sym}`;
      } else if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'].includes(sym)) {
        tvSymbol = `FX:${sym}`;
      } else {
        tvSymbol = `BITSTAMP:${sym}`; // General Crypto Fallback
      }
    }

    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      const widget = new window.TradingView.widget({
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
        overrides: isDark ? {
          "paneProperties.background": "#0f172a",
          "paneProperties.vertGridProperties.color": "#1e293b",
          "paneProperties.horzGridProperties.color": "#1e293b",
          "mainSeriesProperties.candleStyle.upColor": "#10b981",
          "mainSeriesProperties.candleStyle.downColor": "#f43f5e",
          "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
          "mainSeriesProperties.candleStyle.borderDownColor": "#f43f5e",
          "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
          "mainSeriesProperties.candleStyle.wickDownColor": "#f43f5e"
        } : {}
      });

      widgetRef.current = widget;
    } catch (err) {
      console.error('TradingView widget initialization failed:', err);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      widgetRef.current = null;
    };
  }, [scriptLoaded, symbol, theme]); // Added explicit cleanup logic

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-full w-full transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-[100] bg-slate-900' 
        : `relative ${isDark ? 'bg-slate-900' : 'bg-white'}`
    }`}>
      <div className="flex-1 relative min-h-[500px]">
        <div 
          ref={containerRef} 
          className="absolute inset-0 w-full h-full"
        />

        {/* Trade Execution Markers Overlay */}
        {positions && positions.length > 0 && (() => {
          const symbolPositions = positions.filter(p => 
            p?.symbol && p.symbol.replace(/[^A-Z0-9]/g, '') === symbol.replace(/[^A-Z0-9]/g, '')
          );
          if (symbolPositions.length === 0) return null;
          return (
            <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none flex flex-col justify-center pl-2 space-y-1.5">
              {symbolPositions.map((pos, idx) => {
                const isBuy = (pos.side || pos.type || '').toUpperCase() === 'BUY';
                return (
                  <div
                    key={pos.id || idx}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-sm shadow-lg ${
                      isBuy
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    }`}
                  >
                    {/* Direction arrow */}
                    <span className={`text-[14px] font-black leading-none ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isBuy ? '▲' : '▼'}
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-[8px] font-black uppercase tracking-widest ${
                        isBuy ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      <span className="text-[9px] font-black text-white tabular-nums">
                        @ ${Number(pos.entryPrice || pos.entry_price || 0).toLocaleString()}
                      </span>
                      {pos.quantity && (
                        <span className="text-[7px] text-slate-400 font-bold">
                          {pos.quantity} units
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Execution Mode Overlay - pending order intent */}
        {activeIntent && (
          <div className="absolute top-8 right-8 z-10 pointer-events-none animate-in fade-in zoom-in duration-300">
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${
              activeIntent.side === 'buy' 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-ping ${
                activeIntent.side === 'buy' ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                  activeIntent.side === 'buy' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  New {activeIntent.side} Order
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {activeIntent.type === 'market' ? 'Market Execution' : `Pending @ ${activeIntent.price || '...'}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className={`px-4 py-2 border-t flex items-center justify-between text-xs font-medium ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE MARKET DATA
          </span>
          <span className="opacity-40">|</span>
          <span>POWERED BY TRADINGVIEW</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-2 px-3 py-1 rounded border transition-all hover:scale-105 active:scale-95 ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-gold-500 hover:bg-slate-700' 
                : 'bg-white border-slate-200 text-gold-600 hover:bg-slate-50'
            }`}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Fullscreen"}
          >
            {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {isFullscreen ? "Close" : "Expand"}
            </span>
          </button>
          <div className={`px-2 py-0.5 rounded border ${
            isDark ? 'bg-slate-800 border-slate-700 text-gold-500' : 'bg-white border-slate-200 text-gold-600'
          }`}>
            ADVANCED ANALYSIS MODE
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewWidget;
