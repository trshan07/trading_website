import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import { marketsData } from './NavConfig';

const MarketMegaMenu = () => {
    const [activeTab, setActiveTab] = useState('Forex');

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[650px] bg-[#000F29] border border-white/10 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden cursor-default ring-1 ring-white/5">
            <div className="flex">
                {/* Categories Tabs (Left Side) */}
                <div className="w-1/3 border-r border-white/5 bg-[#00173D] p-3">
                    {Object.keys(marketsData).map((marketName) => (
                        <button
                            key={marketName}
                            onMouseEnter={() => setActiveTab(marketName)}
                            className={`w-full text-left px-5 py-4 rounded-xl text-sm font-bold transition-all relative mb-1 ${
                                activeTab === marketName
                                    ? 'bg-gold/10 text-gold shadow-sm'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {marketName}
                            {activeTab === marketName && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-gold rounded-l-full" />
                            )}
                        </button>
                    ))}
                </div>
                
                {/* Content Display (Right Side) */}
                <div className="w-2/3 p-8 flex flex-col relative overflow-hidden">
                    {/* Subtle light effect top right */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold/5 blur-[60px] rounded-full pointer-events-none" />

                    <div className="mb-8 relative z-10">
                        <h3 className="text-2xl font-display font-bold text-white mb-3">
                            {activeTab}
                        </h3>
                        <p className="text-[13px] text-white/60 leading-relaxed min-h-[48px] font-medium">
                            {marketsData[activeTab].description}
                        </p>
                    </div>

                    <div className="relative z-10 font-sans">
                        <div className="flex items-center gap-2 mb-4">
                            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold/80 font-bold whitespace-nowrap">
                                Top Instruments
                            </h4>
                            <div className="h-[1px] w-full bg-white/10" />
                        </div>
                        <ul className="space-y-3">
                            {marketsData[activeTab].top5.map((instrument, idx) => (
                                <li key={idx} className="flex items-center text-sm text-white/80 group/item cursor-pointer hover:translate-x-1 transition-transform">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold/40 mr-3 group-hover/item:bg-gold transition-colors" />
                                    <span className="font-bold group-hover/item:text-gold transition-colors">{instrument}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link 
                        to={marketsData[activeTab].path}
                        className="mt-8 flex items-center gap-2 text-xs font-bold text-white hover:text-gold transition-colors uppercase tracking-[0.1em] group/btn"
                    >
                        Trade {activeTab} <HiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MarketMegaMenu;
