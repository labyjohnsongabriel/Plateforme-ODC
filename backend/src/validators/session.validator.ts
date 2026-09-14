import { z } from 'zod';
export const createSessionSchema = z.object({
  body: z.object({
    formationId: z.string().uuid(),
    formateurId: z.string().uuid().optional(),
    dateDebut: z.string(),
    dateFin: z.string(),
    lieu: z.string().max(200).optional(),
    capacite: z.number().int().min(1).max(500).default(30),
  }),
});