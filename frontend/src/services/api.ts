import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import toast from 'react-hot-toast';
import { ENDPOINTS } from './endpoints.ts';
import type { ApiError } from '@/types/common.types';
import { STORAGE_KEYS } from '@/config/constants';

// ============================================================================
//  CONFIGURATION
// ============================================================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ACCESS_TOKEN_KEY = STORAGE_KEYS.ACCESS_TOKEN;
const REFRESH_TOKEN_KEY = STORAGE_KEYS.REFRESH_TOKEN;
const LEGACY_ACCESS_TOKEN_KEYS = ['accessToken', 'access_token'];
const LEGACY_REFRESH_TOKEN_KEYS = ['refreshToken', 'refresh_token'];

// ============================================================================
//  INSTANCE AXIOS
// ============================================================================
export const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// ============================================================================
//  TOKEN MANAGEMENT
// ============================================================================
export const tokenStorage = {
    getAccessToken: (): string | null => {
        try {
            return (
                localStorage.getItem(ACCESS_TOKEN_KEY) ??
                LEGACY_ACCESS_TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ??
                null
            );
        } catch {
            return null;
        }
    },

    getRefreshToken: (): string | null => {
        try {
            return (
                localStorage.getItem(REFRESH_TOKEN_KEY) ??
                LEGACY_REFRESH_TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ??
                null
            );
        } catch {
            return null;
        }
    },

    setTokens: (accessToken: string, refreshToken?: string): void => {
        try {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            if (refreshToken) {
                localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            }
        } catch {
            // ignore
        }
    },

    clearTokens: (): void => {
        try {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            LEGACY_ACCESS_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
            LEGACY_REFRESH_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
            localStorage.removeItem('odc_user');
        } catch {
            // ignore
        }
    },
};

// ============================================================================
//  REQUEST INTERCEPTOR — Ajouter le token JWT
// ============================================================================
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Ajouter un requestId pour traçabilité
        if (config.headers) {
            config.headers['X-Request-Id'] = crypto.randomUUID?.() || Date.now().toString();
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// ============================================================================
//  REFRESH TOKEN QUEUE
// ============================================================================
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null): void => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else if (token) {
            resolve(token);
        }
    });
    failedQueue = [];
};

// ============================================================================
//  RESPONSE INTERCEPTOR
// ============================================================================
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // ========================================================================
        // 401 — Tentative de refresh
        // ========================================================================
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Ne pas refresh sur les routes publiques
            const isAuthRoute =
                originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/register') ||
                originalRequest.url?.includes('/auth/refresh');

            if (isAuthRoute) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // File d'attente
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = tokenStorage.getRefreshToken();

            if (!refreshToken) {
                handleLogout();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_URL}${ENDPOINTS.AUTH.REFRESH}`, {
                    refreshToken,
                });

                const newAccessToken = data.data.accessToken;
                const newRefreshToken = data.data.refreshToken;

                tokenStorage.setTokens(newAccessToken, newRefreshToken);
                processQueue(null, newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                handleLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // ========================================================================
        // Autres erreurs — Toast
        // ========================================================================
        if (error.response?.status !== 401) {
            const message = getErrorMessage(error);
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

// ============================================================================
//  HELPERS
// ============================================================================

/**
 * Déconnexion automatique
 */
function handleLogout(): void {
    tokenStorage.clearTokens();
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

/**
 * Extrait le message d'erreur
 */
function getErrorMessage(error: AxiosError<ApiError>): string {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
            return errors[0].message || 'Erreur de validation';
        }
    }

    if (error.code === 'ECONNABORTED') {
        return 'Délai de connexion dépassé';
    }

    if (error.code === 'ERR_NETWORK') {
        return 'Impossible de contacter le serveur';
    }

    return error.message || 'Une erreur est survenue';
}

/**
 * Requête générique typée
 */
export async function request<T = any>(
    config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
    return api.request<T>(config);
}

// ============================================================================
//  EXPORTS
// ============================================================================
export default api;