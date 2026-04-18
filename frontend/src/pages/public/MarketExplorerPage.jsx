import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineTrendingUp, HiOutlineShieldCheck, HiOutlineGlobe } from 'react-icons/hi';
import Container from '../../components/layout/Container';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ScreenerWidget from '../../components/trading/ScreenerWidget';
import marketBg from '../../assets/images/MarketEx.jpeg';

const MarketExplorerPage = () => {
    const { category } = useParams();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [category]);

    const marketTitle = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'Markets';
    const marketSubtitle = 'Institutional Trading';
    const marketDescription = `Experience institutional-grade trading in the global ${category || ''} markets with deep liquidity and ultra-low latency execution.`;

    // Animation Variants
    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const whyFeatures = [
        "Deep institutional liquidity",
        "Direct market access pricing",
        "Highly responsive execution"
    ];

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
                            <span className="text-gold text-xs font-semibold tracking-widest uppercase">{marketSubtitle}</span>
                        </motion.div>

                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-display font-bold mb-6">
                            Explore <span className="gradient-text italic">{marketTitle}</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-12">
                            {marketDescription}
                        </motion.p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Liquidity', value: 'Institution' },
                                { label: 'Execution', value: 'Direct' },
                                { label: 'Latency', value: '<1ms' },
                            ].map((stat, idx) => (
                                <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 backdrop-blur-md bg-white/5">
                                    <h3 className="text-3xl font-display font-bold text-white mb-1">{stat.value}</h3>
                                    <p className="text-xs text-white/50 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </Container>
            </section>

            {/* Real-time Data Screener Section */}
            <section className="py-12 relative z-10 w-full">
                <Container className="max-w-[95%]">
                    <div className="glass-card rounded-[2rem] border border-white/10 overflow-hidden bg-navy-light/40 backdrop-blur-md min-h-[600px]">
                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <h2 className="text-2xl font-display font-bold">Live {marketTitle} Market Data</h2>
                            <p className="text-white/50 text-sm">Real-time institutional pricing & performance</p>
                        </div>
                        <div className="p-2 w-full">
                            <ScreenerWidget market={category || 'crypto'} height="600" />
                        </div>
                    </div>
                </Container>
            </section>

            {/* Why Trade Features */}
            <section className="py-20 bg-navy-light/30 border-t border-white/5 relative z-10">
                <Container>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-display font-bold mb-4">Why Trade {marketTitle} With Us?</h2>
                            <p className="text-white/50 max-w-2xl mx-auto">We provide the institutional grade environment you need to capitalize on market opportunities.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {whyFeatures.map((feature, idx) => (
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
                    <h2 className="text-4xl font-display font-bold mb-6">Ready to trade {marketTitle.toLowerCase()}?</h2>
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
