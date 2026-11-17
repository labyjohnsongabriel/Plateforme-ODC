// src/validators/session.validator.ts
import { z } from 'zod';
import {
  uuidSchema,
  urlSchema,
  statutSessionSchema,
} from './common.validator';

/* ============================================================
 *  CREATE
 * ============================================================ */
export const createSessionSchema = z
  .object({
    body: z
      .object({
        formationId: uuidSchema,
        formateurId: uuidSchema.optional(),
        codeSession: z.string().trim().min(3).max(50).optional(),
        dateDebut: z.coerce.date({ errorMap: () => ({ message: 'Date de début invalide' }) }),
        dateFin: z.coerce.date({ errorMap: () => ({ message: 'Date de fin invalide' }) }),
        lieu: z.string().trim().max(200).optional(),
        lienVisio: urlSchema,
        capacite: z.coerce.number().int().positive().max(10000).default(30),
        statut: statutSessionSchema.default('PLANIFIEE'),
        notes: z.string().trim().max(5000).optional(),
        imageUrl: urlSchema,
        estPubliee: z.boolean().optional().default(true),
        dateOuvertureInscriptions: z.coerce.date().optional(),
        dateFermetureInscriptions: z.coerce.date().optional(),
      })
      .strict(),
  })
  .refine((d) => d.body.dateFin > d.body.dateDebut, {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['body', 'dateFin'],
  })
  .refine(
    (d) =>
      !d.body.dateOuvertureInscriptions ||
      !d.body.dateFermetureInscriptions ||
      d.body.dateFermetureInscriptions > d.body.dateOuvertureInscriptions,
    {
      message: 'La fermeture des inscriptions doit être postérieure à l\'ouverture',
      path: ['body', 'dateFermetureInscriptions'],
    },
  );

/* ============================================================
 *  UPDATE
 * ============================================================ */
export const updateSessionSchema = z.object({
  body: z
    .object({
      formateurId: uuidSchema.optional(),
      dateDebut: z.coerce.date().optional(),
      dateFin: z.coerce.date().optional(),
      lieu: z.string().trim().max(200).optional(),
      lienVisio: urlSchema,
      capacite: z.coerce.number().int().positive().max(10000).optional(),
      statut: statutSessionSchema.optional(),
      notes: z.string().trim().max(5000).optional(),
      imageUrl: urlSchema,
      estPubliee: z.boolean().optional(),
      dateOuvertureInscriptions: z.coerce.date().optional(),
      dateFermetureInscriptions: z.coerce.date().optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Aucun champ à mettre à jour',
    }),
  params: z.object({ id: uuidSchema }),
});

/* ============================================================
 *  STATUT / PUBLIER / PRÉSENCE
 * ============================================================ */
export const changerStatutSessionSchema = z.object({
  body: z
    .object({
      statut: statutSessionSchema,
    })
    .strict(),
  params: z.object({ id: uuidSchema }),
});

export const publierSessionSchema = z.object({
  body: z
    .object({
      estPubliee: z.boolean(),
    })
    .strict(),
  params: z.object({ id: uuidSchema }),
});

export const ouvrirPresenceSchema = z.object({
  body: z
    .object({
      ouverte: z.boolean(),
    })
    .strict(),
  params: z.object({ id: uuidSchema }),
});