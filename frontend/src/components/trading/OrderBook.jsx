// frontend/src/components/trading/OrderBook.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FaLayerGroup, FaDotCircle, FaFire, FaBolt, FaArrowRight } from 'react-icons/fa';

const OrderBook = ({ symbol = 'BTC/USD' }) => {
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  const [spread, setSpread] = useState({ value: 0, percentage: 0 });

  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = getBasePrice(symbol);
      const newAsks = [];
      const newBids = [];
      
      for (let i = 0; i < 15; i++) {
        const price = basePrice * (1 + (i + 1) * 0.0004);
        const size = Math.random() * 2.5 + 0.1;
        newAsks.push({
          price,
          size,
          total: price * size,
          cumulative: 0
        });
      }
      
      for (let i = 0; i < 15; i++) {
        const price = basePrice * (1 - (i + 1) * 0.0004);
        const size = Math.random() * 2.5 + 0.1;
        newBids.push({
          price,
          size,
          total: price * size,
          cumulative: 0
        });
      }
      
      newAsks.sort((a, b) => a.price - b.price);
      newBids.sort((a, b) => b.price - a.price);
      
      let askSum = 0;
      newAsks.forEach(ask => { askSum += ask.size; ask.cumulative = askSum; });
      let bidSum = 0;
      newBids.forEach(bid => { bidSum += bid.size; bid.cumulative = bidSum; });

      const bestAsk = newAsks[0]?.price || 0;
      const bestBid = newBids[0]?.price || 0;
      setAsks(newAsks);
      setBids(newBids);
      setSpread({ value: bestAsk - bestBid, percentage: ((bestAsk - bestBid) / bestAsk) * 100 });
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 2000);
    return () => clearInterval(interval);
  }, [symbol]);

  const getBasePrice = (s) => ({ 'BTC/USD': 43250, 'ETH/USD': 2820, 'EUR/USD': 1.0875 }[s] || 100);
  
  const maxCumulative = useMemo(() => {
    return Math.max(...asks.map(a => a.cumulative), ...bids.map(b => b.cumulative)) || 1;
  }, [asks, bids]);

  const bidTotalSize = useMemo(() => bids.reduce((acc, curr) => acc + curr.size, 0), [bids]);
  const askTotalSize = useMemo(() => asks.reduce((acc, curr) => acc + curr.size, 0), [asks]);
  const bidSentiment = (bidTotalSize / (bidTotalSize + askTotalSize)) * 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-1 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 group overflow-hidden transition-colors">
      <div className="p-8">
        {/* Console Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-slate-900/10">
              <FaLayerGroup className="text-gold-500" size={14} />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-[0.3em] italic leading-none transition-colors">Depth Terminal</h3>
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 flex items-center transition-colors">
                <span className="w-1 h-1 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Orderbook.v2 / Neural Sync
              </p>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center space-x-4 transition-colors">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Live Spread</span>
              <span className="text-[11px] font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">${spread.value.toFixed(2)}</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 transition-colors">Impact</span>
              <span className="text-[11px] font-black text-emerald-500 italic tracking-tighter transition-colors">{spread.percentage.toFixed(4)}%</span>
            </div>
          </div>
        </div>

        {/* Market Gravity / Sentiment Bar */}
        <div className="mb-10 px-2">
           <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest mb-2.5 text-slate-400 dark:text-slate-500 transition-colors">
              <div className="flex items-center space-x-2">
                 <FaBolt className="text-emerald-500" />
                 <span>Buy Force: {bidSentiment.toFixed(1)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                 <FaFire className="text-rose-500" />
                 <span>Sell Load: {(100 - bidSentiment).toFixed(1)}%</span>
              </div>
           </div>
           <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner transition-colors">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_100px_#10b981]" 
                style={{ width: `${bidSentiment}%` }}
              ></div>
              <div 
                className="h-full bg-rose-500 transition-all duration-1000 ease-out shadow-[0_0_100px_#f43f5e]" 
                style={{ width: `${100 - bidSentiment}%` }}
              ></div>
           </div>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-3 text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 mb-6 px-4 tracking-[0.2em] border-b border-slate-50 dark:border-slate-800 pb-4 transition-colors">
          <span>Execution Price</span>
          <span className="text-right">Portal Size</span>
          <span className="text-right">Volume Map</span>
        </div>

        {/* Asks Section */}
        <div className="space-y-0.5 mb-6">
          {asks.slice(0, 8).reverse().map((ask, i) => (
            <div key={i} className="relative group overflow-hidden rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
              <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-rose-500/10 to-transparent transition-all duration-500" style={{ width: `${(ask.cumulative / maxCumulative) * 100}%` }} />
              <div className="relative grid grid-cols-3 text-[11px] py-2.5 px-4 items-center">
                <span className="text-rose-500 font-black italic tracking-tighter">${ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-right text-slate-900 dark:text-white font-black transition-colors">{ask.size.toFixed(4)}</span>
                <span className="text-right text-slate-400 dark:text-slate-500 font-bold tabular-nums italic transition-colors">${(ask.total / 1000).toFixed(1)}k</span>
              </div>
            </div>
          ))}
        </div>

        {/* Neural Sync Index Price (Pulse Node) */}
        <div className="group/node relative px-2 my-8">
           <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-2xl shadow-slate-900/20 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 blur-3xl rounded-full -translate-y-16 translate-x-16 group-hover/node:bg-gold-400/10 transition-all"></div>
              <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center space-x-5">
                    <div className="relative">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover/node:border-gold-500/30 transition-all">
                          <FaArrowRight className="text-gold-500 group-hover/node:rotate-90 transition-transform duration-500" size={14} />
                       </div>
                       <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1.5">Index Sync</p>
                       <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-black text-white italic tracking-tighter">${(asks[0]?.price || 0).toLocaleString()}</span>
                          <span className="text-[10px] font-black text-emerald-400 tracking-tighter uppercase italic">USD</span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right hidden sm:block">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-tight italic">Velocity</p>
                    <span className="text-xs font-black text-emerald-500 italic">+2.45%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bids Section */}
        <div className="space-y-0.5">
          {bids.slice(0, 8).map((bid, i) => (
            <div key={i} className="relative group overflow-hidden rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
              <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-emerald-500/10 to-transparent transition-all duration-500" style={{ width: `${(bid.cumulative / maxCumulative) * 100}%` }} />
              <div className="relative grid grid-cols-3 text-[11px] py-2.5 px-4 items-center">
                <span className="text-emerald-500 font-black italic tracking-tighter">${bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-right text-slate-900 dark:text-white font-black transition-colors">{bid.size.toFixed(4)}</span>
                <span className="text-right text-slate-400 dark:text-slate-500 font-bold tabular-nums italic transition-colors">${(bid.total / 1000).toFixed(1)}k</span>
              </div>
            </div>
          ))}
        </div>

        {/* View Selection Footer */}
        <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 transition-colors flex justify-center space-x-4">
           {['Global Book', 'Limit Data', 'Price Map'].map(label => (
             <button key={label} className="px-5 py-2.5 text-[7px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-900 dark:hover:bg-gold-500 hover:text-white dark:hover:text-slate-900 hover:border-slate-900 dark:hover:border-gold-500 transition-all">
               {label}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;