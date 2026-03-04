// frontend/src/App.js

// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import PublicLayout from './layouts/PublicLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import MarketsPage from './pages/public/MarketsPage';
import AccountTypesPage from './pages/public/AccountTypesPage';
import ContactPage from './pages/public/ContactPage';
import RiskDisclaimerPage from './pages/public/RiskDisclaimerPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#002366',
                  color: '#EBB900',
                  fontFamily: 'Raleway, sans-serif',
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/account-types" element={<AccountTypesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/risk-disclaimer" element={<RiskDisclaimerPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;