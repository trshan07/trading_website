import React from 'react';
import { motion } from 'framer-motion';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HiScale, HiDocumentText, HiShieldCheck } from 'react-icons/hi';
import bgImage from '../../assets/images/Conditions.jpeg';

const TermsPage = () => {
    const termSections = [
        {
            title: "1. Scope of Services",
            content: "TIK TRADES provides institutional-grade trading infrastructure and liquidity access. By establishing an account, you acknowledge that our services comprise the execution of trades across various financial instruments as specified in our platform documentation."
        },
        {
            title: "2. Regulatory Compliance",
            content: "All trading activities conducted through our terminal are subject to international regulatory standards. Operators are responsible for ensuring their trading activity aligns with the jurisdictional requirements of their primary base of operation."
        },
        {
            title: "3. Operational Security",
            content: "Terminal access is strictly restricted to authorized operators. You are responsible for maintaining the confidentiality of your access keys and for all activities that occur under your unique operator ID. Any breach of security must be reported to our compliance desk immediately."
        },
        {
            title: "4. Execution Policy",
            content: "Our 'Best Execution' policy ensures that we seek the most favorable terms for our clients' orders. While we strive for zero-latency execution, you recognize that market conditions can impact execution quality and slippage may occur during high volatility events."
        }
    ];

    return (
        <main className="bg-navy min-h-screen relative overflow-hidden">
            <Navbar />

            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <img 
                    src={bgImage} 
                    alt="Legal Terms Background" 
                    className="w-full h-full object-cover opacity-30 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/90 to-navy" />
            </div>

            <div className="relative z-10 pt-32 pb-24">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto"
                    >
                        <SectionTitle 
                            subtitle="Legal Framework" 
                            title="Terms of Service" 
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
                            {/* Sidebar / Quick Links */}
                            <div className="lg:col-span-1 space-y-4 hidden lg:block">
                                <div className="sticky top-32 p-6 glass-card rounded-2xl border-white/5 bg-white/[0.02]">
                                    <h5 className="text-gold text-[10px] font-black uppercase tracking-widest mb-6">Document Nav</h5>
                                    <nav className="space-y-3">
                                        {termSections.map((s, i) => (
                                            <a key={i} href={`#section-${i}`} className="block text-white/40 hover:text-white text-xs font-bold transition-colors">
                                                {s.title.split('.')[1]}
                                            </a>
                                        ))}
                                    </nav>
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <div className="flex items-center space-x-2 text-white/30 text-[9px] font-black uppercase tracking-widest">
                                            <HiScale className="text-gold" />
                                            <span>v4.2 | 2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-3 space-y-8">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="glass-card rounded-[2.5rem] p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-32 bg-gold/5 blur-[100px] pointer-events-none" />
                                    
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-white/70 text-lg leading-relaxed mb-12 italic border-l-2 border-gold pl-6">
                                            "This agreement constitutes the entire legal understanding between TIK TRADES Ltd. and its authorized operators, governing the use of our proprietary trading core and secondary execution loops."
                                        </p>

                                        <div className="space-y-12">
                                            {termSections.map((section, idx) => (
                                                <div key={idx} id={`section-${idx}`} className="group">
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <span className="text-gold font-display font-black text-sm opacity-40 italic">0{idx + 1}</span>
                                                        <h4 className="text-2xl font-display font-bold text-white group-hover:text-gold transition-colors">{section.title}</h4>
                                                    </div>
                                                    <p className="text-white/50 leading-relaxed pl-8 md:pl-10">
                                                        {section.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-20 p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                            <div className="flex justify-center mb-4">
                                                <HiDocumentText className="text-gold w-8 h-8 opacity-50" />
                                            </div>
                                            <p className="text-white/40 text-xs uppercase font-bold tracking-widest">
                                                Full document available for download in the secure operator portal.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </Container>
            </div>

            <Footer />
        </main>
    );
};

export default TermsPage;
