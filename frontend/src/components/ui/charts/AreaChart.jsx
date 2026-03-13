// frontend/src/components/ui/charts/AreaChart.jsx
import React from 'react';
import { AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaChart = ({ data, xKey = 'date', yKey = 'value', color = '#FFD700' }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReAreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey={xKey} stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
        <YAxis stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0A1929', border: '1px solid #FFD700', borderRadius: '8px' }}
          labelStyle={{ color: '#FFD700' }}
        />
        <Area 
          type="monotone" 
          dataKey={yKey} 
          stroke={color} 
          fill={`url(#gradient-${yKey})`} 
        />
      </ReAreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChart;