// frontend/src/pages/public/AboutPage.jsx
import React from 'react';

const AboutPage = () => {
  return (
    <div className="pt-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">About Us</h1>
          <p className="text-lg text-navy-600 mb-8">
            Learn more about Rizal's Trade and our mission to provide accessible trading for everyone.
          </p>
          {/* Add more content here */}
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;