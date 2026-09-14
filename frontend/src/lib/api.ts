import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';
import { tokenStorage } from '@/services/api';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

// ============================================================================
//  AXIOS INSTANCE
// ============================================================================

export const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// ============================================================================
//  TOKEN STORAGE
// ============================================================================

export { tokenStorage };

// ============================================================================
//  INTERCEPTEUR REQUÊTE — Ajoute le token Bearer
// ============================================================================

api.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccessToken();
        console.log('[API] Token envoyé :', token ? 'OUI' : 'NON');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================================
//  INTERCEPTEUR RÉPONSE — Refresh token sur 401
// ============================================================================

api.interceptors.response.use(
    (response) => response.data,
    async (err: AxiosError) => {
        const original: any = err.config;

        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refreshToken = tokenStorage.getRefreshToken();

            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken,
                    });
                    tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken);
                    original.headers.Authorization = `Bearer ${data.data.accessToken}`;
                    return api(original);
                } catch {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(err.response?.data ?? err);
    }
);

export default api;