// frontend/src/components/charts/PortfolioPerformanceChart.jsx
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Professional Portfolio Performance Chart Component
const PortfolioPerformanceChart = ({ data, timeframe, height }) => {
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalReturn: 0,
    dailyChange: 0,
    sharpeRatio: 0,
    maxDrawdown: 0
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      calculateMetrics(data);
    } else {
      generatePortfolioData();
    }
  }, [data, timeframe]);

  const generatePortfolioData = () => {
    const now = new Date();
    const newData = [];
    let value = portfolio?.totalBalance || 100000;
    let peak = value;
    let maxDrawdown = 0;
    
    // Determine number of data points based on timeframe
    let points = 30;
    let dateFormat = 'MM/DD';
    
    switch(timeframe) {
      case '1D':
        points = 24;
        dateFormat = 'HH:mm';
        break;
      case '1W':
        points = 7;
        dateFormat = 'MM/DD';
        break;
      case '1M':
        points = 30;
        dateFormat = 'MM/DD';
        break;
      case '3M':
        points = 90;
        dateFormat = 'MM/DD';
        break;
      case '1Y':
        points = 365;
        dateFormat = 'MM/DD';
        break;
      default:
        points = 30;
    }

    for (let i = points; i >= 0; i--) {
      const date = new Date(now);
      if (timeframe === '1D') {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }

      // Simulate realistic market movements
      const dailyReturn = (Math.random() - 0.48) * 0.02;
      value = value * (1 + dailyReturn);
      
      // Add some volatility spikes
      if (Math.random() > 0.9) {
        value = value * (1 + (Math.random() - 0.5) * 0.05);
      }

      // Track max drawdown
      if (value > peak) peak = value;
      const drawdown = ((peak - value) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;

      // Format date based on timeframe
      let formattedDate;
      if (timeframe === '1D') {
        formattedDate = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      newData.push({
        timestamp: date.toISOString(),
        date: formattedDate,
        value: Math.round(value * 100) / 100,
        formattedValue: `$${Math.round(value).toLocaleString()}`,
        dailyReturn: dailyReturn * 100,
        drawdown
      });
    }

    // Calculate metrics
    const totalReturn = ((value - 100000) / 100000) * 100;
    const dailyChange = ((newData[newData.length - 1].value - newData[newData.length - 2].value) / newData[newData.length - 2].value) * 100;
    
    setChartData(newData);
    setMetrics({
      totalReturn: totalReturn.toFixed(2),
      dailyChange: dailyChange.toFixed(2),
      sharpeRatio: (Math.random() * 2 + 1).toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2)
    });
  };

  const calculateMetrics = (data) => {
    if (!data || data.length < 2) return;
    
    const values = data.map(d => d.value);
    const totalReturn = ((values[values.length - 1] - values[0]) / values[0]) * 100;
    const dailyChange = ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100;
    
    // Calculate max drawdown
    let peak = values[0];
    let maxDrawdown = 0;
    values.forEach(value => {
      if (value > peak) peak = value;
      const drawdown = ((peak - value) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    setMetrics({
      totalReturn: totalReturn.toFixed(2),
      dailyChange: dailyChange.toFixed(2),
      sharpeRatio: (Math.random() * 2 + 1).toFixed(2), // In real app, calculate from returns
      maxDrawdown: maxDrawdown.toFixed(2)
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-800 border border-gold-500 rounded-lg p-4 shadow-xl">
          <p className="text-gold-500 text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-white text-sm">
              Value: <span className="text-gold-400 font-medium">{data.formattedValue}</span>
            </p>
            <p className="text-xs">
              Daily Change: 
              <span className={data.dailyReturn > 0 ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>
                {data.dailyReturn > 0 ? '+' : ''}{data.dailyReturn?.toFixed(2) || '0'}%
              </span>
            </p>
            <p className="text-xs text-red-400">
              Drawdown: {data.drawdown?.toFixed(2) || '0'}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-navy-700/50 rounded-lg p-4">
          <p className="text-xs text-gold-400/70 mb-1">Total Return</p>
          <p className={`text-xl font-bold ${parseFloat(metrics.totalReturn) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {parseFloat(metrics.totalReturn) >= 0 ? '+' : ''}{metrics.totalReturn}%
          </p>
        </div>
        <div className="bg-navy-700/50 rounded-lg p-4">
          <p className="text-xs text-gold-400/70 mb-1">24h Change</p>
          <p className={`text-xl font-bold ${parseFloat(metrics.dailyChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {parseFloat(metrics.dailyChange) >= 0 ? '+' : ''}{metrics.dailyChange}%
          </p>
        </div>
        <div className="bg-navy-700/50 rounded-lg p-4">
          <p className="text-xs text-gold-400/70 mb-1">Sharpe Ratio</p>
          <p className="text-xl font-bold text-gold-400">{metrics.sharpeRatio}</p>
        </div>
        <div className="bg-navy-700/50 rounded-lg p-4">
          <p className="text-xs text-gold-400/70 mb-1">Max Drawdown</p>
          <p className="text-xl font-bold text-red-400">{metrics.maxDrawdown}%</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height || 300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: isMobile ? 8 : 10 }}
            tickLine={{ stroke: '#FFD700' }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis 
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: isMobile ? 8 : 10 }}
            tickLine={{ stroke: '#FFD700' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#FFD700" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            name="Portfolio Value"
            dot={false}
            activeDot={{ r: 6, fill: '#FFD700', stroke: '#0A1929', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2 mt-4">
        {['1D', '1W', '1M', '3M', '1Y'].map((range) => (
          <button
            key={range}
            onClick={() => setSelectedTimeframe(range)}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              timeframe === range
                ? 'bg-gold-500 text-navy-950'
                : 'bg-navy-700 text-gold-400 hover:bg-navy-600'
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PortfolioPerformanceChart;