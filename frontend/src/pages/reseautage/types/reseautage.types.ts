import type { ID, Timestamp, PaginationParams } from '@/types/common.types';
import type { RoleName } from '@/types/user.types';

// ============================================================================
//  ENUMS
// ============================================================================

export enum StatutConnection {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  BLOQUEE = 'BLOQUEE',
}

// ============================================================================
//  MEMBER USER (profil public pour l'annuaire)
// ============================================================================

export interface MemberUser {
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
  role: {
    id: ID;
    nom: RoleName;
    description?: string;
  };
  derniereConnexion?: Timestamp;
  createdAt: Timestamp;
}

// ============================================================================
//  CONNECTIONS
// ============================================================================

export interface Connection {
  id: ID;
  expediteur: MemberUser;
  expediteurId: ID;
  destinataire: MemberUser;
  destinataireId: ID;
  statut: StatutConnection;
  message?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EnvoyerDemandePayload {
  destinataireId: ID;
  message?: string;
}

export interface RepondrePayload {
  statut: StatutConnection;
}

// ============================================================================
//  FILTRES / ANNONCES
// ============================================================================

export interface DirectoryFilters extends PaginationParams {
  role?: RoleName;
  ville?: string;
  competences?: string[];
}

export interface MesConnectionsResponse {
  connectionId: ID;
  user: MemberUser;
}

export interface AnnuaireResponse {
  data: MemberUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}