// frontend/src/router/AppRoutes.js
import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Public Pages
const HomePage = lazy(() => import("../pages/public/HomePage"));
const AboutPage = lazy(() => import("../pages/public/AboutPage"));
const ContactPage = lazy(() => import("../pages/public/ContactPage"));
const MarketsPage = lazy(() => import("../pages/public/MarketsPage"));
const MarketExplorerPage = lazy(() => import("../pages/public/MarketExplorerPage"));
const ResourceExplorerPage = lazy(() => import("../pages/public/ResourceExplorerPage"));
const AccountTypesPage = lazy(() => import("../pages/public/AccountTypesPage"));
const ConditionsPage = lazy(() => import("../pages/public/ConditionsPage"));
const TermsPage = lazy(() => import("../pages/public/TermsPage"));
const LoginPage = lazy(() => import("../pages/public/LoginPage"));
const RegisterPage = lazy(() => import("../pages/public/RegisterPage"));
const PrivacyPage = lazy(() => import("../pages/public/PrivacyPage"));
const RiskDisclaimerPage = lazy(() => import("../pages/public/RiskDisclaimerPage"));
const KYCPolicyPage = lazy(() => import("../pages/public/KYCPolicyPage"));
const AMLPolicyPage = lazy(() => import("../pages/public/AMLPolicyPage"));
const DepositsWithdrawalsPage = lazy(() => import("../pages/public/DepositsWithdrawalsPage"));
const ForgotPasswordPage = lazy(() => import("../pages/public/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/public/ResetPasswordPage"));
const PromotionsPage = lazy(() => import("../pages/public/PromotionsPage"));

// Client Dashboard Pages
const DashboardPage = lazy(() => import("../pages/client/DashboardPage"));

// Admin Pages
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const UsersPage = lazy(() => import("../pages/admin/UsersPage"));
const FundingRequestsPage = lazy(() => import("../pages/admin/FundingRequestsPage"));
const TradesPage = lazy(() => import("../pages/admin/TradesPage"));
const ReportsPage = lazy(() => import("../pages/admin/ReportsPage"));
const AuditPage = lazy(() => import("../pages/admin/AuditPage"));
const AdminSettingsPage = lazy(() => import("../pages/admin/SettingsPage"));
const KYCManagementPage = lazy(() => import("../pages/admin/KYCManagementPage"));
const TransactionsPage = lazy(() => import("../pages/admin/TransactionsPage"));

// Components
import ProtectedRoute from "../components/common/ProtectedRoute";
import PageLoader from "../components/common/PageLoader";
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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
};

export default AppRoutes;
