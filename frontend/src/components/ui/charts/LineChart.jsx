// frontend/src/components/ui/charts/LineChart.jsx
import React from 'react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, xKey = 'date', yKey = 'value', color = '#FFD700' }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey={xKey} stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
        <YAxis stroke="#FFD700" tick={{ fill: '#FFD700', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0A1929', border: '1px solid #FFD700', borderRadius: '8px' }}
          labelStyle={{ color: '#FFD700' }}
        />
        <Line 
          type="monotone" 
          dataKey={yKey} 
          stroke={color} 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: color }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;