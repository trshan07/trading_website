import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import MarketsPage from '../pages/public/MarketsPage';
import MarketExplorerPage from '../pages/public/MarketExplorerPage';
import ResourceExplorerPage from '../pages/public/ResourceExplorerPage';
import AccountTypesPage from '../pages/public/AccountTypesPage';
import ConditionsPage from '../pages/public/ConditionsPage';
import TermsPage from '../pages/public/TermsPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import PrivacyPage from '../pages/public/PrivacyPage';
import RiskDisclaimerPage from '../pages/public/RiskDisclaimerPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import ResetPasswordPage from '../pages/public/ResetPasswordPage';
import PromotionsPage from '../pages/public/PromotionsPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UsersPage from '../pages/admin/UsersPage';
import FundingRequestsPage from '../pages/admin/FundingRequestsPage';
import TradesPage from '../pages/admin/TradesPage';
import ReportsPage from '../pages/admin/ReportsPage';
import AuditPage from '../pages/admin/AuditPage';
import AdminSettingsPage from '../pages/admin/SettingsPage';
import KYCManagementPage from '../pages/admin/KYCManagementPage';
import TransactionsPage from '../pages/admin/TransactionsPage';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/markets/:category" element={<MarketExplorerPage />} />
            <Route path="/resources/:category" element={<ResourceExplorerPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/trading/account-types" element={<AccountTypesPage />} />
            <Route path="/trading/conditions" element={<ConditionsPage />} />
            <Route path="/account-types" element={<AccountTypesPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/risk-disclaimer" element={<RiskDisclaimerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<HomePage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/funding" element={<FundingRequestsPage />} />
            <Route path="/admin/trades" element={<TradesPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/audit" element={<AuditPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/kyc" element={<KYCManagementPage />} />
            <Route path="/admin/transactions" element={<TransactionsPage />} />
        </Routes>
    );
};

export default AppRoutes;
