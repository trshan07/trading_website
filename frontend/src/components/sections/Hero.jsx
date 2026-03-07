import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Container from '../layout/Container';
import Button from '../ui/Button';
import dashboardImg from '../../assets/images/hero-dashboard.png';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
            {/* Architectural Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="scan-line" />

                {/* Ambient Orbs */}
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-gold/10 rounded-full blur-[180px] animate-pulse-slow" />

                {/* Technical HUD elements */}
                <div className="absolute top-1/4 right-0 w-px h-64 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
                <div className="absolute bottom-1/4 left-0 w-px h-64 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
            </div>

            <Container className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                    {/* Content Column */}
                    <div className="lg:col-span-7 text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-card border-gold/20 text-gold text-xs font-bold tracking-[0.2em] uppercase mb-8 shadow-gold-glow-sm"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                            </span>
                            <span>Institutional Execution Protocol</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, type: 'spring', damping: 15 }}
                            className="text-4xl md:text-6xl xl:text-7xl font-display font-bold leading-[1.1] mb-6"
                        >
                            Elevate Your <br />
                            <span className="gradient-text italic">Trading Legacy</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-base md:text-lg text-white/50 mb-10 max-w-xl leading-relaxed font-sans"
                        >
                            Access deep institutional liquidity and lightning-fast execution across Forex, Metals, and Global Indices on our next-generation proprietary infrastructure.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center gap-4"
                        >
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button variant="gold" className="w-full px-8 py-3.5 text-base group relative overflow-hidden">
                                    <span className="relative z-10">Start Trading Now</span>
                                    <motion.div
                                        className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                                    />
                                </Button>
                            </Link>
                            <Link to="/markets" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full px-8 py-3.5 text-base hover:border-gold/50 transition-all">
                                    Platform Tour
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Terminal Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className="mt-20 grid grid-cols-2 sm:grid-cols-3 gap-12 border-t border-white/5 pt-10"
                        >
                            <div className="flex flex-col">
                                <span className="text-gold font-display text-2xl font-bold">0.0<span className="text-sm ml-0.5">pips</span></span>
                                <span className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold mt-2">Ultra-Thin Spreads</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gold font-display text-2xl font-bold">30<span className="text-sm ml-0.5">ms</span></span>
                                <span className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold mt-2">Execution Speed</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gold font-display text-2xl font-bold">1:500</span>
                                <span className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold mt-2">Flexible Leverage</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Visual Column */}
                    <motion.div
                        className="lg:col-span-5 relative hidden lg:block"
                        initial={{ opacity: 0, scale: 0.8, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, type: 'spring', bounce: 0.3 }}
                    >
                        {/* Decorative Background for Image */}
                        <div className="absolute inset-0 bg-gold/5 rounded-3xl blur-3xl -rotate-6 scale-110" />

                        {/* The Image Overlay/Card */}
                        <div className="relative glass-card border-gold/30 p-2 rounded-[2rem] shadow-2xl overflow-hidden group">
                            <motion.img
                                src={dashboardImg}
                                alt="Rizals Trade Terminal"
                                className="rounded-[1.8rem] w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                style={{ maxHeight: '600px' }}
                            />

                            {/* Overlay glass labels */}
                            <div className="absolute top-8 right-8 glass-card border-gold/40 px-4 py-3 rounded-xl shadow-xl backdrop-blur-xl animate-float">
                                <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Execution Status</div>
                                <div className="text-green-400 font-bold flex items-center space-x-2">
                                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                                    <span>Verified: Real-Time</span>
                                </div>
                            </div>

                            <div className="absolute bottom-8 left-8 glass-card border-gold/40 px-6 py-4 rounded-xl shadow-xl backdrop-blur-xl animate-float-delayed">
                                <div className="text-gold text-lg font-bold font-display">GOLD (XAUUSD)</div>
                                <div className="text-white text-2xl font-bold">+1.45%</div>
                            </div>
                        </div>

                        {/* Additional accent elements */}
                        <div className="absolute -z-10 -right-8 -bottom-8 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
                    </motion.div>

                </div>
            </Container>
        </section>
    );
};

export default Hero;
