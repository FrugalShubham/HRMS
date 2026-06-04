import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PlatformPage } from '@/pages/platform/PlatformPage';
import { EmployeesPage } from '@/pages/employees/EmployeesPage';
import { AttendancePage } from '@/pages/attendance/AttendancePage';
import { LeavePage } from '@/pages/leave/LeavePage';
import { PayrollPage } from '@/pages/payroll/PayrollPage';
import { AIPage } from '@/pages/ai/AIPage';
import { BillingPage } from '@/pages/billing/BillingPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="platform" element={<PlatformPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="recruitment" element={<PlaceholderPage title="Recruitment" description="Jobs, candidates, AI resume screening" />} />
        <Route path="assets" element={<PlaceholderPage title="Asset Management" description="Track laptops, devices, and allocations" />} />
        <Route path="announcements" element={<PlaceholderPage title="Announcements" description="Company-wide updates via WhatsApp & email" />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
