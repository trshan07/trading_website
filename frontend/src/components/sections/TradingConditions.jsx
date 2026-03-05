import React from 'react';
import { motion } from 'framer-motion';
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
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
            description: 'Instant deposits and fast withdrawals via local and international methods with zero processing fees.',
            icon: <HiOutlineCash className="w-8 h-8" />,
        },
        {
            title: 'Fees & Transparency',
            description: 'No hidden fees. Transparent pricing with some of the lowest commissions in the institutional market.',
            icon: <HiOutlineLightningBolt className="w-8 h-8" />,
        },
        {
            title: 'Client Protection',
            description: 'Your funds are held in segregated top-tier bank accounts with negative balance protection.',
            icon: <HiOutlineShieldCheck className="w-8 h-8" />,
        },
        {
            title: 'Order Execution',
            description: 'Ultra-low latency execution under 30ms with no requotes or rejections on all instrument types.',
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
                            <p className="relative z-10 text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors duration-500">
                                {condition.description}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default TradingConditions;
