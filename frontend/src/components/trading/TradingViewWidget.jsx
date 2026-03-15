// frontend/src/components/trading/TradingViewWidget.jsx
import React, { useEffect, useRef, useState } from 'react';

const TradingViewWidget = ({ symbol = 'BTCUSD', theme = 'dark' }) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadTradingViewScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.TradingView) {
          resolve();
          return;
        }

        // Check if script is already being loaded
        if (document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')) {
          const checkLoaded = setInterval(() => {
            if (window.TradingView) {
              clearInterval(checkLoaded);
              resolve();
            }
          }, 100);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          if (isMounted) {
            // Small delay to ensure TradingView is fully initialized
            setTimeout(() => {
              if (window.TradingView) {
                resolve();
              } else {
                reject(new Error('TradingView failed to initialize'));
              }
            }, 500);
          }
        };
        script.onerror = () => reject(new Error('Failed to load TradingView script'));
        document.head.appendChild(script);
      });
    };

    const initializeWidget = async () => {
      if (!containerRef.current || !isMounted) return;

      try {
        setIsLoading(true);
        setError(null);

        await loadTradingViewScript();

        if (!isMounted) return;

        // Clear container
        containerRef.current.innerHTML = '';

        // Ensure container has an ID
        const containerId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
        containerRef.current.id = containerId;

        // Create widget
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: '60',
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#0A1929' : '#FFFFFF',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerId,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          save_image: false,
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'MAExp@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          loading_screen: { backgroundColor: theme === 'dark' ? '#0A1929' : '#FFFFFF' },
          overrides: {
            'paneProperties.background': theme === 'dark' ? '#0A1929' : '#FFFFFF',
            'paneProperties.vertGridProperties.color': '#334155',
            'paneProperties.horzGridProperties.color': '#334155',
            'scalesProperties.textColor': '#FFD700',
            'scalesProperties.lineColor': '#FFD700'
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('TradingView widget error:', err);
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    initializeWidget();

    return () => {
      isMounted = false;
      if (widgetRef.current) {
        try {
          widgetRef.current = null;
        } catch (e) {
          console.error('Error cleaning up TradingView widget:', e);
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div className="relative w-full h-full">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-900/50 backdrop-blur-sm z-10">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gold-500 text-sm">Loading TradingView Chart...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-900/50 backdrop-blur-sm z-10">
          <div className="text-red-400 mb-2">⚠️</div>
          <p className="text-red-400 text-sm mb-2">Failed to load chart</p>
          <p className="text-gold-500/50 text-xs">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gold-500 text-navy-950 rounded-lg text-sm hover:bg-gold-400"
          >
            Retry
          </button>
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default TradingViewWidget;