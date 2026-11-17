import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  FORMATION_ROUTES,
  SESSION_ROUTES,
  INSCRIPTION_ROUTES,
  PRESENCE_ROUTES,
  EVALUATION_ROUTES,
  ATTESTATION_ROUTES,
  MESSAGERIE_ROUTES,
  RESEAUTAGE_ROUTES,
  PROFILE_ROUTES,
  USER_ROUTES,
  PARTENAIRE_ROUTES,
  SETTINGS_ROUTES,
  ERROR_ROUTES,
} from '@/config/routes.config';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

const ALL_PROTECTED_ROUTES = [
  ...DASHBOARD_ROUTES,
  ...FORMATION_ROUTES,
  ...SESSION_ROUTES,
  ...INSCRIPTION_ROUTES,
  ...PRESENCE_ROUTES,
  ...EVALUATION_ROUTES,
  ...ATTESTATION_ROUTES,
  ...MESSAGERIE_ROUTES,
  ...RESEAUTAGE_ROUTES,
  ...PROFILE_ROUTES,
  ...USER_ROUTES,
  ...PARTENAIRE_ROUTES,
  ...SETTINGS_ROUTES,
];

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Routes publiques */}
        {PUBLIC_ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={<r.component />} />
        ))}

        {/* Routes auth (redirige si connecté) */}
        {AUTH_ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={<r.component />} />
        ))}

        {/* Routes protégées */}
        {ALL_PROTECTED_ROUTES.map((r) => (
          <Route
            key={r.path}
            path={r.path}
            element={
              <ProtectedRoute permission={r.permission}>
                <r.component />
              </ProtectedRoute>
            }
          />
        ))}

        {/* Routes d'erreur */}
        {ERROR_ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={<r.component />} />
        ))}

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
