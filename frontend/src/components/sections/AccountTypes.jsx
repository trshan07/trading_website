import React from 'react';
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
                { label: 'Minimum Deposit', value: '$100' },
                { label: 'Spread', value: 'From 0.2 pips' },
                { label: 'Commission', value: 'No commission' },
                { label: 'Maximum Leverage', value: '1:400' },
                { label: 'Instruments', value: 'Forex, metals, cryptocurrencies, energies, stocks, indices' },
            ],
            description: 'Whether you are just starting out or refining your strategy, our Standard Account keeps things simple. You get feature-rich trading without the worry of added commissions. Join the majority of our community and see why this is our go-to account type.',
        },
        {
            name: 'Raw Account',
            popular: true,
            features: [
                { label: 'Minimum Deposit', value: '$500' },
                { label: 'Spread', value: 'From 0.3 pips' },
                { label: 'Commission', value: 'No commission' },
                { label: 'Maximum Leverage', value: '1:400' },
                { label: 'Instruments', value: 'Forex, metals, cryptocurrencies' },
            ],
            description: 'Designed for scalpers, high-volume traders, and anyone who needs razor-sharp pricing. Experience ultra-low latency and raw market spreads. You pay what the market pays, plus a fixed commission, giving you a professional-grade trading environment without the fluff.',
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <Container>
                <SectionTitle
                    subtitle="Flexible Options"
                    title="Engineered for Every Trader"
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto items-stretch">
                    {accounts.map((account) => (
                        <Card
                            key={account.name}
                            className={`relative flex flex-col h-full ${account.popular ? 'border-gold/50 !bg-navy-light/80 shadow-2xl shadow-gold/5' : ''
                                }`}
                        >
                            {account.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy font-bold px-6 py-1.5 rounded-full text-[10px] uppercase tracking-widest shadow-lg shadow-gold/20">
                                    Most Popular Choice
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl md:text-3xl font-display font-bold mb-3">{account.name}</h3>
                                <div className="h-1 w-12 bg-gold/50 rounded-full mb-4" />
                                <p className="text-white/60 text-sm md:text-base leading-relaxed line-clamp-4 min-h-[5rem] md:min-h-[6rem]">
                                    {account.description}
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-grow">
                                {account.features.map((feature) => (
                                    <div key={feature.label} className="flex justify-between items-start border-b border-white/5 pb-3">
                                        <span className="text-white/40 text-xs md:text-sm uppercase tracking-wider font-medium">{feature.label}</span>
                                        <span className="font-bold text-gold text-right text-sm md:text-base pl-4">{feature.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto space-y-6">
                                <Link to="/register">
                                    <Button 
                                        variant={account.popular ? 'gold' : 'outline'} 
                                        className={`w-full py-4 text-xs md:text-sm uppercase tracking-[0.2em] font-bold ${account.popular ? 'animate-pulse-subtle shadow-gold-glow' : ''}`}
                                    >
                                        Establish {account.name}
                                    </Button>
                                </Link>
                                <div className="flex items-center justify-center space-x-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 group transition-colors hover:border-white/10">
                                    <div className="flex -space-x-1 opacity-60">
                                        <div className="w-2 h-2 rounded-full bg-gold" />
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-[10px] md:text-xs text-white/40 tracking-wide uppercase">Available on WebTrader, TradingView & MT5</span>
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
