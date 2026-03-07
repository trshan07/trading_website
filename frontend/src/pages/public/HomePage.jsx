import React from 'react';
import Hero from '../../components/sections/Hero';
import TickerSection from '../../components/sections/TickerSection';
import AccountTypes from '../../components/sections/AccountTypes';
import TradingConditions from '../../components/sections/TradingConditions';
import MarketsSection from '../../components/sections/MarketsSection';
import PromotionsSection from '../../components/sections/PromotionsSection';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import homeBg from '../../assets/images/home.jpeg';

const HomePage = () => {
    return (
        <main className="bg-[#000F29] min-h-screen relative font-sans text-white overflow-hidden">
            <Navbar />

            {/* Global Page Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <img 
                    src={homeBg} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/90 via-[#000F29]/70 to-[#000F29]/95" />
                <div className="absolute inset-0 bg-grid-slim opacity-10" />
            </div>

            <div className="relative z-10">
                <Hero />
                <TickerSection />
                <AccountTypes />
                <TradingConditions />
                <MarketsSection />
                <PromotionsSection />
            </div>
            <Footer />
        </main>
    );
};

export default HomePage;
