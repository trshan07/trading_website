import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';
import { resourcesData } from './NavConfig';

const ResourceMegaMenu = () => {
    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[850px] bg-[#000F29] border border-white/10 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden cursor-default p-10 ring-1 ring-white/5">
            {/* Subtle light effect top right */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-3 gap-10 relative z-10">
                {resourcesData.map((section, idx) => (
                    <div key={idx} className="space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold/90 font-sans">
                                {section.category}
                            </h3>
                            <div className="h-0.5 w-8 bg-gold/30 rounded-full" />
                        </div>
                        
                        <div className="space-y-8">
                            {section.items.map((item, itemIdx) => (
                                <Link 
                                    key={itemIdx} 
                                    to={item.path}
                                    className="block group/res relative"
                                >
                                    <h4 className="text-[15px] font-bold text-white group-hover/res:text-gold transition-colors mb-2 flex items-center gap-2">
                                        {item.name}
                                        <HiArrowRight className="w-4 h-4 opacity-0 -translate-x-3 group-hover/res:opacity-100 group-hover/res:translate-x-0 transition-all text-gold" />
                                    </h4>
                                    <p className="text-[12px] text-white/60 leading-relaxed font-medium group-hover/res:text-white/80 transition-colors">
                                        {item.description}
                                    </p>
                                    
                                    {/* Hover Indicator */}
                                    <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gold scale-y-0 group-hover/res:scale-y-100 transition-transform origin-center duration-300" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResourceMegaMenu;
