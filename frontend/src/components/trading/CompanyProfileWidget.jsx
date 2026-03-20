import React, { useEffect, useRef } from 'react';

const CompanyProfile = ({ symbol = 'NASDAQ:AAPL', height = '100%', theme = 'dark' }) => {
  const containerRef = useRef(null);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    if (widgetInitialized.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": symbol,
      "width": "100%",
      "height": height,
      "locale": "en",
      "colorTheme": theme,
      "isTransparent": false,
      "largeChartUrl": ""
    });

    const container = containerRef.current;
    if (container && !widgetInitialized.current) {
      container.appendChild(script);
      widgetInitialized.current = true;
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      widgetInitialized.current = false;
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

export default CompanyProfile;