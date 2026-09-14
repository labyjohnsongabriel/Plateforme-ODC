import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Loader } from '@/components/common/Loader';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';

import { PrivateRoute } from './PrivateRoute';
import { RoleRoute } from './RoleRoute';
import { PublicRoute } from './PublicRoute';
import { PublicRoutes } from './PublicRoutes';

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
  USER_ROUTES,
  PARTENAIRE_ROUTES,
  SETTINGS_ROUTES,
  PROFILE_ROUTES,
  ERROR_ROUTES,
} from './routes.config';

import type { RouteConfig } from './routes.config';

// ============================================================================
//  HELPERS
// ============================================================================

function renderRoute(route: RouteConfig, index: number) {
  const Component = route.component;
  return <Route key={index} path={route.path} element={<Component />} />;
}

function renderProtectedRoute(route: RouteConfig, index: number) {
  const Component = route.component;

  if (route.permission) {
    return (
      <Route
        key={index}
        path={route.path}
        element={
          <RoleRoute permission={route.permission} redirectTo="/403">
            <Component />
          </RoleRoute>
        }
      />
    );
  }

  return <Route key={index} path={route.path} element={<Component />} />;
}

// ============================================================================
//  APP ROUTER
// ============================================================================

export function AppRouter() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader fullScreen />}>
        <Routes>
          {/* ============================================================ */}
          {/* 🌍 ROUTES PUBLIQUES — Accessibles par TOUS                    */}
          {/* (que l'utilisateur soit connecté ou non)                      */}
          {/* ============================================================ */}
          <Route element={<PublicLayout />}>
            {PUBLIC_ROUTES.map(renderRoute)}
          </Route>

          {/* ============================================================ */}
          {/* 🔓 ROUTES AUTH — Redirige si DÉJÀ connecté                    */}
          {/* ============================================================ */}
          <Route element={<PublicRoute />}>
            <Route element={<PublicRoutes />}>
              {AUTH_ROUTES.map(renderRoute)}
            </Route>
          </Route>

          {/* ============================================================ */}
          {/* 🔒 ROUTES PROTÉGÉES                                           */}
          {/* ============================================================ */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              {DASHBOARD_ROUTES.map(renderProtectedRoute)}
              {FORMATION_ROUTES.map(renderProtectedRoute)}
              {SESSION_ROUTES.map(renderProtectedRoute)}
              {INSCRIPTION_ROUTES.map(renderProtectedRoute)}
              {PRESENCE_ROUTES.map(renderProtectedRoute)}
              {EVALUATION_ROUTES.map(renderProtectedRoute)}
              {ATTESTATION_ROUTES.map(renderProtectedRoute)}
              {MESSAGERIE_ROUTES.map(renderProtectedRoute)}
              {RESEAUTAGE_ROUTES.map(renderProtectedRoute)}
              {USER_ROUTES.map(renderProtectedRoute)}
              {PARTENAIRE_ROUTES.map(renderProtectedRoute)}
              {SETTINGS_ROUTES.map(renderProtectedRoute)}
              {PROFILE_ROUTES.map(renderProtectedRoute)}
            </Route>
          </Route>

          {/* ============================================================ */}
          {/* ❌ ROUTES D'ERREUR                                            */}
          {/* ============================================================ */}
          {ERROR_ROUTES.map(renderRoute)}

          {/* ============================================================ */}
          {/* REDIRECTION 404                                              */}
          {/* ============================================================ */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRouter;