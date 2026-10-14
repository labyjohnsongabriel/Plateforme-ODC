<<<<<<< HEAD
import { Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { AppRouter } from '@/routes/AppRouter';
import { useTheme } from '@/context/ThemeContext';
import { APP_CONFIG } from '@/config/app.config';

// ============================================================================
//  MAP ROUTES → TITRES
// ============================================================================

const PAGE_TITLES: Record<string, string> = {
  // Public
  '/': 'Accueil',
  '/login': 'Connexion',
  '/register': 'Inscription',
  '/forgot-password': 'Mot de passe oublié',
  '/reset-password': 'Réinitialiser le mot de passe',
  '/terms': "Conditions d'utilisation",
  '/privacy': 'Politique de confidentialité',

  // Authentifié
  '/dashboard': 'Tableau de bord',
  '/formations': 'Formations',
  '/sessions': 'Sessions',
  '/inscriptions': 'Inscriptions',
  '/presences': 'Présences',
  '/evaluations': 'Évaluations',
  '/attestations': 'Attestations',
  '/messagerie': 'Messagerie',
  '/notifications': 'Notifications',
  '/reseautage': 'Réseautage',
  '/profile': 'Mon profil',

  // Admin / Staff
  '/users': 'Utilisateurs',
  '/partenaires': 'Partenaires',
  '/settings': 'Paramètres',
  '/admin': 'Administration',

  // Erreurs
  '/403': 'Accès refusé',
  '/404': 'Page introuvable',
  '/500': 'Erreur serveur',
};

// ============================================================================
//  APP
// ============================================================================

export default function App() {
  const { mode } = useTheme();
  const location = useLocation();

  // ========================================================================
  //  Effet 1 — Titre dynamique du document
  // ========================================================================
  useEffect(() => {
    const baseTitle = APP_CONFIG.name;
    const path = location.pathname;

    const matchedPath = Object.keys(PAGE_TITLES).find(
      (key) => path === key || path.startsWith(`${key}/`)
    );

    const pageTitle = matchedPath ? PAGE_TITLES[matchedPath] : null;
    document.title = pageTitle ? `${pageTitle} • ${baseTitle}` : baseTitle;
  }, [location.pathname]);

  // ========================================================================
  //  Effet 2 — Meta theme-color
  // ========================================================================
  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const color = mode === 'dark' ? '#0F0F0F' : '#FF7900';

    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }, [mode]);

  // ========================================================================
  //  Effet 3 — Scroll to top à chaque changement de route
  // ========================================================================
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // ========================================================================
  //  RENDER
  // ========================================================================
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-odc-bg-light dark:bg-odc-bg-dark">
            <Loader fullScreen text="Chargement de l'application..." />
          </div>
        }
      >
        <AppRouter />
      </Suspense>
    </ErrorBoundary>
  );
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
}