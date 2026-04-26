import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCheck, HiOutlineBadgeCheck, HiShieldCheck } from 'react-icons/hi';
import Container from '../../components/layout/Container';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import accountBg from '../../assets/images/ResourceEx.jpeg';
import publicService from '../../services/publicService';

const AccountTypesPage = () => {
    const [accounts, setAccounts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAccountTypes = async () => {
            setIsLoading(true);
            try {
                const response = await publicService.getAccountTypes();
                if (response.success) {
                    setAccounts(response.data.map(acc => ({
                        name: acc.name,
                        minDeposit: `$${acc.min_deposit}`,
                        spread: `From ${acc.spreads_from}`,
                        commission: acc.name.includes('Elite') || acc.name.includes('Gold') ? 'Fixed' : '$0',
                        leverage: acc.leverage,
                        platforms: 'WebTrader, MT5',
                        features: Array.isArray(acc.features) ? acc.features : JSON.parse(acc.features || '[]'),
                        tag: acc.name.includes('Standard') ? 'Most Popular' : 'Institutional',
                        highlight: acc.name.includes('Gold') || acc.name.includes('Elite')
                    })));
                }
            } catch (error) {
                console.error('Account protocol sync failed:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAccountTypes();
    }, []);

    if (isLoading) return (
        <div className="min-h-screen bg-[#000F29] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <main className="bg-[#000F29] min-h-screen text-white font-sans selection:bg-gold/30 relative overflow-hidden">
            <Navbar />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img 
                    src={accountBg} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/90 via-[#000F29]/70 to-[#000F29]/95" />
                <div className="absolute inset-0 bg-grid-slim opacity-10" />
            </div>

            <div className="relative pt-44 pb-24 md:pt-56 md:pb-32 z-10">
                <Container>
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="max-w-4xl mx-auto text-center mb-20"
                    >
                        <span className="text-gold text-xs font-bold tracking-[0.4em] uppercase mb-6 block">Trading Architecture</span>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-6 md:mb-8 leading-[1.1]">
                            Institutional <br />
                            <span className="gradient-text italic">Account Tiering</span>
                        </h1>
                        <p className="text-white/40 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4">
                            Precision-engineered account types designed to match every trading style, from active scalpers to long-term institutional investors.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
                        {accounts.map((acc, index) => (
                            <motion.div
                                key={acc.name}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className={`group relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] glass-card border-white/5 transition-all duration-500 hover:shadow-gold-glow-sm flex flex-col ${
                                    acc.highlight ? 'border-gold/30 bg-white/[0.03]' : ''
                                }`}
                            >
                                {acc.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl">
                                        Institutional Raw
                                    </div>
                                )}

                                <div className="mb-8 text-center">
                                    <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-3 block opacity-60">
                                        {acc.tag}
                                    </span>
                                    <h3 className="text-3xl font-display font-bold text-white mb-2">{acc.name}</h3>
                                    <div className="h-1 w-16 bg-gold/30 mx-auto rounded-full group-hover:w-24 transition-all duration-700" />
                                </div>

                                <div className="space-y-4 mb-10 flex-grow">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: 'Minimum Deposit', value: acc.minDeposit },
                                            { label: 'Target Spread', value: acc.spread },
                                            { label: 'Commission', value: acc.commission },
                                            { label: 'Max Leverage', value: acc.leverage },
                                        ].map((item) => (
                                            <div key={item.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-white/10 transition-colors">
                                                <span className="text-white/30 uppercase text-[9px] font-black tracking-widest block mb-1">{item.label}</span>
                                                <span className="text-white font-display font-bold text-base">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <p className="text-white/30 text-[9px] font-black tracking-widest uppercase mb-4">Core Provisions</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {acc.features.map((feature) => (
                                                <div key={feature} className="flex items-center space-x-3">
                                                    <HiCheck className="text-gold w-4 h-4 flex-shrink-0" />
                                                    <span className="text-white/60 text-xs font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <Link to="/register" className="relative group/btn block">
                                        <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover/btn:opacity-60 transition duration-500 ${
                                            acc.highlight ? 'bg-gold' : 'bg-white/20'
                                        }`} />
                                        <button className={`relative w-full py-4 rounded-2xl text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 border ${
                                            acc.highlight 
                                            ? 'bg-gold text-navy border-gold hover:translate-y-[-2px]' 
                                            : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                                        }`}>
                                            Secure {acc.name.split(' ')[0]} Access
                                        </button>
                                    </Link>
                                    <p className="text-center mt-5 text-[9px] text-white/20 font-bold tracking-widest uppercase">
                                        Available Platforms: {acc.platforms}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Security Trust Bar */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="flex flex-wrap items-center justify-center gap-12 pt-20 border-t border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                    >
                        <div className="flex items-center gap-3">
                            <HiShieldCheck className="w-8 h-8 text-gold" />
                            <span className="text-sm font-bold tracking-tighter italic">Secured by SSL 256-bit</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <HiOutlineBadgeCheck className="w-8 h-8 text-gold" />
                            <span className="text-sm font-bold tracking-tighter italic">Regulated Brokerage</span>
                        </div>
                    </motion.div>
                </Container>
            </div>
            <Footer />
        </main>
    );
};

export default AccountTypesPage;
