import React from 'react';
import { motion } from 'framer-motion';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HiShieldCheck, HiOutlineDocumentText } from 'react-icons/hi';
import bgImage from '../../assets/images/Conditions.jpeg';

const KYCPolicyPage = () => {
    const policySections = [
        {
            title: "Identity Verification",
            content: "All customers must complete identity verification before trading."
        },
        {
            title: "Required Documents",
            content: "Required documents include government-issued ID, proof of address, and in some cases, income or source of funds verification."
        },
        {
            title: "Purpose of KYC",
            content: "The purpose of KYC is to ensure compliance with regulatory standards, prevent fraud, and safeguard customer accounts."
        },
        {
            title: "Account Restrictions",
            content: "Accounts with incomplete KYC will have restricted access until verification is completed."
        }
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
                            subtitle="Verification Protocol" 
                            title="KYC Policy" 
                        />

                        <div className="mt-12 space-y-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-card rounded-[2.5rem] p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-32 bg-gold/5 blur-[100px] pointer-events-none" />
                                
                                <div className="prose prose-invert max-w-none relative z-10">
                                    <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Know Your Customer</h3>
                                    <p className="text-white/70 text-lg leading-relaxed mb-12 italic border-l-2 border-gold pl-6">
                                        "To maintain an institutional-grade trading environment, TIK TRADES implements stringent Know Your Customer (KYC) protocols to guarantee maximum security and regulatory conformity."
                                    </p>

                                    <div className="space-y-12">
                                        {policySections.map((section, idx) => (
                                            <div key={idx} id={`section-${idx}`} className="group">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    <span className="text-gold font-display font-black text-sm opacity-40 italic">0{idx + 1}</span>
                                                    <h4 className="text-xl md:text-2xl font-display font-bold text-white group-hover:text-gold transition-colors">{section.title}</h4>
                                                </div>
                                                <p className="text-white/50 leading-relaxed pl-8 md:pl-10">
                                                    {section.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-16 p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                        <div className="flex justify-center mb-4">
                                            <HiShieldCheck className="text-gold w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="text-white/40 text-xs uppercase font-bold tracking-widest leading-relaxed">
                                            Security of your documentation is our priority. All files are transmitted via 256-bit SSL encryption.
                                        </p>
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

export default KYCPolicyPage;
