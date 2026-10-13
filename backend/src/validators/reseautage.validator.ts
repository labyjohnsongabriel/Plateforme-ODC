// src/validators/ressource.validator.ts
import { z } from 'zod';
import { uuidSchema, typeRessourceSchema } from './common.validator';

/* ============================================================
 *  CREATE
 * ============================================================ */
export const createRessourceSchema = z.object({
  body: z
    .object({
      sessionId: uuidSchema.optional(),
      titre: z.string().trim().min(2).max(200),
      description: z.string().trim().max(2000).optional(),
      type: typeRessourceSchema,
      fichierUrl: z.string().url('URL du fichier invalide'),
      fichierNom: z.string().trim().max(255).optional(),
      fichierTaille: z.coerce.number().int().nonnegative().optional(),
      thumbnailUrl: z.string().url().optional().or(z.literal('')),
      visibleParticipants: z.boolean().optional().default(true),
      ordreAffichage: z.coerce.number().int().min(0).max(999).optional().default(0),
    })
    .strict(),
});

/* ============================================================
 *  UPDATE
 * ============================================================ */
export const updateRessourceSchema = z.object({
  body: z
    .object({
      titre: z.string().trim().min(2).max(200).optional(),
      description: z.string().trim().max(2000).optional(),
      type: typeRessourceSchema.optional(),
      fichierUrl: z.string().url().optional(),
      fichierNom: z.string().trim().max(255).optional(),
      fichierTaille: z.coerce.number().int().nonnegative().optional(),
      thumbnailUrl: z.string().url().optional().or(z.literal('')),
      visibleParticipants: z.boolean().optional(),
      ordreAffichage: z.coerce.number().int().min(0).max(999).optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Aucun champ à mettre à jour',
    }),
  params: z.object({ id: uuidSchema }),
});