import React from 'react';
import { motion } from 'framer-motion';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HiUserGroup, HiChip, HiLockClosed, HiEye, HiBadgeCheck } from 'react-icons/hi';
import bgImage from '../../assets/images/Conditions.jpeg';

const PrivacyPage = () => {
    const privacySections = [
        {
            title: "Information Collection",
            icon: <HiUserGroup className="w-6 h-6" />,
            content: "We collect information necessary to provide you with our services, including but not limited to identification data, contact information, financial historical data, and technical data related to your trading activities. This data is essential for maintaining your operator status within the Rizals Trade network."
        },
        {
            title: "Use of Information",
            icon: <HiChip className="w-6 h-6" />,
            content: "Your data is used to verify your identity, process trading transactions, maintain your account, improve our services, and comply with international regulatory requirements. We utilize advanced analytics to monitor for market abuse and ensure the integrity of our execution loops."
        },
        {
            title: "Data Protection",
            icon: <HiLockClosed className="w-6 h-6" />,
            content: "We implement robust technical and organizational measures, including AES-256 encryption and distributed secure servers, to protect your personal information from unauthorized access, loss, or disclosure. All data transmissions are handled via secure SSL gateways."
        },
        {
            title: "Third-Party Protocol",
            icon: <HiEye className="w-6 h-6" />,
            content: "We do not sell your data. Information is only shared with authorized third-party service providers (such as liquidity providers) or regulators as strictly required to facilitate our execution services and comply with applicable financial laws."
        }
    ];

    return (
        <main className="bg-navy min-h-screen relative overflow-hidden">
            <Navbar />

            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
                <img 
                    src={bgImage} 
                    alt="Privacy Policy Background" 
                    className="w-full h-full object-cover opacity-25 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/95 to-navy" />
            </div>

            <div className="relative z-10 pt-32 pb-24">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <SectionTitle 
                            subtitle="Data Governance" 
                            title="Privacy Policy" 
                        />

                        <div className="mt-12 space-y-8">
                            {/* Privacy Intro */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card rounded-[2rem] p-8 md:p-12 border border-white/10 text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gold/50" />
                                <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
                                    At Rizals Trade, we operate with a "Privacy by Design" philosophy. We are committed to protecting the integrity and confidentiality of our clients' personal and financial datasets.
                                </p>
                            </motion.div>

                            {/* Section Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {privacySections.map((section, index) => (
                                    <motion.div
                                        key={section.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="glass-card rounded-[2rem] p-8 border border-white/5 hover:border-gold/30 transition-all duration-500 flex flex-col"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6 border border-gold/10">
                                            {section.icon}
                                        </div>
                                        <h4 className="text-xl font-display font-bold text-white mb-4">{section.title}</h4>
                                        <p className="text-white/50 text-sm leading-relaxed flex-grow">
                                            {section.content}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Trust Badge */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center justify-center pt-8"
                            >
                                <div className="flex items-center space-x-2 text-gold mb-4">
                                    <HiBadgeCheck className="w-8 h-8" />
                                    <span className="text-xl font-display font-bold tracking-widest uppercase italic">GDPR Compliant</span>
                                </div>
                                <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.3em]">
                                    Institutional Data Sovereignty Guaranteed
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </Container>
            </div>

            <Footer />
        </main>
    );
};

export default PrivacyPage;
