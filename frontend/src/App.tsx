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
}