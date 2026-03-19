// frontend/src/router/AppRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";

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
import TradingPage from "../pages/client/TradingPage";
import ChartsPage from "../pages/client/ChartsPage";
import FundingPage from "../pages/client/FundingPage";
import DepositPage from "../pages/client/DepositPage";
import WithdrawalPage from "../pages/client/WithdrawalPage";
import HistoryPage from "../pages/client/HistoryPage";
import ProfilePage from "../pages/client/ProfilePage";
import SettingsPage from "../pages/client/SettingsPage";
import StatementsPage from "../pages/client/StatementsPage";

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
      <Route path="/kyc-policy" element={<KYCPolicyPage />} />
      <Route path="/aml-policy" element={<AMLPolicyPage />} />
      <Route path="/deposits-withdrawals" element={<DepositsWithdrawalsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Client Dashboard Routes - All protected for clients only */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['client']}>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/trading" element={
        <ProtectedRoute allowedRoles={['client']}>
          <TradingPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/charts" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ChartsPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/funding" element={
        <ProtectedRoute allowedRoles={['client']}>
          <FundingPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/deposit" element={
        <ProtectedRoute allowedRoles={['client']}>
          <DepositPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/withdrawal" element={
        <ProtectedRoute allowedRoles={['client']}>
          <WithdrawalPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/history" element={
        <ProtectedRoute allowedRoles={['client']}>
          <HistoryPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/profile" element={
        <ProtectedRoute allowedRoles={['client']}>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/settings" element={
        <ProtectedRoute allowedRoles={['client']}>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/statements" element={
        <ProtectedRoute allowedRoles={['client']}>
          <StatementsPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes - All protected for admins only */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <UsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/funding" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <FundingRequestsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/trades" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <TradesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/audit" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AuditPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/kyc" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <KYCManagementPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/transactions" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <TransactionsPage />
        </ProtectedRoute>
      } />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default AppRoutes;