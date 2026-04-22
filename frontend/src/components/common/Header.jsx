// frontend/src/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import logoLight from '../../assets/images/logos/logo-light.jpg';
import logoDark from '../../assets/images/logos/logo-dark.png';


const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Markets', path: '/markets' },
    { name: 'Account Types', path: '/account-types' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg py-2 border-slate-200 dark:border-slate-800'
          : 'bg-transparent py-4 border-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={theme === 'dark' ? logoDark : logoLight} 
              alt="Rizal's Trade" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${
                  location.pathname === link.path
                    ? 'text-gold-500 after:w-full'
                    : 'text-slate-600 dark:text-slate-300 hover:text-gold-500 transition-colors'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons & Theme Toggle */}
          <div className="hidden lg:flex items-center space-x-6">
            <ThemeToggle />
            
            <Link
              to="/login"
              className="text-slate-600 dark:text-slate-300 hover:text-gold-500 font-medium transition-colors duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-gold dark:bg-gold-500 dark:text-slate-900 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-gold-500/20"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button & Toggle */}
          <div className="flex items-center space-x-4 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-900 dark:text-white hover:text-gold-500 transition-colors"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="pt-4 pb-6 space-y-3 bg-white dark:bg-slate-900 rounded-2xl p-4 mt-2 shadow-2xl border border-slate-100 dark:border-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 text-base font-bold transition-colors ${
                  location.pathname === link.path
                    ? 'text-gold-500'
                    : 'text-slate-600 dark:text-slate-300 hover:text-gold-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col space-y-4">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-slate-900 dark:text-white hover:text-gold-500 font-bold transition-colors text-center py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="btn-gold text-center w-full py-4 rounded-2xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.div>
      </nav>
    </header>
  );
};

export default Header;