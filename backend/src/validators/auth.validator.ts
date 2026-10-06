// src/validators/auth.validator.ts
import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
} from './common.validator';

/* ============================================================
 *  🔒 SÉCURITÉ : les rôles publics sont limités
 * ============================================================ */
const publicRoleSchema = z.enum(['PARTICIPANT', 'PARTENAIRE'], {
  errorMap: () => ({
    message: 'Rôle invalide : PARTICIPANT ou PARTENAIRE attendu',
  }),
});

/* ============================================================
 *  REGISTER
 * ============================================================ */
export const registerSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2, 'Nom trop court (2 min)').max(100, 'Nom trop long'),
      prenom: z.string().trim().min(2, 'Prénom trop court (2 min)').max(100, 'Prénom trop long'),
      email: emailSchema,
      motDePasse: passwordSchema,
      telephone: phoneSchema,
      roleNom: publicRoleSchema.default('PARTICIPANT'),
      // Profil optionnel
      ville: z.string().trim().max(200).optional(),
      bio: z.string().trim().max(2000).optional(),
    })
    .strict(),
});

/* ============================================================
 *  LOGIN
 * ============================================================ */
export const loginSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      motDePasse: z.string().min(1, 'Mot de passe requis'),
    })
    .strict(),
});

/* ============================================================
 *  REFRESH
 * ============================================================ */
export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(10, 'Refresh token invalide'),
    })
    .strict(),
});

/* ============================================================
 *  CHANGE PASSWORD
 * ============================================================ */
export const changePasswordSchema = z.object({
  body: z
    .object({
      ancienMotDePasse: z.string().min(1, 'Ancien mot de passe requis'),
      nouveauMotDePasse: passwordSchema,
    })
    .strict()
    .refine((d) => d.ancienMotDePasse !== d.nouveauMotDePasse, {
      message: 'Le nouveau mot de passe doit être différent de l\'ancien',
      path: ['nouveauMotDePasse'],
    }),
});

/* ============================================================
 *  FORGOT / RESET PASSWORD
 * ============================================================ */
export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: emailSchema,
    })
    .strict(),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(10, 'Token invalide'),
      nouveauMotDePasse: passwordSchema,
    })
    .strict(),
});

/* ============================================================
 *  ALIAS (compat. avec routes existantes)
 * ============================================================ */
export const validateRegister = registerSchema;
export const validateLogin = loginSchema;