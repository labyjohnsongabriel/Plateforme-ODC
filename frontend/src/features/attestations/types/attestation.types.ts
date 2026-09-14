import { z } from 'zod';

// ============================================================================
//  TYPES
// ============================================================================

export interface Attestation {
  id: string;
  numero: string;
  hash: string;
  sessionId: string;
  session?: {
    id: string;
    formation?: {
      titre: string;
      domaine: string;
      dureeHeures: number;
    };
    formateur?: {
      prenom: string;
      nom: string;
    };
    dateDebut: string;
    dateFin: string;
  };
  participantId: string;
  participant?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    photoUrl?: string;
  };
  fichierUrl?: string;
  noteFinale?: number;
  tauxPresence?: number;
  telechargee: boolean;
  dateTelechargement?: string;
  signatureNumerique?: string;
  valide: boolean;
  dateEmission: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttestationVerification {
  numero: string;
  participant: string;
  formation: string;
  dateEmission: string;
  noteFinale?: number;
}

export interface EligibleVerification {
  eligible: boolean;
  raisons: string[];
  details: {
    tauxPresence: number;
    noteMoyenne: number;
    nombreEvaluations: number;
  };
}

export interface GenerateAttestationPayload {
  sessionId: string;
  participantId: string;
}

export interface GenerateBatchPayload {
  sessionId: string;
}

export interface GenerateBatchResult {
  succes: number;
  echecs: number;
  details: Array<{
    participant: string;
    statut: 'OK' | 'ECHEC';
    raison?: string;
  }>;
}

export interface AttestationFilters {
  search?: string;
  sessionId?: string;
  participantId?: string;
  valide?: boolean;
  page?: number;
  limit?: number;
}

export interface AttestationStats {
  total: number;
  valides: number;
  telechargees: number;
  enAttente: number;
  noteMoyenne: number;
  presenceMoyenne: number;
}

// ============================================================================
//  SCHÉMAS ZOD
// ============================================================================

export const verifyAttestationSchema = z.object({
  numero: z
    .string()
    .min(1, 'Numéro requis')
    .regex(
      /^ODC-\d{4}-[A-Z]{3}-[A-F0-9]{6}$/,
      'Format invalide (ex: ODC-2026-WEB-A1B2C3)'
    ),
});

export const generateAttestationSchema = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid(),
});

export type VerifyAttestationFormData = z.infer<typeof verifyAttestationSchema>;
export type GenerateAttestationFormData = z.infer<typeof generateAttestationSchema>;