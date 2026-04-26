import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Container from '../layout/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PromotionsSection = () => {
    const promos = [
        {
            title: '100% Welcome Bonus',
            description: 'Double your trading potential on your first deposit. Limited time offer for new clients.',
            tag: 'New Client',
        },
        {
            title: 'Refer a Friend',
            description: 'Earn up to $500 for every friend you refer who starts trading with TIK TRADES.',
            tag: 'Earn More',
        },
        {
            title: 'Loyalty Rebates',
            description: 'Get paid for every lot you trade. Our loyalty program rewards your trading volume.',
            tag: 'Active Trader',
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-navy/20 pointer-events-none" />
            <Container>
                <SectionTitle
                    subtitle="Exclusive Offers"
                    title="Boost Your Trading Advantage"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {promos.map((promo, index) => (
                        <Card key={promo.title} className="flex flex-col border-white/5 hover:border-gold/20">
                            <div className="mb-6">
                                <span className="bg-gold/10 text-gold text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full border border-gold/20">
                                    {promo.tag}
                                </span>
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-4">{promo.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed mb-8 flex-grow">
                                {promo.description}
                            </p>
                            <Link to="/promotions">
                                <Button variant="outline" className="w-full">
                                    Learn More
                                </Button>
                            </Link>
                        </Card>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 p-12 rounded-3xl bg-gold-gradient relative overflow-hidden text-navy flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Start Trading in Minutes</h2>
                        <p className="font-medium opacity-80">Join over 1M+ traders globally and experience the premium difference.</p>
                    </div>
                    <Link to="/register">
                        <Button variant="gold" className="!bg-navy !text-white !hover:bg-navy-dark whitespace-nowrap px-12 py-4 text-lg">
                            Create Your Account
                        </Button>
                    </Link>
                </motion.div>
            </Container>
        </section>
    );
};

export default PromotionsSection;
