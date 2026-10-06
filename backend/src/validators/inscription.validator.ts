// src/validators/inscription.validator.ts
import { z } from 'zod';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  statutInscriptionSchema,
} from './common.validator';

/* ============================================================
 *  🌐 INSCRIPTION PUBLIQUE (sans compte)
 * ============================================================ */
export const createPublicInscriptionSchema = z.object({
  body: z
    .object({
      sessionId: uuidSchema,
      email: emailSchema,
      nom: z.string().trim().min(2).max(100),
      prenom: z.string().trim().min(2).max(100),
      telephone: phoneSchema,
      motivation: z.string().trim().max(1000).optional(),
    })
    .strict(),
});

/* ============================================================
 *  🔒 INSCRIPTION PARTICIPANT AUTHENTIFIÉ
 * ============================================================ */
export const createInscriptionSchema = z.object({
  body: z
    .object({
      sessionId: uuidSchema,
      motivation: z.string().trim().max(1000).optional(),
    })
    .strict(),
});

/* ============================================================
 *  SÉLECTION (staff)
 * ============================================================ */
export const selectionnerInscriptionSchema = z.object({
  body: z
    .object({
      statut: statutInscriptionSchema.refine(
        (s) => ['ACCEPTEE', 'REFUSEE', 'LISTE_ATTENTE'].includes(s),
        { message: 'Statut invalide : ACCEPTEE, REFUSEE ou LISTE_ATTENTE' },
      ),
      motifRefus: z.string().trim().max(500).optional(),
    })
    .strict()
    .refine((d) => d.statut !== 'REFUSEE' || !!d.motifRefus, {
      message: 'Un motif est requis en cas de refus',
      path: ['motifRefus'],
    }),
  params: z.object({ id: uuidSchema }),
});

/* ============================================================
 *  SÉLECTION EN MASSE
 * ============================================================ */
export const selectionMasseSchema = z.object({
  body: z
    .object({
      inscriptionIds: z.array(uuidSchema).min(1, 'Sélectionnez au moins un candidat').max(500),
      statut: statutInscriptionSchema.refine(
        (s) => ['ACCEPTEE', 'REFUSEE', 'LISTE_ATTENTE'].includes(s),
        { message: 'Statut invalide' },
      ),
      motifRefus: z.string().trim().max(500).optional(),
    })
    .strict()
    .refine((d) => d.statut !== 'REFUSEE' || !!d.motifRefus, {
      message: 'Un motif est requis en cas de refus',
      path: ['motifRefus'],
    }),
  params: z.object({ sessionId: uuidSchema }),
});

/* ============================================================
 *  SÉLECTION AUTO
 * ============================================================ */
export const selectionAutoSchema = z.object({
  body: z
    .object({
      criteres: z
        .object({
          ordre: z.enum(['INSCRIPTION_ASC', 'INSCRIPTION_DESC']).optional().default('INSCRIPTION_ASC'),
          scoreMin: z.coerce.number().min(0).max(100).optional(),
        })
        .strict()
        .optional()
        .default({}),
    })
    .strict(),
  params: z.object({ sessionId: uuidSchema }),
});