import { z } from 'zod';
import type { ID, Timestamp } from '@/types/common.types';
import type { AppRoleName } from '@/types/role.types';

export const loginSchema = z.object({
  email: z.string().trim().email('Email invalide'),
  motDePasse: z.string().min(1, 'Le mot de passe est requis'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    nom: z.string().trim().min(2, 'Le nom est requis'),
    prenom: z.string().trim().min(2, 'Le prénom est requis'),
    email: z.string().trim().email('Email invalide'),
    telephone: z.string().optional(),
    roleNom: z.enum(['PARTICIPANT', 'PARTENAIRE']),
    motDePasse: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmMotDePasse: z.string(),
    acceptTerms: z.boolean().refine(Boolean, 'Vous devez accepter les conditions'),
  })
  .refine((data) => data.motDePasse === data.confirmMotDePasse, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmMotDePasse'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Email invalide'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  motDePasse: z.string().min(8),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

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
  roleNom: AppRoleName;
}

export interface AuthUser {
  id: ID;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  photoUrl?: string | null;
  role: {
    id: ID;
    nom: AppRoleName;
    description?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordPayload {
  ancienMotDePasse: string;
  nouveauMotDePasse: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  motDePasse: string;
}
