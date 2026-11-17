import type { ID, PaginationParams, Timestamp } from './common.types';
import type { AppRoleName } from './role.types';

export { RoleName } from './role.types';

export interface Role {
  id: ID;
  nom: AppRoleName;
  libelle?: string;
  description?: string | null;
}

export interface User {
  id: ID;
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
  profilPublic?: boolean;
  derniereConnexion?: Timestamp | null;
  role: Role & { permissions?: Array<{ code: string }> };
  roleId?: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
  roleNom: AppRoleName;
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
  roleNom: AppRoleName;
}

export interface ToggleActifPayload {
  actif: boolean;
}

export interface UserFilters extends PaginationParams {
  role?: AppRoleName;
  actif?: boolean;
  ville?: string;
}

export interface UserStatsByRole {
  role: AppRoleName;
  count: string;
}
