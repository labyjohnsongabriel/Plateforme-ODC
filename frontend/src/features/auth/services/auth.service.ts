import { authApi } from '@/services/auth.api';
import { tokenStorage } from '@/services/api';
import type {
  AuthUser,
  AuthResponse,
  LoginFormData,
  RegisterFormData,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../types/auth.types';

const REMEMBER_KEY = 'odc_remember_email';
const USER_KEY = 'odc_user';

// ============================================================================
//  AUTH SERVICE
// ============================================================================

export class AuthService {
  /**
   * Connexion
   */
  static async login(email: string, motDePasse: string, remember = false): Promise<AuthResponse> {
    const response = await authApi.login({ email, motDePasse });

    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));

    if (remember) {
      localStorage.setItem(REMEMBER_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    return response;
  }

  /**
   * Inscription
   */
  static async register(data: RegisterFormData): Promise<AuthResponse> {
    const { confirmMotDePasse, acceptTerms, ...payload } = data;
    const response = await authApi.register({
      ...payload,
      roleNom: 'PARTICIPANT',
    });

    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));

    return response;
  }

  /**
   * Déconnexion
   */
  static logout(): void {
    tokenStorage.clearTokens();
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Récupérer l'utilisateur connecté
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = tokenStorage.getAccessToken();
      if (!token) return null;
      return await authApi.me();
    } catch {
      return null;
    }
  }

  /**
   * Vérifier si connecté
   */
  static isAuthenticated(): boolean {
    return !!tokenStorage.getAccessToken();
  }

  /**
   * Récupérer l'email mémorisé
   */
  static getRememberedEmail(): string | null {
    try {
      return localStorage.getItem(REMEMBER_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Obtenir l'utilisateur stocké
   */
  static getStoredUser(): AuthUser | null {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  /**
   * Changer mot de passe
   */
  static async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await authApi.changePassword(payload);
  }

  /**
   * Mot de passe oublié
   */
  static async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await authApi.forgotPassword(payload);
  }

  /**
   * Réinitialiser mot de passe
   */
  static async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await authApi.resetPassword(payload);
  }

  /**
   * Vérifier force mot de passe
   */
  static checkPasswordStrength(password: string): {
    score: number;
    label: string;
    checks: Record<string, boolean>;
  } {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent', 'Parfait'];

    return {
      score,
      label: labels[score],
      checks,
    };
  }
}