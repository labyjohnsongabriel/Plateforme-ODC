import api from './api';
import { ENDPOINTS } from './endpoints';
import type {
    LoginPayload,
    RegisterPayload,
    ChangePasswordPayload,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    RefreshTokenPayload,
    AuthResponse,
    AuthUser,
    RefreshTokenResponse,
} from '@/types/auth.types';

// ============================================================================
//  AUTH API
// ============================================================================

export const authApi = {
    /**
     * Connexion
     */
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
        return data.data;
    },

    /**
     * Inscription
     */
    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const { data } = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
        return data.data;
    },

    /**
     * Rafraîchir le token
     */
    refresh: async (payload: RefreshTokenPayload): Promise<RefreshTokenResponse> => {
        const { data } = await api.post(ENDPOINTS.AUTH.REFRESH, payload);
        return data.data;
    },

    /**
     * Profil de l'utilisateur connecté
     */
    me: async (): Promise<AuthUser> => {
        const { data } = await api.get(ENDPOINTS.AUTH.ME);
        return data.data;
    },

    /**
     * Changer le mot de passe
     */
    changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
        await api.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
    },

    /**
     * Mot de passe oublié
     */
    forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
        await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
    },

    /**
     * Réinitialiser le mot de passe
     */
    resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
        await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    },

    /**
     * Déconnexion locale
     */
    logout: (): void => {
        localStorage.removeItem('odc_access_token');
        localStorage.removeItem('odc_refresh_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('odc_user');
    },
};

export default authApi;