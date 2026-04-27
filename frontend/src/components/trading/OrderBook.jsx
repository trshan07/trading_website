import React, { useEffect, useMemo, useState } from 'react';
import { FaLayerGroup, FaFire, FaBolt, FaArrowRight } from 'react-icons/fa';
import infraService from '../../services/infraService';

const withCumulative = (levels = []) => {
  let running = 0;
  return levels.map((level) => {
    running += Number(level.size || 0);
    return {
      ...level,
      total: Number(level.price || 0) * Number(level.size || 0),
      cumulative: running,
    };
  });
};

const OrderBook = ({ symbol = 'BTCUSDT' }) => {
  const [asks, setAsks] = useState([]);
  const [bids, setBids] = useState([]);
  const [synthetic, setSynthetic] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOrderBook = async () => {
      try {
        const response = await infraService.getOrderBook(symbol, 15);
        if (!active || !response.success) {
          return;
        }

        const normalizedAsks = (response.data?.asks || [])
          .map((item) => ({
            price: Number(item.price || 0),
            size: Number(item.size || 0),
          }))
          .sort((left, right) => left.price - right.price);

        const normalizedBids = (response.data?.bids || [])
          .map((item) => ({
            price: Number(item.price || 0),
            size: Number(item.size || 0),
          }))
          .sort((left, right) => right.price - left.price);

        setAsks(withCumulative(normalizedAsks));
        setBids(withCumulative(normalizedBids));

        setSynthetic(Boolean(response.data?.synthetic));
      } catch (error) {
        if (active) {
          setAsks([]);
          setBids([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadOrderBook();
    const intervalId = setInterval(loadOrderBook, 2500);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [symbol]);

  const bestAsk = asks[0]?.price || 0;
  const bestBid = bids[0]?.price || 0;
  const spreadValue = Math.max(0, bestAsk - bestBid);
  const spreadPercentage = bestAsk > 0 ? (spreadValue / bestAsk) * 100 : 0;
  const maxCumulative = useMemo(
    () => Math.max(...asks.map((item) => item.cumulative), ...bids.map((item) => item.cumulative), 1),
    [asks, bids]
  );

  const bidTotalSize = useMemo(() => bids.reduce((sum, item) => sum + item.size, 0), [bids]);
  const askTotalSize = useMemo(() => asks.reduce((sum, item) => sum + item.size, 0), [asks]);
  const bidSentiment = bidTotalSize + askTotalSize > 0
    ? (bidTotalSize / (bidTotalSize + askTotalSize)) * 100
    : 50;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-1 shadow-xl shadow-slate-200/50 dark:shadow-black/20 group overflow-hidden transition-colors h-full">
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-900 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-slate-900/10">
              <FaLayerGroup className="text-gold-500" size={14} />
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-[0.3em] italic leading-none transition-colors">
                Depth Terminal
              </h3>
              <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 flex items-center transition-colors">
                <span className={`w-1 h-1 rounded-full mr-2 animate-pulse ${synthetic ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                {synthetic ? 'Quote-Derived Depth' : 'Live Market Depth'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 items-center space-x-3 transition-colors">
            <div className="flex flex-col items-end">
              <span className="text-[6px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Spread</span>
              <span className="text-[9px] font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">
                {spreadValue.toFixed(6)}
              </span>
            </div>
            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex flex-col items-end">
              <span className="text-[6px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 transition-colors">Impact</span>
              <span className="text-[9px] font-black text-emerald-500 italic tracking-tighter transition-colors">
                {spreadPercentage.toFixed(4)}%
              </span>
            </div>
          </div>
        </div>

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

        <div className="group/node relative my-8">
          <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-2xl shadow-slate-900/20 relative overflow-hidden transition-all duration-500 hover:scale-[1.01]">
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
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1.5">Best Ask</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-white italic tracking-tighter">
                      {bestAsk ? bestAsk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : '--'}
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 tracking-tighter uppercase italic">{symbol}</span>
                  </div>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-tight italic">
                  Feed
                </p>
                <span className={`text-xs font-black italic ${synthetic ? 'text-amber-400' : 'text-emerald-500'}`}>
                  {loading ? 'SYNCING' : synthetic ? 'SYNTHETIC' : 'LIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="flex justify-between items-center text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-[0.1em] border-b border-slate-50 dark:border-slate-800 pb-3 transition-colors">
              <span className="w-1/3 text-left">Size</span>
              <span className="w-1/3 text-center">Bid Price</span>
              <span className="w-1/3 text-right">Total</span>
            </div>

            <div className="space-y-0.5">
              {bids.slice(0, 10).map((bid, index) => (
                <div key={`bid-${index}`} className="relative group overflow-hidden rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                  <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-emerald-500/10 to-transparent transition-all duration-500" style={{ width: `${(bid.cumulative / maxCumulative) * 100}%` }} />
                  <div className="relative flex justify-between items-center text-[10px] py-1.5 px-2">
                    <span className="w-1/3 text-left text-slate-900 dark:text-white font-black transition-colors">{bid.size.toFixed(4)}</span>
                    <span className="w-1/3 text-center text-emerald-500 font-black italic tracking-tighter">
                      {bid.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </span>
                    <span className="w-1/3 text-right text-slate-400 dark:text-slate-500 font-bold tabular-nums italic transition-colors">
                      {bid.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[8px] uppercase font-black text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-[0.1em] border-b border-slate-50 dark:border-slate-800 pb-3 transition-colors">
              <span className="w-1/3 text-left">Ask Price</span>
              <span className="w-1/3 text-center">Size</span>
              <span className="w-1/3 text-right">Total</span>
            </div>

            <div className="space-y-0.5">
              {asks.slice(0, 10).reverse().map((ask, index) => (
                <div key={`ask-${index}`} className="relative group overflow-hidden rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                  <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-rose-500/10 to-transparent transition-all duration-500" style={{ width: `${(ask.cumulative / maxCumulative) * 100}%` }} />
                  <div className="relative flex justify-between items-center text-[10px] py-1.5 px-2">
                    <span className="w-1/3 text-left text-rose-500 font-black italic tracking-tighter">
                      {ask.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </span>
                    <span className="w-1/3 text-center text-slate-900 dark:text-white font-black transition-colors">{ask.size.toFixed(4)}</span>
                    <span className="w-1/3 text-right text-slate-400 dark:text-slate-500 font-bold tabular-nums italic transition-colors">
                      {ask.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
