// src/lib/api.ts
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/store/auth.store';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api`;

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INSTANCE
   ═══════════════════════════════════════════════════════════════════════════ */

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ VERROU GLOBAL DE REFRESH + FILE D'ATTENTE
   ═══════════════════════════════════════════════════════════════════════════ */

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else if (token) p.resolve(token);
  });
  failedQueue = [];
};

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ ROUTES À NE PAS RETENTER (évite la boucle)
   ═══════════════════════════════════════════════════════════════════════════ */

const NO_REFRESH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];

// ⭐ `/auth/me` est la route qui CONFIRME l'auth.
// Si elle renvoie 401, on déconnecte directement (pas de refresh).
const AUTH_CHECK_ROUTE = '/auth/me';

/* ═══════════════════════════════════════════════════════════════════════════
   INTERCEPTEUR REQUEST — ajout du token
   ═══════════════════════════════════════════════════════════════════════════ */

api.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    const token = state.accessToken;

    if (process.env.NODE_ENV === 'development') {
      console.log('[API REQUEST]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
        tokenPreview: token ? `${token.slice(0, 30)}...` : null,
        isAuthenticated: state.isAuthenticated,
        isHydrated: state.isHydrated,
      });
    }

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      config.headers = config.headers ?? {};
      config.headers['X-Request-Id'] = crypto.randomUUID();
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ═══════════════════════════════════════════════════════════════════════════
   INTERCEPTEUR RESPONSE — refresh unique + anti-boucle
   ═══════════════════════════════════════════════════════════════════════════ */

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const url = request?.url ?? '';

    /* ---------- Log ---------- */
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API ERROR]', {
        method: request?.method?.toUpperCase(),
        url,
        status,
        message:
          (error.response?.data as { message?: string })?.message ??
          error.message,
      });
    }

    /* ---------- 1. Pas 401 → abandon ---------- */
    if (status !== 401 || !request) {
      return Promise.reject(error);
    }

    /* ---------- 2. Route de login/register/refresh → abandon ---------- */
    if (NO_REFRESH_ROUTES.some((r) => url.includes(r))) {
      return Promise.reject(error);
    }

    /* ---------- 3. ⭐ /auth/me 401 → logout direct (anti-boucle) ---------- */
    if (url.includes(AUTH_CHECK_ROUTE)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[API] /auth/me 401 → logout direct');
      }
      useAuthStore.getState().clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    /* ---------- 4. Déjà tenté → abandon (anti-boucle) ---------- */
    if (request._retry) {
      useAuthStore.getState().clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    /* ---------- 5. Pas de refresh token → logout ---------- */
    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
    if (!refreshToken) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[API] 401 sans refresh token → logout');
      }
      clearAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    /* ---------- 6. ⭐ Un refresh est déjà en cours → file d'attente ---------- */
    if (isRefreshing) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Refresh déjà en cours, mise en file…', url);
      }
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          request.headers = request.headers ?? {};
          request.headers.Authorization = `Bearer ${newToken}`;
          return api(request);
        })
        .catch((err) => Promise.reject(err));
    }

    /* ---------- 7. Lancer le refresh ---------- */
    request._retry = true;
    isRefreshing = true;

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Tentative de refresh…');
      }

      const { data } = await axios.post<{
        data: { accessToken: string; refreshToken: string };
      }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { withCredentials: true },
      );

      const newAccessToken = data?.data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error('Refresh : token manquant dans la réponse');
      }

      /* ---------- Sauvegarder les nouveaux tokens ---------- */
      setTokens(newAccessToken, newRefreshToken ?? refreshToken);

      /* ---------- Libérer les requêtes en attente ---------- */
      processQueue(null, newAccessToken);

      /* ---------- Rejouer la requête initiale ---------- */
      request.headers = request.headers ?? {};
      request.headers.Authorization = `Bearer ${newAccessToken}`;

      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Refresh OK, retry:', url);
      }

      return api(request);
    } catch (refreshError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[API] Refresh échoué → logout');
      }

      /* ---------- Libérer la file avec erreur ---------- */
      processQueue(refreshError, null);

      /* ---------- Déconnecter ---------- */
      clearAuth();
      redirectToLogin();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;

  /* ---------- Éviter la boucle sur la page de login ---------- */
  const loginPaths = ['/connexion', '/login', '/signin'];
  if (loginPaths.some((p) => window.location.pathname.startsWith(p))) return;

  /* ---------- ⭐ Éviter les redirections en boucle ---------- */
  const redirectKey = '__auth_redirect_at';
  const lastRedirect = sessionStorage.getItem(redirectKey);
  const now = Date.now();
  if (lastRedirect && now - Number(lastRedirect) < 5000) {
    // déjà redirigé dans les 5 dernières secondes → ne pas boucler
    return;
  }
  sessionStorage.setItem(redirectKey, String(now));

  const next = encodeURIComponent(
    window.location.pathname + window.location.search,
  );
  window.location.href = `/connexion?next=${next}`;
}

export function getApiUrl(path = ''): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

export function isAuthError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
}

export function getStatusCode(error: unknown): number | null {
  return axios.isAxiosError(error) ? error.response?.status ?? null : null;
}

export default api;