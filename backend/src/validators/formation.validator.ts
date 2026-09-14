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
});