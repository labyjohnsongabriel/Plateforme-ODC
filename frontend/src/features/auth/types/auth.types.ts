import { z } from 'zod';
import type { ID, Timestamp } from '@/types/common.types';
import type { RoleName } from '@/types/user.types';

<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════
// 🔐 SCHÉMA DE CONNEXION
// ═══════════════════════════════════════════════════════════
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  remember: z.boolean().optional(),
});

<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════
// 📝 SCHÉMA D'INSCRIPTION
// ═══════════════════════════════════════════════════════════
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  prenom: z.string().min(2, 'Le prénom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
<<<<<<< HEAD

  // 🎯 CHAMP roleNom AJOUTÉ (c'était LE BUG)
  roleNom: z.enum(
    ['PARTICIPANT', 'FORMATEUR', 'STAFF_ODC', 'PARTENAIRE'],
    { errorMap: () => ({ message: 'Veuillez choisir un rôle' }) }
  ),

=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmMotDePasse: z.string(),
  acceptTerms: z.boolean().refine((v) => v === true, 'Vous devez accepter les conditions'),
}).refine((data) => data.motDePasse === data.confirmMotDePasse, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmMotDePasse'],
});

<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════
// 📧 MOT DE PASSE OUBLIÉ
// ═══════════════════════════════════════════════════════════
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════
// 🔄 RÉINITIALISATION MOT DE PASSE
// ═══════════════════════════════════════════════════════════
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  motDePasse: z.string().min(8),
});

<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════
// 📘 TYPES INFÉRÉS
// ═══════════════════════════════════════════════════════════
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════
// 📤 PAYLOADS
// ═══════════════════════════════════════════════════════════
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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

<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════
// 👤 AUTH USER
// ═══════════════════════════════════════════════════════════
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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

<<<<<<< HEAD
// ═══════════════════════════════════════════════════════════
// 📤 AUTH RESPONSE
// ═══════════════════════════════════════════════════════════
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}