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
            title: '100% Capital Injection',
            subtitle: 'Welcome Bonus',
            description: 'Instantly double your trading power with our matched deposit protocol. Designed for high-volume execution from day one.',
            icon: HiOutlineBadgeCheck,
            terms: '*Available for deposits up to $10,000',
            tag: 'Institutional'
        },
        {
            title: 'Node Referral Program',
            subtitle: 'Network Growth',
            description: 'Introduce professional traders to our liquidity nodes and earn $500 per qualified partner with no upper limit.',
            icon: HiOutlineUserGroup,
            terms: '*Per qualified execution partner',
            tag: 'Growth'
        },
        {
            title: 'Execution Rebates',
            subtitle: 'Loyalty Protocol',
            description: 'Professional traders receive direct lot-based rebates credited to their terminal balance in real-time.',
            icon: HiOutlineTrendingUp,
            terms: '*Contact your account manager',
            tag: 'Volume'
        }
    ];

    return (
        <main className="bg-navy min-h-screen text-white">
            <Navbar />

            {/* Page Hero */}
            <div className="relative pt-40 pb-24 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={promoBg}
                        alt=""
                        className="w-full h-full object-cover opacity-60 mix-blend-soft-light scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/80 to-navy" />
                    <div className="absolute inset-0 bg-grid-slim opacity-30" />
                </div>

                <Container className="relative z-10">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase mb-6 block">Exclusive Advantage</span>
                            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-[1.1]">
                                Empower Your <br />
                                <span className="gradient-text italic">Market Edge</span>
                            </h1>
                            <p className="text-white/40 text-lg md:text-xl max-w-2xl leading-relaxed">
                                Access our suite of institutional-grade incentives designed to maximize your trading capital and execution efficiency.
                            </p>
                        </motion.div>
                    </div>
                </Container>
            </div>

            {/* Promotions Grid */}
            <section className="py-24 relative">
                <Container>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {mainOffers.map((offer, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative flex flex-col p-10 rounded-[2.5rem] glass-card border-white/5 hover:border-gold/20 transition-all duration-500 hover:shadow-gold-glow-sm"
                            >
                                <div className="absolute top-8 right-8 text-white/5 group-hover:text-gold/10 transition-colors">
                                    <offer.icon className="w-24 h-24" />
                                </div>

                                <div className="mb-8">
                                    <span className="text-gold text-[10px] uppercase font-bold tracking-widest border border-gold/20 px-3 py-1 rounded-full">
                                        {offer.tag}
                                    </span>
                                </div>

                                <h3 className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase mb-2">{offer.subtitle}</h3>
                                <h2 className="text-3xl font-display font-bold mb-6 group-hover:text-gold transition-colors">{offer.title}</h2>
                                <p className="text-white/50 text-sm leading-relaxed mb-10 flex-grow">
                                    {offer.description}
                                </p>

                                <div className="pt-8 border-t border-white/5">
                                    <Link to="/login">
                                        <Button variant="outline" className="w-full py-4 group/btn flex items-center justify-center space-x-2">
                                            <span>Terminal Access</span>
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

            {/* How it Works / Protocol */}
            <section className="py-32 bg-navy-dark relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <Container>
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
                                Activation <br />
                                <span className="gradient-text italic">Protocol</span>
                            </h2>
                            <div className="space-y-12">
                                {[
                                    { step: '01', title: 'Provision Account', desc: 'Complete our high-speed onboarding and verify your terminal access.' },
                                    { step: '02', title: 'Connect Capital', desc: 'Securely deposit funds via our global payment gateway nodes.' },
                                    { step: '03', title: 'Incentive Match', desc: 'Bonus or rebate protocols are automatically deployed to your balance.' }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="text-gold/20 font-display text-5xl font-bold group-hover:text-gold transition-colors duration-500">
                                            {step.step}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2 tracking-wide uppercase">{step.title}</h4>
                                            <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="glass-card p-12 rounded-[3rem] border-gold/10 relative z-10 backdrop-blur-3xl">
                                <h3 className="text-2xl font-display font-bold mb-8 text-center">Protocol Integrity</h3>
                                <div className="space-y-6">
                                    {[
                                        'Instant Credit Allocation',
                                        'Transparent Terms & Conditions',
                                        'No Execution Constraints',
                                        'Dedicated Performance Manager'
                                    ].map((check, i) => (
                                        <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                                <HiOutlineBadgeCheck className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-white/70">{check}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 text-center">
                                    <Link to="/register">
                                        <Button variant="gold" className="w-full py-5 rounded-2xl">
                                            Start Your Legacy
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {/* Decorative Orbs */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-[100px]" />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-[100px]" />
                        </div>
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
};

export default PromotionsPage;
