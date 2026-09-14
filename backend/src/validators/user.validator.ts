import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(100),
    prenom: z.string().min(2).max(100),
    email: z.string().email(),
    motDePasse: z.string().min(8),
    telephone: z.string().max(20).optional(),
    roleNom: z.enum(['ADMIN', 'STAFF', 'FORMATEUR', 'PARTICIPANT', 'PARTENAIRE']),
    ville: z.string().max(200).optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    nom: z.string().min(2).max(100).optional(),
    prenom: z.string().min(2).max(100).optional(),
    telephone: z.string().max(20).optional(),
    ville: z.string().max(200).optional(),
    bio: z.string().max(2000).optional(),
    linkedin: z.string().url().optional().or(z.literal('')),
    photoUrl: z.string().url().optional().or(z.literal('')),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const changeRoleSchema = z.object({
  body: z.object({
    roleNom: z.enum(['ADMIN', 'STAFF', 'FORMATEUR', 'PARTICIPANT', 'PARTENAIRE']),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const toggleActifSchema = z.object({
  body: z.object({ actif: z.boolean() }),
  params: z.object({ id: z.string().uuid() }),
});