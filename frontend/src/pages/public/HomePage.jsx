import React, { Suspense, lazy } from 'react';
import Hero from '../../components/sections/Hero';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import DeferredSection from '../../components/common/DeferredSection';
import homeBg from '../../assets/images/home.jpeg';

const TickerSection = lazy(() => import('../../components/sections/TickerSection'));
const AccountTypes = lazy(() => import('../../components/sections/AccountTypes'));
const TradingConditions = lazy(() => import('../../components/sections/TradingConditions'));
const MarketsSection = lazy(() => import('../../components/sections/MarketsSection'));
const PromotionsSection = lazy(() => import('../../components/sections/PromotionsSection'));

const sectionSkeleton = "min-h-[320px] md:min-h-[420px]";

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
                    loading="eager"
                    decoding="async"
                    fetchPriority="low"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000F29]/90 via-[#000F29]/70 to-[#000F29]/95" />
                <div className="absolute inset-0 bg-grid-slim opacity-10" />
            </div>

            <div className="relative z-10">
                <Hero />
                <DeferredSection minHeightClassName="min-h-[72px]">
                    <Suspense fallback={<div className="min-h-[72px]" />}>
                        <TickerSection />
                    </Suspense>
                </DeferredSection>
                <DeferredSection minHeightClassName={sectionSkeleton}>
                    <Suspense fallback={<div className={sectionSkeleton} />}>
                        <AccountTypes />
                    </Suspense>
                </DeferredSection>
                <DeferredSection minHeightClassName={sectionSkeleton}>
                    <Suspense fallback={<div className={sectionSkeleton} />}>
                        <TradingConditions />
                    </Suspense>
                </DeferredSection>
                <DeferredSection minHeightClassName={sectionSkeleton}>
                    <Suspense fallback={<div className={sectionSkeleton} />}>
                        <MarketsSection />
                    </Suspense>
                </DeferredSection>
                <DeferredSection minHeightClassName={sectionSkeleton}>
                    <Suspense fallback={<div className={sectionSkeleton} />}>
                        <PromotionsSection />
                    </Suspense>
                </DeferredSection>
            </div>
            <Footer />
        </main>
    );
};

export default HomePage;
