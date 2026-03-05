// frontend/src/pages/public/LoginPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const LoginPage = () => {
 return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-navy-900 to-navy-700">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Your Account</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <span className="px-3 text-gray-500"><FaEnvelope /></span>
              <input
                type="email"
                id="email"
                placeholder=" Enter your email"
                className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md"
              />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <div className="flex items-center border border-gray-300 rounded-md">
              <span className="px-3 text-gray-500"><FaLock /></span>
              <input
                type="password"
                id="password"
                placeholder=" Enter your password"
                className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-500 rounded-md"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gold-500 text-white py-2 rounded-md hover:bg-gold-600 transition-colors duration-300"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-gold-500 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;