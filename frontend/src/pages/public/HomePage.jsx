// frontend/src/pages/public/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaShieldAlt, 
  FaGlobe, 
  FaMobileAlt,
  FaArrowRight,
  FaUsers,
  FaAward,
  FaClock
} from 'react-icons/fa';
import { HiOutlineChartBar, HiOutlineTrendingUp } from 'react-icons/hi';

const HomePage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <HiOutlineChartBar className="h-8 w-8 text-gold-500" />,
      title: 'Advanced Trading Tools',
      description: 'Access professional-grade charts, indicators, and analysis tools.'
    },
    {
      icon: <FaShieldAlt className="h-8 w-8 text-gold-500" />,
      title: 'Secure Platform',
      description: 'Your funds and data are protected with bank-level security.'
    },
    {
      icon: <FaGlobe className="h-8 w-8 text-gold-500" />,
      title: 'Global Markets',
      description: 'Trade Forex, Indices, Commodities, and Stocks from one account.'
    },
    {
      icon: <FaMobileAlt className="h-8 w-8 text-gold-500" />,
      title: 'Mobile Trading',
      description: 'Trade on the go with our powerful mobile trading app.'
    }
  ];

  const stats = [
    { icon: FaUsers, value: '50K+', label: 'Active Traders' },
    { icon: FaAward, value: '15+', label: 'Industry Awards' },
    { icon: FaClock, value: '10+', label: 'Years Experience' },
    { icon: FaGlobe, value: '100+', label: 'Countries' }
  ];

  const markets = [
    { name: 'Forex', change: '+2.3%', volume: '$6.6T' },
    { name: 'Indices', change: '+1.8%', volume: '$3.2T' },
    { name: 'Commodities', change: '-0.5%', volume: '$1.8T' },
    { name: 'Stocks', change: '+3.1%', volume: '$5.4T' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-bg min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-500 rounded-full filter blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Trade Smarter with{' '}
                <span className="gradient-text">Rizal's Trade</span>
              </h1>
              <p className="text-xl text-navy-200 mb-8">
                Experience the future of online trading with our cutting-edge platform. 
                Access global markets, advanced tools, and professional support.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary text-lg">
                  Start Trading Now
                  <FaArrowRight className="inline ml-2" />
                </Link>
                <Link to="/markets" className="btn-secondary text-lg">
                  View Markets
                </Link>
              </div>

              {/* Market Ticker */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                {markets.map((market) => (
                  <div key={market.name} className="bg-navy-800 bg-opacity-50 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-navy-300 text-sm">{market.name}</p>
                    <p className={`text-lg font-bold ${market.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {market.change}
                    </p>
                    <p className="text-navy-400 text-xs">Vol: {market.volume}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Trading Interface Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-gold-500 border-opacity-30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gold-500 text-sm">Live Preview</span>
                </div>
                
                {/* Simulated Chart */}
                <div className="h-48 bg-gradient-to-r from-navy-700 to-navy-800 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full h-32 bg-gradient-to-t from-gold-500 to-transparent opacity-30"></div>
                  </div>
                  {/* Candlestick simulation */}
                  <div className="absolute bottom-0 left-0 w-full flex items-end justify-around px-4">
                    {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={`w-2 ${i % 2 === 0 ? 'bg-green-500' : 'bg-red-500'}`} style={{ height: `${height}px` }}></div>
                        <div className="w-4 h-0.5 bg-gold-500 mt-1"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trading Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-navy-900 rounded-lg p-3">
                    <p className="text-navy-300 text-xs">EUR/USD</p>
                    <p className="text-white font-bold">1.09234</p>
                    <p className="text-green-400 text-xs">+0.23%</p>
                  </div>
                  <div className="bg-navy-900 rounded-lg p-3">
                    <p className="text-navy-300 text-xs">BTC/USD</p>
                    <p className="text-white font-bold">43,567.89</p>
                    <p className="text-red-400 text-xs">-1.45%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-10 w-10 text-gold-500 mx-auto mb-4" />
                <h3 className="text-3xl md:text-4xl font-bold text-navy-900 mb-2">{stat.value}</h3>
                <p className="text-navy-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-navy-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title">
              Why Choose{' '}
              <span className="gradient-text">Rizal's Trade</span>
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Experience trading with a platform designed for both beginners and professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card group hover:border-gold-500"
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-navy-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Trading Journey?
            </h2>
            <p className="text-xl text-navy-200 mb-8 max-w-2xl mx-auto">
              Join thousands of traders who trust Rizal's Trade for their trading needs
            </p>
            <Link to="/register" className="btn-primary text-lg inline-flex items-center">
              Create Free Account
              <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;