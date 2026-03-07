import React from 'react';
import { motion } from 'framer-motion';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HiShieldCheck, HiExclamation, HiCheck } from 'react-icons/hi';
import bgImage from '../../assets/images/Conditions.jpeg';

const RiskDisclaimerPage = () => {
    const riskSections = [
        {
            title: "Leverage and Margin Risk",
            icon: <HiExclamation className="w-6 h-6" />,
            content: "The high degree of leverage available in trading can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose."
        },
        {
            title: "Market Volatility",
            icon: <HiShieldCheck className="w-6 h-6" />,
            content: "Financial markets are subject to unpredictable shifts in sentiment and price. Rapid price movements can lead to substantial losses that can exceed your initial deposit in some circumstances. Rizals Trade provides institutional-grade execution, but cannot guarantee protection against extreme market gaps or volatility."
        },
        {
            title: "Technical and Systemic Risks",
            icon: <HiExclamation className="w-6 h-6" />,
            content: "Online trading systems carry inherent risks including hardware failure, software issues, and connectivity disruptions. While we utilize redundant servers and high-speed data centers, clients must recognize that technical failures are a possibility in any electronic trading environment."
        }
    ];

    return (
        <main className="bg-navy min-h-screen relative overflow-hidden">
            <Navbar />

            {/* Fixed Background Layer */}
            <div className="fixed inset-0 z-0">
                <img 
                    src={bgImage} 
                    alt="Institutional Risk Compliance" 
                    className="w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/80 to-navy" />
                <div className="absolute inset-0 bg-grid-slim opacity-10" />
            </div>

            <div className="relative z-10 pt-32 pb-24">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <SectionTitle 
                            subtitle="Regulatory Protocol" 
                            title="Risk Disclaimer" 
                        />

                        {/* High Alert Banner */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-8 md:p-10 mb-12 backdrop-blur-md relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                            <div className="flex items-start space-x-6">
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                                    <HiExclamation className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold text-white mb-3 uppercase tracking-wider">High Risk Investment Warning</h3>
                                    <p className="text-white/70 leading-relaxed italic text-base">
                                        Trading foreign exchange and CFDs on margin carries a high level of risk and may not be suitable for all investors. You must be aware of the risks and be willing to accept them in order to invest in the financial markets.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Detailed Sections */}
                        <div className="space-y-6">
                            {riskSections.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card rounded-[2rem] p-8 md:p-10 border border-white/5 hover:border-gold/20 transition-all duration-500"
                                >
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="text-gold opacity-60 italic font-display text-sm">Protocol 0{index + 1}</div>
                                        <div className="h-px flex-grow bg-white/10" />
                                    </div>
                                    <h4 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-3">
                                        <span className="text-gold">{section.icon}</span>
                                        {section.title}
                                    </h4>
                                    <p className="text-white/50 leading-relaxed text-sm">
                                        {section.content}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer Acknowledgment */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-16 pt-12 border-t border-white/5 text-center"
                        >
                            <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-6">
                                <HiShieldCheck className="text-gold w-5 h-5" />
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Regulatory Compliance Verified</span>
                            </div>
                            <p className="text-white/30 text-xs max-w-2xl mx-auto leading-relaxed italic">
                                By accessing our trading environment, you acknowledge that you have fully read and understood the systemic risks involved in margin trading and are capable of assuming the financial consequences of your execution decisions.
                            </p>
                        </motion.div>
                    </motion.div>
                </Container>
            </div>

            <Footer />
        </main>
    );
};

export default RiskDisclaimerPage;
