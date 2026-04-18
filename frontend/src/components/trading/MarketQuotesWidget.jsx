import React, { useEffect, useRef, memo } from 'react';

const MarketQuotesWidget = ({ category = 'Forex', theme = 'dark', height = '500' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.type = 'text/javascript';
    script.async = true;

    // Define symbols based on the category
    let symbolsGroups = [];

    switch (category.toLowerCase()) {
        case 'forex':
            symbolsGroups = [{
                name: "Forex",
                originalName: "Forex",
                symbols: [
                    { name: "FX:EURUSD", displayName: "EUR/USD" },
                    { name: "FX:GBPUSD", displayName: "GBP/USD" },
                    { name: "FX:USDJPY", displayName: "USD/JPY" },
                    { name: "FX:AUDUSD", displayName: "AUD/USD" },
                    { name: "FX:USDCAD", displayName: "USD/CAD" },
                    { name: "FX:USDCHF", displayName: "USD/CHF" },
                    { name: "FX:NZDUSD", displayName: "NZD/USD" }
                ]
            }];
            break;
        case 'crypto':
            symbolsGroups = [{
                name: "Cryptocurrencies",
                originalName: "Cryptocurrencies",
                symbols: [
                    { name: "BINANCE:BTCUSDT", displayName: "Bitcoin" },
                    { name: "BINANCE:ETHUSDT", displayName: "Ethereum" },
                    { name: "BINANCE:SOLUSDT", displayName: "Solana" },
                    { name: "BINANCE:BNBUSDT", displayName: "BNB" },
                    { name: "BINANCE:ADAUSDT", displayName: "Cardano" },
                    { name: "BINANCE:XRPUSDT", displayName: "Ripple" }
                ]
            }];
            break;
        case 'indices':
            symbolsGroups = [{
                name: "Indices",
                originalName: "Indices",
                symbols: [
                    { name: "FOREXCOM:SPXUSD", displayName: "S&P 500" },
                    { name: "FOREXCOM:NSXUSD", displayName: "US 100" },
                    { name: "FOREXCOM:DJI", displayName: "Dow Jones" },
                    { name: "FOREXCOM:UKXGBP", displayName: "UK 100" },
                    { name: "INDEX:DEU40", displayName: "DAX 40" },
                    { name: "INDEX:NKY", displayName: "Nikkei 225" }
                ]
            }];
            break;
        case 'commodities':
            symbolsGroups = [{
                name: "Commodities",
                originalName: "Commodities",
                symbols: [
                    { name: "OANDA:XAUUSD", displayName: "Gold" },
                    { name: "OANDA:XAGUSD", displayName: "Silver" },
                    { name: "NYMEX:CL1!", displayName: "Crude Oil" },
                    { name: "NYMEX:NG1!", displayName: "Natural Gas" },
                    { name: "COMEX:HG1!", displayName: "Copper" }
                ]
            }];
            break;
        case 'shares':
        case 'stocks':
            symbolsGroups = [{
                name: "Shares",
                originalName: "Shares",
                symbols: [
                    { name: "NASDAQ:AAPL", displayName: "Apple" },
                    { name: "NASDAQ:MSFT", displayName: "Microsoft" },
                    { name: "NASDAQ:TSLA", displayName: "Tesla" },
                    { name: "NASDAQ:AMZN", displayName: "Amazon" },
                    { name: "NASDAQ:GOOGL", displayName: "Alphabet" },
                    { name: "NASDAQ:NVDA", displayName: "NVIDIA" },
                    { name: "NASDAQ:META", displayName: "Meta" }
                ]
            }];
            break;
        default:
            symbolsGroups = [{
                name: "Popular",
                originalName: "Popular",
                symbols: [
                    { name: "FX:EURUSD", displayName: "EUR/USD" },
                    { name: "BINANCE:BTCUSDT", displayName: "Bitcoin" },
                    { name: "FOREXCOM:SPXUSD", displayName: "S&P 500" },
                    { name: "OANDA:XAUUSD", displayName: "Gold" },
                    { name: "NASDAQ:AAPL", displayName: "Apple" }
                ]
            }];
            break;
    }

    script.text = JSON.stringify({
      width: '100%',
      height: height,
      symbolsGroups: symbolsGroups,
      showSymbolLogo: true,
      isTransparent: true,
      colorTheme: theme,
      locale: 'en'
    });

    const timeoutId = setTimeout(() => {
        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }
    }, 0);

    return () => {
        clearTimeout(timeoutId);
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }
    };
  }, [category, theme, height]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright text-center text-xs mt-2 text-white/30 hidden">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="text-white/50 hover:text-gold transition-colors">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default memo(MarketQuotesWidget);
