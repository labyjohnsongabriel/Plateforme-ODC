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
}