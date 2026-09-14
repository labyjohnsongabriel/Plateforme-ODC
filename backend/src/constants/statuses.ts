/**
 * ============================================================================
 *  STATUTS DE LA PLATEFORME ODC
 * ============================================================================
 */

// ============================================================================
// STATUTS DE SESSION
// ============================================================================
export enum SessionStatus {
  OUVERTE = 'OUVERTE',
  FERMEE = 'FERMEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export const SESSION_STATUS_META: Record<
  SessionStatus,
  { libelle: string; couleur: string; icone: string }
> = {
  [SessionStatus.OUVERTE]: {
    libelle: 'Ouverte',
    couleur: '#2E7D32',
    icone: 'lock-open',
  },
  [SessionStatus.FERMEE]: {
    libelle: 'Fermée',
    couleur: '#6B6B6B',
    icone: 'lock-closed',
  },
  [SessionStatus.EN_COURS]: {
    libelle: 'En cours',
    couleur: '#FF7900',
    icone: 'play',
  },
  [SessionStatus.TERMINEE]: {
    libelle: 'Terminée',
    couleur: '#0277BD',
    icone: 'check-circle',
  },
  [SessionStatus.ANNULEE]: {
    libelle: 'Annulée',
    couleur: '#C62828',
    icone: 'x-circle',
  },
};

// ============================================================================
// STATUTS D'INSCRIPTION
// ============================================================================
export enum InscriptionStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  LISTE_ATTENTE = 'LISTE_ATTENTE',
  ANNULEE = 'ANNULEE',
}

export const INSCRIPTION_STATUS_META: Record<
  InscriptionStatus,
  { libelle: string; couleur: string; icone: string }
> = {
  [InscriptionStatus.EN_ATTENTE]: {
    libelle: 'En attente',
    couleur: '#F57C00',
    icone: 'clock',
  },
  [InscriptionStatus.ACCEPTEE]: {
    libelle: 'Acceptée',
    couleur: '#2E7D32',
    icone: 'check-circle',
  },
  [InscriptionStatus.REFUSEE]: {
    libelle: 'Refusée',
    couleur: '#C62828',
    icone: 'x-circle',
  },
  [InscriptionStatus.LISTE_ATTENTE]: {
    libelle: 'Liste d\'attente',
    couleur: '#7B1FA2',
    icone: 'queue-list',
  },
  [InscriptionStatus.ANNULEE]: {
    libelle: 'Annulée',
    couleur: '#6B6B6B',
    icone: 'ban',
  },
};

// ============================================================================
// STATUTS DE FORMATION (niveaux)
// ============================================================================
export enum FormationLevel {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
}

export const FORMATION_LEVEL_META: Record<
  FormationLevel,
  { libelle: string; couleur: string }
> = {
  [FormationLevel.DEBUTANT]: {
    libelle: 'Débutant',
    couleur: '#2E7D32',
  },
  [FormationLevel.INTERMEDIAIRE]: {
    libelle: 'Intermédiaire',
    couleur: '#FF7900',
  },
  [FormationLevel.AVANCE]: {
    libelle: 'Avancé',
    couleur: '#C62828',
  },
};

// ============================================================================
// TYPES D'ÉVALUATION
// ============================================================================
export enum EvaluationType {
  QUIZ = 'QUIZ',
  PROJET = 'PROJET',
  EXAMEN = 'EXAMEN',
  TP = 'TP',
  ORAL = 'ORAL',
}

export const EVALUATION_TYPE_META: Record<
  EvaluationType,
  { libelle: string; icone: string; couleur: string }
> = {
  [EvaluationType.QUIZ]: {
    libelle: 'Quiz',
    icone: 'question-mark-circle',
    couleur: '#0277BD',
  },
  [EvaluationType.PROJET]: {
    libelle: 'Projet',
    icone: 'folder',
    couleur: '#7B1FA2',
  },
  [EvaluationType.EXAMEN]: {
    libelle: 'Examen',
    icone: 'document-text',
    couleur: '#C62828',
  },
  [EvaluationType.TP]: {
    libelle: 'Travaux pratiques',
    icone: 'wrench',
    couleur: '#2E7D32',
  },
  [EvaluationType.ORAL]: {
    libelle: 'Présentation orale',
    icone: 'microphone',
    couleur: '#F57C00',
  },
};

// ============================================================================
// TYPES DE NOTIFICATION
// ============================================================================
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  { libelle: string; couleur: string; icone: string }
> = {
  [NotificationType.INFO]: {
    libelle: 'Information',
    couleur: '#0277BD',
    icone: 'information-circle',
  },
  [NotificationType.SUCCESS]: {
    libelle: 'Succès',
    couleur: '#2E7D32',
    icone: 'check-circle',
  },
  [NotificationType.WARNING]: {
    libelle: 'Avertissement',
    couleur: '#F57C00',
    icone: 'exclamation-triangle',
  },
  [NotificationType.ERROR]: {
    libelle: 'Erreur',
    couleur: '#C62828',
    icone: 'x-circle',
  },
};

// ============================================================================
// STATUTS DE CONNEXION (réseautage)
// ============================================================================
export enum ConnectionStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  BLOQUEE = 'BLOQUEE',
}

export const CONNECTION_STATUS_META: Record<
  ConnectionStatus,
  { libelle: string; couleur: string }
> = {
  [ConnectionStatus.EN_ATTENTE]: {
    libelle: 'En attente',
    couleur: '#F57C00',
  },
  [ConnectionStatus.ACCEPTEE]: {
    libelle: 'Acceptée',
    couleur: '#2E7D32',
  },
  [ConnectionStatus.REFUSEE]: {
    libelle: 'Refusée',
    couleur: '#C62828',
  },
  [ConnectionStatus.BLOQUEE]: {
    libelle: 'Bloquée',
    couleur: '#6B6B6B',
  },
};

// ============================================================================
// TYPES DE RESSOURCE
// ============================================================================
export enum RessourceType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  LIEN = 'LIEN',
  DOCUMENT = 'DOCUMENT',
  PRESENTATION = 'PRESENTATION',
  AUTRE = 'AUTRE',
}

export const RESSOURCE_TYPE_META: Record<
  RessourceType,
  { libelle: string; icone: string }
> = {
  [RessourceType.PDF]: { libelle: 'PDF', icone: 'document' },
  [RessourceType.VIDEO]: { libelle: 'Vidéo', icone: 'video-camera' },
  [RessourceType.IMAGE]: { libelle: 'Image', icone: 'photograph' },
  [RessourceType.LIEN]: { libelle: 'Lien', icone: 'link' },
  [RessourceType.DOCUMENT]: { libelle: 'Document', icone: 'document-text' },
  [RessourceType.PRESENTATION]: { libelle: 'Présentation', icone: 'presentation-chart' },
  [RessourceType.AUTRE]: { libelle: 'Autre', icone: 'folder' },
};

// ============================================================================
// TYPES DE MESSAGE
// ============================================================================
export enum MessageType {
  TEXTE = 'TEXTE',
  IMAGE = 'IMAGE',
  FICHIER = 'FICHIER',
  SYSTEME = 'SYSTEME',
}

// ============================================================================
// ACTIONS D'AUDIT
// ============================================================================
export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  FAILED_LOGIN = 'FAILED_LOGIN',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SELECT = 'SELECT',
  GENERATE = 'GENERATE',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
}

// ============================================================================
// TRANSITIONS AUTORISÉES
// ============================================================================

/**
 * Transitions valides pour les sessions
 */
export const SESSION_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  [SessionStatus.OUVERTE]: [SessionStatus.FERMEE, SessionStatus.ANNULEE, SessionStatus.EN_COURS],
  [SessionStatus.FERMEE]: [SessionStatus.EN_COURS, SessionStatus.ANNULEE],
  [SessionStatus.EN_COURS]: [SessionStatus.TERMINEE, SessionStatus.ANNULEE],
  [SessionStatus.TERMINEE]: [],
  [SessionStatus.ANNULEE]: [],
};

/**
 * Transitions valides pour les inscriptions
 */
export const INSCRIPTION_TRANSITIONS: Record<InscriptionStatus, InscriptionStatus[]> = {
  [InscriptionStatus.EN_ATTENTE]: [
    InscriptionStatus.ACCEPTEE,
    InscriptionStatus.REFUSEE,
    InscriptionStatus.LISTE_ATTENTE,
    InscriptionStatus.ANNULEE,
  ],
  [InscriptionStatus.LISTE_ATTENTE]: [
    InscriptionStatus.ACCEPTEE,
    InscriptionStatus.REFUSEE,
    InscriptionStatus.ANNULEE,
  ],
  [InscriptionStatus.ACCEPTEE]: [InscriptionStatus.ANNULEE],
  [InscriptionStatus.REFUSEE]: [],
  [InscriptionStatus.ANNULEE]: [],
};

/**
 * Vérifie si une transition est autorisée
 */
export function canTransitionSession(
  from: SessionStatus,
  to: SessionStatus
): boolean {
  return SESSION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionInscription(
  from: InscriptionStatus,
  to: InscriptionStatus
): boolean {
  return INSCRIPTION_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Helpers d'affichage
 */
export function getSessionStatusLabel(status: SessionStatus): string {
  return SESSION_STATUS_META[status]?.libelle || status;
}

export function getSessionStatusColor(status: SessionStatus): string {
  return SESSION_STATUS_META[status]?.couleur || '#6B6B6B';
}

export function getInscriptionStatusLabel(status: InscriptionStatus): string {
  return INSCRIPTION_STATUS_META[status]?.libelle || status;
}

export function getInscriptionStatusColor(status: InscriptionStatus): string {
  return INSCRIPTION_STATUS_META[status]?.couleur || '#6B6B6B';
}