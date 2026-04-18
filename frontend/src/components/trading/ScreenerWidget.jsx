import React, { useEffect, useRef, memo } from 'react';

const ScreenerWidget = ({ market = 'crypto', theme = 'dark', height = '600' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Clean up previous instances on re-render to avoid duplicates
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.type = 'text/javascript';
    script.async = true;

    // Suppress TradingView's innocuous internal warning "Invalid environment undefined"
    // caused by their remote script trying to access missing env variables.
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    const suppressTradingViewWarnings = (...args) => {
        const errorMsg = args.join(' ');
        if (errorMsg.includes('Invalid environment undefined')) {
            return true;
        }
        return false;
    };

    console.error = (...args) => {
        if (suppressTradingViewWarnings(...args)) return;
        originalConsoleError(...args);
    };
    console.warn = (...args) => {
        if (suppressTradingViewWarnings(...args)) return;
        originalConsoleWarn(...args);
    };
    console.log = (...args) => {
        if (suppressTradingViewWarnings(...args)) return;
        originalConsoleLog(...args);
    };
    // Map our categories to TradingView screener markets
    let tvMarket = 'crypto';
    const lowerMarket = market.toLowerCase();
    
    if (lowerMarket === 'forex') tvMarket = 'forex';
    else if (lowerMarket === 'shares' || lowerMarket === 'stocks') tvMarket = 'america';
    else if (lowerMarket === 'crypto') tvMarket = 'crypto';
    // TradingView screener doesn't have a direct 'commodities' or 'indices' market in the same way,
    // so we default to 'forex' or 'crypto' if not strictly defined, or 'america' for general US markets.
    else tvMarket = 'america';

    script.text = JSON.stringify({
      width: '100%',
      height: height,
      defaultColumn: 'overview',
      defaultScreen: 'general',
      market: tvMarket,
      showToolbar: true,
      colorTheme: theme,
      locale: 'en',
      isTransparent: true,
    });

    const timeoutId = setTimeout(() => {
        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }
    }, 0);

    return () => {
        clearTimeout(timeoutId);
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        console.log = originalConsoleLog;
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }
    };
  }, [market, theme, height]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(ScreenerWidget);
