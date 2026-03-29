import React, { useEffect, useRef } from 'react';

const SymbolInfo = ({ symbol = 'BTCUSDT', height = '100%', theme = 'dark' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    script.async = true;
    script.type = 'text/javascript';
    script.crossOrigin = 'anonymous';
    
    // Widget configuration
    const config = {
      "symbol": symbol,
      "width": "100%",
      "height": height,
      "locale": "en",
      "colorTheme": theme,
      "isTransparent": false,
      "largeChartUrl": ""
    };
    
    script.innerHTML = JSON.stringify(config);

    // Append script to container with small delay to ensure DOM settled
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
  }, [symbol, theme, height]);

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height, width: '100%' }}
    />
  );
};

export default SymbolInfo;