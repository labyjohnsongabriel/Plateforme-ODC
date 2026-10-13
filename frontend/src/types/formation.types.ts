export type NiveauFormation = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';

export interface Domaine {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  couleur?: string;
  icone?: string;
  imageUrl?: string;
  actif: boolean;
  estPubliee: boolean;
  ordreAffichage: number;
  formations?: Formation[];
  createdAt: string;
  updatedAt: string;
}

export interface Formation {
  id: string;
  titre: string;
  slug: string;
  description?: string;
  objectifs?: string;
  prerequis?: string;
  programme?: string;
  domaine: string;
  domaineRelation?: Domaine;
  domaineId?: string;
  niveau: NiveauFormation;
  dureeHeures: number;
  imageUrl?: string;
  imageCouvertureUrl?: string;
  videoPresentationUrl?: string;
  prix?: number;
  estPubliee: boolean;
  actif: boolean;
  miseEnAvant: boolean;
  nbParticipantsMax: number;
  datePublication?: string;
  nbVues: number;
  sessions?: Session[];
  createdAt: string;
  updatedAt: string;
}

import type { Session } from './session.types';

export interface FormationFilters {
  q?: string;
  domaineId?: string;
  niveau?: NiveauFormation;
  estPubliee?: boolean;
  actif?: boolean;
  page?: number;
  limit?: number;
}