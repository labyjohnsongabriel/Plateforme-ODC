import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

// ============================================================================
//  TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'odc-theme';
const PREFERENCE_KEY = 'odc-theme-preference';

// ============================================================================
//  HELPERS
// ============================================================================

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(PREFERENCE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  } catch {
    return 'system';
  }
}

function getStoredTheme(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return null;
  } catch {
    return null;
  }
}

function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// ============================================================================
//  PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const stored = getStoredPreference();
    return stored;
  });

  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = getStoredTheme();
    if (stored) return stored;

    const pref = getStoredPreference();
    if (pref === 'system') return getSystemTheme();
    return pref;
  });

  // ========================================================================
  // Apply theme on mount and change
  // ========================================================================
  useEffect(() => {
    applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  // ========================================================================
  // Listen for system theme changes
  // ========================================================================
  useEffect(() => {
    if (preference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [preference]);

  // ========================================================================
  // Actions
  // ========================================================================
  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    try {
      localStorage.setItem(PREFERENCE_KEY, pref);
    } catch {
      // ignore
    }

    if (pref === 'system') {
      setMode(getSystemTheme());
    } else {
      setMode(pref);
    }
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    setPreferenceState(newMode);
    try {
      localStorage.setItem(PREFERENCE_KEY, newMode);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(mode === 'light' ? 'dark' : 'light');
  }, [mode, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      preference,
      setPreference,
      toggleTheme,
      setTheme,
    }),
    [mode, preference, setPreference, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================================================
//  HOOK
// ============================================================================

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export default ThemeContext;