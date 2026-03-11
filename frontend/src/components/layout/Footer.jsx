import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="relative z-10 bg-[#000F29]/80 backdrop-blur-lg pt-16 md:pt-24 pb-8 md:pb-12 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <Container>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-16">
                    {/* Brand - Full width on mobile */}
                    <div className="col-span-2 lg:col-span-1 text-center lg:text-left mb-4 md:mb-0">
                        <Link to="/" className="text-2xl font-bold font-display gradient-text italic mb-4 md:mb-6 block">
                            RIZALS TRADE
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm mx-auto lg:mx-0">
                            Empowering traders globally with institutional-grade technology, deep liquidity, and a commitment to transparency.
                        </p>
                        <div className="flex justify-center md:justify-start space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-gold hover:text-navy transition-all">
                                <FaFacebook />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-gold hover:text-navy transition-all">
                                <FaTwitter />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-gold hover:text-navy transition-all">
                                <FaLinkedin />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-gold hover:text-navy transition-all">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Trading</h4>
                        <ul className="space-y-4 text-white/50 text-sm">
                            <li><Link to="/trading/account-types" className="hover:text-gold transition-colors">Account Types</Link></li>
                            <li><Link to="/trading/conditions" className="hover:text-gold transition-colors">Conditions</Link></li>
                            <li><Link to="/markets" className="hover:text-gold transition-colors">Markets Overview</Link></li>
                            <li><Link to="/promotions" className="hover:text-gold transition-colors">Promotions</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Markets</h4>
                        <ul className="space-y-4 text-white/50 text-sm">
                            <li><Link to="/markets/forex" className="hover:text-gold transition-colors">Forex</Link></li>
                            <li><Link to="/markets/commodities" className="hover:text-gold transition-colors">Commodities</Link></li>
                            <li><Link to="/markets/indices" className="hover:text-gold transition-colors">Indices</Link></li>
                            <li><Link to="/markets/crypto" className="hover:text-gold transition-colors">Cryptocurrencies</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-white/50 text-sm">
                            <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
                            <li><Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/risk-disclaimer" className="hover:text-gold transition-colors">Risk Disclaimer</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Risk Disclaimer */}
                <div className="border-t border-white/5 pt-10 text-[10px] md:text-xs leading-relaxed space-y-4 text-center">
                    <p className="max-w-3xl mx-auto">
                        <span className="text-white/60 font-bold uppercase block mb-2">Risk Warning:</span>
                        Trading foreign exchange and CFDs on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
                    </p>
                    <p className="pt-4 border-t border-white/5">
                        &copy; {new Date().getFullYear()} Rizals Trade. All rights reserved.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
