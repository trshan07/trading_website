// TradingView script loader utility
const loadTradingViewScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.TradingView) {
      resolve(window.TradingView);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.TradingView) {
          clearInterval(checkInterval);
          resolve(window.TradingView);
        }
      }, 100);
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        resolve(window.TradingView);
      } else {
        reject(new Error('TradingView loaded but not available'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load TradingView script'));
    document.head.appendChild(script);
  });
};

export default loadTradingViewScript;