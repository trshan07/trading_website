import React from 'react';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const AccountTypesPage = () => {
    const accounts = [
        {
            name: 'Standard Account',
            minDeposit: '$100',
            spread: 'From 0.2 pips',
            commission: '$0',
            leverage: '1:400',
            platforms: 'WebTrader, MT5',
        },
        {
            name: 'Raw Account',
            minDeposit: '$500',
            spread: 'From 0.0 pips',
            commission: 'Fixed',
            leverage: '1:400',
            platforms: 'WebTrader, MT5, TradingView',
            highlight: true,
        },
    ];

    return (
        <main className="bg-navy min-h-screen">
            <Navbar />
            <div className="pt-32 pb-24">
                <Container>
                    <SectionTitle
                        subtitle="Choice for Every Trader"
                        title="Trading Account Types"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                        {accounts.map((acc) => (
                            <Card key={acc.name} className={acc.highlight ? 'border-gold/50' : ''}>
                                <h3 className="text-3xl font-display font-bold mb-8">{acc.name}</h3>
                                <div className="space-y-6">
                                    {Object.entries(acc).filter(([k]) => k !== 'name' && k !== 'highlight').map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b border-white/5 pb-4">
                                            <span className="text-white/50 uppercase text-xs tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                                            <span className="text-gold font-bold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button variant={acc.highlight ? 'gold' : 'outline'} className="w-full mt-10">
                                    Select {acc.name}
                                </Button>
                            </Card>
                        ))}
                    </div>

                    <div className="glass-card rounded-3xl overflow-hidden border-white/5">
                        <div className="p-12 text-center border-b border-white/5">
                            <h2 className="text-3xl font-display font-bold">Comparison Table</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="p-6 text-white/50 uppercase text-xs tracking-widest">Feature</th>
                                        <th className="p-6 text-gold font-bold">Standard</th>
                                        <th className="p-6 text-gold font-bold">Raw</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        ['Execution Type', 'Instant', 'Market'],
                                        ['Minimum Lot Size', '0.01', '0.01'],
                                        ['Stop Out Level', '50%', '50%'],
                                        ['News Trading', 'Allowed', 'Allowed'],
                                        ['Expert Advisors', 'Allowed', 'Allowed'],
                                        ['Scalping', 'Allowed', 'Allowed'],
                                    ].map(([feature, std, raw]) => (
                                        <tr key={feature} className="hover:bg-white/5 transition-colors">
                                            <td className="p-6 text-white/70">{feature}</td>
                                            <td className="p-6 text-white/90 font-medium">{std}</td>
                                            <td className="p-6 text-white/90 font-medium">{raw}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Container>
            </div>
            <Footer />
        </main>
    );
};

export default AccountTypesPage;
