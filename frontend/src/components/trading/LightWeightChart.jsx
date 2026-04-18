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

    let active = true;

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

    // Generate sample data based on symbol
    const generateData = () => {
      const data = [];
      const now = new Date();
      const basePrice = getBasePrice(symbol);
      
      for (let i = 100; i >= 0; i--) {
        const time = new Date(now);
        time.setDate(time.getDate() - i);
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

    // Dispose old chart if exists
    if (chartRef.current) {
        try { chartRef.current.remove(); } catch (e) {}
        chartRef.current = null;
    }
    seriesRef.current = null;

    const isDark = theme === 'dark';

    // Chart configuration
    const chartOptions = {
      layout: {
        background: { color: isDark ? '#0a0f1c' : '#ffffff' },
        textColor: isDark ? '#ffd700' : '#1e293b',
      },
      grid: {
        vertLines: { color: isDark ? '#1e293b' : '#e2e8f0' },
        horzLines: { color: isDark ? '#1e293b' : '#e2e8f0' },
      },
      width: chartContainerRef.current.clientWidth || 0,
      height: chartContainerRef.current.clientHeight || 0,
      crosshair: {
        mode: 1,
        vertLine: { width: 1, color: '#ffd700', style: 3 },
        horzLine: { width: 1, color: '#ffd700', style: 3 },
      },
      rightPriceScale: {
        borderColor: isDark ? '#ffd700' : '#94a3b8',
        textColor: isDark ? '#ffd700' : '#1e293b',
      },
      timeScale: {
        borderColor: isDark ? '#ffd700' : '#94a3b8',
        timeVisible: true,
        secondsVisible: false,
      },
    };

    try {
      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
      });
      seriesRef.current = candlestickSeries;

      const data = generateData();
      const candlestickData = data.map(d => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      candlestickSeries.setData(candlestickData);

      const volumeSeries = chart.addHistogramSeries({
        color: '#ffd700',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      const volumeData = data.map((d, index) => ({
        time: d.time,
        value: Math.floor(Math.random() * 1000000) + 500000,
        color: index % 2 === 0 ? '#26a69a' : '#ef5350',
      }));
      volumeSeries.setData(volumeData);

      chart.timeScale().fitContent();

    } catch (error) {
      console.error('Error creating chart:', error);
    }

    // Handle resize with ResizeObserver for better accuracy and lifecycle sync
    const resizeObserver = new ResizeObserver((entries) => {
        if (!active || !chartRef.current || !entries.length) return;
        const { width, height } = entries[0].contentRect;
        if (width === 0 || height === 0) return;
        try {
            chartRef.current.applyOptions({ width, height });
            chartRef.current.timeScale().fitContent();
        } catch (e) {}
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      active = false;
      resizeObserver.disconnect();
      
      const currentChart = chartRef.current;
      seriesRef.current = null;
      chartRef.current = null;
      
      if (currentChart) {
        try {
          currentChart.remove();
        } catch (e) {}
      }
    };
  }, [symbol, theme, height, width]);

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