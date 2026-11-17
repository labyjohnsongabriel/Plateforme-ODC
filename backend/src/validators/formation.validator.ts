// src/validators/formation.validator.ts
import { z } from 'zod';
import {
  uuidSchema,
  urlSchema,
  niveauFormationSchema,
} from './common.validator';

/* ============================================================
 *  CREATE
 * ============================================================ */
export const createFormationSchema = z.object({
  body: z
    .object({
      titre: z.string().trim().min(3, 'Titre trop court').max(200, 'Titre trop long'),
      slug: z.string().trim().min(3).max(220).optional(),
      description: z.string().trim().min(10, 'Description trop courte').max(5000),
      objectifs: z.string().trim().max(2000).optional(),
      prerequis: z.string().trim().max(2000).optional(),
      programme: z.string().trim().max(10000).optional(),

      domaineId: uuidSchema.optional(),
      domaine: z.string().trim().min(2).max(100).optional(), // fallback legacy

      niveau: niveauFormationSchema,
      dureeHeures: z.coerce.number().int().positive().max(500),

      imageUrl: urlSchema,
      imageCouvertureUrl: urlSchema,
      videoPresentationUrl: urlSchema,

      prix: z.coerce.number().nonnegative().max(1000000).optional(),
      nbParticipantsMax: z.coerce.number().int().min(0).max(10000).optional().default(0),

      estPubliee: z.boolean().optional().default(false),
      actif: z.boolean().optional().default(true),
      miseEnAvant: z.boolean().optional().default(false),
    })
    .strict()
    .refine((d) => d.domaineId || d.domaine, {
      message: 'Un domaine (domaineId) est requis',
      path: ['domaineId'],
    }),
});

/* ============================================================
 *  UPDATE
 * ============================================================ */
export const updateFormationSchema = z.object({
  body: z
    .object({
      titre: z.string().trim().min(3).max(200).optional(),
      slug: z.string().trim().min(3).max(220).optional(),
      description: z.string().trim().min(10).max(5000).optional(),
      objectifs: z.string().trim().max(2000).optional(),
      prerequis: z.string().trim().max(2000).optional(),
      programme: z.string().trim().max(10000).optional(),

      domaineId: uuidSchema.optional(),
      domaine: z.string().trim().min(2).max(100).optional(),

      niveau: niveauFormationSchema.optional(),
      dureeHeures: z.coerce.number().int().positive().max(500).optional(),

      imageUrl: urlSchema,
      imageCouvertureUrl: urlSchema,
      videoPresentationUrl: urlSchema,

      prix: z.coerce.number().nonnegative().max(1000000).optional(),
      nbParticipantsMax: z.coerce.number().int().min(0).max(10000).optional(),

      actif: z.boolean().optional(),
      miseEnAvant: z.boolean().optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Aucun champ à mettre à jour',
    }),
  params: z.object({ id: uuidSchema }),
});

/* ============================================================
 *  PUBLICATION
 * ============================================================ */
export const publierFormationSchema = z.object({
  body: z
    .object({
      estPubliee: z.boolean(),
    })
    .strict(),
  params: z.object({ id: uuidSchema }),
});

/* ============================================================
 *  SEARCH
 * ============================================================ */
export const searchFormationsSchema = z.object({
  query: z.object({
    q: z.string().trim().max(200).optional(),
    domaineId: uuidSchema.optional(),
    niveau: niveauFormationSchema.optional(),
    estPubliee: z.enum(['true', 'false']).optional(),
    actif: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});