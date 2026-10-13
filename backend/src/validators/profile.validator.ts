// src/validators/profile.validator.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2, 'Nom trop court').max(100).optional(),
      prenom: z.string().trim().min(2, 'Prénom trop court').max(100).optional(),
      telephone: z
        .string()
        .trim()
        .regex(/^\+?[0-9\s().-]{6,20}$/, 'Numéro de téléphone invalide')
        .optional(),
      bio: z.string().trim().max(2000).optional(),
      ville: z.string().trim().max(200).optional(),
      linkedin: z.string().url().optional().or(z.literal('')),
      siteWeb: z.string().url().optional().or(z.literal('')),
      entreprise: z.string().trim().max(200).optional(),
      poste: z.string().trim().max(200).optional(),
      competences: z.array(z.string().trim().max(100)).max(30).optional(),
      photoCouvertureUrl: z.string().url().optional().or(z.literal('')),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Aucun champ à mettre à jour',
    }),
});

export const toggleVisibiliteSchema = z.object({
  body: z.object({
    profilPublic: z.boolean(),
  }).strict(),
});

export const requestEmailChangeSchema = z.object({
  body: z.object({
    nouvelEmail: z.string().email('Email invalide'),
  }).strict(),
});