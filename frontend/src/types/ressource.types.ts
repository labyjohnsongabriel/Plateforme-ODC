import type { Session } from './session.types';
import type { User } from './user.types';

export type TypeRessource =
  | 'PDF'
  | 'VIDEO'
  | 'IMAGE'
  | 'LIEN'
  | 'DOCUMENT'
  | 'PRESENTATION'
  | 'AUTRE';

export interface Ressource {
  id: string;
  titre: string;
  description?: string;
  type: TypeRessource;
  fichierUrl: string;
  fichierNom?: string;
  fichierTaille?: number;
  thumbnailUrl?: string;
  visibleParticipants: boolean;
  ordreAffichage: number;
  nbTelechargements: number;
  session?: Session;
  sessionId?: string;
  uploadeParUser?: User;
  uploadePar?: string;
  createdAt: string;
}