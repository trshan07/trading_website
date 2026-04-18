import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import MarketQuotesWidget from '../../components/trading/MarketQuotesWidget';

const MarketsPage = () => {
    const categories = ['Forex', 'Commodities', 'Indices', 'Shares', 'Crypto'];
    const [activeTab, setActiveTab] = useState('Forex');

    const descriptions = {
        Forex: 'Trade major, minor and exotic currency pairs with tight spreads and high leverage.',
        Commodities: 'Speculate on the price movements of gold, silver, oil, and natural gas.',
        Indices: 'Access the world\'s leading indices and trade the performance of global economies.',
        Shares: 'Invest in global blue-chip companies across US, UK, EU and Asian markets.',
        Crypto: 'Trade the most popular cryptocurrencies 24/7 with secure and fast execution.',
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

                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-16">
                        {categories.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 md:px-10 py-3 md:py-4 rounded-full text-xs md:text-sm font-display font-bold transition-all duration-300 ${activeTab === tab
                                    ? 'bg-gold text-navy shadow-[0_0_20px_rgba(212,175,55,0.3)] md:shadow-[0_0_30px_rgba(212,175,55,0.4)]'
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
                            className="text-center max-w-4xl mx-auto"
                        >
                            <h3 className="text-3xl md:text-4xl font-display font-bold mb-4 md:mb-6 gradient-text">{activeTab}</h3>
                            <p className="text-white/60 text-base md:text-lg leading-relaxed mb-6 md:mb-8 max-w-2xl mx-auto">
                                {descriptions[activeTab]}
                            </p>
                            
                            <div className="border border-white/10 rounded-[2rem] bg-navy-light/40 backdrop-blur-sm overflow-hidden min-h-[500px]">
                                <MarketQuotesWidget category={activeTab} height="500" />
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
