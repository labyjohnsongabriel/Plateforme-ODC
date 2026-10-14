<<<<<<< HEAD
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
=======
// src/types/user.types.ts
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  photoUrl?: string | null;
  photoCouvertureUrl?: string | null;
  bio?: string | null;
  ville?: string | null;
  linkedin?: string | null;
  siteWeb?: string | null;
  entreprise?: string | null;
  poste?: string | null;
  competences?: string[] | null;
  actif: boolean;
  emailVerifie: boolean;
  profilPublic: boolean;
  derniereConnexion?: string | null;
  role: {
    id: string;
    nom: 'ADMINISTRATEUR' | 'STAFF_ODC' | 'FORMATEUR' | 'PARTICIPANT' | 'PARTENAIRE';
    libelle: string;
  };
  roleId: string;
  createdAt: string;
  updatedAt: string;
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
}