// frontend/src/components/charts/MarketAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const MarketAnalysis = ({ marketData }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [marketCapData, setMarketCapData] = useState([]);
  const [dominanceData, setDominanceData] = useState([]);
  const [fearGreedIndex, setFearGreedIndex] = useState(65);
  const [marketSentiment, setMarketSentiment] = useState(72);

  useEffect(() => {
    if (marketData) {
      const totalCap = Object.values(marketData).reduce((sum, data) => {
        return sum + (data.marketCap || 0);
      }, 0);

      const dominance = Object.entries(marketData)
        .filter(([_, data]) => data.marketCap)
        .map(([symbol, data]) => ({
          name: symbol,
          value: (data.marketCap / totalCap) * 100,
          color: getSymbolColor(symbol)
        }));

      setDominanceData(dominance);

      const marketCap = Object.entries(marketData).map(([symbol, data]) => ({
        name: symbol,
        value: data.marketCap || data.volume * 2,
        color: getSymbolColor(symbol)
      }));
      setMarketCapData(marketCap);

      const avgChange = Object.values(marketData).reduce((sum, data) => {
        return sum + parseFloat(data.change);
      }, 0) / Object.keys(marketData).length;
      
      setFearGreedIndex(Math.min(100, Math.max(0, 50 + avgChange * 10)));
      setMarketSentiment(Math.min(100, Math.max(0, 50 + avgChange * 15)));
    }
  }, [marketData]);

  const getSymbolColor = (symbol) => {
    const colors = {
      'BTC/USD': '#EAB308', // gold-500
      'ETH/USD': '#10B981',
      'EUR/USD': '#3B82F6',
      'GBP/USD': '#8B5CF6',
      'GOLD': '#F59E0B'
    };
    return colors[symbol] || '#EAB308';
  };

  const getFearGreedColor = (value) => {
    if (value >= 75) return '#10B981';
    if (value >= 55) return '#84CC16';
    if (value >= 45) return '#EAB308';
    if (value >= 25) return '#F97316';
    return '#EF4444';
  };

  const getFearGreedLabel = (value) => {
    if (value >= 75) return 'Extreme Greed';
    if (value >= 55) return 'Greed';
    if (value >= 45) return 'Neutral';
    if (value >= 25) return 'Fear';
    return 'Extreme Fear';
  };

  return (
    <div className="space-y-6 transition-colors duration-300">
      {/* Market Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fear & Greed Index */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Fear & Greed Index</h4>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl font-black italic tracking-tighter" style={{ color: getFearGreedColor(fearGreedIndex) }}>
              {Math.round(fearGreedIndex)}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{getFearGreedLabel(fearGreedIndex)}</span>
          </div>
          <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(234,179,8,0.2)]"
              style={{ 
                width: `${fearGreedIndex}%`,
                background: `linear-gradient(90deg, #EF4444, #F97316, #EAB308, #84CC16, #10B981)`
              }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2.5 opacity-50">
            <span>Severe Fear</span>
            <span>Unbounded Greed</span>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Aggregate Sentiment</h4>
          <div className="flex items-center justify-between mb-4">
            <span className="text-4xl font-black italic tracking-tighter text-blue-500 dark:text-blue-400 transition-colors">{marketSentiment}%</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {marketSentiment > 60 ? 'Bullish' : marketSentiment < 40 ? 'Bearish' : 'Neutral'}
            </span>
          </div>
          <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              style={{ width: `${marketSentiment}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2.5 opacity-50">
            <span>Market Bearish</span>
            <span>Market Bullish</span>
          </div>
        </div>
      </div>

      {/* Market Dominance */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 italic">Global Dominance Control</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {dominanceData.map((item) => (
            <div key={item.name} className="group">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</span>
                <span className="text-slate-900 dark:text-white italic">{item.value.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-in-out group-hover:brightness-110"
                  style={{ 
                    width: `${item.value}%`,
                    backgroundColor: item.color,
                    boxShadow: `0 0 10px ${item.color}33`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 24h Market Highlights */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Volatility Highlights</h4>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Object.entries(marketData)
            .sort((a, b) => Math.abs(parseFloat(b[1].change)) - Math.abs(parseFloat(a[1].change)))
            .slice(0, 3)
            .map(([symbol, data]) => (
              <div key={symbol} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${parseFloat(data.change) >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                  <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight transition-colors">{symbol}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md italic uppercase ${
                    parseFloat(data.change) > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {parseFloat(data.change) > 0 ? '▲' : '▼'} {Math.abs(parseFloat(data.change))}%
                  </span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">${data.price.toLocaleString()}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;