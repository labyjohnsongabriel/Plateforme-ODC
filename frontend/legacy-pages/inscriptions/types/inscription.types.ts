import { z } from 'zod';
import type { ID, Timestamp, PaginationParams } from '@/types/common.types';
import type { User } from '@/types/user.types';
import type { Session } from '@/types/session.types';

export enum StatutInscription {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  LISTE_ATTENTE = 'LISTE_ATTENTE',
}

export const createInscriptionSchema = z.object({
  sessionId: z.string().min(1),
  motivation: z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v === true),
});

export type CreateInscriptionFormData = z.infer<typeof createInscriptionSchema>;

export interface Inscription {
  id: ID;
  session: Session;
  sessionId: ID;
  participant: User;
  participantId: ID;
  statut: StatutInscription;
  motifRefus?: string;
  motivation?: string;
  dateInscription: Timestamp;
}

export interface InscriptionFilters extends PaginationParams {
  sessionId?: ID;
  participantId?: ID;
  statut?: StatutInscription;
}