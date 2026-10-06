// src/validators/partenaire.validator.ts
import { z } from 'zod';
import { uuidSchema, emailSchema, urlSchema } from './common.validator';

export const createPartenaireSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2).max(200),
      slug: z.string().trim().min(2).max(220).optional(),
      secteur: z.string().trim().max(100).optional(),
      description: z.string().trim().max(3000).optional(),
      contactEmail: emailSchema.optional(),
      contactTel: z.string().trim().max(20).optional(),
      siteWeb: urlSchema,
      logoUrl: urlSchema,
      actif: z.boolean().optional().default(true),
      estPubliee: z.boolean().optional().default(true),
      ordreAffichage: z.coerce.number().int().min(0).max(999).optional().default(0),
    })
    .strict(),
});

export const updatePartenaireSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2).max(200).optional(),
      slug: z.string().trim().min(2).max(220).optional(),
      secteur: z.string().trim().max(100).optional(),
      description: z.string().trim().max(3000).optional(),
      contactEmail: emailSchema.optional(),
      contactTel: z.string().trim().max(20).optional(),
      siteWeb: urlSchema,
      logoUrl: urlSchema,
      actif: z.boolean().optional(),
      estPubliee: z.boolean().optional(),
      ordreAffichage: z.coerce.number().int().min(0).max(999).optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Aucun champ à mettre à jour',
    }),
  params: z.object({ id: uuidSchema }),
});