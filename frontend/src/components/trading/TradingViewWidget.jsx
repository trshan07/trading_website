import React, { useEffect, useRef, memo, useState, useMemo } from 'react';
import { createChart } from 'lightweight-charts';
import { 
  FaChartLine, FaChartBar, FaSearch, FaDrawPolygon, 
  FaInfoCircle, FaRegBell, FaChevronRight, FaChevronLeft,
  FaArrowUp, FaArrowDown, FaCompress, FaExpand, FaCog, FaThList
} from 'react-icons/fa';

const TradingViewWidget = memo(({ 
  symbol: initialSymbol = 'BTCUSD',
  interval: initialInterval = '1M',
  onIntervalChange,
  theme = 'dark',
  height = '100%',
  width = '100%',
  positions = []
}) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [activeInterval, setActiveInterval] = useState(initialInterval);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isDark = theme === 'dark';
  
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const intervals = ['1M', '5M', '15M', '1H', '4H', '1D', '1W'];

  const intervalConfig = useMemo(() => ({
    '1M': { api: '1m', seconds: 60, limit: 500 },
    '5M': { api: '5m', seconds: 300, limit: 500 },
    '15M': { api: '15m', seconds: 900, limit: 500 },
    '1H': { api: '1h', seconds: 3600, limit: 500 },
    '4H': { api: '4h', seconds: 14400, limit: 500 },
    '1D': { api: '1d', seconds: 86400, limit: 365 },
    '1W': { api: '1w', seconds: 604800, limit: 260 },
  }), []);

  // Map symbols for Binance WebSocket/API
  const getBinanceSymbol = (s) => {
    const upper = (s || 'BTCUSD').toUpperCase().replace(':', '');
    if (upper === 'BTCUSD') return 'BTCUSDT';
    if (upper === 'ETHUSD') return 'ETHUSDT';
    return upper;
  };

  useEffect(() => {
    setSymbol(initialSymbol);
  }, [initialSymbol]);

  useEffect(() => {
    setActiveInterval(initialInterval);
  }, [initialInterval]);

  // Watchlist Data
  const watchlist = [
    { symbol: 'BTCUSD', name: 'Bitcoin', price: '64,120.50', change: '+2.4%' },
    { symbol: 'ETHUSD', name: 'Ethereum', price: '3,450.20', change: '+1.8%' },
    { symbol: 'AAPL', name: 'Apple Inc', price: '192.25', change: '-0.4%' },
    { symbol: 'TSLA', name: 'Tesla', price: '175.40', change: '+3.2%' },
    { symbol: 'EURUSD', name: 'Euro / Dollar', price: '1.0825', change: '+0.1%' },
    { symbol: 'XAUUSD', name: 'Gold', price: '2,340.50', change: '+0.5%' },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions = {
      autoSize: true,
      layout: {
        background: { color: theme === 'dark' ? '#0f172a' : '#ffffff' },
        textColor: theme === 'dark' ? '#94a3b8' : '#334155',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
        horzLines: { color: theme === 'dark' ? '#1e293b' : '#f1f5f9' },
      },
      crosshair: { mode: 0 },
      priceScale: { borderColor: theme === 'dark' ? '#334155' : '#e2e8f0' },
      timeScale: { 
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', 
        timeVisible: true 
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    seriesRef.current = candlestickSeries;

    let isMounted = true;
    let ws = null;
    let fallbackInterval = null;

    // Fetch History
    const fetchHistory = async () => {
        try {
            const apiSymbol = getBinanceSymbol(symbol);
            if (!['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'].includes(apiSymbol)) {
                throw new Error("Simulate non-crypto Asset");
            }
            const selectedInterval = intervalConfig[activeInterval] || intervalConfig['1M'];
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${apiSymbol}&interval=${selectedInterval.api}&limit=${selectedInterval.limit}`);
            if (!response.ok) throw new Error("Invalid Symbol or CORS");
            const data = await response.json();
            if (isMounted && Array.isArray(data)) {
                const cdata = data.map(d => ({
                    time: d[0] / 1000,
                    open: parseFloat(d[1]),
                    high: parseFloat(d[2]),
                    low: parseFloat(d[3]),
                    close: parseFloat(d[4]),
                }));
                candlestickSeries.setData(cdata);
                chart.timeScale().fitContent();
                const firstClose = cdata[0]?.close ?? 0;
                const lastClose = cdata[cdata.length - 1]?.close ?? 0;
                setCurrentPrice(lastClose);
                setPriceChange(firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0);
                startBinanceStream(apiSymbol, selectedInterval.api);
            }
        } catch (err) {
            // Mock Data Generator for Stocks, Funds, Options, etc.
            let basePrice = 150.0;
            if (symbol === 'SPY') basePrice = 484.50;
            if (symbol === 'ES1!') basePrice = 4855.25;
            if (symbol === 'EURUSD') basePrice = 1.0875;
            if (symbol === 'AAPL') basePrice = 185.00;
            if (symbol === 'US10Y') basePrice = 4.15;
            if (symbol === 'DXY') basePrice = 104.20;
            if (symbol === 'VIX') basePrice = 13.50;

            const mockData = [];
            const selectedInterval = intervalConfig[activeInterval] || intervalConfig['1M'];
            const totalPoints = selectedInterval.limit;
            let mockTime = Math.floor(Date.now() / 1000) - (totalPoints * selectedInterval.seconds);
            let current = basePrice;
            
            for (let i = 0; i < totalPoints; i++) {
                const change = (Math.random() - 0.5) * (basePrice * 0.002);
                const open = current;
                const close = current + change;
                const high = Math.max(open, close) + Math.abs(change) * Math.random();
                const low = Math.min(open, close) - Math.abs(change) * Math.random();
                mockData.push({ time: mockTime, open, high, low, close });
                current = close;
                mockTime += selectedInterval.seconds;
            }
            
            if (isMounted) {
                candlestickSeries.setData(mockData);
                chart.timeScale().fitContent();
                const firstClose = mockData[0]?.close ?? 0;
                const lastClose = mockData[mockData.length - 1]?.close ?? 0;
                setCurrentPrice(lastClose);
                setPriceChange(firstClose ? ((lastClose - firstClose) / firstClose) * 100 : 0);
                
                // Simulate Live Ticks
                fallbackInterval = setInterval(() => {
                    if (!isMounted) return;
                    const lastBar = mockData[mockData.length - 1];
                    const nextTick = lastBar.close + (Math.random() - 0.5) * (basePrice * 0.0005);
                    const now = Math.floor(Date.now() / 1000);
                    
                    if (now >= lastBar.time + selectedInterval.seconds) {
                        const newBar = { time: lastBar.time + selectedInterval.seconds, open: lastBar.close, high: Math.max(lastBar.close, nextTick), low: Math.min(lastBar.close, nextTick), close: nextTick };
                        mockData.push(newBar);
                        candlestickSeries.update(newBar);
                    } else {
                        lastBar.close = nextTick;
                        lastBar.high = Math.max(lastBar.high, nextTick);
                        lastBar.low = Math.min(lastBar.low, nextTick);
                        candlestickSeries.update(lastBar);
                    }
                    setCurrentPrice(nextTick);
                    const seriesStart = mockData[0]?.close ?? nextTick;
                    setPriceChange(seriesStart ? ((nextTick - seriesStart) / seriesStart) * 100 : 0);
                }, 1500);
            }
        }
    };

    const startBinanceStream = (apiSymbol, interval) => {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${apiSymbol.toLowerCase()}@kline_${interval}`);
        ws.onmessage = (event) => {
            if (!isMounted) return;
            const data = JSON.parse(event.data);
            const k = data.k;
            const nextClose = parseFloat(k.c);
            candlestickSeries.update({
                time: k.t / 1000,
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: nextClose,
            });
            setCurrentPrice(nextClose);
            const openPrice = parseFloat(k.o);
            setPriceChange(openPrice ? ((nextClose - openPrice) / openPrice) * 100 : 0);
        };
        ws.onerror = () => {};
    };

    fetchHistory();

    return () => {
      isMounted = false;
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (ws) {
          ws.onopen = null;
          ws.onmessage = null;
          ws.onerror = null;
          if (ws.readyState === WebSocket.OPEN) {
              ws.close(1000, "Component unmounted");
          } else if (ws.readyState === WebSocket.CONNECTING) {
              ws.onopen = () => ws.close(1000, "Component unmounted");
          }
      }
      chart.remove();
    };
  }, [symbol, theme, activeInterval, intervalConfig]);

  // Update Markers (Positions)
  useEffect(() => {
      if (!seriesRef.current || !positions || positions.length === 0) {
          if (seriesRef.current) seriesRef.current.setMarkers([]);
          return;
      }
      
      const filteredMarkers = positions
          .filter(pos => {
              const posSym = (pos.symbol || '').toUpperCase();
              const chartSym = (symbol || '').toUpperCase();
              return posSym === chartSym || getBinanceSymbol(posSym) === getBinanceSymbol(chartSym);
          })
          .map(pos => ({
              time: pos.chartMarker?.time || Math.floor(Date.now() / 1000),
              position: pos.type === 'BUY' ? 'belowBar' : 'aboveBar',
              color: pos.type === 'BUY' ? '#10b981' : '#f43f5e',
              shape: pos.type === 'BUY' ? 'arrowUp' : 'arrowDown',
              text: `${pos.type} @ ${pos.entryPrice || pos.avgPrice}`,
              size: 2
          }));

      // Sort by time ascending
      filteredMarkers.sort((a, b) => a.time - b.time);

      // ENFORCE STRICT ASCENDING ORDER (LIGHTWEIGHT CHARTS REQUIREMENT)
      // If two markers have the same time, we'll increment the later one by 1 second
      const strictMarkers = filteredMarkers.reduce((acc, current, idx) => {
          if (idx > 0) {
              const prev = acc[idx - 1];
              if (current.time <= prev.time) {
                current.time = prev.time + 1;
              }
          }
          acc.push(current);
          return acc;
      }, []);

      seriesRef.current.setMarkers(strictMarkers);
  }, [positions, symbol]);

  return (
    <div className={`flex flex-col h-full w-full rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 ${
      isDark
        ? 'bg-slate-900 border border-slate-800'
        : 'bg-white border border-slate-200 shadow-slate-200/70'
    }`}>
      {/* Top Professional Toolbar */}
      <div className={`h-14 flex items-center justify-between px-6 border-b backdrop-blur-xl ${
        isDark
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-slate-50/90 border-slate-200'
      }`}>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center text-slate-900 shadow-lg shadow-gold-500/20">
              <FaChartLine size={14} />
            </div>
            <div>
              <h4 className={`text-sm font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {symbol} <span className={`text-[10px] font-medium not-italic ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{getBinanceSymbol(symbol)}</span>
              </h4>
            </div>
          </div>
          
          <div className={`h-4 w-[1px] ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          
          <div className="flex items-center space-x-1">
            {intervals.map(t => (
              <button 
                key={t}
                onClick={() => {
                  setActiveInterval(t);
                  onIntervalChange?.(t);
                }}
                className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                  activeInterval === t
                    ? isDark
                      ? 'bg-slate-700 text-gold-500 shadow-inner'
                      : 'bg-slate-900 text-white shadow-inner'
                    : isDark
                      ? 'text-slate-500 hover:text-white hover:bg-slate-700/50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
             <p className={`text-sm font-black italic tracking-tighter ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
               ${currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </p>
             <p className={`text-[9px] font-bold uppercase tracking-widest ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
               {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
             </p>
          </div>
          <div className="flex items-center space-x-3">
             <button className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center border ${
               isDark
                 ? 'bg-slate-700/50 text-slate-400 hover:text-white border-slate-600/30'
                 : 'bg-white text-slate-400 hover:text-slate-900 border-slate-200'
             }`}><FaRegBell size={12} /></button>
             <button className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center border ${
               isDark
                 ? 'bg-slate-700/50 text-slate-400 hover:text-white border-slate-600/30'
                 : 'bg-white text-slate-400 hover:text-slate-900 border-slate-200'
             }`}><FaCog size={12} /></button>
          </div>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Tools Extension */}
        <div className={`w-12 border-r flex flex-col items-center py-4 space-y-5 ${
          isDark
            ? 'bg-slate-800/30 border-slate-700/50'
            : 'bg-slate-50 border-slate-200'
        }`}>
           {[FaSearch, FaChartBar, FaDrawPolygon, FaInfoCircle, FaCompress].map((Icon, i) => (
             <button key={i} className={`transition-colors p-2 rounded-xl ${
               isDark
                 ? 'text-slate-500 hover:text-gold-500 hover:bg-slate-800'
                 : 'text-slate-400 hover:text-gold-600 hover:bg-white'
             }`}>
               <Icon size={14} />
             </button>
           ))}
        </div>

        {/* Chart Primary View */}
        <div className={`flex-1 relative group ${isDark ? 'bg-slate-900/40' : 'bg-white'}`}>
           <div 
             ref={chartContainerRef} 
             className="w-full h-full"
           />
           
           {/* Floating Time Range Widget */}
           <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 backdrop-blur-md px-4 py-2 rounded-2xl border shadow-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity ${
             isDark
               ? 'bg-slate-800/80 border-slate-700'
               : 'bg-white/95 border-slate-200 shadow-slate-200/70'
           }`}>
              {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'].map(r => (
                <button key={r} className={`text-[9px] font-black px-2 py-1 ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}>{r}</button>
              ))}
           </div>
        </div>

        {/* Sidebar Watchlist */}
        <div className={`transition-all duration-500 ease-in-out border-l flex flex-col ${
          isDark ? 'border-slate-700/50' : 'border-slate-200'
        } ${isSidebarOpen ? 'w-72' : 'w-0 opacity-0 overflow-hidden'}`}>
           <div className={`p-5 flex items-center justify-between border-b ${
             isDark ? 'border-slate-700/50' : 'border-slate-200'
           }`}>
              <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Watchlist</h5>
              <button onClick={() => setIsSidebarOpen(false)} className={isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}><FaChevronRight size={10} /></button>
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
              {watchlist.map((asset) => (
                <div 
                  key={asset.symbol} 
                  onClick={() => setSymbol(asset.symbol)}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                    symbol === asset.symbol
                      ? 'bg-gold-500 text-slate-900 shadow-lg'
                      : isDark
                        ? 'hover:bg-slate-800 text-white'
                        : 'hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{asset.symbol}</p>
                    <p className={`text-[9px] font-medium leading-none ${
                      symbol === asset.symbol
                        ? 'text-slate-900/60'
                        : isDark
                          ? 'text-slate-500'
                          : 'text-slate-400'
                    }`}>{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-tight mb-1">{asset.price}</p>
                    <p className={`text-[8px] font-bold ${asset.change.includes('+') ? (symbol === asset.symbol ? 'text-emerald-900' : 'text-emerald-400') : (symbol === asset.symbol ? 'text-rose-900' : 'text-rose-400')}`}>{asset.change}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Toggle Sidebar Button (when closed) */}
        {!isSidebarOpen && (
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className={`absolute right-0 top-1/2 -translate-y-1/2 p-1.5 border-l border-t border-b rounded-l-xl shadow-2xl z-30 ${
               isDark
                 ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-gold-500'
                 : 'bg-white border-slate-200 text-slate-400 hover:text-gold-600'
             }`}
           >
             <FaChevronLeft size={10} />
           </button>
        )}
      </div>

      {/* Terminal Status Bar */}
      <div className={`h-8 border-t px-6 flex items-center justify-between ${
        isDark
          ? 'bg-slate-800/80 border-slate-700/50'
          : 'bg-slate-50 border-slate-200'
      }`}>
         <div className="flex items-center space-x-4">
            <span className="flex items-center text-[8px] font-black text-emerald-500 uppercase tracking-widest"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> Market Connected</span>
            <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Latency: 12ms</span>
         </div>
         <div className={`flex items-center text-[8px] font-black uppercase tracking-widest italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            09:28:11 UTC-5
         </div>
      </div>
    </div>
  );
});

export default TradingViewWidget;
