/**
 * Rôles de la plateforme ODC
 */
export enum RoleName {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  FORMATEUR = 'FORMATEUR',
  PARTICIPANT = 'PARTICIPANT',
  PARTENAIRE = 'PARTENAIRE',
}

/**
 * Métadonnées des rôles
 */
export interface RoleMetadata {
  nom: RoleName;
  libelle: string;
  description: string;
  couleur: string;
  icone: string;
  priorite: number; // Plus élevé = plus de droits
}

export const ROLES: Record<RoleName, RoleMetadata> = {
  [RoleName.ADMIN]: {
    nom: RoleName.ADMIN,
    libelle: 'Administrateur',
    description: 'Accès total à la plateforme, gestion des utilisateurs et configuration',
    couleur: '#C62828',
    icone: 'shield-check',
    priorite: 100,
  },
  [RoleName.STAFF]: {
    nom: RoleName.STAFF,
    libelle: 'Staff ODC',
    description: 'Gestion opérationnelle des formations, inscriptions et attestations',
    couleur: '#FF7900',
    icone: 'briefcase',
    priorite: 80,
  },
  [RoleName.FORMATEUR]: {
    nom: RoleName.FORMATEUR,
    libelle: 'Formateur',
    description: 'Animation des sessions, présences et évaluations',
    couleur: '#0277BD',
    icone: 'academic-cap',
    priorite: 60,
  },
  [RoleName.PARTICIPANT]: {
    nom: RoleName.PARTICIPANT,
    libelle: 'Participant',
    description: 'Inscription aux formations, suivi et réseautage',
    couleur: '#2E7D32',
    icone: 'user-group',
    priorite: 40,
  },
  [RoleName.PARTENAIRE]: {
    nom: RoleName.PARTENAIRE,
    libelle: 'Partenaire',
    description: 'Consultation des statistiques et collaboration',
    couleur: '#7B1FA2',
    icone: 'handshake',
    priorite: 20,
  },
};

/**
 * Liste des rôles
 */
export const ROLE_NAMES = Object.values(RoleName);

/**
 * Rôles administratifs (accès étendu)
 */
export const ADMIN_ROLES: RoleName[] = [RoleName.ADMIN, RoleName.STAFF];

/**
 * Rôles internes ODC
 */
export const INTERNAL_ROLES: RoleName[] = [
  RoleName.ADMIN,
  RoleName.STAFF,
  RoleName.FORMATEUR,
];

/**
 * Rôles externes
 */
export const EXTERNAL_ROLES: RoleName[] = [
  RoleName.PARTICIPANT,
  RoleName.PARTENAIRE,
];

/**
 * Rôles pouvant créer des formations
 */
export const FORMATION_CREATOR_ROLES: RoleName[] = [RoleName.ADMIN, RoleName.STAFF];

/**
 * Rôles pouvant générer des attestations
 */
export const ATTESTATION_GENERATOR_ROLES: RoleName[] = [RoleName.ADMIN, RoleName.STAFF];

/**
 * Rôles pouvant valider les présences
 */
export const PRESENCE_VALIDATOR_ROLES: RoleName[] = [
  RoleName.ADMIN,
  RoleName.STAFF,
  RoleName.FORMATEUR,
];

/**
 * Vérifie si un rôle est administratif
 */
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as RoleName);
}

/**
 * Vérifie si un rôle est interne ODC
 */
export function isInternalRole(role: string): boolean {
  return INTERNAL_ROLES.includes(role as RoleName);
}

/**
 * Vérifie si un rôle peut gérer un autre rôle
 */
export function canManageRole(managerRole: string, targetRole: string): boolean {
  const manager = ROLES[managerRole as RoleName];
  const target = ROLES[targetRole as RoleName];
  if (!manager || !target) return false;
  return manager.priorite > target.priorite;
}

/**
 * Retourne la couleur associée à un rôle
 */
export function getRoleColor(role: string): string {
  return ROLES[role as RoleName]?.couleur || '#6B6B6B';
}

/**
 * Retourne le libellé d'un rôle
 */
export function getRoleLabel(role: string): string {
  return ROLES[role as RoleName]?.libelle || role;
}