import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiChevronLeft } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import authBg from '../../assets/images/auth-bg.png';

const RegisterPage = () => {
  return (
    <main className="bg-navy min-h-screen flex flex-col lg:flex-row overflow-hidden text-white">
      {/* Visual Side (45%) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-navy-dark border-r border-white/5">
        <img
          src={authBg}
          alt="Institutional Trading"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-125 rotate-1"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/80 to-navy" />

        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center border-white/10 group-hover:border-gold/50 transition-all">
              <HiChevronLeft className="w-6 h-6 text-gold" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase text-white/50 group-hover:text-gold transition-colors">Abort Onboarding</span>
          </Link>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Joining Protocol</span>
              <h1 className="text-5xl font-display font-bold leading-tight mb-8">
                Begin Your <br />
                <span className="gradient-text italic">Trading Legacy</span>
              </h1>

              <ul className="space-y-6">
                {[
                  { label: 'Deep Liquidity', desc: 'Direct access to Tier-1 banking nodes.' },
                  { label: 'Zero Lag', desc: 'Sub-30ms execution on all instruments.' },
                  { label: 'Global Reach', desc: 'Trade Forex, Metals, and Indices 24/5.' }
                ].map((item, i) => (
                  <li key={i} className="flex space-x-4">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-widest uppercase">{item.label}</div>
                      <div className="text-xs text-white/40 leading-relaxed">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="pt-12 border-t border-white/5">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-navy bg-white/10 glass-card" />
                ))}
              </div>
              <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">JOIN 1M+ GLOBAL TRADERS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side (55%) */}
      <div className="flex-1 min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 relative bg-navy lg:bg-transparent overflow-y-auto">
        <div className="absolute inset-0 bg-grid-slim opacity-10 pointer-events-none lg:hidden" />

        <div className="max-w-xl w-full mx-auto relative z-10">
          <div className="mb-10 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block mb-8 lg:hidden"
            >
              <Link to="/" className="text-2xl font-bold font-display gradient-text italic">RIZALS TRADE</Link>
            </motion.div>
            <h2 className="text-4xl font-display font-bold mb-3">Provision Account</h2>
            <p className="text-white/40 text-sm">Deployment takes less than 180 seconds</p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-3 ml-1">Entity Name</label>
                <div className="relative group">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors w-4 h-4" />
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-3 ml-1">Surname</label>
                <div className="relative group">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-3 ml-1">Digital Address</label>
                <div className="relative group">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors w-4 h-4" />
                  <input
                    type="email"
                    placeholder="operator@system.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-3 ml-1">Comm. Channel</label>
                <div className="relative group">
                  <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors w-4 h-4" />
                  <input
                    type="tel"
                    placeholder="+1 XXX XXX XXXX"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-3 ml-1">Access Phrase</label>
                <div className="relative group">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors w-4 h-4" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-3 ml-1">Verify Phrase</label>
                <div className="relative group">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors w-4 h-4" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 py-2">
              <input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-white/5 text-gold focus:ring-gold focus:ring-offset-navy accent-gold cursor-pointer mt-1" />
              <p className="text-white/30 text-xs leading-relaxed">
                I confirm the regulatory <Link to="/risk-disclaimer" className="text-gold font-bold hover:underline">Risk Disclaimer</Link> and agree to the institutional <Link to="/terms" className="text-gold font-bold hover:underline">User Agreement</Link> and <Link to="/privacy" className="text-gold font-bold hover:underline">Data Protection Policy</Link>.
              </p>
            </div>

            <Button variant="gold" className="w-full py-4 font-bold text-base rounded-2xl shadow-gold-glow-sm hover:shadow-gold-glow transition-all active:scale-[0.98]">
              Establish Account
            </Button>

            <div className="text-center pt-4 mb-16">
              <p className="text-white/40 text-sm">
                Existing Operator?{' '}
                <Link to="/login" className="text-gold font-bold hover:underline ml-1">Synchronize Account</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
