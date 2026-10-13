// src/validators/presence.validator.ts
import { z } from 'zod';
import {
  uuidSchema,
  methodePresenceSchema,
  statutPresenceSchema,
} from './common.validator';

/* ============================================================
 *  SCAN QR (participant)
 * ============================================================ */
export const scanQrSchema = z.object({
  body: z
    .object({
      sessionId: uuidSchema,
      qrToken: z.string().trim().min(10, 'Token QR invalide').max(500),
    })
    .strict(),
});

/* ============================================================
 *  SAISIE MANUELLE (formateur)
 * ============================================================ */
export const marquerManuelSchema = z.object({
  body: z
    .object({
      sessionId: uuidSchema,
      participantId: uuidSchema,
      present: z.boolean(),
      statut: statutPresenceSchema.optional(),
      methode: methodePresenceSchema.optional().default('MANUEL'),
      commentaire: z.string().trim().max(500).optional(),
    })
    .strict()
    .refine((d) => d.present === true || d.statut !== undefined, {
      message: 'Précisez un statut en cas d\'absence',
      path: ['statut'],
    }),
});

/* ============================================================
 *  GÉNÉRATION QR (formateur)
 * ============================================================ */
export const generateQrSchema = z.object({
  body: z
    .object({
      sessionId: uuidSchema,
      dureeMinutes: z.coerce.number().int().positive().max(120).optional().default(5),
    })
    .strict(),
});