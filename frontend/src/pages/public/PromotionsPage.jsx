import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineBadgeCheck, HiOutlineUserGroup, HiOutlineTrendingUp, HiChevronRight } from 'react-icons/hi';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';
import promoBg from '../../assets/images/promotions-bg.png';

const PromotionsPage = () => {
    const mainOffers = [
        {
            title: 'Welcome Deposit Bonus',
            subtitle: 'First Step Advantage',
            description: 'Kickstart your journey. Receive a 50% Credit Bonus on your first deposit to increase your trading equity.',
            icon: HiOutlineBadgeCheck,
            terms: '*T&Cs apply. Maximum credit limits apply.',
            tag: 'New Accounts'
        },
        {
            title: 'Refer-a-Friend Program',
            subtitle: 'Network Growth',
            description: 'Trading is better with a crew. Refer a fellow trader and both of you will receive a $50 cash bonus once they meet the minimum volume requirements.',
            icon: HiOutlineUserGroup,
            terms: '*Available per qualified referral.',
            tag: 'Social'
        },
        {
            title: 'Loyalty Rebate Program',
            subtitle: 'Volume Rewards',
            description: 'Get paid for every lot you trade. Our "Cashback" program rewards high-volume traders with monthly rebates directly into their trading accounts.',
            icon: HiOutlineTrendingUp,
            terms: '*Monthly rebates based on lot volume.',
            tag: 'Active Traders'
        }
    ];

    return (
        <main className="bg-[#000F29] min-h-screen text-white font-sans selection:bg-gold/30 relative overflow-hidden">
            <Navbar />

            {/* Global Page Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img 
                    src={promoBg} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-soft-light"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/80 via-[#000F29]/70 to-[#000F29]/95" />
                <div className="absolute inset-0 bg-grid-slim opacity-10" />
            </div>

            {/* Page Hero */}
            <div className="relative pt-44 pb-24 z-10">
                <Container className="relative">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase mb-6 block">Premium Rewards</span>
                            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-[1.1]">
                                Maximize Your <br />
                                <span className="gradient-text italic">Trading Capital</span>
                            </h1>
                            <p className="text-white/40 text-lg md:text-xl max-w-2xl leading-relaxed">
                                Access our elite incentive architecture designed to amplify your market presence and reward consistent execution.
                            </p>
                        </motion.div>
                    </div>
                </Container>
            </div>

            {/* Promotions Grid */}
            <section className="py-24 relative z-10">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {mainOffers.map((offer, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative flex flex-col p-10 rounded-[2.5rem] glass-card border-white/5 hover:border-gold/30 transition-all duration-500 hover:shadow-gold-glow-sm"
                            >
                                <div className="absolute top-8 right-8 text-white/[0.03] group-hover:text-gold/10 transition-colors">
                                    <offer.icon className="w-24 h-24" />
                                </div>

                                <div className="mb-8">
                                    <span className="text-gold text-[10px] uppercase font-bold tracking-widest border border-gold/20 px-3 py-1 rounded-full bg-gold/5">
                                        {offer.tag}
                                    </span>
                                </div>

                                <h3 className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase mb-2">{offer.subtitle}</h3>
                                <h2 className="text-3xl font-display font-bold mb-6 group-hover:text-gold transition-colors">{offer.title}</h2>
                                <p className="text-white/50 text-base leading-relaxed mb-10 flex-grow pt-4 border-t border-white/5">
                                    {offer.description}
                                </p>

                                <div className="pt-8 mb-2">
                                    <Link to="/login">
                                        <Button variant="gold" className="w-full py-4 group/btn flex items-center justify-center space-x-2 rounded-2xl">
                                            <span>Secure Offer</span>
                                            <HiChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <p className="text-[10px] text-white/20 mt-4 text-center italic">{offer.terms}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Activation Protocol */}
            <section className="py-32 bg-[#010816] relative overflow-hidden z-10">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />

                <Container>
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
                                Claim User <br />
                                <span className="gradient-text italic">Protocol</span>
                            </h2>
                            <div className="space-y-12">
                                {[
                                    { step: '01', title: 'Open Account', desc: 'Verify your profile and prepare your digital terminal for capital injection.' },
                                    { step: '02', title: 'Connect Funds', desc: 'Securely deposit via our global liquidity network to trigger bonus protocols.' },
                                    { step: '03', title: 'Automated Credit', desc: 'Incentives are applied directly to your equity balance within milliseconds.' }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="text-gold/10 font-display text-5xl font-bold group-hover:text-gold transition-colors duration-500">
                                            {step.step}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2 tracking-wide uppercase transition-colors group-hover:text-gold/80">{step.title}</h4>
                                            <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="glass-card p-12 rounded-[3.5rem] border-gold/10 relative z-10 backdrop-blur-3xl overflow-hidden group">
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-[80px]" />
                                <h3 className="text-2xl font-display font-bold mb-10 text-center">Reward Integrity</h3>
                                <div className="space-y-4">
                                    {[
                                        'Real-Time Balance Updates',
                                        'Transparent Payout Logic',
                                        'No Hidden Trading Locks',
                                        '24/5 VIP Support Access'
                                    ].map((check, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center space-x-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold/10 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                                                <HiOutlineBadgeCheck className="w-5 h-5" />
                                            </div>
                                            <span className="text-base font-medium text-white/70">{check}</span>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="mt-12 text-center">
                                    <Link to="/register">
                                        <Button variant="gold" className="w-full py-5 rounded-2xl shadow-gold-glow-sm">
                                            Register for Bonuses
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {/* Decorative Orbs */}
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-[120px]" />
                            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]" />
                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
};

export default PromotionsPage;
