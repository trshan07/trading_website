// frontend/src/components/ui/charts/LineChart.jsx
import React from 'react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

const LineChart = ({ data, xKey = 'date', yKey = 'value', color }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const themeColors = {
    grid: isDark ? '#1e293b' : '#f1f5f9',
    axis: isDark ? '#64748b' : '#94a3b8',
    text: isDark ? '#94a3b8' : '#64748b',
    gold: '#EAB308', // gold-500
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0'
  };

  const strokeColor = color || themeColors.gold;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
        <XAxis 
          dataKey={xKey} 
          stroke={themeColors.axis} 
          tick={{ fill: themeColors.text, fontSize: 10, fontWeight: 900 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          stroke={themeColors.axis} 
          tick={{ fill: themeColors.text, fontSize: 10, fontWeight: 900 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: themeColors.tooltipBg, 
            border: `1px solid ${themeColors.tooltipBorder}`, 
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            color: isDark ? '#ffffff' : '#0f172a',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ color: strokeColor }}
          labelStyle={{ color: themeColors.text, marginBottom: '4px' }}
        />
        <Line 
          type="monotone" 
          dataKey={yKey} 
          stroke={strokeColor} 
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: strokeColor, stroke: isDark ? '#0f172a' : '#ffffff', strokeWidth: 2 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;