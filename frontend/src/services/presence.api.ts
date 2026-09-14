import type { ID, Timestamp, PaginationParams } from '../types/common.types';
import type { User } from '../types/user.types';
import type { Session } from '../types/session.types';

// ============================================================================
//  PRÉSENCES
// ============================================================================

export interface Presence {
    id: ID;
    session: Session;
    sessionId: ID;
    participant: User;
    participantId: ID;
    datePresence: string;
    heureScan?: string;
    present: boolean;
    justifiee: boolean;
    qrToken?: string;
    commentaire?: string;
    ipAddress?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ScanQrPayload {
    sessionId: ID;
    qrToken: string;
}

export interface MarquerManuelPayload {
    sessionId: ID;
    participantId: ID;
    present: boolean;
    commentaire?: string;
}

export interface TauxPresence {
    tauxPresence: number;
}

export interface PresenceFilters extends PaginationParams {
    sessionId?: ID;
    participantId?: ID;
    date?: string;
}