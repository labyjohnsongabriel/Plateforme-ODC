import { z } from 'zod';

// ============================================================================
//  ENUMS
// ============================================================================

export enum StatutInscription {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  LISTE_ATTENTE = 'LISTE_ATTENTE',
  ANNULEE = 'ANNULEE',
}

// ============================================================================
//  SCHÉMAS ZOD (valeurs runtime)
// ============================================================================

export const createInscriptionSchema = z.object({
  sessionId: z.string().min(1, 'Session requise'),
  motivation: z.string().max(1000, 'Maximum 1000 caractères').optional(),
});

export const selectionnerSchema = z.object({
  statut: z.nativeEnum(StatutInscription),
  motifRefus: z.string().max(500).optional(),
});

export const selectionMasseSchema = z.object({
  inscriptionIds: z
    .array(z.string())
    .min(1, 'Sélectionnez au moins un candidat'),
  statut: z.nativeEnum(StatutInscription),
  motifRefus: z.string().max(500).optional(),
});

// ============================================================================
//  TYPES INFÉRÉS DES SCHÉMAS
// ============================================================================

export type CreateInscriptionFormData = z.infer<typeof createInscriptionSchema>;
export type SelectionnerFormData = z.infer<typeof selectionnerSchema>;
export type SelectionMasseFormData = z.infer<typeof selectionMasseSchema>;

// ============================================================================
//  ENTITÉS
// ============================================================================

export interface Inscription {
  id: string;
  statut: StatutInscription;
  motifRefus?: string;
  motivation?: string;
  dateInscription: string;
  dateSelection?: string;
  participant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    photoUrl?: string;
    ville?: string;
  };
  participantId: string;
  session: {
    id: string;
    dateDebut: string;
    dateFin: string;
    lieu?: string;
    capacite: number;
    formation?: {
      titre: string;
      domaine: string;
    };
  };
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
//  PAYLOADS API
// ============================================================================

export interface CreateInscriptionPayload {
  sessionId: string;
  motivation?: string;
}

export interface SelectionnerPayload {
  statut: StatutInscription;
  motifRefus?: string;
}

export interface SelectionMassePayload {
  inscriptionIds: string[];
  statut: StatutInscription;
  motifRefus?: string;
}

// ============================================================================
//  FILTRES / STATS
// ============================================================================

export interface InscriptionFilters {
  search?: string;
  statut?: StatutInscription;
  sessionId?: string;
  participantId?: string;
  page?: number;
  limit?: number;
}

export interface SelectionStats {
  total: number;
  enAttente: number;
  acceptees: number;
  refusees: number;
  listeAttente: number;
  capacite: number;
  placesRestantes: number;
  tauxRemplissage: number;
}