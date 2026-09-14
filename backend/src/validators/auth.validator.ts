import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(100),
    prenom: z.string().min(2).max(100),
    email: z.string().email(),
    motDePasse: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir une majuscule')
      .regex(/[a-z]/, 'Doit contenir une minuscule')
      .regex(/[0-9]/, 'Doit contenir un chiffre'),
    telephone: z.string().max(20).optional(),
    roleNom: z
      .enum(['PARTICIPANT', 'FORMATEUR', 'PARTENAIRE'])
      .default('PARTICIPANT'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    motDePasse: z.string().min(1),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    ancienMotDePasse: z.string().min(1),
    nouveauMotDePasse: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/),
  }),
});