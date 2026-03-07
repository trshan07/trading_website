import React from 'react';
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import {
    HiOutlineShieldCheck,
    HiOutlineLightningBolt,
    HiOutlineCash,
    HiOutlineUserGroup
} from 'react-icons/hi';

const TradingConditions = () => {
    const conditions = [
        {
            title: 'Deposits & Withdrawals',
            description: 'Moving your money should be the easiest part of your day. We have streamlined our funding process so you can spend less time waiting and more time trading.',
            points: [
                'Simple Funding: Choose from a variety of methods, including instant bank transfers, wire transfers, and major credit/debit cards.',
                'Fast Turnaround: We process most withdrawal requests within 24 hours because we know that when you want your funds, you want them now.',
                'Zero Hidden Hurdles: What you see is what you get. We do not believe in holding fees or complicated exit barriers.',
            ],
            icon: <HiOutlineCash className="w-8 h-8" />,
        },
        {
            title: 'Fees',
            description: 'We believe in No Surprises investing. While other brokers bury their costs in long documents, we keep ours front and center.',
            points: [
                'Competitive Spreads: We work with top-tier liquidity providers to ensure you get tight pricing on every trade.',
                'Transparent Structure: Whether it is a commission-based account or a spread-only model, you will always know exactly what you are paying before you hit buy.',
                'No Maintenance Fees: We do not charge you just for having an account. Your capital stays yours.',
            ],
            icon: <HiOutlineLightningBolt className="w-8 h-8" />,
        },
        {
            title: 'Client Protection',
            description: 'Your peace of mind is our top priority. We do not just talk about security; we build our entire infrastructure around it.',
            points: [
                'Segregated Accounts: Your funds are kept in separate, tier-1 bank accounts, completely isolated from our own corporate operating capital.',
                'Encryption & Security: We use industry-leading SSL encryption and multi-factor authentication (2FA) to protect your personal data and assets.',
                'Regulatory Compliance: We operate under strict oversight and follow global financial standards to support a fair and ethical trading environment.',
            ],
            icon: <HiOutlineShieldCheck className="w-8 h-8" />,
        },
        {
            title: 'Order Execution',
            description: 'In trading, every millisecond counts. Our technology is built to handle high-volume trading with precision.',
            points: [
                'Ultra-Low Latency: Our servers are strategically located to minimize slippage, helping your orders fill at the price you intended.',
                'Best Execution Policy: We are committed to finding the best possible market price for your trades, regardless of market volatility.',
                'Deep Liquidity: By tapping into a large liquidity pool, even large orders are executed smoothly and efficiently without disrupting the market.',
            ],
            icon: <HiOutlineUserGroup className="w-8 h-8" />,
        },
    ];

    return (
        <section className="py-24 bg-navy-light/30">
            <Container>
                <SectionTitle
                    subtitle="Superior Environment"
                    title="World-Class Trading Conditions"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {conditions.map((condition) => (
                        <div
                            key={condition.title}
                            className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden cursor-default transition-all duration-500 hover:border-gold/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.12)] hover:-translate-y-1"
                        >
                            {/* Subtle gold top gradient on hover */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                            {/* Icon */}
                            <div className="relative z-10 mb-6 w-14 h-14 rounded-xl bg-gold/10 border border-gold/10 flex items-center justify-center group-hover:bg-gold group-hover:border-gold/0 transition-all duration-500">
                                <span className="text-gold group-hover:text-navy transition-colors duration-500">
                                    {condition.icon}
                                </span>
                            </div>

                            <h3 className="relative z-10 text-xl font-display font-bold mb-3 text-white group-hover:text-gold transition-colors duration-500">
                                {condition.title}
                            </h3>
                            <p className="relative z-10 text-white/40 text-sm leading-relaxed mb-4 group-hover:text-white/60 transition-colors duration-500">
                                {condition.description}
                            </p>
                            <ul className="relative z-10 space-y-2">
                                {condition.points.map((point) => (
                                    <li key={point} className="text-white/60 text-xs leading-relaxed">
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default TradingConditions;
