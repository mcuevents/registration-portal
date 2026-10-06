import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { PassSuccessPage } from './pages/PassSuccessPage';
import { LookupPage } from './pages/LookupPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminRegistrations } from './pages/admin/AdminRegistrations';
import { AdminQRScanner } from './pages/admin/AdminQRScanner';
import { CheckInPage } from './pages/CheckInPage';

// Protected Route Guard for Admin
function ProtectedAdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// Public Layout Wrapper with Navbar & Footer
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public Visitor Routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/pass/:registrationId" element={<PublicLayout><PassSuccessPage /></PublicLayout>} />
          <Route path="/lookup" element={<PublicLayout><LookupPage /></PublicLayout>} />

          {/* Admin Auth Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <ProtectedAdminRoute>
                <AdminRegistrations />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/scan"
            element={
              <ProtectedAdminRoute>
                <AdminQRScanner />
              </ProtectedAdminRoute>
            }
          />

          {/* Dedicated Lightweight Event-Day Gate Check-In Page */}
          <Route path="/checkin" element={<CheckInPage />} />

          {/* 404 Route */}
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
