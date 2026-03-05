import React from 'react';
import Container from '../../components/layout/Container';
import SectionTitle from '../../components/ui/SectionTitle';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const TermsPage = () => {
    return (
        <main className="bg-navy min-h-screen">
            <Navbar />
            <div className="pt-32 pb-24">
                <Container>
                    <SectionTitle subtitle="Legal Agreement" title="Terms & Conditions" />
                    <div className="max-w-4xl mx-auto glass-card p-12 rounded-3xl border-white/5">
                        <h3 className="text-2xl font-display font-bold text-gold mb-6">1. Introduction</h3>
                        <p className="text-white/60 leading-relaxed">Terms of service governed by global law...</p>
                    </div>
                </Container>
            </div>
            <Footer />
        </main>
    );
};

export default TermsPage;
