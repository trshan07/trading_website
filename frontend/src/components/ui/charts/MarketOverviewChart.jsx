// frontend/src/components/charts/MarketOverviewChart.jsx
import React, { useState, useEffect } from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketOverviewChart = ({ symbol = 'BTC/USD', data = [], height = 200 }) => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    currentPrice: 0,
    priceChange: 0,
    high24h: 0,
    low24h: 0,
    volume24h: 0
  });

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      calculateStats(data);
    } else {
      generateMarketData();
    }
  }, [symbol]);

  const generateMarketData = () => {
    const data = [];
    const now = new Date();
    let price = getBasePrice(symbol);
    let high = price;
    let low = price;
    let totalVolume = 0;

    for (let i = 24; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(time.getHours() - i);
      
      // Realistic price movement
      const volatility = getVolatility(symbol);
      const change = (Math.random() - 0.48) * volatility;
      price = price * (1 + change);
      
      // Track 24h high/low
      if (price > high) high = price;
      if (price < low) low = price;
      
      // Generate volume (higher during volatile periods)
      const volume = Math.floor(Math.random() * 10000) + 5000 + (Math.abs(change) * 100000);
      totalVolume += volume;

      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: Math.round(price * 100) / 100,
        volume: Math.round(volume),
        formattedPrice: `$${price.toFixed(2)}`,
        change: (change * 100).toFixed(2)
      });
    }

    const priceChange = ((price - data[0].price) / data[0].price) * 100;

    setChartData(data);
    setStats({
      currentPrice: price,
      priceChange,
      high24h: high,
      low24h: low,
      volume24h: totalVolume
    });
  };

  const getBasePrice = (symbol) => {
    switch(symbol) {
      case 'BTC/USD': return 43250;
      case 'ETH/USD': return 2820;
      case 'EUR/USD': return 1.0875;
      case 'GBP/USD': return 1.2650;
      case 'GOLD': return 2052.30;
      default: return 100;
    }
  };

  const getVolatility = (symbol) => {
    switch(symbol) {
      case 'BTC/USD': return 0.02;
      case 'ETH/USD': return 0.025;
      case 'EUR/USD': return 0.005;
      case 'GBP/USD': return 0.006;
      case 'GOLD': return 0.008;
      default: return 0.01;
    }
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) return;
    
    const prices = data.map(d => d.price);
    const volumes = data.map(d => d.volume);
    
    setStats({
      currentPrice: prices[prices.length - 1],
      priceChange: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
      high24h: Math.max(...prices),
      low24h: Math.min(...prices),
      volume24h: volumes.reduce((a, b) => a + b, 0)
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-800 border border-gold-500 rounded-lg p-3 shadow-xl">
          <p className="text-gold-500 text-xs mb-2">{label}</p>
          <p className="text-white text-sm">
            Price: <span className="text-gold-400 font-medium">${data.price.toLocaleString()}</span>
          </p>
          <p className="text-xs text-gold-400/70">
            Volume: {(data.volume / 1000).toFixed(1)}K
          </p>
          <p className={`text-xs ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.change >= 0 ? '+' : ''}{data.change}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Market Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-xs text-gold-400/70">{symbol}</p>
            <p className="text-xl font-bold text-white">${stats.currentPrice.toLocaleString()}</p>
          </div>
          <div className={`px-2 py-1 rounded text-sm ${stats.priceChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {stats.priceChange >= 0 ? '+' : ''}{stats.priceChange.toFixed(2)}%
          </div>
        </div>
        
        <div className="flex space-x-4 text-sm">
          <div>
            <p className="text-xs text-gold-400/70">24h High</p>
            <p className="text-green-400 font-medium">${stats.high24h.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gold-400/70">24h Low</p>
            <p className="text-red-400 font-medium">${stats.low24h.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gold-400/70">Volume</p>
            <p className="text-white font-medium">${(stats.volume24h / 1e6).toFixed(2)}M</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
          <XAxis 
            dataKey="time" 
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: 10 }}
            tickLine={{ stroke: '#FFD700' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="price"
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: 10 }}
            tickLine={{ stroke: '#FFD700' }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            stroke="#FFD700" 
            tick={{ fill: '#FFD700', fontSize: 10 }}
            tickLine={{ stroke: '#FFD700' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            hide={true}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#FFD700"
            fill="#FFD700"
            fillOpacity={0.1}
            name="Price"
            dot={false}
          />
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#FFD700"
            opacity={0.3}
            name="Volume"
            barSize={20}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketOverviewChart;