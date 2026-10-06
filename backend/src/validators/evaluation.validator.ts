// src/validators/evaluation.validator.ts
import { z } from 'zod';
import {
  uuidSchema,
  typeEvaluationSchema,
} from './common.validator';

/* ============================================================
 *  CREATE
 * ============================================================ */
export const createEvaluationSchema = z
  .object({
    body: z
      .object({
        sessionId: uuidSchema,
        titre: z.string().trim().min(3).max(200),
        type: typeEvaluationSchema,
        noteMax: z.coerce.number().positive().max(100).default(20),
        noteMinPassage: z.coerce.number().nonnegative().max(100).default(10),
        coefficient: z.coerce.number().positive().max(10).default(1),
        dateEvaluation: z.coerce.date().optional(),
        dureeMinutes: z.coerce.number().int().positive().max(600).optional(),
        description: z.string().trim().max(5000).optional(),
        consignes: z.string().trim().max(5000).optional(),
        publiee: z.boolean().optional().default(false),
      })
      .strict(),
  })
  .refine((d) => d.body.noteMinPassage <= d.body.noteMax, {
    message: 'noteMinPassage doit être inférieure ou égale à noteMax',
    path: ['body', 'noteMinPassage'],
  });

/* ============================================================
 *  UPDATE
 * ============================================================ */
export const updateEvaluationSchema = z
  .object({
    body: z
      .object({
        titre: z.string().trim().min(3).max(200).optional(),
        type: typeEvaluationSchema.optional(),
        noteMax: z.coerce.number().positive().max(100).optional(),
        noteMinPassage: z.coerce.number().nonnegative().max(100).optional(),
        coefficient: z.coerce.number().positive().max(10).optional(),
        dateEvaluation: z.coerce.date().optional(),
        dureeMinutes: z.coerce.number().int().positive().max(600).optional(),
        description: z.string().trim().max(5000).optional(),
        consignes: z.string().trim().max(5000).optional(),
      })
      .strict()
      .refine((d) => Object.keys(d).length > 0, {
        message: 'Aucun champ à mettre à jour',
      }),
    params: z.object({ id: uuidSchema }),
  });

/* ============================================================
 *  PUBLIER
 * ============================================================ */
export const publierEvaluationSchema = z.object({
  body: z
    .object({
      publiee: z.boolean(),
    })
    .strict(),
  params: z.object({ id: uuidSchema }),
});