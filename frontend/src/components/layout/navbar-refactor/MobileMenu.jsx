import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { navLinks, marketsData } from './NavConfig';

const MobileMenu = ({ isOpen, setIsOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="lg:hidden bg-navy-dark border-b border-white/10 py-6 px-4 absolute w-full max-h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                    <div key={link.name}>
                        {link.type === 'standard' ? (
                            <>
                                <div className="text-gold font-bold mb-2 uppercase text-xs tracking-widest">{link.name}</div>
                                <div className="flex flex-col space-y-2 pl-4">
                                    {link.submenu.map((item) => (
                                        <NavLink 
                                            key={item.name} 
                                            to={item.path} 
                                            onClick={() => setIsOpen(false)} 
                                            className="text-white/70 hover:text-white py-1 transition-colors"
                                        >
                                            {item.name}
                                        </NavLink>
                                    ))}
                                </div>
                            </>
                        ) : link.type === 'mega-market' ? (
                            <>
                                <div className="text-gold font-bold mb-2 uppercase text-xs tracking-widest">{link.name}</div>
                                <div className="flex flex-col space-y-2 pl-4">
                                    {Object.keys(marketsData).map((marketName) => (
                                        <NavLink 
                                            key={marketName} 
                                            to={marketsData[marketName].path} 
                                            onClick={() => setIsOpen(false)} 
                                            className="text-white/70 hover:text-white py-1 transition-colors"
                                        >
                                            {marketName}
                                        </NavLink>
                                    ))}
                                </div>
                            </>
                        ) : link.type === 'mega-resource' ? (
                            <>
                                <div className="text-gold font-bold mb-2 uppercase text-xs tracking-widest">{link.name}</div>
                                <div className="flex flex-col space-y-2 pl-4">
                                    <NavLink to="/resources/tools" onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white py-1">Trading Tools</NavLink>
                                    <NavLink to="/resources/analysis" onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white py-1">Market Analysis</NavLink>
                                </div>
                            </>
                        ) : (
                            <NavLink 
                                to={link.path} 
                                onClick={() => setIsOpen(false)} 
                                className="font-medium text-white/80 hover:text-white transition-colors"
                            >
                                {link.name}
                            </NavLink>
                        )}
                    </div>
                ))}
                <hr className="border-white/10" />
                <Link to="/login" className="text-center py-3 text-white/70" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="btn-gold text-center py-3" onClick={() => setIsOpen(false)}>Register</Link>
            </div>
        </div>
    );
};

export default MobileMenu;
