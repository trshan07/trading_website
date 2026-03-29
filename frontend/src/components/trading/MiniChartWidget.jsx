import React, { useEffect, useRef } from 'react';

const MiniChart = ({ symbol = 'BTCUSDT', height = 50, theme = 'dark' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.type = 'text/javascript';
    script.crossOrigin = 'anonymous';
    
    // Widget configuration
    const config = {
      "symbol": symbol,
      "width": "100%",
      "height": height,
      "locale": "en",
      "dateRange": "1M",
      "colorTheme": theme,
      "trendLineColor": "rgba(255, 215, 0, 1)",
      "underLineColor": "rgba(255, 215, 0, 0.3)",
      "isTransparent": false,
      "largeChartUrl": "",
      "chartOnly": true,
      "noTimeInterval": true
    };
    
    script.innerHTML = JSON.stringify(config);

    // Append script to container with small delay to ensute DOM settled
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

export default MiniChart;