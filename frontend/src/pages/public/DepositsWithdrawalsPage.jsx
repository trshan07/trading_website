import React from 'react';
import { motion } from 'framer-motion';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HiCreditCard, HiOutlineLibrary, HiCurrencyDollar, HiLightningBolt } from 'react-icons/hi';
import bgImage from '../../assets/images/Conditions.jpeg';

const DepositsWithdrawalsPage = () => {
    const depositMethods = [
        {
            title: "Credit/Debit Cards",
            icon: <HiCreditCard className="w-6 h-6 text-gold" />,
            time: "Instant",
            desc: "Instant deposits with secure payment gateways."
        },
        {
            title: "Net Banking",
            icon: <HiOutlineLibrary className="w-6 h-6 text-gold" />,
            time: "Direct",
            desc: "Direct transfers from your bank account."
        },
        {
            title: "UPI",
            icon: <HiLightningBolt className="w-6 h-6 text-gold" />,
            time: "Instant",
            desc: "Fast and convenient deposits via UPI apps."
        },
        {
            title: "Cryptocurrency",
            icon: <HiCurrencyDollar className="w-6 h-6 text-gold" />,
            time: "Blockchain",
            desc: "Supported crypto deposits with blockchain confirmations."
        },
        {
            title: "Bank Transfers",
            icon: <HiOutlineLibrary className="w-6 h-6 text-gold" />,
            time: "Traditional",
            desc: "Traditional wire transfers for larger amounts."
        }
    ];

    const processingTimes = [
        { method: "Credit/Debit Cards", time: "2–5 business days" },
        { method: "Net Banking/UPI", time: "1–3 business days" },
        { method: "Crypto Transactions", time: "Within blockchain confirmation times" },
        { method: "Bank Transfers", time: "3–7 business days" }
    ];

    return (
        <main className="bg-navy min-h-screen relative overflow-hidden flex flex-col">
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

            <div className="relative z-10 pt-32 pb-24 flex-grow">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto"
                    >
                        <SectionTitle 
                            subtitle="Financial Flow" 
                            title="Deposits & Withdrawals" 
                        />

                        <div className="mt-12 space-y-12">
                            {/* DEPOSIT SECTIONS */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-[2.5rem] p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 p-32 bg-green-500/5 blur-[100px] pointer-events-none" />
                                
                                <h3 className="text-2xl font-display font-bold text-white mb-2 tracking-widest uppercase">Deposit Infrastructure</h3>
                                <p className="text-white/50 mb-10 text-sm">We provide frictionless institutional gateways ensuring swift deployment of trading capital.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                    {depositMethods.map((method, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-gold/30 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-xl flex justify-center items-center group-hover:scale-110 transition-transform">
                                                    {method.icon}
                                                </div>
                                                <span className="text-[10px] uppercase font-bold tracking-widest bg-gold/10 text-gold py-1 px-3 rounded-full border border-gold/20">
                                                    {method.time}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-white mb-2">{method.title}</h4>
                                            <p className="text-white/40 text-sm leading-relaxed">{method.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* WITHDRAWAL SECTIONS */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="glass-card rounded-[2.5rem] p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute bottom-0 right-0 p-32 bg-gold/5 blur-[100px] pointer-events-none" />
                                
                                <h3 className="text-2xl font-display font-bold text-white mb-2 tracking-widest uppercase relative z-10">Withdrawal Policy</h3>
                                <p className="text-white/50 mb-10 text-sm relative z-10">Return of capital rules built for extreme transparency and speed.</p>

                                <div className="prose prose-invert max-w-none relative z-10 space-y-8">
                                    <div className="bg-navy/50 border-l-2 border-gold p-6 rounded-r-2xl mb-8">
                                        <p className="text-white/70 italic m-0">
                                            "Withdrawals are strictly processed returning to the original funding vector utilized for deployment, wherever operationally possible. All outflows are relentlessly protected by obligatory KYC and AML cross-verifications."
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Transmission Matrix</h4>
                                            
                                            <ul className="space-y-4">
                                                {processingTimes.map((item, i) => (
                                                    <li key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <span className="text-white font-medium text-sm">{item.method}</span>
                                                        <span className="text-gold text-sm font-black text-right">{item.time}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 flex flex-col justify-center">
                                            <h4 className="text-white font-bold mb-4 uppercase tracking-wider">Crucial Preconditions</h4>
                                            <ul className="space-y-3 text-white/50 text-sm list-disc pl-4">
                                                <li>Withdrawals are processed to the same method used for deposits, wherever possible.</li>
                                                <li>All withdrawals are subject to KYC and AML checks.</li>
                                                <li>Minimum withdrawal limits and transaction fees may apply.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </Container>
            </div>

            <Footer />
        </main>
    );
};

export default DepositsWithdrawalsPage;
