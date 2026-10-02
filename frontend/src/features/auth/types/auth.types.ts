import { z } from 'zod';
import type { ID, Timestamp } from '@/types/common.types';
import type { RoleName } from '@/types/user.types';

// ═══════════════════════════════════════════════════════════
// 🔐 SCHÉMA DE CONNEXION
// ═══════════════════════════════════════════════════════════
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  remember: z.boolean().optional(),
});

// ═══════════════════════════════════════════════════════════
// 📝 SCHÉMA D'INSCRIPTION
// ═══════════════════════════════════════════════════════════
export const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),

  // 🎯 CHAMP roleNom AJOUTÉ (c'était LE BUG)
  roleNom: z.enum(
    ['PARTICIPANT', 'FORMATEUR', 'STAFF_ODC', 'PARTENAIRE'],
    { errorMap: () => ({ message: 'Veuillez choisir un rôle' }) }
  ),

  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmMotDePasse: z.string(),
  acceptTerms: z.boolean().refine((v) => v === true, 'Vous devez accepter les conditions'),
}).refine((data) => data.motDePasse === data.confirmMotDePasse, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmMotDePasse'],
});

// ═══════════════════════════════════════════════════════════
// 📧 MOT DE PASSE OUBLIÉ
// ═══════════════════════════════════════════════════════════
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

// ═══════════════════════════════════════════════════════════
// 🔄 RÉINITIALISATION MOT DE PASSE
// ═══════════════════════════════════════════════════════════
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  motDePasse: z.string().min(8),
});

// ═══════════════════════════════════════════════════════════
// 📘 TYPES INFÉRÉS
// ═══════════════════════════════════════════════════════════
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ═══════════════════════════════════════════════════════════
// 📤 PAYLOADS
// ═══════════════════════════════════════════════════════════
export interface LoginPayload {
  email: string;
  motDePasse: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  roleNom: RoleName;
}

// ═══════════════════════════════════════════════════════════
// 👤 AUTH USER
// ═══════════════════════════════════════════════════════════
export interface AuthUser {
  id: ID;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  photoUrl?: string;
  role: {
    id: ID;
    nom: RoleName;
    description?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ═══════════════════════════════════════════════════════════
// 📤 AUTH RESPONSE
// ═══════════════════════════════════════════════════════════
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}