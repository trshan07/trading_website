import React from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlineCash,
    HiOutlineTag,
    HiOutlineShieldCheck,
    HiOutlineLightningBolt,
    HiOutlineClock,
    HiOutlineGlobe,
    HiOutlineCheckCircle,
    HiCheck,
    HiArrowRight
} from 'react-icons/hi';
import Container from '../../components/layout/Container';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import conditionsBg from '../../assets/images/Conditions.jpeg';

const conditionBlocks = [
    {
        title: 'Instant Funding',
        shortLabel: 'Deposits',
        icon: <HiOutlineCash className="w-7 h-7" />,
        intro: 'Streamlined funding process with zero hidden hurdles. Fast turnaround for all withdrawals.',
        bullets: [
            'Instant bank & wire transfers',
            'Most withdrawals under 24 hours',
            'Zero holding fees',
        ],
        metric: '< 24h Processing'
    },
    {
        title: 'Raw Spreads',
        shortLabel: 'Pricing',
        icon: <HiOutlineTag className="w-7 h-7" />,
        intro: 'Top-tier liquidity providers ensure the tightest possible pricing on every trade you make.',
        bullets: [
            'Tightest available spreads',
            'Transparent commission structure',
            'No account maintenance fees',
        ],
        metric: 'From 0.0 pips'
    },
    {
        title: 'Tier-1 Security',
        shortLabel: 'Safeguards',
        icon: <HiOutlineShieldCheck className="w-7 h-7" />,
        intro: 'Institutional-grade infrastructure built around keeping your capital and data secure.',
        bullets: [
            'Segregated tier-1 bank accounts',
            'Industry-leading SSL & 2FA',
            'Strict regulatory compliance',
        ],
        metric: 'Full Segregation'
    },
    {
        title: 'Surgical Execution',
        shortLabel: 'Speed',
        icon: <HiOutlineLightningBolt className="w-7 h-7" />,
        intro: 'Ultra-low latency servers minimize slippage and fill your orders at the intended price.',
        bullets: [
            'Strategically located servers',
            'Best Execution Policy',
            'Deep institutional liquidity',
        ],
        metric: '< 30ms Execution'
    },
];

const trustStats = [
    { label: 'Withdrawal Speed', value: 'Under 24h', icon: <HiOutlineClock className="w-6 h-6" /> },
    { label: 'Global Infrastructure', value: 'Equinix NY4', icon: <HiOutlineGlobe className="w-6 h-6" /> },
    { label: 'Policy Transparency', value: '100% Clear', icon: <HiOutlineCheckCircle className="w-6 h-6" /> },
];

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const MotionDiv = motion.div;
const MotionHeading = motion.h1;
const MotionParagraph = motion.p;

const ConditionsPage = () => {
    return (
        <main className="bg-[#000F29] min-h-screen relative overflow-hidden font-sans selection:bg-gold/30">
            <Navbar />

            {/* Global Page Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img 
                    src={conditionsBg} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/90 via-[#000F29]/70 to-[#000F29]/95" />
                <div className="absolute inset-0 bg-grid-slim opacity-10" />
            </div>

            <div className="relative z-10">
                {/* Compact Header */}
                <section className="relative pt-44 pb-16 md:pt-48 md:pb-24 overflow-hidden border-b border-white/5">
                    <Container className="relative z-10">
                        <MotionDiv 
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="max-w-5xl mx-auto flex flex-col items-center text-center"
                        >
                            <MotionDiv variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-8">
                                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">Premium Environment</span>
                            </MotionDiv>
                            
                            <MotionHeading variants={fadeInUp} className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white mb-6 md:mb-8 leading-tight">
                                Institutional <br />
                                <span className="gradient-text italic">Trading Conditions</span>
                            </MotionHeading>
                            
                            <MotionParagraph variants={fadeInUp} className="text-base md:text-xl text-white/50 mb-10 md:mb-12 max-w-2xl leading-relaxed font-medium px-4">
                                Engineered for speed, transparency, and top-tier safeguards. Your operations stay predictable and protected in live market conditions.
                            </MotionParagraph>

                            <MotionDiv variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl px-4 md:px-0">
                                {trustStats.map((stat) => (
                                    <div key={stat.label} className="glass-card rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.05] transition-all duration-500">
                                        <div className="text-gold mb-3 md:mb-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">{stat.icon}</div>
                                        <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-1">{stat.value}</h3>
                                        <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-[0.1em] font-black">{stat.label}</p>
                                    </div>
                                ))}
                            </MotionDiv>
                        </MotionDiv>
                    </Container>
                </section>

                {/* Compact Grid Layout for Conditions */}
                <section className="relative py-16 md:py-24">
                    <Container>
                        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            {conditionBlocks.map((block, index) => (
                                <MotionDiv 
                                    key={block.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-9 border border-white/10 hover:border-gold/30 transition-all duration-500 relative group overflow-hidden flex flex-col h-full"
                                >
                                    {/* Hover Glow */}
                                    <div className="absolute top-0 right-0 p-32 bg-gold/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-500">
                                            {block.icon}
                                        </div>
                                        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-gold text-[10px] font-black tracking-widest font-display shadow-2xl">
                                            {block.metric}
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10 mb-6">
                                        <p className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">{block.shortLabel}</p>
                                        <h3 className="text-2xl font-display font-bold text-white mb-3 leading-tight">{block.title}</h3>
                                        <p className="text-white/50 text-sm leading-relaxed font-medium">{block.intro}</p>
                                    </div>
                                    
                                    <div className="space-y-3 relative z-10 mt-auto pt-6 border-t border-white/5">
                                        {block.bullets.map((bullet, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                                                    <HiCheck className="w-2.5 h-2.5 text-gold shrink-0" />
                                                </div>
                                                <p className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">{bullet}</p>
                                            </div>
                                        ))}
                                    </div>
                                </MotionDiv>
                            ))}
                        </div>

                        {/* Highly Compact CTA */}
                        <MotionDiv 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto glass-card rounded-[1.5rem] md:rounded-[2.5rem] p-8 md:p-14 border border-gold/20 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 relative overflow-hidden group shadow-gold-glow-sm"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-duration-700 pointer-events-none" />
                            
                            <div className="text-center md:text-left z-10">
                                <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-3 leading-tight">Trade with Professional Edge</h2>
                                <p className="text-sm md:text-base text-white/40 font-medium max-w-md mx-auto md:mx-0">Experience the difference with an account built for high-performance trading.</p>
                            </div>
                            
                            <div className="shrink-0 z-10">
                                <a href="/register" className="inline-block relative group/btn">
                                    <div className="absolute -inset-1 bg-gold rounded-full blur opacity-40 group-hover/btn:opacity-100 transition duration-500" />
                                    <button className="relative btn-gold py-4 px-10 text-base font-black tracking-widest uppercase flex items-center gap-3 m-0">
                                        Open Live Account <HiArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
                                    </button>
                                </a>
                            </div>
                        </MotionDiv>

                    </Container>
                </section>
            </div>

            <Footer />
        </main>
    );
};

export default ConditionsPage;
