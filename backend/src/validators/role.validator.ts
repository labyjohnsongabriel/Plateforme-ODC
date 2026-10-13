// src/validators/role.validator.ts
import { z } from 'zod';
import { uuidSchema, roleNameSchema } from './common.validator';

export const createRoleSchema = z.object({
  body: z
    .object({
      nom: roleNameSchema,
      libelle: z.string().trim().min(2).max(150),
      description: z.string().trim().max(1000).optional(),
      niveauHierarchie: z.coerce.number().int().min(0).max(1000).optional(),
      couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale (#RRGGBB)').optional(),
      icone: z.string().max(100).optional(),
      permissionCodes: z.array(z.string().trim().max(100)).max(200).optional(),
    })
    .strict(),
});

export const updateRoleSchema = z.object({
  body: z
    .object({
      libelle: z.string().trim().min(2).max(150).optional(),
      description: z.string().trim().max(1000).optional(),
      niveauHierarchie: z.coerce.number().int().min(0).max(1000).optional(),
      couleur: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      icone: z.string().max(100).optional(),
      actif: z.boolean().optional(),
      permissionCodes: z.array(z.string().trim().max(100)).max(200).optional(),
    })
    .strict()
    .refine((d) => Object.keys(d).length > 0, {
      message: 'Aucun champ à mettre à jour',
    }),
  params: z.object({ id: uuidSchema }),
});