import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TickerSection = () => {
    const INITIAL_PRICES = [
        { name: 'EURUSD', symbol: 'FX:EURUSD', scanner: 'forex', price: '0.0000', change: '+0.00%' },
        { name: 'GBPUSD', symbol: 'FX:GBPUSD', scanner: 'forex', price: '0.0000', change: '+0.00%' },
        { name: 'USDJPY', symbol: 'FX:USDJPY', scanner: 'forex', price: '0.00', change: '+0.00%' },
        { name: 'GOLD', symbol: 'OANDA:XAUUSD', scanner: 'cfd', price: '0.00', change: '+0.00%' },
        { name: 'WTI', symbol: 'OANDA:WTICOUSD', scanner: 'cfd', price: '0.00', change: '+0.00%' },
        { name: 'BTCUSD', symbol: 'BINANCE:BTCUSDT', scanner: 'crypto', price: '0.00', change: '+0.00%' },
        { name: 'ETHUSD', symbol: 'BINANCE:ETHUSDT', scanner: 'crypto', price: '0.00', change: '+0.00%' },
        { name: 'SPX500', symbol: 'OANDA:SPX500USD', scanner: 'cfd', price: '0.00', change: '+0.00%' },
    ];

    const [prices, setPrices] = useState(INITIAL_PRICES);

    useEffect(() => {
        const fetchTickers = async () => {
            const scannerGroups = { forex: [], cfd: [], crypto: [] };
            INITIAL_PRICES.forEach(item => scannerGroups[item.scanner].push(item.symbol));

            try {
                const fetchPromises = Object.entries(scannerGroups).map(([scanner, tickers]) => {
                    if (tickers.length === 0) return null;
                    return fetch(`https://scanner.tradingview.com/${scanner}/scan`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: JSON.stringify({ symbols: { tickers }, columns: ['close', 'change'] })
                    }).then(res => res.json()).catch(() => null);
                });

                const results = await Promise.all(fetchPromises);
                const allData = results.filter(Boolean).flatMap(res => res.data || []);

                if (allData.length > 0) {
                    setPrices(prev => prev.map(item => {
                        const hit = allData.find(d => d.s === item.symbol);
                        if (hit) {
                            const [p, c] = hit.d;
                            const fPrice = p > 1000 ? p.toFixed(2) : (p < 1 ? p.toFixed(4) : p.toFixed(3));
                            const fChange = c >= 0 ? `+${c.toFixed(2)}%` : `${c.toFixed(2)}%`;
                            return { ...item, price: fPrice, change: fChange };
                        }
                        return item;
                    }));
                }
            } catch (err) {
                if (typeof navigator !== 'undefined' && !navigator.onLine) return;
                console.error("Ticker fetch error", err);
            }
        };

        fetchTickers();
        const interval = setInterval(fetchTickers, 10000);
        return () => clearInterval(interval);
    }, []);

    // Double the array for seamless looping
    const duplicatedPrices = [...prices, ...prices];

    return (
        <div className="bg-navy/40 backdrop-blur-md border-y border-white/5 py-4 overflow-hidden select-none">
            <motion.div
                animate={{ x: [0, -100 * prices.length] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: 30,
                        ease: 'linear',
                    },
                }}
                className="flex space-x-12 whitespace-nowrap"
            >
                {duplicatedPrices.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{item.name}</span>
                        <span className="text-white font-display font-bold">{item.price}</span>
                        <span className={`text-xs font-bold ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {item.change}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default TickerSection;
