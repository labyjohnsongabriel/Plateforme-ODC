// ============================================================================
// ODC PLATFORM — Types d'authentification
// Fichier : src/features/auth/types/auth.types.ts
// ============================================================================

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// 🔐 SCHÉMA DE CONNEXION
// ═══════════════════════════════════════════════════════════════════════════
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  motDePasse: z
    .string()
    .min(1, 'Le mot de passe est requis'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// 🆕 RÔLES DISPONIBLES À L'INSCRIPTION
// ⚠️ ADMIN absent volontairement (sécurité)
// ═══════════════════════════════════════════════════════════════════════════
export const roleEnum = z.enum(
  ['PARTICIPANT', 'FORMATEUR', 'STAFF_ODC', 'PARTENAIRE'],
  {
    errorMap: () => ({ message: 'Veuillez choisir un rôle' }),
  }
);

export type RoleName = z.infer<typeof roleEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// 📝 SCHÉMA D'INSCRIPTION
// ═══════════════════════════════════════════════════════════════════════════
export const registerSchema = z
  .object({
    // Identité
    nom: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100, 'Le nom est trop long'),

    prenom: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(100, 'Le prénom est trop long'),

    email: z
      .string()
      .min(1, 'L\'email est requis')
      .email('Email invalide'),

    telephone: z
      .string()
      .optional()
      .or(z.literal('')),

    // 🆕 Rôle choisi dans le Select
    roleNom: roleEnum,

    // Sécurité
    motDePasse: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre'),

    confirmMotDePasse: z
      .string()
      .min(1, 'La confirmation est requise'),

    // Termes
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Vous devez accepter les conditions d\'utilisation',
      }),
  })
  // ✅ Vérification que les 2 mots de passe correspondent
  .refine((data) => data.motDePasse === data.confirmMotDePasse, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmMotDePasse'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// 🔑 SCHÉMA DE CHANGEMENT DE MOT DE PASSE
// ═══════════════════════════════════════════════════════════════════════════
export const changePasswordSchema = z
  .object({
    ancienMotDePasse: z
      .string()
      .min(1, 'L\'ancien mot de passe est requis'),

    nouveauMotDePasse: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Une majuscule est requise')
      .regex(/[a-z]/, 'Une minuscule est requise')
      .regex(/[0-9]/, 'Un chiffre est requis'),

    confirmNouveauMotDePasse: z
      .string()
      .min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.nouveauMotDePasse === data.confirmNouveauMotDePasse, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmNouveauMotDePasse'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// 📧 SCHÉMA MOT DE PASSE OUBLIÉ
// ═══════════════════════════════════════════════════════════════════════════
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 SCHÉMA RÉINITIALISATION MOT DE PASSE
// ═══════════════════════════════════════════════════════════════════════════
export const resetPasswordSchema = z
  .object({
    motDePasse: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Une majuscule est requise')
      .regex(/[a-z]/, 'Une minuscule est requise')
      .regex(/[0-9]/, 'Un chiffre est requis'),

    confirmMotDePasse: z
      .string()
      .min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.motDePasse === data.confirmMotDePasse, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmMotDePasse'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;