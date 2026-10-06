export type RoleName =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

export const ROLE_LABELS: Record<RoleName, string> = {
  ADMINISTRATEUR: 'Administrateur',
  STAFF_ODC: 'Staff ODC',
  FORMATEUR: 'Formateur',
  PARTICIPANT: 'Participant',
  PARTENAIRE: 'Partenaire',
};

export const ROLE_COLORS: Record<RoleName, string> = {
  ADMINISTRATEUR: 'red',
  STAFF_ODC: 'orange',
  FORMATEUR: 'blue',
  PARTICIPANT: 'green',
  PARTENAIRE: 'purple',
};

export const ROLE_HIERARCHY: Record<RoleName, number> = {
  ADMINISTRATEUR: 100,
  STAFF_ODC: 80,
  FORMATEUR: 60,
  PARTENAIRE: 40,
  PARTICIPANT: 20,
};

export interface Permission {
  id: string;
  code: string;
  libelle: string;
  categorie?: string;
  description?: string;
}