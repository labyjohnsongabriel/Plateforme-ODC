// ============================================================================
//  API TYPES — Export centralisé
// ============================================================================

export * from './common.types';
export * from './user.types';
export * from './role.types';
export * from './formation.types';
export * from './session.types';
export * from './inscription.types';
export * from './presence.types';
export * from './evaluation.types';
export * from './attestation.types';
export * from './messagerie.types';
export * from './dashboard.types';

// Notification
export interface Notification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  lue: boolean;
  lien?: string;
  icone?: string;
  metadata?: Record<string, any>;
  dateLecture?: string;
  createdAt: string;
}