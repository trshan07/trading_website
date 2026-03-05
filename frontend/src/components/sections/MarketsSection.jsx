import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';

const MarketsSection = () => {
    const [activeTab, setActiveTab] = useState('Forex');

    const marketData = {
        Forex: [
            { name: 'EUR/USD', change: '+0.05%', price: '1.0842' },
            { name: 'GBP/USD', change: '-0.12%', price: '1.2654' },
            { name: 'USD/JPY', change: '+0.21%', price: '148.32' },
            { name: 'AUD/USD', change: '-0.08%', price: '0.6542' },
        ],
        Commodities: [
            { name: 'Gold', change: '+0.45%', price: '2024.50' },
            { name: 'Silver', change: '+0.12%', price: '22.84' },
            { name: 'Crude Oil', change: '-1.20%', price: '73.15' },
            { name: 'Natural Gas', change: '+2.10%', price: '2.45' },
        ],
        Indices: [
            { name: 'S&P 500', change: '+0.32%', price: '4958.60' },
            { name: 'Nasdaq 100', change: '+0.54%', price: '17642.10' },
            { name: 'DAX 40', change: '-0.15%', price: '16952.30' },
            { name: 'FTSE 100', change: '+0.08%', price: '7615.50' },
        ],
        Crypto: [
            { name: 'Bitcoin', change: '+2.45%', price: '43250.00' },
            { name: 'Ethereum', change: '+1.80%', price: '2315.40' },
            { name: 'Solana', change: '+5.12%', price: '98.45' },
            { name: 'Cardano', change: '-0.45%', price: '0.50' },
        ],
    };

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
