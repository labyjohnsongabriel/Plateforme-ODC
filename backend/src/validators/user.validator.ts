<<<<<<< HEAD
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
=======
// src/validators/user.validator.ts
import { z } from 'zod';
import {
  uuidSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  urlSchema,
  roleNameSchema,
} from './common.validator';

/* ============================================================
 *  CREATE USER (admin)
 * ============================================================ */
export const createUserSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2).max(100),
      prenom: z.string().trim().min(2).max(100),
      email: emailSchema,
      motDePasse: passwordSchema,
      telephone: phoneSchema,
      roleNom: roleNameSchema,
      actif: z.boolean().optional().default(true),
      ville: z.string().trim().max(200).optional(),
      entreprise: z.string().trim().max(200).optional(),
      poste: z.string().trim().max(200).optional(),
    })
    .strict(),
});

/* ============================================================
 *  UPDATE USER (admin) — tous les champs optionnels sauf protections
 * ============================================================ */
export const updateUserSchema = z.object({
  body: z
    .object({
      nom: z.string().trim().min(2).max(100).optional(),
      prenom: z.string().trim().min(2).max(100).optional(),
      telephone: phoneSchema,
      photoUrl: urlSchema,
      bio: z.string().trim().max(2000).optional(),
      ville: z.string().trim().max(200).optional(),
      linkedin: urlSchema,
      siteWeb: urlSchema,
      entreprise: z.string().trim().max(200).optional(),
      poste: z.string().trim().max(200).optional(),
      competences: z.array(z.string().trim().max(100)).max(30).optional(),
      profilPublic: z.boolean().optional(),
      actif: z.boolean().optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Aucun champ à mettre à jour',
    }),
  params: z.object({ id: uuidSchema }),
});

/* ============================================================
 *  CHANGE ROLE (admin)
 * ============================================================ */
export const changeRoleSchema = z.object({
  body: z
    .object({
      roleNom: roleNameSchema,
    })
    .strict(),
  params: z.object({ id: uuidSchema }),
});

/* ============================================================
 *  TOGGLE ACTIF (admin)
 * ============================================================ */
export const toggleActifSchema = z.object({
  body: z
    .object({
      actif: z.boolean(),
    })
    .strict(),
  params: z.object({ id: uuidSchema }),
});

/* ============================================================
 *  SEARCH USERS (admin, query)
 * ============================================================ */
export const searchUsersSchema = z.object({
  query: z.object({
    roleId: uuidSchema.optional(),
    actif: z.enum(['true', 'false']).optional(),
    q: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
});