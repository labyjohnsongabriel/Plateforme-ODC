
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

/* ---------------------------------------------------------------------------
 * Store & Contextes
 * ------------------------------------------------------------------------- */
import { store } from '@/store';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';

/* ---------------------------------------------------------------------------
 * Application & styles
 * ------------------------------------------------------------------------- */
import App from './App';
import '@/styles/globals.css';

/* ============================================================================
 * 1. CONFIGURATION
 * ========================================================================== */

/**
 * Élément racine du DOM.
 * Lance une erreur explicite si l'élément est introuvable.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    "[ODC] Élément racine #root introuvable. " +
      "Vérifiez que votre index.html contient bien <div id=\"root\"></div>.",
  );
}

/**
 * Options de configuration du Router (React Router v7).
 * Active les fonctionnalités futures pour préparer la migration.
 */
const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

/**
 * Configuration globale du Toaster (react-hot-toast).
 * Aligné sur les tokens ODC pour une cohérence visuelle parfaite.
 */
const TOASTER_OPTIONS = {
  duration: 4000,
  style: {
    background: 'var(--odc-surface)',
    color: 'var(--odc-text-primary)',
    border: '1px solid var(--odc-border)',
    borderRadius: 'var(--odc-radius-lg, 12px)',
    boxShadow: 'var(--odc-shadow-md)',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 500,
    maxWidth: '420px',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: 'var(--odc-success)',
      secondary: 'var(--odc-surface)',
    },
    style: {
      borderLeft: '4px solid var(--odc-success)',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: 'var(--odc-error)',
      secondary: 'var(--odc-surface)',
    },
    style: {
      borderLeft: '4px solid var(--odc-error)',
    },
  },
  loading: {
    iconTheme: {
      primary: 'var(--odc-primary)',
      secondary: 'var(--odc-surface)',
    },
    style: {
      borderLeft: '4px solid var(--odc-primary)',
    },
  },
} as const;

/* ============================================================================
 * 2. COMPOSITION DES PROVIDERS
 * ========================================================================== */

/**
 * Providers globaux de l'application.
 *
 * Ordre d'imbrication (du plus externe au plus interne) :
 *  1. Redux Store        — état global
 *  2. BrowserRouter      — routage
 *  3. ThemeProvider      — thème clair/sombre
 *  4. ToastProvider      — notifications applicatives
 *  5. AuthProvider       — authentification (dépend du Router)
 *  6. SocketProvider     — WebSocket (dépend de l'Auth)
 *
 * @param children - L'arbre React à envelopper
 */
interface AppProvidersProps {
  children: React.ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <SocketProvider>{children}</SocketProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

/* ============================================================================
 * 3. RENDU RACINE
 * ========================================================================== */

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppProviders>
      <App />

      {/* Système de notifications global */}
      <Toaster position="top-right" toastOptions={TOASTER_OPTIONS} />
    </AppProviders>
  </React.StrictMode>,
);

/* ============================================================================
 * 4. GESTION D'ERREURS GLOBALE (optionnel — développement)
 * ========================================================================== */

if (import.meta.env.DEV) {
  // Erreurs non capturées
  window.addEventListener('error', (event) => {
    console.error('[ODC] Erreur non capturée :', event.error);
  });

  // Promesses rejetées non gérées
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[ODC] Promesse rejetée non gérée :', event.reason);
  });
}