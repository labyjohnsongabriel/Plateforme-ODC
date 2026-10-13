// src/lib/api.ts
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 30_000;

/* ============================================================================
   INSTANCE AXIOS
   ============================================================================ */

export const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ============================================================================
   INTERCEPTEUR — REQUÊTE (⭐ LECTURE DEPUIS ZUSTAND)
   ============================================================================ */

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ⭐ Lire le token depuis Zustand (source de vérité unique)
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Identifiant unique pour le traçage
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      config.headers['X-Request-Id'] = crypto.randomUUID();
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ============================================================================
   QUEUE DE REFRESH
   ============================================================================ */

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

/* ============================================================================
   INTERCEPTEUR — RÉPONSE (refresh auto + retry 5xx)
   ============================================================================ */

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    /* -------------------- Pas de config ou pas de réponse -------------------- */
    if (!originalRequest || !error.response) {
      // Erreur réseau ou timeout
      if (error.code === 'ECONNABORTED') {
        console.warn('[API] Timeout dépassé');
      }
      return Promise.reject(error);
    }

    const { status } = error.response;

    /* ==================== 401 — Refresh automatique ==================== */
    if (status === 401 && !originalRequest._retry) {
      // Ne pas boucler sur les endpoints d'auth
      const url = originalRequest.url ?? '';
      if (
        url.includes('/auth/refresh') ||
        url.includes('/auth/login') ||
        url.includes('/auth/register')
      ) {
        return Promise.reject(error);
      }

      const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();

      // Pas de refresh token → déconnexion
      if (!refreshToken) {
        console.warn('[API] 401 sans refresh token → déconnexion');
        clearAuth();
        redirectToLogin();
        return Promise.reject(error);
      }

      // Si un refresh est déjà en cours, mettre en file d'attente
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ⭐ Appel direct avec axios (pas l'instance `api`) pour éviter la boucle
        const { data } = await axios.post<{
          data: { accessToken: string; refreshToken: string };
        }>(
          `${API_URL}/api/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        // ⭐ Mettre à jour Zustand (source de vérité)
        setTokens(accessToken, newRefreshToken);

        // Traiter la file d'attente
        processQueue(null, accessToken);

        // Rejouer la requête originale
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Échec du refresh → déconnexion
        processQueue(refreshError, null);
        clearAuth();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    /* ==================== 403 — Accès refusé ==================== */
    if (status === 403) {
      console.warn('[API] 403 Accès refusé :', originalRequest.url);
    }

    /* ==================== 429 — Rate limit ==================== */
    if (status === 429) {
      console.warn('[API] 429 Trop de requêtes');
    }

    /* ==================== 5xx — Retry automatique ==================== */
    if (status >= 500 && (originalRequest._retryCount ?? 0) < 2) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      const delay = Math.pow(2, originalRequest._retryCount) * 1000;

      console.warn(
        `[API] ${status} — Retry ${originalRequest._retryCount}/2 dans ${delay}ms`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

/* ============================================================================
   HELPERS
   ============================================================================ */

/**
 * Redirige vers la page de connexion (une seule fois).
 */
function redirectToLogin(): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/connexion')) return;

  const next = encodeURIComponent(currentPath + window.location.search);
  window.location.href = `/connexion?next=${next}`;
}

/* ============================================================================
   HELPERS PUBLICS
   ============================================================================ */

export function getApiUrl(path = ''): string {
  return `${API_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
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