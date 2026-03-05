import React from 'react';
import Hero from '../../components/sections/Hero';
import TickerSection from '../../components/sections/TickerSection';
import AccountTypes from '../../components/sections/AccountTypes';
import TradingConditions from '../../components/sections/TradingConditions';
import MarketsSection from '../../components/sections/MarketsSection';
import PromotionsSection from '../../components/sections/PromotionsSection';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const HomePage = () => {
    return (
        <main className="bg-navy min-h-screen">
            <Navbar />
            <Hero />
            <TickerSection />
            <AccountTypes />
            <TradingConditions />
            <MarketsSection />
            <PromotionsSection />
            <Footer />
        </main>
    );
};

export default HomePage;
