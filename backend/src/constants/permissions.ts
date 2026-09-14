import { RoleName } from './roles';

/**
 * Codes de permissions (format : ressource.action)
 */
export enum PermissionCode {
  // ---- Utilisateurs ----
  USER_CREATE = 'users.create',
  USER_READ = 'users.read',
  USER_UPDATE = 'users.update',
  USER_DELETE = 'users.delete',
  USER_CHANGE_ROLE = 'users.change_role',
  USER_TOGGLE_ACTIVE = 'users.toggle_active',

  // ---- Formations ----
  FORMATION_CREATE = 'formations.create',
  FORMATION_READ = 'formations.read',
  FORMATION_UPDATE = 'formations.update',
  FORMATION_DELETE = 'formations.delete',

  // ---- Sessions ----
  SESSION_CREATE = 'sessions.create',
  SESSION_READ = 'sessions.read',
  SESSION_UPDATE = 'sessions.update',
  SESSION_DELETE = 'sessions.delete',

  // ---- Inscriptions ----
  INSCRIPTION_CREATE = 'inscriptions.create',
  INSCRIPTION_READ = 'inscriptions.read',
  INSCRIPTION_SELECT = 'inscriptions.select',
  INSCRIPTION_DELETE = 'inscriptions.delete',

  // ---- Présences ----
  PRESENCE_SCAN = 'presences.scan',
  PRESENCE_READ = 'presences.read',
  PRESENCE_MANAGE = 'presences.manage',

  // ---- Évaluations ----
  EVALUATION_CREATE = 'evaluations.create',
  EVALUATION_READ = 'evaluations.read',
  EVALUATION_GRADE = 'evaluations.grade',

  // ---- Attestations ----
  ATTESTATION_GENERATE = 'attestations.generate',
  ATTESTATION_READ = 'attestations.read',
  ATTESTATION_DOWNLOAD = 'attestations.download',
  ATTESTATION_VERIFY = 'attestations.verify',

  // ---- Dashboard ----
  DASHBOARD_ADMIN = 'dashboard.admin',
  DASHBOARD_STAFF = 'dashboard.staff',
  DASHBOARD_FORMATEUR = 'dashboard.formateur',
  DASHBOARD_PARTICIPANT = 'dashboard.participant',
  DASHBOARD_PARTENAIRE = 'dashboard.partenaire',

  // ---- Messagerie ----
  MESSAGERIE_SEND = 'messagerie.send',
  MESSAGERIE_READ = 'messagerie.read',

  // ---- Réseautage ----
  RESEAUTAGE_READ = 'reseautage.read',
  RESEAUTAGE_CONNECT = 'reseautage.connect',

  // ---- Partenaires ----
  PARTENAIRE_CREATE = 'partenaires.create',
  PARTENAIRE_READ = 'partenaires.read',
  PARTENAIRE_UPDATE = 'partenaires.update',
  PARTENAIRE_DELETE = 'partenaires.delete',

  // ---- Administration ----
  ADMIN_AUDIT = 'admin.audit',
  ADMIN_CONFIG = 'admin.config',
  ADMIN_MAINTENANCE = 'admin.maintenance',
}

/**
 * Métadonnées d'une permission
 */
export interface PermissionMetadata {
  code: PermissionCode;
  libelle: string;
  categorie: string;
  description?: string;
}

/**
 * Catalogue complet des permissions
 */
export const PERMISSIONS: Record<PermissionCode, PermissionMetadata> = {
  [PermissionCode.USER_CREATE]: {
    code: PermissionCode.USER_CREATE,
    libelle: 'Créer un utilisateur',
    categorie: 'Utilisateurs',
  },
  [PermissionCode.USER_READ]: {
    code: PermissionCode.USER_READ,
    libelle: 'Voir les utilisateurs',
    categorie: 'Utilisateurs',
  },
  [PermissionCode.USER_UPDATE]: {
    code: PermissionCode.USER_UPDATE,
    libelle: 'Modifier un utilisateur',
    categorie: 'Utilisateurs',
  },
  [PermissionCode.USER_DELETE]: {
    code: PermissionCode.USER_DELETE,
    libelle: 'Supprimer un utilisateur',
    categorie: 'Utilisateurs',
  },
  [PermissionCode.USER_CHANGE_ROLE]: {
    code: PermissionCode.USER_CHANGE_ROLE,
    libelle: 'Changer le rôle d\'un utilisateur',
    categorie: 'Utilisateurs',
  },
  [PermissionCode.USER_TOGGLE_ACTIVE]: {
    code: PermissionCode.USER_TOGGLE_ACTIVE,
    libelle: 'Activer/désactiver un utilisateur',
    categorie: 'Utilisateurs',
  },

  [PermissionCode.FORMATION_CREATE]: {
    code: PermissionCode.FORMATION_CREATE,
    libelle: 'Créer une formation',
    categorie: 'Formations',
  },
  [PermissionCode.FORMATION_READ]: {
    code: PermissionCode.FORMATION_READ,
    libelle: 'Voir les formations',
    categorie: 'Formations',
  },
  [PermissionCode.FORMATION_UPDATE]: {
    code: PermissionCode.FORMATION_UPDATE,
    libelle: 'Modifier une formation',
    categorie: 'Formations',
  },
  [PermissionCode.FORMATION_DELETE]: {
    code: PermissionCode.FORMATION_DELETE,
    libelle: 'Supprimer une formation',
    categorie: 'Formations',
  },

  [PermissionCode.SESSION_CREATE]: {
    code: PermissionCode.SESSION_CREATE,
    libelle: 'Créer une session',
    categorie: 'Sessions',
  },
  [PermissionCode.SESSION_READ]: {
    code: PermissionCode.SESSION_READ,
    libelle: 'Voir les sessions',
    categorie: 'Sessions',
  },
  [PermissionCode.SESSION_UPDATE]: {
    code: PermissionCode.SESSION_UPDATE,
    libelle: 'Modifier une session',
    categorie: 'Sessions',
  },
  [PermissionCode.SESSION_DELETE]: {
    code: PermissionCode.SESSION_DELETE,
    libelle: 'Supprimer une session',
    categorie: 'Sessions',
  },

  [PermissionCode.INSCRIPTION_CREATE]: {
    code: PermissionCode.INSCRIPTION_CREATE,
    libelle: 'S\'inscrire à une session',
    categorie: 'Inscriptions',
  },
  [PermissionCode.INSCRIPTION_READ]: {
    code: PermissionCode.INSCRIPTION_READ,
    libelle: 'Voir les inscriptions',
    categorie: 'Inscriptions',
  },
  [PermissionCode.INSCRIPTION_SELECT]: {
    code: PermissionCode.INSCRIPTION_SELECT,
    libelle: 'Sélectionner les candidats',
    categorie: 'Inscriptions',
  },
  [PermissionCode.INSCRIPTION_DELETE]: {
    code: PermissionCode.INSCRIPTION_DELETE,
    libelle: 'Annuler une inscription',
    categorie: 'Inscriptions',
  },

  [PermissionCode.PRESENCE_SCAN]: {
    code: PermissionCode.PRESENCE_SCAN,
    libelle: 'Scanner un QR code de présence',
    categorie: 'Présences',
  },
  [PermissionCode.PRESENCE_READ]: {
    code: PermissionCode.PRESENCE_READ,
    libelle: 'Voir les présences',
    categorie: 'Présences',
  },
  [PermissionCode.PRESENCE_MANAGE]: {
    code: PermissionCode.PRESENCE_MANAGE,
    libelle: 'Gérer les présences',
    categorie: 'Présences',
  },

  [PermissionCode.EVALUATION_CREATE]: {
    code: PermissionCode.EVALUATION_CREATE,
    libelle: 'Créer une évaluation',
    categorie: 'Évaluations',
  },
  [PermissionCode.EVALUATION_READ]: {
    code: PermissionCode.EVALUATION_READ,
    libelle: 'Voir les évaluations',
    categorie: 'Évaluations',
  },
  [PermissionCode.EVALUATION_GRADE]: {
    code: PermissionCode.EVALUATION_GRADE,
    libelle: 'Saisir des notes',
    categorie: 'Évaluations',
  },

  [PermissionCode.ATTESTATION_GENERATE]: {
    code: PermissionCode.ATTESTATION_GENERATE,
    libelle: 'Générer des attestations',
    categorie: 'Attestations',
  },
  [PermissionCode.ATTESTATION_READ]: {
    code: PermissionCode.ATTESTATION_READ,
    libelle: 'Voir les attestations',
    categorie: 'Attestations',
  },
  [PermissionCode.ATTESTATION_DOWNLOAD]: {
    code: PermissionCode.ATTESTATION_DOWNLOAD,
    libelle: 'Télécharger une attestation',
    categorie: 'Attestations',
  },
  [PermissionCode.ATTESTATION_VERIFY]: {
    code: PermissionCode.ATTESTATION_VERIFY,
    libelle: 'Vérifier une attestation',
    categorie: 'Attestations',
  },

  [PermissionCode.DASHBOARD_ADMIN]: {
    code: PermissionCode.DASHBOARD_ADMIN,
    libelle: 'Accès dashboard administrateur',
    categorie: 'Dashboard',
  },
  [PermissionCode.DASHBOARD_STAFF]: {
    code: PermissionCode.DASHBOARD_STAFF,
    libelle: 'Accès dashboard staff',
    categorie: 'Dashboard',
  },
  [PermissionCode.DASHBOARD_FORMATEUR]: {
    code: PermissionCode.DASHBOARD_FORMATEUR,
    libelle: 'Accès dashboard formateur',
    categorie: 'Dashboard',
  },
  [PermissionCode.DASHBOARD_PARTICIPANT]: {
    code: PermissionCode.DASHBOARD_PARTICIPANT,
    libelle: 'Accès dashboard participant',
    categorie: 'Dashboard',
  },
  [PermissionCode.DASHBOARD_PARTENAIRE]: {
    code: PermissionCode.DASHBOARD_PARTENAIRE,
    libelle: 'Accès dashboard partenaire',
    categorie: 'Dashboard',
  },

  [PermissionCode.MESSAGERIE_SEND]: {
    code: PermissionCode.MESSAGERIE_SEND,
    libelle: 'Envoyer un message',
    categorie: 'Messagerie',
  },
  [PermissionCode.MESSAGERIE_READ]: {
    code: PermissionCode.MESSAGERIE_READ,
    libelle: 'Lire les messages',
    categorie: 'Messagerie',
  },

  [PermissionCode.RESEAUTAGE_READ]: {
    code: PermissionCode.RESEAUTAGE_READ,
    libelle: 'Consulter l\'annuaire',
    categorie: 'Réseautage',
  },
  [PermissionCode.RESEAUTAGE_CONNECT]: {
    code: PermissionCode.RESEAUTAGE_CONNECT,
    libelle: 'Envoyer des demandes de connexion',
    categorie: 'Réseautage',
  },

  [PermissionCode.PARTENAIRE_CREATE]: {
    code: PermissionCode.PARTENAIRE_CREATE,
    libelle: 'Créer un partenaire',
    categorie: 'Partenaires',
  },
  [PermissionCode.PARTENAIRE_READ]: {
    code: PermissionCode.PARTENAIRE_READ,
    libelle: 'Voir les partenaires',
    categorie: 'Partenaires',
  },
  [PermissionCode.PARTENAIRE_UPDATE]: {
    code: PermissionCode.PARTENAIRE_UPDATE,
    libelle: 'Modifier un partenaire',
    categorie: 'Partenaires',
  },
  [PermissionCode.PARTENAIRE_DELETE]: {
    code: PermissionCode.PARTENAIRE_DELETE,
    libelle: 'Supprimer un partenaire',
    categorie: 'Partenaires',
  },

  [PermissionCode.ADMIN_AUDIT]: {
    code: PermissionCode.ADMIN_AUDIT,
    libelle: 'Consulter les logs d\'audit',
    categorie: 'Administration',
  },
  [PermissionCode.ADMIN_CONFIG]: {
    code: PermissionCode.ADMIN_CONFIG,
    libelle: 'Configurer la plateforme',
    categorie: 'Administration',
  },
  [PermissionCode.ADMIN_MAINTENANCE]: {
    code: PermissionCode.ADMIN_MAINTENANCE,
    libelle: 'Activer le mode maintenance',
    categorie: 'Administration',
  },
};

/**
 * Matrice RBAC — Permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<RoleName, PermissionCode[]> = {
  // ============ ADMIN — Toutes les permissions ============
  [RoleName.ADMIN]: Object.values(PermissionCode),

  // ============ STAFF ODC ============
  [RoleName.STAFF]: [
    PermissionCode.USER_READ,
    PermissionCode.FORMATION_CREATE,
    PermissionCode.FORMATION_READ,
    PermissionCode.FORMATION_UPDATE,
    PermissionCode.SESSION_CREATE,
    PermissionCode.SESSION_READ,
    PermissionCode.SESSION_UPDATE,
    PermissionCode.INSCRIPTION_READ,
    PermissionCode.INSCRIPTION_SELECT,
    PermissionCode.PRESENCE_READ,
    PermissionCode.PRESENCE_MANAGE,
    PermissionCode.EVALUATION_READ,
    PermissionCode.ATTESTATION_GENERATE,
    PermissionCode.ATTESTATION_READ,
    PermissionCode.ATTESTATION_VERIFY,
    PermissionCode.DASHBOARD_STAFF,
    PermissionCode.MESSAGERIE_SEND,
    PermissionCode.MESSAGERIE_READ,
    PermissionCode.RESEAUTAGE_READ,
    PermissionCode.RESEAUTAGE_CONNECT,
    PermissionCode.PARTENAIRE_READ,
  ],

  // ============ FORMATEUR ============
  [RoleName.FORMATEUR]: [
    PermissionCode.FORMATION_READ,
    PermissionCode.SESSION_READ,
    PermissionCode.INSCRIPTION_READ,
    PermissionCode.PRESENCE_SCAN,
    PermissionCode.PRESENCE_READ,
    PermissionCode.PRESENCE_MANAGE,
    PermissionCode.EVALUATION_CREATE,
    PermissionCode.EVALUATION_READ,
    PermissionCode.EVALUATION_GRADE,
    PermissionCode.ATTESTATION_READ,
    PermissionCode.ATTESTATION_VERIFY,
    PermissionCode.DASHBOARD_FORMATEUR,
    PermissionCode.MESSAGERIE_SEND,
    PermissionCode.MESSAGERIE_READ,
    PermissionCode.RESEAUTAGE_READ,
    PermissionCode.RESEAUTAGE_CONNECT,
  ],

  // ============ PARTICIPANT ============
  [RoleName.PARTICIPANT]: [
    PermissionCode.FORMATION_READ,
    PermissionCode.SESSION_READ,
    PermissionCode.INSCRIPTION_CREATE,
    PermissionCode.INSCRIPTION_READ,
    PermissionCode.INSCRIPTION_DELETE,
    PermissionCode.PRESENCE_SCAN,
    PermissionCode.PRESENCE_READ,
    PermissionCode.EVALUATION_READ,
    PermissionCode.ATTESTATION_READ,
    PermissionCode.ATTESTATION_DOWNLOAD,
    PermissionCode.DASHBOARD_PARTICIPANT,
    PermissionCode.MESSAGERIE_SEND,
    PermissionCode.MESSAGERIE_READ,
    PermissionCode.RESEAUTAGE_READ,
    PermissionCode.RESEAUTAGE_CONNECT,
  ],

  // ============ PARTENAIRE ============
  [RoleName.PARTENAIRE]: [
    PermissionCode.FORMATION_READ,
    PermissionCode.SESSION_READ,
    PermissionCode.ATTESTATION_VERIFY,
    PermissionCode.DASHBOARD_PARTENAIRE,
    PermissionCode.MESSAGERIE_SEND,
    PermissionCode.MESSAGERIE_READ,
    PermissionCode.RESEAUTAGE_READ,
    PermissionCode.RESEAUTAGE_CONNECT,
  ],
};

/**
 * Vérifie si un rôle possède une permission
 */
export function roleHasPermission(role: string, permission: PermissionCode): boolean {
  const permissions = ROLE_PERMISSIONS[role as RoleName];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Vérifie si un rôle possède au moins une des permissions
 */
export function roleHasAnyPermission(
  role: string,
  permissions: PermissionCode[]
): boolean {
  return permissions.some((p) => roleHasPermission(role, p));
}

/**
 * Vérifie si un rôle possède toutes les permissions
 */
export function roleHasAllPermissions(
  role: string,
  permissions: PermissionCode[]
): boolean {
  return permissions.every((p) => roleHasPermission(role, p));
}

/**
 * Retourne les permissions d'un rôle
 */
export function getPermissionsForRole(role: string): PermissionCode[] {
  return ROLE_PERMISSIONS[role as RoleName] || [];
}

/**
 * Groupe les permissions par catégorie
 */
export function groupPermissionsByCategory(): Record<string, PermissionMetadata[]> {
  const grouped: Record<string, PermissionMetadata[]> = {};
  for (const perm of Object.values(PERMISSIONS)) {
    if (!grouped[perm.categorie]) grouped[perm.categorie] = [];
    grouped[perm.categorie].push(perm);
  }
  return grouped;
}