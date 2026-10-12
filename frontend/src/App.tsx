// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Public
import HomePage from '@/pages/public/HomePage';
import FormationsPage from '@/pages/public/FormationsPage';
import SessionsPage from '@/pages/public/SessionsPage';
import PartenairesPage from '@/pages/public/PartenairesPage';

// Auth
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Dashboards
import AdminDashboard from '@/pages/admin/Dashboard';
import StaffDashboard from '@/pages/staff/Dashboard';
import FormateurDashboard from '@/pages/formateur/Dashboard';
import ParticipantDashboard from '@/pages/participant/Dashboard';
import PartenaireDashboard from '@/pages/partenaire/Dashboard';

// Error
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* -------------------- PUBLIC -------------------- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/formations" element={<FormationsPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/partenaires" element={<PartenairesPage />} />
          </Route>

          {/* -------------------- AUTH -------------------- */}
          <Route element={<AuthLayout />}>
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
          </Route>

          {/* -------------------- ADMIN -------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['ADMINISTRATEUR']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* -------------------- STAFF -------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['STAFF_ODC', 'ADMINISTRATEUR']} />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
          </Route>

          {/* -------------------- FORMATEUR -------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['FORMATEUR', 'ADMINISTRATEUR']} />}>
            <Route path="/formateur/dashboard" element={<FormateurDashboard />} />
          </Route>

          {/* -------------------- PARTICIPANT -------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ADMINISTRATEUR']} />}>
            <Route path="/participant/dashboard" element={<ParticipantDashboard />} />
          </Route>

          {/* -------------------- PARTENAIRE -------------------- */}
          <Route element={<ProtectedRoute allowedRoles={['PARTENAIRE', 'ADMINISTRATEUR']} />}>
            <Route path="/partenaire/dashboard" element={<PartenaireDashboard />} />
          </Route>

          {/* -------------------- REDIRECTION /dashboard -------------------- */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* -------------------- 404 -------------------- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

/* ============================================================================
   REDIRECTION /dashboard → dashboard selon rôle
   ============================================================================ */

function DashboardRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  return <Navigate to={getDashboardRoute(user.role?.nom)} replace />;
}