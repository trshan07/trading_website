// frontend/src/components/charts/MarketOverviewChart.jsx
import React, { useState, useEffect } from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

const MarketOverviewChart = ({ symbol = 'BTC/USD', data = [], height = 200 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
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
        <div className={`border rounded-xl p-4 shadow-2xl backdrop-blur-md transition-colors duration-300 ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
          <p className="text-gold-500 text-[10px] font-black uppercase tracking-widest mb-3 italic">{label}</p>
          <div className="space-y-1.5">
             <p className={`text-sm font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>
               Price: <span className="text-gold-500">${data.price.toLocaleString()}</span>
             </p>
             <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
               Volume: <span className="text-slate-700 dark:text-slate-300">{(data.volume / 1000).toFixed(1)}K</span>
             </p>
             <p className={`text-[10px] font-black uppercase tracking-tighter ${data.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
               {data.change >= 0 ? '▲' : '▼'} {Math.abs(data.change)}%
             </p>
          </div>
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

  return (
    <div className="w-full transition-colors duration-300">
      {/* Market Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-900 dark:bg-gold-500 rounded-xl text-gold-500 dark:text-slate-900 shadow-lg transition-colors">
             <span className="text-[10px] font-black uppercase tracking-widest">{symbol.split('/')[0]}</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">{symbol}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">${stats.currentPrice.toLocaleString()}</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black italic uppercase tracking-widest transition-all ${stats.priceChange >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {stats.priceChange >= 0 ? '+' : ''}{stats.priceChange.toFixed(2)}%
          </div>
        </div>
        
        <div className="flex space-x-6">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">24h High</p>
            <p className="text-xs font-black text-emerald-500 italic">${stats.high24h.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">24h Low</p>
            <p className="text-xs font-black text-rose-500 italic">${stats.low24h.toLocaleString()}</p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Vol</p>
            <p className={`text-xs font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>${(stats.volume24h / 1e6).toFixed(2)}M</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
          <XAxis 
            dataKey="time" 
            stroke={themeColors.axis} 
            tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
            tickLine={{ stroke: themeColors.axis }}
            interval="preserveStartEnd"
            axisLine={false}
          />
          <YAxis 
            yAxisId="price"
            stroke={themeColors.axis} 
            tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
            tickLine={{ stroke: themeColors.axis }}
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            axisLine={false}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            stroke={themeColors.axis} 
            tick={{ fill: themeColors.text, fontSize: 9, fontWeight: 900 }}
            tickLine={{ stroke: themeColors.axis }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            hide={true}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: themeColors.gold, strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke={themeColors.gold}
            fill={themeColors.gold}
            fillOpacity={isDark ? 0.05 : 0.1}
            name="Price"
            dot={false}
            strokeWidth={3}
          />
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill={isDark ? '#334155' : '#cbd5e1'}
            opacity={0.3}
            name="Volume"
            barSize={12}
            radius={[4, 4, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketOverviewChart;