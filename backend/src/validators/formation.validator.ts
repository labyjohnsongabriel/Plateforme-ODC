<<<<<<< HEAD
import { z } from 'zod';

export const createFormationSchema = z.object({
  body: z.object({
    titre: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    domaine: z.string().min(2).max(100),
    dureeHeures: z.number().int().positive().max(500),
    niveau: z.enum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE']),
    prerequis: z.string().max(2000).optional(),
    objectifs: z.string().max(2000).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
  }),
});

export const updateFormationSchema = z.object({
  body: z.object({
    titre: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    domaine: z.string().min(2).max(100).optional(),
    dureeHeures: z.number().int().positive().max(500).optional(),
    niveau: z.enum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE']).optional(),
    prerequis: z.string().max(2000).optional(),
    objectifs: z.string().max(2000).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    actif: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
});