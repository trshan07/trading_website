import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';

const MarketsSection = () => {
    const [activeTab, setActiveTab] = useState('Forex');

    const [marketData, setMarketData] = useState({
        Forex: [
            { name: 'EUR/USD', symbol: 'FX:EURUSD', change: '+0.00%', price: '0.0000', scanner: 'forex' },
            { name: 'GBP/USD', symbol: 'FX:GBPUSD', change: '+0.00%', price: '0.0000', scanner: 'forex' },
            { name: 'USD/JPY', symbol: 'FX:USDJPY', change: '+0.00%', price: '0.00', scanner: 'forex' },
            { name: 'AUD/USD', symbol: 'FX:AUDUSD', change: '+0.00%', price: '0.0000', scanner: 'forex' },
        ],
        Commodities: [
            { name: 'Gold', symbol: 'OANDA:XAUUSD', change: '+0.00%', price: '0.00', scanner: 'cfd' },
            { name: 'Silver', symbol: 'OANDA:XAGUSD', change: '+0.00%', price: '0.00', scanner: 'cfd' },
            { name: 'Oil', symbol: 'OANDA:WTICOUSD', change: '+0.00%', price: '0.00', scanner: 'cfd' },
            { name: 'Nat Gas', symbol: 'OANDA:NATGASUSD', change: '+0.00%', price: '0.00', scanner: 'cfd' },
        ],
        Indices: [
            { name: 'S&P 500', symbol: 'OANDA:SPX500USD', change: '+0.00%', price: '0.00', scanner: 'cfd' },
            { name: 'Nasdaq', symbol: 'OANDA:NAS100USD', change: '+0.00%', price: '0.00', scanner: 'cfd' },
            { name: 'DAX', symbol: 'OANDA:DE30EUR', change: '+0.00%', price: '0.00', scanner: 'cfd' },
            { name: 'UK 100', symbol: 'OANDA:UK100GBP', change: '+0.00%', price: '0.00', scanner: 'cfd' },
        ],
        Crypto: [
            { name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', change: '+0.00%', price: '0.00', scanner: 'crypto' },
            { name: 'Ethereum', symbol: 'BINANCE:ETHUSDT', change: '+0.00%', price: '0.00', scanner: 'crypto' },
            { name: 'Solana', symbol: 'BINANCE:SOLUSDT', change: '+0.00%', price: '0.00', scanner: 'crypto' },
            { name: 'Cardano', symbol: 'BINANCE:ADAUSDT', change: '+0.00%', price: '0.00', scanner: 'crypto' },
        ],
    });

    useEffect(() => {
        const fetchTradingViewData = async () => {
            const currentTabAssets = marketData[activeTab];
            if (!currentTabAssets || currentTabAssets.length === 0) return;

            const scanner = currentTabAssets[0].scanner || 'crypto';
            const tickers = currentTabAssets.map(asset => asset.symbol);

            try {
                const response = await fetch(`https://scanner.tradingview.com/${scanner}/scan`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: JSON.stringify({
                        symbols: { tickers },
                        columns: ['close', 'change']
                    })
                });

                if (!response.ok) throw new Error('Network response was not ok');
                const result = await response.json();

                if (result.data && result.data.length > 0) {
                    setMarketData(prevData => {
                        const newData = { ...prevData };
                        const updatedAssets = newData[activeTab].map(asset => {
                            const apiItem = result.data.find(item => item.s === asset.symbol);
                            if (apiItem) {
                                const price = apiItem.d[0];
                                const change = apiItem.d[1];
                                
                                // Format logic
                                const formattedPrice = price > 1000 ? price.toFixed(2) : (price < 1 ? price.toFixed(4) : price.toFixed(3));
                                const formattedChange = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
                                
                                return { ...asset, price: formattedPrice, change: formattedChange };
                            }
                            return asset;
                        });
                        newData[activeTab] = updatedAssets;
                        return newData;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch live TradingView data:", error);
            }
        };

        // Fetch immediately and set interval
        fetchTradingViewData();
        const interval = setInterval(fetchTradingViewData, 5000);
        return () => clearInterval(interval);
    }, [activeTab]);

    return (
        <section className="py-24 relative overflow-hidden">
            <Container>
                <SectionTitle
                    subtitle="Trade Everything"
                    title="Global Markets at Your Fingertips"
                />

                {/* Tab Controls */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {Object.keys(marketData).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === tab
                                ? 'bg-gold text-navy shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                : 'bg-navy-light/50 text-white/50 hover:text-white border border-white/10'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Market Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence mode="sync">
                        {marketData[activeTab].map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Link to="/login">
                                    <Card className="!bg-navy/40 hover:!bg-navy-light/60 border-gold/10 hover:border-gold/30">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-lg font-bold">{item.name}</span>
                                            <span className={`text-sm font-bold ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                                {item.change}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-display font-bold text-white mb-2">
                                            {item.price}
                                        </div>
                                        <div className="h-12 w-full bg-gold/5 rounded-lg mt-4 overflow-hidden relative">
                                            <motion.div
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
                                            />
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </Container>
        </section>
    );
};

export default MarketsSection;
