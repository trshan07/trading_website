// frontend/src/components/trading/TradingViewWidget.jsx
import React, { useEffect, useRef } from 'react';

const TradingViewWidget = ({ symbol = 'BTCUSD', theme = 'dark' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if script is already loaded
    if (window.TradingView) {
      initializeWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = initializeWidget;
    document.head.appendChild(script);

    return () => {
      // Clean up
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  const initializeWidget = () => {
    if (window.TradingView && containerRef.current) {
      containerRef.current.innerHTML = '';
      
      new window.TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: '60',
        timezone: 'Etc/UTC',
        theme: theme,
        style: '1',
        locale: 'en',
        toolbar_bg: '#0A1929',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: containerRef.current.id,
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
        popup_height: '650'
      });
    }
  };

  return (
    <div 
      id={`tradingview_${symbol.replace('/', '_')}`} 
      ref={containerRef} 
      className="w-full h-full"
    />
  );
};

export default TradingViewWidget;