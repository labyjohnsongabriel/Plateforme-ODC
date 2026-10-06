// src/validators/domaine.validator.ts
import { z } from 'zod';

export const createDomaineSchema = z.object({
  body: z.object({
    nom: z.string().trim().min(2).max(100),
    slug: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icone: z.string().max(100).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    actif: z.boolean().optional().default(true),
    estPubliee: z.boolean().optional().default(false),
    ordreAffichage: z.coerce.number().int().min(0).max(999).optional().default(0),
  }).strict(),
});

export const updateDomaineSchema = z.object({
  body: z.object({
    nom: z.string().trim().min(2).max(100).optional(),
    slug: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    icone: z.string().max(100).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    actif: z.boolean().optional(),
    estPubliee: z.boolean().optional(),
    ordreAffichage: z.coerce.number().int().min(0).max(999).optional(),
  }).strict(),
  params: z.object({ id: z.string().uuid() }),
});