import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import Container from './Container';
import { useTheme } from '../../context/ThemeContext';
import logoLight from '../../assets/images/logos/logo-light.jpg';
import logoDark from '../../assets/images/logos/logo-dark.png';


// Refactored Sub-components
import { navLinks } from './navbar-refactor/NavConfig';
import MarketMegaMenu from './navbar-refactor/MarketMegaMenu';
import ResourceMegaMenu from './navbar-refactor/ResourceMegaMenu';
import MobileMenu from './navbar-refactor/MobileMenu';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();


    return (
        <nav className="fixed w-full z-50 bg-navy/80 backdrop-blur-lg border-b border-white/10">
            <Container>
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img 
                          src={logoDark} 
                          alt="TIK TRADES" 
                          className="h-10 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-8 h-full">
                        {navLinks.map((link) => (
                            <div key={link.name} className="relative group h-full flex items-center">
                                {/* Navigation Trigger */}
                                {link.type !== 'link' ? (
                                    <button className="flex items-center space-x-1 text-white/80 hover:text-gold transition-colors font-medium h-full">
                                        <span>{link.name}</span>
                                        <HiChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                                    </button>
                                ) : (
                                    <NavLink
                                        to={link.path}
                                        end={link.path === '/'}
                                        className={({ isActive }) =>
                                            `relative font-medium transition-colors duration-300 h-full flex items-center ${isActive
                                                ? 'text-gold'
                                                : 'text-white/70 hover:text-white'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {link.name}
                                                {isActive && (
                                                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                )}

                                {/* Standard Submenu */}
                                {link.type === 'standard' && (
                                    <div className="absolute top-20 left-0 w-56 bg-[#000F29] border border-white/10 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5 py-2">
                                        {link.submenu.map((item) => (
                                            <NavLink
                                                key={item.name}
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `block px-4 py-2 text-sm transition-colors ${isActive
                                                        ? 'text-gold bg-white/5 font-semibold'
                                                        : 'text-white/80 hover:bg-white/5 hover:text-gold'
                                                    }`
                                                }
                                            >
                                                {item.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}

                                {/* Market Mega Menu */}
                                {link.type === 'mega-market' && <MarketMegaMenu />}

                                {/* Resource Mega Menu */}
                                {link.type === 'mega-resource' && <ResourceMegaMenu />}
                            </div>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <Link to="/login" className="text-white/80 hover:text-gold transition-colors font-bold text-xs uppercase tracking-widest">Login</Link>
                        <Link to="/register" className="btn-gold py-2.5 px-6 block text-center text-xs font-black tracking-widest">Register</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <HiX className="w-8 h-8" /> : <HiMenu className="w-8 h-8" />}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu */}
            <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
        </nav>
    );
};

export default Navbar;
