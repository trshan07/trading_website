import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const LightweightChart = ({ 
  symbol = 'BTCUSDT',
  theme = 'dark',
  height = '100%',
  width = '100%'
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Generate sample data based on symbol
    const generateData = () => {
      const data = [];
      const now = new Date();
      const basePrice = getBasePrice(symbol);
      
      for (let i = 100; i >= 0; i--) {
        const time = new Date(now);
        time.setDate(time.getDate() - i);
        
        // Create realistic price movements
        const change = (Math.random() - 0.5) * 0.02;
        const price = basePrice * (1 + change + (Math.sin(i / 10) * 0.01));
        
        data.push({
          time: time.toISOString().split('T')[0],
          value: price,
          open: price * (1 - Math.random() * 0.01),
          high: price * (1 + Math.random() * 0.02),
          low: price * (1 - Math.random() * 0.02),
          close: price * (1 + (Math.random() - 0.5) * 0.01),
        });
      }
      return data;
    };

    // Helper function to get base price based on symbol
    const getBasePrice = (sym) => {
      if (sym.includes('BTC')) return 43250;
      if (sym.includes('ETH')) return 2820;
      if (sym.includes('BNB')) return 350;
      if (sym.includes('SOL')) return 120;
      if (sym.includes('EUR')) return 1.0875;
      if (sym.includes('GBP')) return 1.2650;
      if (sym.includes('AAPL')) return 175.50;
      if (sym.includes('MSFT')) return 380.25;
      if (sym.includes('GOLD') || sym.includes('XAU')) return 2052.30;
      return 100;
    };

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Chart configuration
    const chartOptions = {
      layout: {
        background: { color: theme === 'dark' ? '#0a0f1c' : '#ffffff' },
        textColor: theme === 'dark' ? '#ffd700' : '#1e293b',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#1e293b' : '#e2e8f0' },
        horzLines: { color: theme === 'dark' ? '#1e293b' : '#e2e8f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#ffd700',
          style: 3,
        },
        horzLine: {
          width: 1,
          color: '#ffd700',
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#ffd700' : '#94a3b8',
        textColor: theme === 'dark' ? '#ffd700' : '#1e293b',
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#ffd700' : '#94a3b8',
        timeVisible: true,
        secondsVisible: false,
      },
    };

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      // Add candlestick series - Note: method name is addCandlestickSeries (not addCandlestickSeries)
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
      });

      const data = generateData();
      
      // Format data for candlestick
      const candlestickData = data.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      candlestickSeries.setData(candlestickData);
      seriesRef.current = candlestickSeries;

      // Add volume series
      const volumeSeries = chart.addHistogramSeries({
        color: '#ffd700',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = data.map((d, index) => ({
        time: d.time,
        value: Math.floor(Math.random() * 1000000) + 500000,
        color: index % 2 === 0 ? '#26a69a' : '#ef5350',
      }));
      volumeSeries.setData(volumeData);

      // Fit content
      chart.timeScale().fitContent();

    } catch (error) {
      console.error('Error creating chart:', error);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
        chartRef.current.timeScale().fitContent();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol]); // Only re-run if symbol changes

  // Dynamic Theme/Options Update
  useEffect(() => {
    if (chartRef.current) {
        const isDark = theme === 'dark';
        chartRef.current.applyOptions({
            layout: {
                background: { color: isDark ? '#0f172a' : '#ffffff' },
                textColor: isDark ? '#ffd700' : '#1e293b',
            },
            grid: {
                vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
                horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
            },
            crosshair: {
                vertLine: { labelBackgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
                horzLine: { labelBackgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
            },
            rightPriceScale: {
                borderColor: isDark ? '#ffd70033' : '#94a3b8',
                textColor: isDark ? '#ffd700' : '#1e293b',
            },
            timeScale: {
                borderColor: isDark ? '#ffd70033' : '#94a3b8',
            },
        });
    }
  }, [theme]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ 
        height, 
        width,
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}
    />
  );
};

export default LightweightChart;