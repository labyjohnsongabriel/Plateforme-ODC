import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { authApi } from '@/services/auth.api';
import { tokenStorage } from '@/services/api';
import { RoleName } from '@/types/user.types';
import type { AuthUser, RegisterPayload } from '@/types/auth.types';

// ============================================================================
//  TYPES
// ============================================================================

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
  hasRole: (roles: RoleName | RoleName[]) => boolean;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
//  HELPER — Extrait les tokens quelle que soit la structure
// ============================================================================

interface ExtractedAuth {
  user: AuthUser | null;
  accessToken: string | undefined;
  refreshToken: string | undefined;
}

function extractAuthData(raw: any): ExtractedAuth {
  console.log('[extractAuthData] Entrée brute:', raw);

  // Essayer plusieurs chemins possibles
  const candidates = [
    raw?.data?.data,      // { data: { data: { user, accessToken } } }
    raw?.data,            // { data: { user, accessToken } }
    raw,                  // { user, accessToken }
  ];

  for (const c of candidates) {
    if (!c) continue;

    const accessToken =
      c.accessToken ?? c.access_token ?? c.token ?? c.accessTokenJwt;
    const refreshToken =
      c.refreshToken ?? c.refresh_token ?? c.refreshTokenJwt;
    const user = c.user ?? c.userData ?? c.utilisateur;

    if (accessToken) {
      console.log('[extractAuthData] ✅ Trouvé via:', Object.keys(c));
      return { user, accessToken, refreshToken };
    }
  }

  console.error('[extractAuthData] ❌ Aucun token trouvé dans la réponse');
  return { user: null, accessToken: undefined, refreshToken: undefined };
}

// ============================================================================
//  PROVIDER
// ============================================================================

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  //  HELPERS
  // ========================================================================

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    if (nextUser) {
      localStorage.setItem('odc_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('odc_user');
    }
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    tokenStorage.clearTokens();
    localStorage.removeItem('odc_user');
    setUser(null);
    setError(null);
  }, []);

  // ========================================================================
  //  REFRESH USER
  // ========================================================================

  const refreshUser = useCallback(async (): Promise<void> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userData = await authApi.me();
      persistUser(userData);
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [persistUser, clearSession]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  // ========================================================================
  //  LOGIN — Robustesse maximale
  // ========================================================================

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setError(null);
      try {
        const response = await authApi.login({ email, motDePasse: password });

        console.log('🔍 [LOGIN] Réponse brute:', response);

        const { user: userData, accessToken, refreshToken } =
          extractAuthData(response);

        console.log('🔍 [LOGIN] Extrait:', {
          user: userData ? `${userData.prenom} ${userData.nom}` : 'NULL',
          accessToken: accessToken ? 'PRÉSENT' : 'UNDEFINED',
          refreshToken: refreshToken ? 'PRÉSENT' : 'UNDEFINED',
        });

        if (!accessToken) {
          throw new Error(
            'Aucun token trouvé dans la réponse. Vérifie la console.'
          );
        }

        tokenStorage.setTokens(accessToken, refreshToken);
        persistUser(userData);

        console.log('✅ [LOGIN] Token stocké avec succès');
      } catch (err: any) {
        const message =
          err?.response?.data?.message ??
          err?.message ??
          'Erreur de connexion';
        console.error('❌ [LOGIN] Erreur:', message);
        setError(message);
        throw new Error(message);
      }
    },
    [persistUser]
  );

  // ========================================================================
  //  REGISTER
  // ========================================================================

  const register = useCallback(
    async (data: RegisterPayload): Promise<void> => {
      setError(null);
      try {
        const response = await authApi.register(data);

        console.log('🔍 [REGISTER] Réponse brute:', response);

        const { user: userData, accessToken, refreshToken } =
          extractAuthData(response);

        if (!accessToken) {
          throw new Error('Aucun token trouvé dans la réponse');
        }

        tokenStorage.setTokens(accessToken, refreshToken);
        persistUser(userData);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ??
          err?.message ??
          "Erreur d'inscription";
        setError(message);
        throw new Error(message);
      }
    },
    [persistUser]
  );

  // ========================================================================
  //  LOGOUT
  // ========================================================================

  const logout = useCallback((): void => {
    try {
      void authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // ========================================================================
  //  UPDATE USER
  // ========================================================================

  const updateUser = useCallback((updates: Partial<AuthUser>): void => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('odc_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ========================================================================
  //  HAS ROLE
  // ========================================================================

  const hasRole = useCallback(
    (roles: RoleName | RoleName[]): boolean => {
      const currentRole = user?.role?.nom;
      if (!currentRole) return false;
      const rolesArray = Array.isArray(roles) ? roles : [roles];
      return rolesArray.includes(currentRole as RoleName);
    },
    [user?.role?.nom]
  );

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      hasRole,
      clearError,
    }),
    [
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      hasRole,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
//  HOOK
// ============================================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;