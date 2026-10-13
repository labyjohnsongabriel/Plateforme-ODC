// src/validators/common.validator.ts
import { z } from 'zod';
import { RoleName, StatutSession, StatutInscription, StatutPresence, MethodePresence,
  TypeEvaluation, StatutConnection, NiveauFormation, TypeMessage, TypeRessource,
  TypeNotification } from '../entities/enums';

/* ============================================================
 *  PRIMITIVES
 * ============================================================ */
export const uuidSchema = z.string().uuid('Identifiant invalide (UUID attendu)');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Adresse email invalide')
  .max(150, 'Email trop long');

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(72, 'Le mot de passe est trop long (72 max)')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial');

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s().-]{6,20}$/, 'Numéro de téléphone invalide')
  .optional();

export const urlSchema = z.string().url('URL invalide').optional().or(z.literal(''));

/* ============================================================
 *  PAGINATION
 * ============================================================ */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['ASC', 'DESC']).optional(),
});

/* ============================================================
 *  ENUMS RÉUTILISABLES
 * ============================================================ */
export const roleNameSchema = z.nativeEnum(RoleName);
export const statutSessionSchema = z.nativeEnum(StatutSession);
export const statutInscriptionSchema = z.nativeEnum(StatutInscription);
export const statutPresenceSchema = z.nativeEnum(StatutPresence);
export const methodePresenceSchema = z.nativeEnum(MethodePresence);
export const typeEvaluationSchema = z.nativeEnum(TypeEvaluation);
export const statutConnectionSchema = z.nativeEnum(StatutConnection);
export const niveauFormationSchema = z.nativeEnum(NiveauFormation);
export const typeMessageSchema = z.nativeEnum(TypeMessage);
export const typeRessourceSchema = z.nativeEnum(TypeRessource);
export const typeNotificationSchema = z.nativeEnum(TypeNotification);

/* ============================================================
 *  HELPERS
 * ============================================================ */
export const idParamSchema = z.object({
  params: z.object({ id: uuidSchema }),
});

export const paginatedQuerySchema = z.object({
  query: paginationSchema,
});