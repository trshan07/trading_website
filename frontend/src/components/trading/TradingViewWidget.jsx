import React, { useEffect, useRef, memo } from 'react';

const AdvancedRealTimeChart = memo(({ 
  symbol = 'BTCUSDT',
  theme = 'dark',
  height = '100%',
  width = '100%'
}) => {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // Unique ID for this specific widget instance container to avoid querySelector conflicts
    const widgetId = `tradingview_${Math.random().toString(36).substring(7)}`;

    // Clean up previous content if it exists
    if (containerRef.current) {
        containerRef.current.innerHTML = '';
        
        // Create the actual widget div that the TV script will target
        const widgetContainer = document.createElement('div');
        widgetContainer.id = widgetId;
        widgetContainer.className = 'tradingview-widget-container__widget';
        widgetContainer.style.height = '100%';
        widgetContainer.style.width = '100%';
        containerRef.current.appendChild(widgetContainer);

        // Create the script
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.type = 'text/javascript';
        script.crossOrigin = "anonymous";
        
        // Configuration
        script.text = JSON.stringify({
          "autosize": true,
          "symbol": symbol,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": theme,
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "calendar": false,
          "studies": [
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies"
          ],
          "container_id": widgetId, // Explicitly tell the script which element to use
          "support_host": "https://www.tradingview.com"
        });

        // Use a small timeout to ensure the DOM for widgetContainer has settled
        setTimeout(() => {
            if (containerRef.current && containerRef.current.contains(widgetContainer)) {
                containerRef.current.appendChild(script);
            }
        }, 0);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        height, 
        width,
        position: 'relative',
        background: theme === 'dark' ? '#0a0f1c' : '#ffffff' // Placeholder background
      }}
      className="tradingview-widget-container"
    >
      <div className="tradingview-widget-copyright" style={{ display: 'none' }}>
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
});

export default AdvancedRealTimeChart;