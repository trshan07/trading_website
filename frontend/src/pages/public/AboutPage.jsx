import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineUserGroup, HiOutlineGlobeAlt } from 'react-icons/hi';
import Container from '../../components/layout/Container';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import tikTradesAboutBg from '../../assets/images/rizals_about_bg.png';

const AboutPage = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    return (
        <main className="bg-[#000F29] min-h-screen text-white font-sans selection:bg-gold/30 overflow-hidden relative">
            <Navbar />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">                <img 
                    src={tikTradesAboutBg} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/70 via-[#000F29]/40 to-[#000F29] opacity-90" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" />
                <div className="absolute inset-0 bg-grid-slim opacity-[0.03]" />

                {/* Floating particles or flares */}
                <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-gold rounded-full animate-ping opacity-20" />
                <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-10 delay-700" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-44 pb-24 md:pt-60 md:pb-40">
                <Container>
                    <div className="max-w-4xl mx-auto text-center border-b border-white/5 pb-20">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="inline-block px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-8"
                        >
                            <span className="text-gold text-[10px] uppercase font-bold tracking-[0.3em]">Our Identity</span>
                        </motion.div>

                        <motion.h1
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            className="text-5xl sm:text-6xl md:text-8xl font-display font-bold mb-6 md:mb-10 leading-tight"
                        >
                            About <span className="gradient-text italic">Us</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-lg md:text-2xl text-white/70 font-medium leading-[1.6] md:leading-[1.8] max-w-3xl mx-auto"
                        >
                            We were founded by <span className="text-gold font-bold">traders, for traders</span>. Our mission is to bridge the gap between institutional-grade technology and the retail investor.
                        </motion.p>
                    </div>
                </Container>
            </section>

            {/* Core Pillars */}
            <section className="py-24 relative bg-navy-light/10">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                                Built for those who <br />
                                <span className="italic text-gold">take markets seriously</span>
                            </h2>
                            <p className="text-white/50 text-lg leading-relaxed font-medium">
                                By providing transparent pricing, lightning-fast execution, and human-centric support, we’ve built a home where technology meets integrity.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy transition-all duration-300">
                                        <HiOutlineShieldCheck className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold tracking-wider uppercase text-white/80 group-hover:text-gold transition-colors">Transparency</span>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy transition-all duration-300">
                                        <HiOutlineLightningBolt className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-bold tracking-wider uppercase text-white/80 group-hover:text-gold transition-colors">High Speed</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square rounded-[3rem] border border-white/10 flex items-center justify-center overflow-hidden group relative shadow-2xl">
                                {/* Base Image */}
                                <img src={tikTradesAboutBg} alt="About Tik Trades" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" />
                                
                                {/* Gradual dark gradient from bottom for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#000F29] via-[#000F29]/30 to-transparent opacity-80" />
                                
                                <div className="relative z-10 text-center p-12 mt-auto pb-16">
                                    <span className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold text-white/20 italic select-none block mb-4">TIK TRADES</span>
                                    <p className="text-xs uppercase tracking-[0.5em] text-gold font-bold bg-navy/50 px-4 py-2 rounded-full inline-block backdrop-blur-md">Institutional DNA</p>
                                </div>

                                {/* Floating Stat Card */}
                                <div className="absolute bottom-10 -right-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl animate-float">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Global Reach</p>
                                    <div className="flex items-center gap-2">
                                        <HiOutlineGlobeAlt className="text-gold w-5 h-5" />
                                        <span className="text-2xl font-display font-bold">150+ Markets</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* Human Support Section */}
            <section className="py-32">
                <Container>
                    <div className="bg-[#00173D]/50 border border-white/5 rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[100px]" />
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8">Human-Centric Support</h3>
                            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8 md:mb-12 font-medium">
                                We believe that in an automated world, human connection remains vital. Our support team consists of experienced market experts, not scripts or bots.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                                <div className="px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-sm font-bold hover:bg-gold/10 hover:border-gold/30 transition-all cursor-default uppercase md:normal-case">24/5 Live Support</div>
                                <div className="px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-sm font-bold hover:bg-gold/10 hover:border-gold/30 transition-all cursor-default uppercase md:normal-case">Direct Analyst Access</div>
                                <div className="px-6 md:px-8 py-2.5 md:py-3 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-sm font-bold hover:bg-gold/10 hover:border-gold/30 transition-all cursor-default uppercase md:normal-case">Multilingual</div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
};

export default AboutPage;
