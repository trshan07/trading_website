import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiOutlineDesktopComputer, HiOutlineLightBulb, HiOutlineChartBar, HiOutlineCheckCircle } from 'react-icons/hi';
import Container from '../../components/layout/Container';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import resourceBg from '../../assets/images/ResourceEx.jpeg';

// Resource Data Configuration
const resourceContent = {
    platforms: {
        title: 'Trading Platforms',
        subtitle: 'Institutional Grade Technology',
        description: 'Experience the full power of global markets with our suite of high-performance trading platforms. Built for speed, reliability, and precision.',
        heroBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-navy to-navy',
        features: [
            {
                title: 'Web Trader',
                description: 'No download required. Access the full power of the markets directly from your browser with one-click trading and real-time syncing.',
                icon: <HiOutlineDesktopComputer className="w-8 h-8" />
            },
            {
                title: 'Mobile App',
                description: 'Stay connected to the markets 24/7. Execute trades, manage positions, and monitor your portfolio on the go.',
                icon: <HiOutlineDesktopComputer className="w-8 h-8" />
            },
            {
                title: 'Desktop Pro',
                description: 'For professional traders who require advanced charting, high-speed execution, and deep customization.',
                icon: <HiOutlineDesktopComputer className="w-8 h-8" />
            }
        ],
        stats: [
            { label: 'Execution Speed', value: '< 30ms' },
            { label: 'Uptime', value: '99.99%' },
            { label: 'Connectivity', value: 'Direct DMA' },
        ]
    },
    tools: {
        title: 'Integrated Tools',
        subtitle: 'Smart Trading Edge',
        description: 'Supercharge your trading decisions with our integrated suite of analysis and research tools. Gain professional insights in real-time.',
        heroBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-900/20 via-navy to-navy',
        features: [
            {
                title: 'Trading Central',
                description: 'Get automated technical analysis, market sentiment data, and daily trade ideas delivered directly to your dashboard.',
                icon: <HiOutlineLightBulb className="w-8 h-8" />
            },
            {
                title: 'Trading View',
                description: 'Use the world’s most popular charting interface with hundreds of indicators and a massive social community.',
                icon: <HiOutlineChartBar className="w-8 h-8" />
            },
            {
                title: 'Volatility Analyzer',
                description: 'Understand market movements before they happen with our proprietary volatility and sentiment indicators.',
                icon: <HiOutlineChartBar className="w-8 h-8" />
            }
        ],
        stats: [
            { label: 'Analysis Tools', value: '100+' },
            { label: 'Daily Ideas', value: '50+' },
            { label: 'Accuracy', value: 'Verified' },
        ]
    },
    analysis: {
        title: 'Analysis & News',
        subtitle: 'Market Intelligence',
        description: 'Stay ahead of the curve with real-time market intelligence, global news coverage, and our comprehensive economic calendar.',
        heroBg: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-navy to-navy',
        features: [
            {
                title: 'Market News',
                description: 'Real-time updates on global events moving the needle. Deep dives into geopolitical events and economic shifts.',
                icon: <HiOutlineLightBulb className="w-8 h-8" />
            },
            {
                title: 'Economic Calendar',
                description: 'Never miss a central bank meeting or NFP report with our live-updating schedule of global financial events.',
                icon: <HiOutlineChartBar className="w-8 h-8" />
            },
            {
                title: 'Expert Commentary',
                description: 'Read daily insights from our senior market analysts on major currency pairs, indices, and commodities.',
                icon: <HiOutlineLightBulb className="w-8 h-8" />
            }
        ],
        stats: [
            { label: 'News Updates', value: 'Real-time' },
            { label: 'Calendar Events', value: 'Global' },
            { label: 'Expert Views', value: 'Daily' },
        ]
    }
};

const ResourceExplorerPage = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        if (category && resourceContent[category.toLowerCase()]) {
            setData(resourceContent[category.toLowerCase()]);
        } else {
            navigate('/');
        }
        window.scrollTo(0, 0);
    }, [category, navigate]);

    if (!data) return null;

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <main className="bg-[#000F29] min-h-screen text-white font-sans selection:bg-gold/30 relative overflow-hidden">
            <Navbar />

            {/* Global Page Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img 
                    src={resourceBg} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/90 via-[#000F29]/70 to-[#000F29]/95" />
                <div className="absolute inset-0 bg-grid-slim opacity-10" />
            </div>

            {/* Hero Section */}
            <section className="pt-44 pb-24 md:pt-56 md:pb-36 relative z-10">

                <Container className="relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8"
                        >
                            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                            <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">{data.subtitle}</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight"
                        >
                            Explore Our <span className="gradient-text italic">{data.title}</span>
                        </motion.h1>
                        
                        <motion.p 
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-16 font-medium"
                        >
                            {data.description}
                        </motion.p>

                        <motion.div 
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {data.stats.map((stat, idx) => (
                                <div key={idx} className="bg-white/[0.03] border border-white/10 p-8 rounded-2xl backdrop-blur-sm group hover:border-gold/30 transition-colors">
                                    <h3 className="text-3xl font-display font-bold text-white mb-2">{stat.value}</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-bold">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* Features Detail */}
            <section className="py-24 relative">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.features.map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#00173D]/50 border border-white/5 p-10 rounded-[2.5rem] hover:bg-[#00173D] transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    {feature.icon || <HiOutlineCheckCircle className="w-24 h-24" />}
                                </div>

                                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-8 group-hover:scale-110 transition-transform">
                                    {feature.icon || <HiOutlineCheckCircle className="w-8 h-8" />}
                                </div>

                                <h3 className="text-2xl font-display font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-white/50 leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Trust Section */}
            <section className="py-24 bg-navy-light/20 border-y border-white/5">
                <Container>
                    <div className="bg-[#000F29] border border-white/10 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold/5 blur-[120px] rounded-full" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="max-w-xl">
                                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Built for Traders, <br/>By <span className="text-gold italic">Institutions</span></h2>
                                <p className="text-white/50 text-lg leading-relaxed font-medium mb-10">
                                    Our resources are more than just tools—they are the foundation of a successful trading career. Join thousands of traders using our institutional-grade environment.
                                </p>
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineCheckCircle className="text-gold w-5 h-5" />
                                        <span className="text-sm font-bold text-white/80">Tier 1 Liquidity</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HiOutlineCheckCircle className="text-gold w-5 h-5" />
                                        <span className="text-sm font-bold text-white/80">Military Grade Security</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                                <a href="/register" className="inline-block relative group">
                                    <div className="absolute -inset-1 bg-gold rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500" />
                                    <button className="relative btn-gold py-5 px-12 text-lg flex items-center justify-center gap-2 m-0 border border-gold/50 shadow-2xl">
                                        Open Live Account <HiArrowRight />
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
};

export default ResourceExplorerPage;
