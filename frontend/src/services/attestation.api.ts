import type { ID, Timestamp } from '../types/common.types';
import type { User } from '../types/user.types';
import type { Session } from '../types/session.types';

// ============================================================================
//  ATTESTATIONS
// ============================================================================

export interface Attestation {
    id: ID;
    numero: string;
    hash: string;
    session: Session;
    sessionId: ID;
    participant: User;
    participantId: ID;
    fichierUrl?: string;
    noteFinale?: number;
    tauxPresence?: number;
    telechargee: boolean;
    dateTelechargement?: Timestamp;
    signatureNumerique?: string;
    valide: boolean;
    dateEmission: Timestamp;
    createdAt: Timestamp;
}

export interface AttestationVerification {
    numero: string;
    participant: string;
    formation: string;
    dateEmission: Timestamp;
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

export interface GenererAttestationPayload {
    sessionId: ID;
    participantId: ID;
}

export interface GenererParSessionResponse {
    succes: number;
    echecs: number;
    details: Array<{
        participant: string;
        statut: 'OK' | 'ECHEC';
        raison?: string;
    }>;
}