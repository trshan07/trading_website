import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const RealTimeChart = ({ 
  symbol = 'BTC/USD',
  theme = 'dark',
  height = '100%',
  width = '100%'
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // Get base price based on symbol
    const getBasePrice = () => {
      if (symbol.includes('BTC')) return 43250;
      if (symbol.includes('ETH')) return 2820;
      if (symbol.includes('EUR')) return 1.0875;
      if (symbol.includes('GBP')) return 1.2650;
      if (symbol.includes('GOLD')) return 2052.30;
      if (symbol.includes('AAPL')) return 175.50;
      if (symbol.includes('MSFT')) return 380.25;
      return 100;
    };

    // Generate realistic historical data
    const generateHistoricalData = () => {
      const data = [];
      const now = new Date();
      const basePrice = getBasePrice();
      let lastPrice = basePrice;
      
      for (let i = 200; i >= 0; i--) {
        const date = new Date(now);
        date.setMinutes(date.getMinutes() - i * 30); // 30-minute intervals
        
        // Random walk with mean reversion
        const change = (Math.random() - 0.5) * 0.01;
        const drift = (basePrice - lastPrice) * 0.001; // Mean reversion
        lastPrice = lastPrice * (1 + change + drift);
        
        data.push({
          time: date.toISOString().slice(0, 19).replace('T', ' '),
          value: lastPrice,
        });
      }
      return data;
    };

    // Chart configuration
    const chartOptions = {
      layout: {
        background: { color: theme === 'dark' ? '#0a0f1c' : '#ffffff' },
        textColor: theme === 'dark' ? '#ffd700' : '#1e293b',
        fontSize: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { 
          color: theme === 'dark' ? '#1e293b' : '#e2e8f0',
          style: 1,
          visible: true,
        },
        horzLines: { 
          color: theme === 'dark' ? '#1e293b' : '#e2e8f0',
          style: 1,
          visible: true,
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: '#ffd700',
          style: 3,
          labelBackgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
        },
        horzLine: {
          width: 1,
          color: '#ffd700',
          style: 3,
          labelBackgroundColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
        },
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#ffd700' : '#94a3b8',
        borderVisible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        alignLabels: true,
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#ffd700' : '#94a3b8',
        borderVisible: true,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 5,
        barSpacing: 6,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: true,
      },
    };

    try {
      // Create chart
      const chart = createChart(chartContainerRef.current, chartOptions);
      chartRef.current = chart;

      // Add line series
      const lineSeries = chart.addLineSeries({
        color: '#ffd700',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#ffd700',
        crosshairMarkerBackgroundColor: theme === 'dark' ? '#0a0f1c' : '#ffffff',
        lastValueVisible: true,
        priceLineVisible: true,
        priceLineColor: '#ffd700',
        priceLineWidth: 1,
        priceLineStyle: 2,
      });

      // Set data
      const historicalData = generateHistoricalData();
      lineSeries.setData(historicalData);
      seriesRef.current = lineSeries;

      // Add volume series (optional)
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

      const volumeData = historicalData.map((item, index) => ({
        time: item.time,
        value: Math.floor(Math.random() * 1000000) + 500000,
        color: index % 2 === 0 ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
      }));
      volumeSeries.setData(volumeData);

      // Fit content
      chart.timeScale().fitContent();

      // Add some styling to the price scale
      chart.priceScale('right').applyOptions({
        borderColor: theme === 'dark' ? '#ffd700' : '#94a3b8',
      });

    } catch (error) {
      console.error('Error creating chart:', error);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
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
        chartRef.current = null;
      }
    };
  }, [symbol, theme]);

  return (
    <div 
      ref={chartContainerRef} 
      style={{ 
        height, 
        width,
        borderRadius: '0.5rem',
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  );
};

export default RealTimeChart;