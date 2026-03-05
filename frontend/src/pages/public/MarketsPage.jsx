import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Card from '../../components/ui/Card';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const MarketsPage = () => {
    const [activeTab, setActiveTab] = useState('Forex');

    const marketData = {
        Forex: {
            description: 'Trade major, minor and exotic currency pairs with tight spreads and high leverage.',
            instruments: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'EUR/GBP', 'NZD/USD'],
        },
        Commodities: {
            description: 'Speculate on the price movements of gold, silver, oil, and natural gas.',
            instruments: ['Gold (XAU/USD)', 'Silver (XAG/USD)', 'WTI Oil', 'Brent Oil', 'Natural Gas'],
        },
        Indices: {
            description: 'Access the world\'s leading indices and trade the performance of global economies.',
            instruments: ['S&P 500', 'Nasdaq 100', 'Dow Jones 30', 'DAX 40', 'FTSE 100', 'Nikkei 225'],
        },
        Shares: {
            description: 'Invest in global blue-chip companies across US, UK, EU and Asian markets.',
            instruments: ['Apple', 'Microsoft', 'Tesla', 'Amazon', 'Google', 'Nvidia', 'Meta'],
        },
        Crypto: {
            description: 'Trade the most popular cryptocurrencies 24/7 with secure and fast execution.',
            instruments: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'Cardano (ADA)', 'Ripple (XRP)'],
        },
    };

    return (
        <main className="bg-navy min-h-screen">
            <Navbar />
            <div className="pt-32 pb-24">
                <Container>
                    <SectionTitle
                        subtitle="Global Access"
                        title="Institutional Markets"
                    />

                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {Object.keys(marketData).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-10 py-4 rounded-full font-display font-bold transition-all duration-300 ${activeTab === tab
                                    ? 'bg-gold text-navy shadow-[0_0_30px_rgba(212,175,55,0.4)]'
                                    : 'bg-navy-light/50 text-white/50 hover:text-white border border-white/10'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
                        >
                            <div className="lg:col-span-1">
                                <div className="sticky top-32">
                                    <h3 className="text-4xl font-display font-bold mb-6 gradient-text">{activeTab}</h3>
                                    <p className="text-white/60 text-lg leading-relaxed mb-8">
                                        {marketData[activeTab].description}
                                    </p>
                                </div>
                            </div>

                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {marketData[activeTab].instruments.map((symbol) => (
                                    <Card key={symbol} className="hover:border-gold/30 group">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Instrument</div>
                                                <div className="text-xl font-bold font-display group-hover:text-gold transition-colors">{symbol}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-green-400 font-bold">Live</div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </Container>
            </div>
            <Footer />
        </main>
    );
};

export default MarketsPage;
