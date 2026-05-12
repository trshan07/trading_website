import React, { Suspense, lazy } from 'react';
import Hero from '../../components/sections/Hero';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Container from '../../components/layout/Container';
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
                <section className="pb-12 md:pb-16">
                    <Container>
                        <div className="max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm px-6 py-8 md:px-10 md:py-10 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                            <p className="text-gold text-xs font-bold tracking-[0.28em] uppercase mb-4">
                                Real-Time Market Access
                            </p>
                            <h2 className="text-2xl md:text-4xl font-display font-bold leading-tight mb-4">
                                Trade global markets with TikTrades from one advanced online trading platform
                            </h2>
                            <p className="text-white/65 text-sm md:text-lg leading-relaxed max-w-4xl">
                                TikTrades gives traders access to forex, cryptocurrencies, commodities, stocks, and indices with real-time charts, market analysis tools, account options, and fast execution designed for active online trading.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3 text-xs md:text-sm text-white/75">
                                <span className="rounded-full border border-gold/20 bg-gold/10 px-4 py-2">Forex Trading</span>
                                <span className="rounded-full border border-gold/20 bg-gold/10 px-4 py-2">Crypto Trading</span>
                                <span className="rounded-full border border-gold/20 bg-gold/10 px-4 py-2">Stock Trading</span>
                                <span className="rounded-full border border-gold/20 bg-gold/10 px-4 py-2">Commodities</span>
                                <span className="rounded-full border border-gold/20 bg-gold/10 px-4 py-2">Live Charts</span>
                                <span className="rounded-full border border-gold/20 bg-gold/10 px-4 py-2">Market Analysis</span>
                            </div>
                        </div>
                    </Container>
                </section>
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
