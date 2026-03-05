import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { HiCheckCircle } from 'react-icons/hi';

const AccountTypes = () => {
    const accounts = [
        {
            name: 'Standard Account',
            popular: false,
            features: [
                { label: 'Min Deposit', value: '$100' },
                { label: 'Spreads', value: 'From 0.2 pips' },
                { label: 'Commission', value: '$0' },
                { label: 'Leverage', value: 'Up to 1:400' },
            ],
            description: 'Ideal for retail traders looking for no-commission trading with competitive spreads.',
        },
        {
            name: 'Raw Account',
            popular: true,
            features: [
                { label: 'Min Deposit', value: '$500' },
                { label: 'Spreads', value: 'From 0.0 pips' },
                { label: 'Commission', value: 'Fixed per lot' },
                { label: 'Leverage', value: 'Up to 1:400' },
            ],
            description: 'Designed for professionals and high-frequency traders needing deep liquidity.',
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <Container>
                <SectionTitle
                    subtitle="Flexible Options"
                    title="Engineered for Every Trader"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {accounts.map((account, index) => (
                        <Card
                            key={account.name}
                            className={`relative flex flex-col ${account.popular ? 'border-gold/50 !bg-navy-light/80' : ''
                                }`}
                        >
                            {account.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy font-bold px-6 py-1 rounded-full text-xs uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-2xl font-display font-bold mb-4">{account.name}</h3>
                            <p className="text-white/50 text-sm mb-8">{account.description}</p>

                            <div className="space-y-6 mb-10 flex-grow">
                                {account.features.map((feature) => (
                                    <div key={feature.label} className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-white/60">{feature.label}</span>
                                        <span className="font-bold text-gold">{feature.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <Link to="/register">
                                    <Button variant={account.popular ? 'gold' : 'outline'} className="w-full">
                                        Open {account.name}
                                    </Button>
                                </Link>
                                <div className="flex items-center justify-center space-x-2 text-xs text-white/40">
                                    <HiCheckCircle className="text-gold" />
                                    <span>Available on WebTrader, TradingView & MT5</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default AccountTypes;
