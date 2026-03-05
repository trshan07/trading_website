import React from 'react';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Card from '../../components/ui/Card';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const AboutPage = () => {
    return (
        <main className="bg-navy min-h-screen">
            <Navbar />
            <div className="pt-32 pb-24">
                <Container>
                    <SectionTitle
                        subtitle="Our Legacy"
                        title="The Rizals Trade Story"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32 items-center">
                        <div className="order-2 lg:order-1">
                            <h3 className="text-3xl font-display font-bold mb-6">Redefining the Trading Landscape</h3>
                            <p className="text-white/60 text-lg leading-relaxed mb-6">
                                Founded by a group of veteran traders and financial technology experts, Rizals Trade was born from a simple vision: to provide retail traders with the same institutional technology and deep liquidity available to large banks.
                            </p>
                        </div>
                        <div className="order-1 lg:order-2 h-96 bg-gold/10 rounded-3xl border border-gold/20 flex items-center justify-center p-12">
                            <span className="text-9xl font-display font-bold opacity-10 select-none">RIZALS</span>
                        </div>
                    </div>
                </Container>
            </div>
            <Footer />
        </main>
    );
};

export default AboutPage;
