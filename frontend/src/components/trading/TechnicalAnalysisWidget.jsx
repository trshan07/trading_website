import React, { useEffect, useMemo, useRef } from 'react';
import { resolveTradingViewSymbol } from '../../utils/marketSymbols';

const TechnicalAnalysis = ({ symbol = 'BTCUSDT', instrument = null, interval = 'D', height = '100%', theme = 'dark' }) => {
  const containerRef = useRef(null);
  const tvSymbol = useMemo(
    () => resolveTradingViewSymbol({ symbol, instrument }),
    [instrument, symbol]
  );

  useEffect(() => {
    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.type = 'text/javascript';
    script.crossOrigin = 'anonymous';
    
    // Widget configuration
    const config = {
      "interval": interval,
      "width": "100%",
      "height": height,
      "symbol": tvSymbol,
      "showIntervalTabs": true,
      "locale": "en",
      "colorTheme": theme === 'dark' ? 'dark' : 'light',
      "isTransparent": false,
      "largeChartUrl": ""
    };
    
    script.innerHTML = JSON.stringify(config);

    // Append script to container with a small delay to ensure DOM is settled
    setTimeout(() => {
        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }
    }, 0);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [height, interval, theme, tvSymbol]);

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height, width: '100%' }}
    />
  );
};

export default TechnicalAnalysis;
