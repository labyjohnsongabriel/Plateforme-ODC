// src/validators/note.validator.ts
import { z } from 'zod';
import { uuidSchema } from './common.validator';

/* ============================================================
 *  SAISIE DE NOTE (formateur)
 * ============================================================ */
export const saisirNoteSchema = z.object({
  body: z
    .object({
      participantId: uuidSchema,
      note: z.coerce.number().nonnegative().max(100, 'Note hors barème'),
      commentaire: z.string().trim().max(1000).optional(),
    })
    .strict(),
  params: z.object({ evaluationId: uuidSchema }),
});

/* ============================================================
 *  CREATE OR UPDATE
 * ============================================================ */
export const createOrUpdateNoteSchema = z.object({
  body: z
    .object({
      evaluationId: uuidSchema,
      participantId: uuidSchema,
      note: z.coerce.number().nonnegative().max(100),
      commentaire: z.string().trim().max(1000).optional(),
    })
    .strict(),
});

/* ============================================================
 *  SEARCH
 * ============================================================ */
export const searchNotesSchema = z.object({
  query: z.object({
    evaluationId: uuidSchema.optional(),
    participantId: uuidSchema.optional(),
    sessionId: uuidSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});