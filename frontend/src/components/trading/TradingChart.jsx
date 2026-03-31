import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const TradingChart = ({ type = 'line', data = [], symbol = 'BTCUSD', theme: propTheme }) => {
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;
  const isDark = theme === 'dark';
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
        <div className={`border rounded-xl p-4 shadow-2xl backdrop-blur-md transition-colors duration-300 ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
          <p className="text-gold-500 text-[10px] font-black uppercase tracking-widest mb-3 italic">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-black italic" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const themeColors = {
    grid: isDark ? '#1e293b' : '#f1f5f9',
    axis: isDark ? '#64748b' : '#94a3b8',
    text: isDark ? '#94a3b8' : '#64748b',
    gold: '#EAB308' // gold-500
  };

  if (type === 'candlestick') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
          <XAxis 
            dataKey="time" 
            stroke={themeColors.axis} 
            tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
            tickLine={{ stroke: themeColors.axis }}
            minTickGap={30}
            axisLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke={themeColors.axis} 
            tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
            tickLine={{ stroke: themeColors.axis }}
            tickFormatter={formatYAxis}
            domain={['auto', 'auto']}
            axisLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke={themeColors.axis} 
            tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
            tickLine={{ stroke: themeColors.axis }}
            tickFormatter={formatYAxis}
            domain={['auto', 'auto']}
            axisLine={false}
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
            stroke={themeColors.gold}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: themeColors.gold }}
            name="Price"
          />
          
          {/* Volume Bars */}
          <Bar
            yAxisId="right"
            dataKey="volume"
            fill={isDark ? '#334155' : '#cbd5e1'}
            opacity={0.3}
            name="Volume"
            barSize={12}
            radius={[4, 4, 0, 0]}
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
              <stop offset="5%" stopColor={themeColors.gold} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={themeColors.gold} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
          <XAxis 
            dataKey="time" 
            stroke={themeColors.axis} 
            tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
            tickLine={{ stroke: themeColors.axis }}
            axisLine={false}
          />
          <YAxis 
            stroke={themeColors.axis} 
            tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
            tickLine={{ stroke: themeColors.axis }}
            tickFormatter={formatYAxis}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={themeColors.gold} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            name="Price"
            dot={false}
            activeDot={{ r: 6, fill: themeColors.gold }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Default line chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
        <XAxis 
          dataKey="time" 
          stroke={themeColors.axis} 
          tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
          tickLine={{ stroke: themeColors.axis }}
          axisLine={false}
        />
        <YAxis 
          stroke={themeColors.axis} 
          tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
          tickLine={{ stroke: themeColors.axis }}
          tickFormatter={formatYAxis}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke={themeColors.gold} 
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: themeColors.gold }}
          name="Price"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TradingChart;