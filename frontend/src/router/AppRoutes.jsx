// frontend/src/router/AppRoutes.js
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Public Pages
import HomePage from "../pages/public/HomePage";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";
import MarketsPage from "../pages/public/MarketsPage";
import MarketExplorerPage from "../pages/public/MarketExplorerPage";
import ResourceExplorerPage from "../pages/public/ResourceExplorerPage";
import AccountTypesPage from "../pages/public/AccountTypesPage";
import ConditionsPage from "../pages/public/ConditionsPage";
import TermsPage from "../pages/public/TermsPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import PrivacyPage from "../pages/public/PrivacyPage";
import RiskDisclaimerPage from "../pages/public/RiskDisclaimerPage";
import KYCPolicyPage from "../pages/public/KYCPolicyPage";
import AMLPolicyPage from "../pages/public/AMLPolicyPage";
import DepositsWithdrawalsPage from "../pages/public/DepositsWithdrawalsPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../pages/public/ResetPasswordPage";
import PromotionsPage from "../pages/public/PromotionsPage";

// Client Dashboard Pages
import DashboardPage from "../pages/client/DashboardPage";

// Admin Pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UsersPage from "../pages/admin/UsersPage";
import FundingRequestsPage from "../pages/admin/FundingRequestsPage";
import TradesPage from "../pages/admin/TradesPage";
import ReportsPage from "../pages/admin/ReportsPage";
import AuditPage from "../pages/admin/AuditPage";
import AdminSettingsPage from "../pages/admin/SettingsPage";
import KYCManagementPage from "../pages/admin/KYCManagementPage";
import TransactionsPage from "../pages/admin/TransactionsPage";

// Components
import ProtectedRoute from "../components/common/ProtectedRoute";
import SeoHead from "../components/common/SeoHead";
import { seoConfig } from "../config/seo";

const withSeo = (page, seo) => (
  <>
    <SeoHead {...seo} />
    {page}
  </>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/real-time-trading-platform" replace />} />
      <Route path="/real-time-trading-platform" element={withSeo(<HomePage />, seoConfig.home)} />
      <Route path="/about" element={withSeo(<AboutPage />, seoConfig.about)} />
      <Route path="/contact" element={withSeo(<ContactPage />, seoConfig.contact)} />
      <Route path="/markets" element={withSeo(<MarketsPage />, seoConfig.markets)} />
      <Route path="/markets/:category" element={withSeo(<MarketExplorerPage />, seoConfig.marketExplorer)} />
      <Route path="/resources/:category" element={withSeo(<ResourceExplorerPage />, seoConfig.resourceExplorer)} />
      <Route path="/promotions" element={withSeo(<PromotionsPage />, seoConfig.promotions)} />
      <Route path="/trading/account-types" element={withSeo(<AccountTypesPage />, seoConfig.accountTypes)} />
      <Route path="/trading/conditions" element={withSeo(<ConditionsPage />, seoConfig.conditions)} />
      <Route path="/account-types" element={withSeo(<AccountTypesPage />, seoConfig.accountTypes)} />
      <Route path="/terms" element={withSeo(<TermsPage />, seoConfig.terms)} />
      <Route path="/privacy" element={withSeo(<PrivacyPage />, seoConfig.privacy)} />
      <Route path="/risk-disclaimer" element={withSeo(<RiskDisclaimerPage />, seoConfig.riskDisclaimer)} />
      <Route path="/kyc-policy" element={withSeo(<KYCPolicyPage />, seoConfig.kycPolicy)} />
      <Route path="/aml-policy" element={withSeo(<AMLPolicyPage />, seoConfig.amlPolicy)} />
      <Route path="/deposits-withdrawals" element={withSeo(<DepositsWithdrawalsPage />, seoConfig.depositsWithdrawals)} />
      <Route path="/login" element={withSeo(<LoginPage />, seoConfig.login)} />
      <Route path="/register" element={withSeo(<RegisterPage />, seoConfig.register)} />
      <Route path="/forgot-password" element={withSeo(<ForgotPasswordPage />, seoConfig.forgotPassword)} />
      <Route path="/reset-password" element={withSeo(<ResetPasswordPage />, seoConfig.resetPassword)} />

      {/* Client Dashboard Routes - All protected for clients only */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['client']}>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/:tab" element={
        <ProtectedRoute allowedRoles={['client']}>
          <DashboardPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes - All protected for admins only */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <AdminDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/funding" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <FundingRequestsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/trades" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <TradesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <ReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/audit" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <AuditPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <AdminSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/kyc" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <KYCManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/transactions" element={
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <TransactionsPage />
        </ProtectedRoute>
      } />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/real-time-trading-platform" replace />} />
    </Routes>
  );
};

export default AppRoutes;
