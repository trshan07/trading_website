// frontend/src/components/charts/MarketAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MarketAnalysis = ({ marketData }) => {
  const [marketCapData, setMarketCapData] = useState([]);
  const [dominanceData, setDominanceData] = useState([]);
  const [fearGreedIndex, setFearGreedIndex] = useState(65);
  const [marketSentiment, setMarketSentiment] = useState(72);

  useEffect(() => {
    // Calculate market dominance
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

      // Generate market cap data
      const marketCap = Object.entries(marketData).map(([symbol, data]) => ({
        name: symbol,
        value: data.marketCap || data.volume * 2,
        color: getSymbolColor(symbol)
      }));
      setMarketCapData(marketCap);

      // Update fear & greed index based on market movement
      const avgChange = Object.values(marketData).reduce((sum, data) => {
        return sum + parseFloat(data.change);
      }, 0) / Object.keys(marketData).length;
      
      setFearGreedIndex(Math.min(100, Math.max(0, 50 + avgChange * 10)));
      setMarketSentiment(Math.min(100, Math.max(0, 50 + avgChange * 15)));
    }
  }, [marketData]);

  const getSymbolColor = (symbol) => {
    const colors = {
      'BTC/USD': '#FFD700',
      'ETH/USD': '#10B981',
      'EUR/USD': '#3B82F6',
      'GBP/USD': '#8B5CF6',
      'GOLD': '#F59E0B'
    };
    return colors[symbol] || '#FFD700';
  };

  const getFearGreedColor = (value) => {
    if (value >= 75) return '#10B981';
    if (value >= 55) return '#84CC16';
    if (value >= 45) return '#FFD700';
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
    <div className="space-y-6">
      {/* Market Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fear & Greed Index */}
        <div className="bg-navy-700/50 rounded-lg p-4">
          <h4 className="text-sm text-gold-400 mb-4">Fear & Greed Index</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold" style={{ color: getFearGreedColor(fearGreedIndex) }}>
              {Math.round(fearGreedIndex)}
            </span>
            <span className="text-sm text-gold-400/70">{getFearGreedLabel(fearGreedIndex)}</span>
          </div>
          <div className="relative h-3 bg-navy-600 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500"
              style={{ 
                width: `${fearGreedIndex}%`,
                background: `linear-gradient(90deg, #EF4444, #F97316, #FFD700, #84CC16, #10B981)`
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gold-400/50 mt-1">
            <span>Extreme Fear</span>
            <span>Extreme Greed</span>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="bg-navy-700/50 rounded-lg p-4">
          <h4 className="text-sm text-gold-400 mb-4">Market Sentiment</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-blue-400">{marketSentiment}%</span>
            <span className="text-sm text-gold-400/70">
              {marketSentiment > 60 ? 'Bullish' : marketSentiment < 40 ? 'Bearish' : 'Neutral'}
            </span>
          </div>
          <div className="relative h-3 bg-navy-600 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${marketSentiment}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gold-400/50 mt-1">
            <span>Bearish</span>
            <span>Bullish</span>
          </div>
        </div>
      </div>

      {/* Market Dominance */}
      <div className="bg-navy-700/50 rounded-lg p-4">
        <h4 className="text-sm text-gold-400 mb-4">Market Dominance</h4>
        <div className="space-y-3">
          {dominanceData.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gold-400/70">{item.name}</span>
                <span className="text-white font-medium">{item.value.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-navy-600 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${item.value}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 24h Market Highlights */}
      <div className="bg-navy-700/50 rounded-lg p-4">
        <h4 className="text-sm text-gold-400 mb-4">Market Highlights</h4>
        <div className="space-y-3">
          {Object.entries(marketData)
            .sort((a, b) => Math.abs(parseFloat(b[1].change)) - Math.abs(parseFloat(a[1].change)))
            .slice(0, 3)
            .map(([symbol, data]) => (
              <div key={symbol} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">{symbol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    parseFloat(data.change) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {parseFloat(data.change) > 0 ? '▲' : '▼'} {Math.abs(parseFloat(data.change))}%
                  </span>
                </div>
                <span className="text-white font-medium">${data.price.toLocaleString()}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;