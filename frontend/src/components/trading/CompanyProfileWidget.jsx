import React, { useEffect, useMemo, useRef } from 'react';
import { resolveTradingViewSymbol } from '../../utils/marketSymbols';

const CompanyProfile = ({ symbol = 'NASDAQ:AAPL', instrument = null, height = '100%', theme = 'dark' }) => {
  const containerRef = useRef(null);
  const tvSymbol = useMemo(
    () => resolveTradingViewSymbol({ symbol, instrument }),
    [instrument, symbol]
  );

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": tvSymbol,
      "width": "100%",
      "height": height,
      "locale": "en",
      "colorTheme": theme === 'dark' ? 'dark' : 'light',
      "isTransparent": false,
      "largeChartUrl": ""
    });

    const container = containerRef.current;
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [height, theme, tvSymbol]);

  return (
    <div 
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height, width: '100%' }}
    />
  );
};

export default CompanyProfile;
