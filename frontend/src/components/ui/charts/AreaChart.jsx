// frontend/src/components/ui/charts/AreaChart.jsx
import React from 'react';

const AreaChart = ({ data = [], xKey = 'date', yKey = 'value' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gold-500/50 text-sm">No data available</p>
      </div>
    );
  }

  // Simple placeholder chart
  const maxValue = Math.max(...data.map(d => d[yKey]));
  const minValue = Math.min(...data.map(d => d[yKey]));
  const range = maxValue - minValue;

  return (
    <div className="h-full w-full relative">
      <div className="absolute inset-0 flex items-end">
        {data.map((point, index) => {
          const height = ((point[yKey] - minValue) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 mx-px bg-gold-500/30 hover:bg-gold-500/50 transition-all"
              style={{ height: `${height}%` }}
              title={`${point[xKey]}: $${point[yKey].toLocaleString()}`}
            />
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-500/20"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gold-500/20"></div>
    </div>
  );
};

export default AreaChart;