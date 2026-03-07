// frontend/src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa';
import { HiOutlineChartBar } from 'react-icons/hi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
      { name: 'Blog', path: '/blog' },
    ],
    trading: [
      { name: 'Markets', path: '/markets' },
      { name: 'Account Types', path: '/account-types' },
      { name: 'Trading Platforms', path: '/platforms' },
      { name: 'Education', path: '/education' },
    ],
    resources: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Webinars', path: '/webinars' },
    ],
    legal: [
      { name: 'Terms & Conditions', path: '/terms' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Risk Disclaimer', path: '/risk-disclaimer' },
      { name: 'Compliance', path: '/compliance' },
    ],
  };

  const socialLinks = [
    { icon: FaFacebookF, href: 'https://facebook.com', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="relative z-10 bg-[#010816] text-white pt-24 pb-12 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <HiOutlineChartBar className="h-8 w-8 text-gold-500" />
              <span className="text-2xl font-bold">
                <span className="text-white">Rizal's</span>
                <span className="text-gold-500">Trade</span>
              </span>
            </Link>
            <p className="text-navy-200 mb-4 text-sm">
              Your trusted partner in online trading. Experience the future of investing with our cutting-edge platform.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-navy-800 rounded-full flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-navy-900 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-gold-500 font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-navy-200 hover:text-gold-500 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold-500 font-semibold text-lg mb-4">Trading</h3>
            <ul className="space-y-2">
              {footerLinks.trading.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-navy-200 hover:text-gold-500 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold-500 font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-navy-200 hover:text-gold-500 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold-500 font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-navy-200 hover:text-gold-500 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-navy-700 pt-8 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-navy-200 mb-4">
              Subscribe to our newsletter for market insights and trading tips
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-navy-800 border border-navy-600 text-white placeholder-navy-400 focus:outline-none focus:border-gold-500"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-700 pt-8 text-center text-navy-300 text-sm">
          <p>&copy; {currentYear} Rizal's Trade. All rights reserved.</p>
          <p className="mt-2 max-w-4xl mx-auto">
            Trading foreign exchange and CFDs on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;