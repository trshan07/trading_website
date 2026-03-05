import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiChevronLeft } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import authBg from '../../assets/images/auth-bg.png';

const ForgotPasswordPage = () => {
    return (
        <main className="bg-navy min-h-screen flex flex-col lg:flex-row overflow-hidden text-white">
            {/* Visual Side (60%) */}
            <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-navy-dark">
                <img
                    src={authBg}
                    alt="Institutional Trading"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity scale-110 grayscale"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-navy via-navy/90 to-transparent" />

                <div className="relative z-10 w-full flex flex-col justify-between p-16">
                    <Link to="/login" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center border-white/10 group-hover:border-gold/50 transition-all">
                            <HiChevronLeft className="w-6 h-6 text-gold" />
                        </div>
                        <span className="text-sm font-bold tracking-widest uppercase text-white/50 group-hover:text-gold transition-colors">Back to Login</span>
                    </Link>

                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Security Protocol</span>
                            <h1 className="text-6xl font-display font-bold leading-tight mb-8">
                                Access <br />
                                <span className="gradient-text italic">Recovery</span>
                            </h1>
                            <p className="text-white/40 text-lg leading-relaxed mb-12">
                                For your security, we follow a strict multi-factor authentication protocol to recover lost terminal access.
                            </p>
                        </motion.div>
                    </div>

                    <div className="flex items-center space-x-6 text-white/20 text-xs font-bold tracking-widest uppercase">
                        <span>End-to-End Encryption</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <span>Biometric Verification Ready</span>
                    </div>
                </div>
            </div>

            {/* Form Side (40%) */}
            <div className="flex-1 min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative bg-navy lg:bg-transparent">
                <div className="absolute inset-0 bg-grid-slim opacity-10 pointer-events-none lg:hidden" />

                <div className="max-w-md w-full mx-auto relative z-10">
                    <div className="mb-12">
                        <h2 className="text-3xl font-display font-bold mb-3">Recover Credentials</h2>
                        <p className="text-white/40 text-sm">Enter your registered Terminal ID to receive recovery instructions.</p>
                    </div>

                    <form className="space-y-6">
                        <div>
                            <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-3 ml-1">Terminal ID (Email)</label>
                            <div className="relative group">
                                <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors w-4 h-4" />
                                <input
                                    type="email"
                                    placeholder="operator@system.com"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <Button variant="gold" className="w-full py-4 font-bold text-base rounded-2xl shadow-gold-glow-sm hover:shadow-gold-glow transition-all active:scale-[0.98]">
                            Initiate Recovery
                        </Button>

                        <div className="text-center pt-8">
                            <p className="text-white/40 text-sm">
                                Remembered your access?{' '}
                                <Link to="/login" className="text-gold font-bold hover:underline ml-1">Login Instead</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="mt-20 lg:absolute lg:bottom-12 lg:left-20 lg:right-20">
                    <p className="text-center lg:text-left text-[10px] text-white/20 uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} RIZALS TRADE INTERNET PROTOCOL. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;
