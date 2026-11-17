// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════════════════════
   STORE & CONTEXTES
   ═══════════════════════════════════════════════════════════════════════════ */

import { store } from '@/store';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';

/* ═══════════════════════════════════════════════════════════════════════════
   APPLICATION & STYLES
   ═══════════════════════════════════════════════════════════════════════════ */

import App from './App';
import '@/styles/globals.css';

/* ═══════════════════════════════════════════════════════════════════════════
   1. CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    '[ODC] Élément racine #root introuvable. ' +
      'Vérifiez que votre index.html contient bien <div id="root"></div>.',
  );
}

/** Options React Router v7 (préparation migration) */
const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const;

/* ─── Style commun des toasts ──────────────────────────────────────────── */
const TOAST_BASE_STYLE: React.CSSProperties = {
  background: 'var(--odc-surface)',
  color: 'var(--odc-text-primary)',
  border: '1px solid var(--odc-border)',
  borderRadius: 'var(--odc-radius-lg)',
  boxShadow: 'var(--odc-shadow-lg)',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: '500', // ✅ string, pas number
  maxWidth: '420px',
};

/* ─── Options complètes du Toaster ─────────────────────────────────────── */
const TOASTER_OPTIONS = {
  duration: 4_000,
  style: TOAST_BASE_STYLE,
  success: {
    duration: 3_000,
    iconTheme: {
      primary: 'var(--odc-success)',
      secondary: 'var(--odc-surface)',
    },
    style: {
      ...TOAST_BASE_STYLE,
      borderLeft: '4px solid var(--odc-success)',
    },
  },
  error: {
    duration: 5_000,
    iconTheme: {
      primary: 'var(--odc-error)',
      secondary: 'var(--odc-surface)',
    },
    style: {
      ...TOAST_BASE_STYLE,
      borderLeft: '4px solid var(--odc-error)',
    },
  },
  loading: {
    duration: Infinity,
    iconTheme: {
      primary: 'var(--odc-primary)',
      secondary: 'var(--odc-surface)',
    },
    style: {
      ...TOAST_BASE_STYLE,
      borderLeft: '4px solid var(--odc-primary)',
    },
  },
  blank: {
    style: {
      ...TOAST_BASE_STYLE,
      borderLeft: '4px solid var(--odc-info)',
    },
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   2. COMPOSITION DES PROVIDERS
   ═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   3. RENDU RACINE
   ═══════════════════════════════════════════════════════════════════════════ */

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 80, // ✅ évite le chevauchement avec le header
          right: 16,
        }}
        toastOptions={TOASTER_OPTIONS}
      />
    </AppProviders>
  </React.StrictMode>,
);

/* ═══════════════════════════════════════════════════════════════════════════
   4. GESTION D'ERREURS GLOBALE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Capture les erreurs non gérées.
 * En développement : console uniquement.
 * En production : à remplacer par un service (Sentry, LogRocket, etc.)
 */
function setupGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    const message = event.error?.message ?? event.message;
    console.error('[ODC] Erreur non capturée :', message);

    // ✅ TODO production : envoyer à Sentry
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(event.error);
    // }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[ODC] Promesse rejetée non gérée :', event.reason);

    // ✅ Évite les fuites si le user ferme la page
    event.preventDefault();

    // TODO production : Sentry.captureException(event.reason)
  });
}

setupGlobalErrorHandlers();

/* ═══════════════════════════════════════════════════════════════════════════
   5. INFORMATIONS DEV
   ═══════════════════════════════════════════════════════════════════════════ */

if (import.meta.env.DEV) {
  console.info(
    `%c🚀 ODC Platform — Mode développement`,
    'color: #FF7900; font-weight: bold; font-size: 12px;',
  );
}