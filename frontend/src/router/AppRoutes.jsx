import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import MarketsPage from '../pages/public/MarketsPage';
import AccountTypesPage from '../pages/public/AccountTypesPage';
import TermsPage from '../pages/public/TermsPage';

import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import PrivacyPage from '../pages/public/PrivacyPage';
import RiskDisclaimerPage from '../pages/public/RiskDisclaimerPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import PromotionsPage from '../pages/public/PromotionsPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/trading/account-types" element={<AccountTypesPage />} />
            <Route path="/account-types" element={<AccountTypesPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/risk-disclaimer" element={<RiskDisclaimerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<HomePage />} />
        </Routes>
    );
};

export default AppRoutes;
