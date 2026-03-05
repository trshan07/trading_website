import React from 'react';
import { motion } from 'framer-motion';

const TickerSection = () => {
    const prices = [
        { name: 'EURUSD', price: '1.0842', change: '+0.05%' },
        { name: 'GBPUSD', price: '1.2654', change: '-0.12%' },
        { name: 'USDJPY', price: '148.32', change: '+0.21%' },
        { name: 'GOLD', price: '2024.50', change: '+0.45%' },
        { name: 'WTI', price: '73.15', change: '-1.20%' },
        { name: 'BTCUSD', price: '43250', change: '+2.45%' },
        { name: 'ETHUSD', price: '2315', change: '+1.80%' },
        { name: 'SPX500', price: '4958', change: '+0.32%' },
    ];

    // Double the array for seamless looping
    const duplicatedPrices = [...prices, ...prices];

    return (
        <div className="bg-navy-dark border-y border-white/5 py-4 overflow-hidden select-none">
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
