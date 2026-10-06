export interface Partenaire {
  id: string;
  nom: string;
  slug: string;
  secteur?: string;
  description?: string;
  contactEmail?: string;
  contactTel?: string;
  siteWeb?: string;
  logoUrl?: string;
  actif: boolean;
  estPubliee: boolean;
  ordreAffichage: number;
  createdAt: string;
  updatedAt: string;
}