import { z } from 'zod';
import type { ID, Timestamp, PaginationParams } from '@/types/common.types';

// ============================================================================
//  ENUMS
// ============================================================================

export enum NiveauFormation {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
}

export enum DomaineFormation {
  WEB = 'WEB',
  DATA = 'DATA',
  CYBER = 'CYBER',
  IA = 'IA',
  DESIGN = 'DESIGN',
  CLOUD = 'CLOUD',
  MOBILE = 'MOBILE',
  MARKETING = 'MARKETING',
}

// ============================================================================
//  ZOD SCHEMAS (valeurs runtime)
// ============================================================================

export const createFormationSchema = z.object({
  titre: z
    .string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z
    .string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(5000, 'La description ne peut pas dépasser 5000 caractères'),
  domaine: z.string().min(1, 'Le domaine est requis'),
  dureeHeures: z
    .number({ invalid_type_error: 'La durée est requise' })
    .min(1, 'La durée minimale est de 1 heure')
    .max(500, 'La durée maximale est de 500 heures'),
  niveau: z.nativeEnum(NiveauFormation, {
    errorMap: () => ({ message: 'Le niveau est requis' }),
  }),
  prerequis: z.string().max(2000).optional().or(z.literal('')),
  objectifs: z.string().max(2000).optional().or(z.literal('')),
  programme: z.string().max(5000).optional().or(z.literal('')),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  prix: z.number().min(0).optional(),
  nbParticipantsMax: z.number().min(1).max(500).optional(),
  actif: z.boolean().optional(),
});

export const updateFormationSchema = createFormationSchema.partial();

export const formationFiltersSchema = z.object({
  search: z.string().optional(),
  domaine: z.string().optional(),
  niveau: z.nativeEnum(NiveauFormation).optional(),
  actif: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ============================================================================
//  TYPES INFÉRÉS DES SCHÉMAS ZOD
// ============================================================================

export type CreateFormationFormData = z.infer<typeof createFormationSchema>;
export type UpdateFormationFormData = z.infer<typeof updateFormationSchema>;
export type FormationFiltersFormData = z.infer<typeof formationFiltersSchema>;

// ============================================================================
//  ENTITÉS API
// ============================================================================

export interface Formation {
  id: ID;
  titre: string;
  description?: string;
  domaine: string;
  dureeHeures: number;
  niveau: NiveauFormation;
  prerequis?: string;
  objectifs?: string;
  programme?: string;
  imageUrl?: string;
  prix?: number;
  nbParticipantsMax?: number;
  actif: boolean;
  sessions?: unknown[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
//  PAYLOADS API
// ============================================================================

export interface CreateFormationPayload {
  titre: string;
  description: string;
  domaine: string;
  dureeHeures: number;
  niveau: NiveauFormation;
  prerequis?: string;
  objectifs?: string;
  programme?: string;
  imageUrl?: string;
  prix?: number;
  nbParticipantsMax?: number;
}

export interface UpdateFormationPayload extends Partial<CreateFormationPayload> {
  actif?: boolean;
}

export interface FormationFilters extends PaginationParams {
  domaine?: string;
  niveau?: NiveauFormation;
  actif?: boolean;
}

// ============================================================================
//  STATISTIQUES
// ============================================================================

export interface TopFormation {
  titre: string;
  inscriptions: string;
}

export interface FormationStatsByDomaine {
  domaine: string;
  count: string;
}

export interface FormationStats {
  totalFormations: number;
  formationsActives: number;
  totalSessions: number;
  totalParticipants: number;
}