// src/validators/attestation.validator.ts
import { z } from 'zod';
import { uuidSchema } from './common.validator';

/* ============================================================
 *  GÉNÉRATION INDIVIDUELLE
 * ============================================================ */
export const genererAttestationSchema = z.object({
  body: z
    .object({
      sessionId: uuidSchema,
      participantId: uuidSchema,
    })
    .strict(),
});

/* ============================================================
 *  VÉRIFICATION PUBLIQUE (QR)
 * ============================================================ */
export const verifierAttestationSchema = z.object({
  params: z.object({
    numero: z.string().trim().min(5, 'Numéro invalide').max(50),
  }),
});

/* ============================================================
 *  ÉLIGIBILITÉ
 * ============================================================ */
export const eligibiliteSchema = z.object({
  params: z.object({
    sessionId: uuidSchema,
    participantId: uuidSchema,
  }),
});

/* ============================================================
 *  SEARCH (admin/staff)
 * ============================================================ */
export const searchAttestationsSchema = z.object({
  query: z.object({
    sessionId: uuidSchema.optional(),
    participantId: uuidSchema.optional(),
    valide: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});