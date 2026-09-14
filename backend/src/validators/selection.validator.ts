import { z } from 'zod';

export const selectionSchema = z.object({
  body: z.object({
    statut: z.enum(['ACCEPTEE', 'REFUSEE', 'LISTE_ATTENTE']),
    motifRefus: z.string().max(1000).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const selectionMasseSchema = z.object({
  body: z.object({
    inscriptionIds: z.array(z.string().uuid()).min(1).max(500),
    statut: z.enum(['ACCEPTEE', 'REFUSEE', 'LISTE_ATTENTE']),
    motifRefus: z.string().max(1000).optional(),
  }),
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});