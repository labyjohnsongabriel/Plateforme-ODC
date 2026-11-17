// src/contexts/ThemeContext.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** Mode effectif (light ou dark) */
  mode: ThemeMode;
  /** Préférence utilisateur (light, dark ou system) */
  preference: ThemePreference;
  /** Change la préférence (met à jour le mode automatiquement) */
  setPreference: (pref: ThemePreference) => void;
  /** Bascule entre light et dark */
  toggleTheme: () => void;
  /** Change directement le mode (équivalent à setPreference) */
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'odc-theme';
const PREFERENCE_KEY = 'odc-theme-preference';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(PREFERENCE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return 'system';
}

function applyThemeClass(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.setAttribute('data-theme', mode);
  root.style.colorScheme = mode;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════════════════════════════════════ */

interface ThemeProviderProps {
  children: ReactNode;
  /** Thème par défaut si rien dans localStorage */
  defaultPreference?: ThemePreference;
}

export function ThemeProvider({
  children,
  defaultPreference = 'system',
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const stored = getStoredPreference();
    return stored ?? defaultPreference;
  });

  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = getStoredPreference();
    if (stored === 'system') return getSystemTheme();
    if (stored === 'light' || stored === 'dark') return stored;
    return defaultPreference === 'system'
      ? getSystemTheme()
      : defaultPreference;
  });

  /* ─── Applique la classe CSS + persiste ─────────────────────────────── */
  useEffect(() => {
    applyThemeClass(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
      localStorage.setItem(PREFERENCE_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [mode, preference]);

  /* ─── Écoute `prefers-color-scheme` (uniquement si pref = system) ──── */
  useEffect(() => {
    if (preference !== 'system') return;
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light');
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  /* ─── Actions ───────────────────────────────────────────────────────── */
  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    if (pref === 'system') {
      setMode(getSystemTheme());
    } else {
      setMode(pref);
    }
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    setPreferenceState(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const next: ThemeMode = current === 'light' ? 'dark' : 'light';
      setPreferenceState(next);
      return next;
    });
  }, []);

  /* ─── Valeur mémorisée ──────────────────────────────────────────────── */
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      preference,
      setPreference,
      toggleTheme,
      setTheme,
    }),
    [mode, preference, setPreference, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export default ThemeContext;