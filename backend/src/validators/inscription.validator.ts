import { z } from 'zod';
export const createInscriptionSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid(),
    motivation: z.string().max(1000).optional(),
  }),
});