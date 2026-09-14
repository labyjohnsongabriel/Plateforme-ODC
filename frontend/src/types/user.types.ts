import type { ID, Timestamp, PaginationParams } from './common.types';

// ============================================================================
//  UTILISATEURS
// ============================================================================

export enum RoleName {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  FORMATEUR = 'FORMATEUR',
  PARTICIPANT = 'PARTICIPANT',
  PARTENAIRE = 'PARTENAIRE',
}

export interface Role {
  id: ID;
  nom: RoleName;
  description?: string;
}

export interface User {
  id: ID;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  photoUrl?: string;
  bio?: string;
  ville?: string;
  linkedin?: string;
  entreprise?: string;
  poste?: string;
  competences?: string[];
  actif: boolean;
  emailVerifie: boolean;
  derniereConnexion?: Timestamp;
  role: Role;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  roleNom: RoleName;
  ville?: string;
}

export interface UpdateUserPayload {
  nom?: string;
  prenom?: string;
  telephone?: string;
  ville?: string;
  bio?: string;
  linkedin?: string;
  entreprise?: string;
  poste?: string;
  photoUrl?: string;
}

export interface ChangeRolePayload {
  roleNom: RoleName;
}

export interface ToggleActifPayload {
  actif: boolean;
}

export interface UserFilters extends PaginationParams {
  role?: RoleName;
  actif?: boolean;
  ville?: string;
}

export interface UserStatsByRole {
  role: RoleName;
  count: string;
}