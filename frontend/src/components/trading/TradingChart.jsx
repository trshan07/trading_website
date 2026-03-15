// frontend/src/components/trading/TradingChart.jsx
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const TradingChart = ({ type = 'line', data = [], symbol = 'BTCUSD' }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Generate mock data if no data provided
    if (!data || data.length === 0) {
      const mockData = generateMockData();
      setChartData(mockData);
    } else {
      setChartData(data);
    }
  }, [data, symbol]);

  const generateMockData = () => {
    const data = [];
    const now = new Date();
    let basePrice = symbol.includes('BTC') ? 43000 : 
                   symbol.includes('ETH') ? 2800 : 
                   symbol.includes('EUR') ? 1.08 : 2000;
    
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30 * 60000);
      const hour = time.getHours().toString().padStart(2, '0');
      const minute = time.getMinutes().toString().padStart(2, '0');
      
      // Random price movement
      const change = (Math.random() - 0.5) * basePrice * 0.02;
      const price = basePrice + change;
      const high = price + Math.random() * basePrice * 0.01;
      const low = price - Math.random() * basePrice * 0.01;
      const volume = Math.floor(Math.random() * 2000) + 500;
      
      data.push({
        time: `${hour}:${minute}`,
        price: parseFloat(price.toFixed(2)),
        volume,
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        open: parseFloat((price - Math.random() * basePrice * 0.005).toFixed(2)),
        close: parseFloat((price + Math.random() * basePrice * 0.005).toFixed(2))
      });
      
      basePrice = price;
    }
    
    return data;
  };

  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-800 border border-gold-500 rounded-lg p-3 shadow-xl">
          <p className="text-gold-500 text-sm font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'candlestick') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: 10 }}
            tickLine={{ stroke: '#FFD700' }}
            minTickGap={30}
          />
          <YAxis 
            yAxisId="left"
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: 10 }}
            tickLine={{ stroke: '#FFD700' }}
            tickFormatter={formatYAxis}
            domain={['auto', 'auto']}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: 10 }}
            tickLine={{ stroke: '#FFD700' }}
            tickFormatter={formatYAxis}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* High-Low Range as Area */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="high"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.1}
            name="High"
            dot={false}
            activeDot={false}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="low"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.1}
            name="Low"
            dot={false}
            activeDot={false}
          />
          
          {/* Price Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="price"
            stroke="#FFD700"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#FFD700' }}
            name="Price"
          />
          
          {/* Volume Bars */}
          <Bar
            yAxisId="right"
            dataKey="volume"
            fill="#FFD700"
            opacity={0.3}
            name="Volume"
            barSize={20}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: 10 }}
            tickLine={{ stroke: '#FFD700' }}
          />
          <YAxis 
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: 10 }}
            tickLine={{ stroke: '#FFD700' }}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#FFD700" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            name="Price"
            dot={false}
            activeDot={{ r: 6, fill: '#FFD700' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Default line chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis 
          dataKey="time" 
          stroke="#FFD700" 
          tick={{ fill: '#FFD700', fontSize: 10 }}
          tickLine={{ stroke: '#FFD700' }}
        />
        <YAxis 
          stroke="#FFD700" 
          tick={{ fill: '#FFD700', fontSize: 10 }}
          tickLine={{ stroke: '#FFD700' }}
          tickFormatter={formatYAxis}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#FFD700" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#FFD700' }}
          name="Price"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TradingChart;