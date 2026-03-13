// frontend/src/components/trading/TradingChart.jsx
import React from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const TradingChart = ({ type = 'line', data = [] }) => {
  const chartData = data.length ? data : [
    { time: '09:30', price: 42500, volume: 1200, high: 42600, low: 42400 },
    { time: '10:00', price: 42650, volume: 1500, high: 42700, low: 42550 },
    { time: '10:30', price: 42800, volume: 1800, high: 42850, low: 42650 },
    { time: '11:00', price: 42750, volume: 1300, high: 42800, low: 42700 },
    { time: '11:30', price: 42900, volume: 2000, high: 42950, low: 42750 },
    { time: '12:00', price: 43000, volume: 2200, high: 43050, low: 42900 },
    { time: '12:30', price: 43150, volume: 1900, high: 43200, low: 43000 },
    { time: '13:00', price: 43050, volume: 1600, high: 43200, low: 43000 },
    { time: '13:30', price: 43200, volume: 2100, high: 43250, low: 43050 },
    { time: '14:00', price: 43350, volume: 2300, high: 43400, low: 43200 },
  ];

  if (type === 'candlestick') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
          <YAxis stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0A1929', border: '1px solid #FFD700', borderRadius: '8px' }}
            labelStyle={{ color: '#FFD700' }}
          />
          <Area 
            type="monotone" 
            dataKey="high" 
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.1} 
            name="High"
          />
          <Area 
            type="monotone" 
            dataKey="low" 
            stroke="#EF4444" 
            fill="#EF4444" 
            fillOpacity={0.1} 
            name="Low"
          />
          <Bar dataKey="volume" fill="#FFD700" opacity={0.3} name="Volume" yAxisId="right" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
          <YAxis stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0A1929', border: '1px solid #FFD700', borderRadius: '8px' }}
            labelStyle={{ color: '#FFD700' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#FFD700" 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Default line chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="time" stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
        <YAxis stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0A1929', border: '1px solid #FFD700', borderRadius: '8px' }}
          labelStyle={{ color: '#FFD700' }}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#FFD700" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#FFD700' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TradingChart;