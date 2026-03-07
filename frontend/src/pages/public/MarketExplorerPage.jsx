import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiOutlineTrendingUp, HiOutlineShieldCheck, HiOutlineGlobe } from 'react-icons/hi';
import Container from '../../components/layout/Container';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import marketBg from '../../assets/images/MarketEx.jpeg';

// Market Data Configuration
const marketsContent = {
    forex: {
        title: 'Forex Trading',
        subtitle: 'The Global Currency Market',
        description: 'Trade the world\'s most liquid market with 24/5 access to currency fluctuations. Benefit from tight spreads and deep liquidity on major, minor, and exotic pairs.',
        heroBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-navy to-navy',
        stats: [
            { label: 'Daily Volume', value: '$6.6T+' },
            { label: 'Market Hours', value: '24/5' },
            { label: 'Leverage Up To', value: '1:500' },
        ],
        instruments: [
            { symbol: 'EUR/USD', name: 'Euro / US Dollar', spread: '0.0 pips' },
            { symbol: 'GBP/USD', name: 'British Pound / US Dollar', spread: '0.2 pips' },
            { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', spread: '0.1 pips' },
            { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', spread: '0.2 pips' },
            { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', spread: '0.3 pips' },
        ],
        features: [
            'Deep institutional liquidity',
            'No dealing desk execution',
            'Micro lot trading available'
        ]
    },
    commodities: {
        title: 'Commodities',
        subtitle: 'Hard Assets & Energies',
        description: 'Diversify your portfolio by trading hard assets like energy and precious metals. Hedge against inflation and speculate on global supply and demand.',
        heroBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/40 via-navy to-navy',
        stats: [
            { label: 'Asset Types', value: 'Metals & Energy' },
            { label: 'Execution', value: 'Instant' },
            { label: 'Spreads From', value: '0.5 pts' },
        ],
        instruments: [
            { symbol: 'XAU/USD', name: 'Gold', spread: '1.2 pts' },
            { symbol: 'XAG/USD', name: 'Silver', spread: '2.5 pts' },
            { symbol: 'WTI', name: 'US Crude Oil', spread: '3.0 pts' },
            { symbol: 'BRENT', name: 'Brent Crude', spread: '3.0 pts' },
            { symbol: 'NATGAS', name: 'Natural Gas', spread: '4.0 pts' },
        ],
        features: [
            'Hedge against inflation',
            'No physical delivery required',
            'Highly responsive to global events'
        ]
    },
    indices: {
        title: 'Indices',
        subtitle: 'Global Stock Markets',
        description: 'Speculate on the performance of entire economies or sectors in one trade. Trade the world\'s major stock indices with competitive pricing.',
        heroBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-navy to-navy',
        stats: [
            { label: 'Global Markets', value: '15+' },
            { label: 'Commissions', value: '$0' },
            { label: 'Leverage', value: '1:200' },
        ],
        instruments: [
            { symbol: 'US30', name: 'Wall Street 30', spread: '1.5 pts' },
            { symbol: 'NAS100', name: 'US Tech 100', spread: '1.0 pts' },
            { symbol: 'GER40', name: 'Germany 40', spread: '1.2 pts' },
            { symbol: 'UK100', name: 'UK 100', spread: '1.5 pts' },
            { symbol: 'SPX500', name: 'US 500', spread: '0.5 pts' },
        ],
        features: [
            'Broad market exposure',
            'Dividend adjustments applied',
            'Extended trading hours'
        ]
    },
    shares: {
        title: 'Shares CFDs',
        subtitle: 'Global Equities',
        description: 'Buy and sell CFDs on the world\'s most influential public companies. Take advantage of price movements in both rising and falling markets.',
        heroBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-navy to-navy',
        stats: [
            { label: 'Available Stocks', value: '500+' },
            { label: 'Markets', value: 'US, EU, UK' },
            { label: 'Execution', value: 'DMA' },
        ],
        instruments: [
            { symbol: 'AAPL', name: 'Apple Inc.', spread: 'Market' },
            { symbol: 'TSLA', name: 'Tesla Inc.', spread: 'Market' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', spread: 'Market' },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', spread: 'Market' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', spread: 'Market' },
        ],
        features: [
            'Earn dividends on long positions',
            'Fractional shares available',
            'Direct Market Access (DMA) pricing'
        ]
    },
    crypto: {
        title: 'Cryptocurrencies',
        subtitle: 'Digital Assets',
        description: 'Trade the future of finance with 24/7 access to high-volatility digital assets. No wallets required, just pure price speculation.',
        heroBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-navy to-navy',
        stats: [
            { label: 'Market Hours', value: '24/7' },
            { label: 'Holdings', value: 'No Wallets' },
            { label: 'Volatility', value: 'High' },
        ],
        instruments: [
            { symbol: 'BTC/USD', name: 'Bitcoin', spread: 'Dynamic' },
            { symbol: 'ETH/USD', name: 'Ethereum', spread: 'Dynamic' },
            { symbol: 'SOL/USD', name: 'Solana', spread: 'Dynamic' },
            { symbol: 'XRP/USD', name: 'Ripple', spread: 'Dynamic' },
            { symbol: 'LTC/USD', name: 'Litecoin', spread: 'Dynamic' },
        ],
        features: [
            'Trade on margins over the weekend',
            'Deep liquidity pools',
            'No risk of wallet hacks'
        ]
    }
};

const MarketExplorerPage = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const [marketData, setMarketData] = useState(null);

    useEffect(() => {
        // Validate category
        if (category && marketsContent[category.toLowerCase()]) {
            setMarketData(marketsContent[category.toLowerCase()]);
        } else {
            // Redirect to a default or 404 if invalid
            navigate('/markets');
        }
        window.scrollTo(0, 0);
    }, [category, navigate]);

    if (!marketData) return null; // or a loading spinner

    // Animation Variants
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <main className="bg-[#000F29] min-h-screen relative font-sans text-white overflow-hidden">
            <Navbar />

            {/* Global Page Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img 
                    src={marketBg} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/90 via-[#000F29]/70 to-[#000F29]/95" />
                <div className="absolute inset-0 bg-grid-slim opacity-10" />
            </div>

            {/* Dynamic Hero Section */}
            <section className="pt-40 pb-24 md:pt-48 md:pb-32 relative z-10">

                <Container className="relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-white/10 mb-6">
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                            <span className="text-gold text-xs font-semibold tracking-widest uppercase">{marketData.subtitle}</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-display font-bold mb-6">
                            Explore <span className="gradient-text italic">{marketData.title}</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12">
                            {marketData.description}
                        </motion.p>

                        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {marketData.stats.map((stat, idx) => (
                                <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 backdrop-blur-md bg-white/5">
                                    <h3 className="text-3xl font-display font-bold text-white mb-1">{stat.value}</h3>
                                    <p className="text-xs text-white/50 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </Container>
            </section>

            {/* Top Instruments Table */}
            <section className="py-20 relative">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Popular Instruments</h2>
                                <p className="text-white/50">Most traded assets in this category.</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-gold text-sm font-bold bg-gold/10 px-4 py-2 rounded-lg">
                                <HiOutlineTrendingUp className="w-5 h-5" /> Live Spreads
                            </div>
                        </div>

                        <div className="glass-card rounded-[2rem] border border-white/10 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
                                            <th className="p-6 font-medium">Instrument</th>
                                            <th className="p-6 font-medium">Name</th>
                                            <th className="p-6 font-medium text-right">Target Spread</th>
                                            <th className="p-6 font-medium text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {marketData.instruments.map((instrument, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-navy border border-white/10 flex items-center justify-center text-gold font-bold text-xs shadow-inner">
                                                            {instrument.symbol.substring(0, 3)}
                                                        </div>
                                                        <span className="font-display font-bold text-lg">{instrument.symbol}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-white/70">{instrument.name}</td>
                                                <td className="p-6 text-right font-mono text-gold font-bold">{instrument.spread}</td>
                                                <td className="p-6 text-center">
                                                    <button className="text-sm font-bold text-white/50 hover:text-gold transition-colors flex items-center justify-center w-full gap-1">
                                                        Trade <HiArrowRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Why Trade Features */}
            <section className="py-20 bg-navy-light/30 border-t border-white/5">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-display font-bold mb-4">Why Trade {marketData.title} With Us?</h2>
                            <p className="text-white/50 max-w-2xl mx-auto">We provide the institutional grade environment you need to capitalize on market opportunities.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {marketData.features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-8 rounded-2xl border border-white/5 hover:border-gold/30 transition-colors text-center group"
                                >
                                    <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                                        {idx === 0 ? <HiOutlineShieldCheck className="w-6 h-6" /> :
                                            idx === 1 ? <HiOutlineTrendingUp className="w-6 h-6" /> :
                                                <HiOutlineGlobe className="w-6 h-6" />}
                                    </div>
                                    <p className="text-white/80 font-medium">{feature}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-t from-gold/5 border-t border-white/5" />
                <Container className="relative z-10">
                    <h2 className="text-4xl font-display font-bold mb-6">Ready to trade {marketData.title.toLowerCase()}?</h2>
                    <p className="text-white/60 mb-10">Open your account in under 3 minutes and access global markets.</p>
                    <a href="/register" className="inline-block relative group">
                        <div className="absolute -inset-1 bg-gold rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500" />
                        <button className="relative btn-gold py-4 px-10 text-lg flex items-center justify-center gap-2 m-0 border border-gold/50 shadow-2xl">
                            Start Trading Now
                        </button>
                    </a>
                </Container>
            </section>

            <Footer />
        </main>
    );
};

export default MarketExplorerPage;
