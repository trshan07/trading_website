import React, { useEffect, useRef } from 'react';

const MarketOverview = ({ height = '100%', theme = 'dark' }) => {
  const containerRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    // Clean up previous script
    if (scriptRef.current && scriptRef.current.parentNode) {
      scriptRef.current.parentNode.removeChild(scriptRef.current);
    }

    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(widgetContainer);

    // Create script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.type = 'text/javascript';
    
    script.text = JSON.stringify({
      "colorTheme": theme,
      "dateRange": "12M",
      "showChart": true,
      "locale": "en",
      "width": "100%",
      "height": height,
      "largeChartUrl": "",
      "tabs": [
        {
          "title": "Forex",
          "symbols": [
            { "s": "FX:EURUSD", "d": "EUR/USD" },
            { "s": "FX:GBPUSD", "d": "GBP/USD" },
            { "s": "FX:USDJPY", "d": "USD/JPY" }
          ]
        },
        {
          "title": "Crypto",
          "symbols": [
            { "s": "BINANCE:BTCUSDT", "d": "BTC/USDT" },
            { "s": "BINANCE:ETHUSDT", "d": "ETH/USDT" },
            { "s": "BINANCE:BNBUSDT", "d": "BNB/USDT" }
          ]
        }
      ]
    });

    scriptRef.current = script;
    containerRef.current.appendChild(script);

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [theme, height]);

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height, width: '100%' }}
    />
  );
};

export default MarketOverview;