import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiLockClosed, HiCheck, HiOutlineEye, HiOutlineEyeOff, HiExclamationCircle } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import authBg from '../../assets/images/real_trading_bg.png';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const handleKeyUp = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      setErrorMsg("Registration unavailable during active trading session.");
    }, 2000);
  };

  return (
    <main className="bg-navy min-h-screen relative text-white font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={authBg}
          alt="Trading Network"
          className="w-full h-full object-cover opacity-60 mix-blend-screen scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/60 to-navy/90" />
        <div className="absolute inset-0 bg-grid-slim opacity-20 pointer-events-none" />
        
        {/* Advanced Animated Data Node Overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
           <svg className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2" viewBox="0 0 1000 1000">
             {/* Orbital Data Rings */}
             <motion.circle cx="500" cy="500" r="300" stroke="rgba(212, 175, 55, 0.1)" strokeWidth="1" fill="none" strokeDasharray="10 20" 
                 animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
             />
             <motion.circle cx="500" cy="500" r="450" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="1" fill="none" strokeDasharray="5 15" 
                 animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
             />
             
             {/* Floating Nodes & Connecting Vectors */}
             <motion.path d="M200,300 L350,250 L500,400 L650,300 L800,450" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" />
             <motion.path d="M350,250 L400,100" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" />
             <motion.path d="M650,300 L750,150" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" />

             {/* Ping Nodes */}
             <motion.circle cx="350" cy="250" fill="#22c55e" 
                initial={{ opacity: 0.2, r: 2 }}
                animate={{ opacity: [0.2, 1, 0.2], r: [2, 4, 2] }} 
                transition={{ duration: 3, repeat: Infinity }}
             />
             <motion.circle cx="500" cy="400" fill="#d4af37" 
                initial={{ opacity: 0.2, r: 3 }}
                animate={{ opacity: [0.2, 1, 0.2], r: [3, 6, 3] }} 
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
             />
             <motion.circle cx="650" cy="300" fill="#22c55e" 
                initial={{ opacity: 0.2, r: 2 }}
                animate={{ opacity: [0.2, 1, 0.2], r: [2, 4, 2] }} 
                transition={{ duration: 2.5, repeat: Infinity, delay: 2 }}
             />
             
             {/* Scanning Line sweep */}
             <motion.line x1="0" y1="0" x2="1000" y2="0" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="2"
               animate={{ y: [0, 1000, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             />
           </svg>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center lg:justify-between min-h-screen py-6 pb-20 gap-12 lg:gap-16">
        
        {/* Header Section */}
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8 }}
           className="text-center lg:text-left mb-6 mt-6 md:mt-2 lg:max-w-xl"
        >
          <div className="flex justify-center lg:justify-start mb-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <span className="text-3xl font-display font-bold gradient-text italic tracking-wider">RIZALS TRADE</span>
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gold tracking-wide mb-2">
            Operator Registration Terminal
          </h1>
          <p className="text-white/60 text-sm md:text-base italic">
            Secure provisioning protocol for new operators.
          </p>
          
          <div className="flex flex-col items-center lg:items-start mt-4 space-y-1.5 text-[10px] text-white/50 tracking-widest uppercase hidden md:flex">
             <div className="flex flex-col lg:items-start space-y-2 lg:space-y-1.5">
                <div className="flex items-center space-x-2 text-green-400">
                   <HiLockClosed className="w-4 h-4" />
                   <span>Protected by 256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                   <HiCheck className="w-4 h-4 text-white/50" />
                   <span>Identity Verification Required</span>
                </div>
                <div className="flex items-center space-x-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                   <span>Global Gateway v2.3</span>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Register Form Card */}
        <motion.div
           initial={{ opacity: 0, x: 30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="w-full max-w-2xl glass-card border border-white/10 rounded-2xl shadow-2xl shadow-navy-dark overflow-hidden backdrop-blur-md bg-navy-dark/40 mb-10 lg:mb-0 lg:mx-0 mx-auto"
        >
          {/* Card Header */}
          <div className="py-5 border-b border-white/10 bg-white/5 text-center relative flex justify-center items-center px-6">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
             <h2 className="text-xl font-display text-white tracking-widest">Account Provisioning</h2>
          </div>

          <div className="p-6 md:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-lg mb-4"
                  >
                    <HiExclamationCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 ml-1">First Name</label>
                    <div className="relative group">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Given Name"
                        className="w-full bg-navy/50 border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/60 focus:bg-navy/80 transition-all placeholder:text-white/30"
                    />
                    </div>
                </div>
                <div>
                     <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 ml-1">Last Name</label>
                    <div className="relative group">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Family Name"
                        className="w-full bg-navy/50 border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/60 focus:bg-navy/80 transition-all placeholder:text-white/30"
                    />
                    </div>
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                     <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 ml-1">Email Address (Terminal ID)</label>
                    <div className="relative group">
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors w-5 h-5" />
                    <input
                        type="email"
                        placeholder="operator@system.com"
                        className="w-full bg-navy/50 border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/60 focus:bg-navy/80 transition-all placeholder:text-white/30"
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 ml-1">Phone Number</label>
                    <div className="relative group">
                    <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors w-5 h-5" />
                    <input
                        type="tel"
                        placeholder="+1 XXX XXX XXXX"
                        className="w-full bg-navy/50 border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-gold/60 focus:bg-navy/80 transition-all placeholder:text-white/30"
                    />
                    </div>
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 ml-1">Access Phrase (Password)</label>
                    <div className="relative group">
                      <div className="relative">
                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors w-5 h-5" />
                        <input
                            type={showPassword ? "text" : "password"}
                            onKeyUp={handleKeyUp}
                            placeholder="••••••••"
                            className="w-full bg-navy/50 border border-white/20 rounded-lg py-3 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-gold/60 focus:bg-navy/80 transition-all placeholder:text-white/30"
                        />
                        <div 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </div>
                      </div>
                      <AnimatePresence>
                        {capsLockOn && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-amber-400 text-[10px] uppercase tracking-wider mt-2 flex items-center space-x-1"
                          >
                            <HiExclamationCircle className="w-3 h-3" />
                            <span>Caps Lock is ON</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                </div>
                <div>
                    <label className="block text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mb-2 ml-1">Verify Phrase</label>
                    <div className="relative group">
                      <div className="relative">
                        <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors w-5 h-5" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            onKeyUp={handleKeyUp}
                            placeholder="••••••••"
                            className="w-full bg-navy/50 border border-white/20 rounded-lg py-3 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-gold/60 focus:bg-navy/80 transition-all placeholder:text-white/30"
                        />
                        <div 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 py-2">
                <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-navy/50 text-gold focus:ring-gold focus:ring-offset-navy accent-gold cursor-pointer mt-0.5" />
                <p className="text-white/50 text-[10px] leading-relaxed uppercase tracking-wider">
                    I confirm the regulatory <Link to="/risk-disclaimer" className="text-gold hover:underline">Risk Disclaimer</Link> and agree to the institutional <Link to="/terms" className="text-gold hover:underline">User Agreement</Link>.
                </p>
              </div>

              <Button 
                variant="gold" 
                type="submit"
                disabled={isLoading}
                className="relative overflow-hidden group w-full py-3.5 mt-2 font-bold text-sm tracking-widest rounded-lg shadow-gold-glow hover:shadow-gold-glow-lg transition-all active:scale-[0.98] uppercase flex justify-center items-center animate-shine"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-navy-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Provisioning...</span>
                  </span>
                ) : (
                  <>Establish Account <span className="ml-2">→</span></>
                )}
              </Button>
            </form>
          </div>
          
           {/* Login Link inside card bottom */}
          <div className="bg-navy-dark/60 py-4 px-6 border-t border-white/10 flex justify-center items-center text-[10px] uppercase font-bold tracking-widest">
             <span className="text-white/40 mr-2">Existing Operator?</span>
             <Link to="/login" className="text-gold hover:text-white transition-colors">Synchronize Account</Link>
          </div>
        </motion.div>
      </div>

       {/* Footer Status Bar (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 w-full border-t border-white/10 bg-navy-dark/80 backdrop-blur-md z-20 hidden md:block">
         <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between text-[10px] tracking-widest uppercase text-white/40 space-y-4 md:space-y-0">
            
            <div className="flex items-center space-x-6">
                <span>Rizals Trade Ltd.</span>
                <span className="w-px h-4 bg-white/20 hidden md:block"></span>
                <span className="hidden md:block">Secure Operator Network</span>
                <span className="w-px h-4 bg-white/20 hidden md:block"></span>
                <span className="flex items-center space-x-2">
                    <span>System Status:</span>
                    <span className="text-green-500 font-bold">Online</span>
                </span>
            </div>
            
            <div className="flex items-center space-x-6">
                <span className="flex items-center space-x-2 hidden md:flex">
                    <span>Server Status:</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                    <span className="text-white">Online</span>
                </span>
                <span className="w-px h-4 bg-white/20 hidden md:block"></span>
                <span>Latency: <span className="text-white font-bold">18ms</span></span>
                <span className="w-px h-4 bg-white/20"></span>
                <span>Network: <span className="text-white">Global Grid</span></span>
            </div>
         </div>

         <div className="border-t border-white/5 py-2 w-full overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 whitespace-nowrap flex text-[10px] tracking-widest font-mono text-white/50">
               <div className="animate-ticker space-x-12 pr-12">
                  <span className="flex items-center space-x-2"><span>EURUSD 1.0834</span><span className="text-green-500">▲</span></span>
                  <span className="flex items-center space-x-2"><span>BTCUSD 63,200</span><span className="text-red-500">▼</span></span>
                  <span className="flex items-center space-x-2"><span>XAUUSD 2,148</span><span className="text-green-500">▲</span></span>
                  <span className="flex items-center space-x-2"><span>GBPUSD 1.2645</span><span className="text-red-500">▼</span></span>
                  <span className="flex items-center space-x-2"><span>USDJPY 150.32</span><span className="text-green-500">▲</span></span>
                  <span className="flex items-center space-x-2"><span>ETHUSD 3,450</span><span className="text-green-500">▲</span></span>
                  
                  {/* Duplicated for seamless loop */}
                  <span className="flex items-center space-x-2"><span>EURUSD 1.0834</span><span className="text-green-500">▲</span></span>
                  <span className="flex items-center space-x-2"><span>BTCUSD 63,200</span><span className="text-red-500">▼</span></span>
                  <span className="flex items-center space-x-2"><span>XAUUSD 2,148</span><span className="text-green-500">▲</span></span>
                  <span className="flex items-center space-x-2"><span>GBPUSD 1.2645</span><span className="text-red-500">▼</span></span>
                  <span className="flex items-center space-x-2"><span>USDJPY 150.32</span><span className="text-green-500">▲</span></span>
                  <span className="flex items-center space-x-2"><span>ETHUSD 3,450</span><span className="text-green-500">▲</span></span>
               </div>
            </div>
         </div>
      </div>
    </main>
  );
};

export default RegisterPage;
