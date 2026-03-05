import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';
import { FaFacebook, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-navy-dark pt-20 pb-10 border-t border-white/5">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="text-2xl font-bold font-display gradient-text italic mb-6 block">
                            RIZALS TRADE
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                            Empowering traders globally with institutional-grade technology, deep liquidity, and a commitment to transparency.
                        </p>
                        <div className="flex space-x-4">
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
                <div className="border-t border-white/5 pt-10 text-white/30 text-xs leading-relaxed space-y-4">
                    <p>
                        <span className="text-white/60 font-bold uppercase block mb-2">Risk Warning:</span>
                        Trading foreign exchange and Contracts for Difference (CFDs) involves a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange, you should carefully consider your investment objectives, level of experience, and risk appetite.
                    </p>
                    <p>
                        The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose. You should be aware of all the risks associated with foreign exchange trading and seek advice from an independent financial advisor if you have any doubts.
                    </p>
                    <p className="pt-4 border-t border-white/5 text-center">
                        &copy; {new Date().getFullYear()} Rizals Trade. All rights reserved.
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
