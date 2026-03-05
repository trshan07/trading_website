import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import Container from './Container';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        {
            name: 'Trading',
            submenu: [
                { name: 'Account Types', path: '/trading/account-types' },
                { name: 'Conditions', path: '/trading/conditions' },
            ],
        },
        {
            name: 'Markets',
            submenu: [
                { name: 'Forex', path: '/markets/forex' },
                { name: 'Commodities', path: '/markets/commodities' },
                { name: 'Indices', path: '/markets/indices' },
                { name: 'Shares', path: '/markets/shares' },
                { name: 'Crypto', path: '/markets/crypto' },
            ],
        },
        {
            name: 'Resources',
            submenu: [
                { name: 'Platforms', path: '/resources/platforms' },
                { name: 'Tools', path: '/resources/tools' },
                { name: 'Analysis', path: '/resources/analysis' },
            ],
        },
        {
            name: 'Company',
            submenu: [
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
            ],
        },
        { name: 'Promotions', path: '/promotions' },
    ];

    return (
        <nav className="fixed w-full z-50 bg-navy/80 backdrop-blur-lg border-b border-white/10">
            <Container>
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold font-display gradient-text italic">RIZALS TRADE</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <div key={link.name} className="relative group">
                                {link.submenu ? (
                                    <button className="flex items-center space-x-1 text-white/80 hover:text-gold transition-colors font-medium">
                                        <span>{link.name}</span>
                                        <HiChevronDown className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <NavLink
                                        to={link.path}
                                        end={link.path === '/'}
                                        className={({ isActive }) =>
                                            `relative font-medium transition-colors duration-300 ${isActive
                                                ? 'text-gold'
                                                : 'text-white/70 hover:text-white'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {link.name}
                                                {isActive && (
                                                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                )}

                                {link.submenu && (
                                    <div className="absolute top-full left-0 mt-2 w-48 glass-card rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                                        {link.submenu.map((item) => (
                                            <NavLink
                                                key={item.name}
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `block px-4 py-3 text-sm transition-colors ${isActive
                                                        ? 'text-gold bg-gold/10 font-semibold'
                                                        : 'text-white/80 hover:bg-gold/10 hover:text-gold'
                                                    }`
                                                }
                                            >
                                                {item.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <Link to="/login" className="text-white hover:text-gold transition-colors font-medium">Login</Link>
                        <Link to="/register" className="btn-gold py-2 block text-center">Register</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <HiX className="w-8 h-8" /> : <HiMenu className="w-8 h-8" />}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-navy-dark border-b border-white/10 py-6 px-4">
                    <div className="flex flex-col space-y-4">
                        {navLinks.map((link) => (
                            <div key={link.name}>
                                {link.submenu ? (
                                    <>
                                        <div className="text-gold font-bold mb-2 uppercase text-xs tracking-widest">{link.name}</div>
                                        <div className="flex flex-col space-y-2 pl-4">
                                            {link.submenu.map((item) => (
                                                <NavLink
                                                    key={item.name}
                                                    to={item.path}
                                                    className={({ isActive }) =>
                                                        `transition-colors ${isActive
                                                            ? 'text-gold font-semibold'
                                                            : 'text-white/70 hover:text-white'
                                                        }`
                                                    }
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {item.name}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <NavLink
                                        to={link.path}
                                        end={link.path === '/'}
                                        className={({ isActive }) =>
                                            `font-medium transition-colors ${isActive
                                                ? 'text-gold'
                                                : 'text-white/80 hover:text-white'
                                            }`
                                        }
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </NavLink>
                                )}
                            </div>
                        ))}
                        <hr className="border-white/10" />
                        <Link to="/login" className="text-center py-3 text-white" onClick={() => setIsOpen(false)}>Login</Link>
                        <Link to="/register" className="btn-gold text-center py-3" onClick={() => setIsOpen(false)}>Register</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
