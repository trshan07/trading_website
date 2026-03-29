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
    <div className="h-full w-full relative flex items-baseline justify-between pt-4">
      {data.map((point, index) => {
        const height = maxValue === minValue ? 100 : ((point[yKey] - minValue) / range) * 100;
        return (
          <div
            key={index}
            className="group relative flex-1 flex flex-col items-center"
            style={{ height: '100%' }}
          >
            <div
              className={`w-full max-w-[12px] rounded-t-sm transition-all duration-300 ${
                point[yKey] >= data[index - 1]?.[yKey] || index === 0
                  ? 'bg-emerald-100 group-hover:bg-emerald-200'
                  : 'bg-rose-100 group-hover:bg-rose-200'
              }`}
              style={{ height: `${Math.max(height, 5)}%`, marginTop: 'auto' }}
            >
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                ${point[yKey].toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100"></div>
    </div>
  );
};

export default AreaChart;