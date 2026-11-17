// src/lib/sites.ts

export interface OdcSite {
  id: 'antananarivo' | 'fianarantsoa';
  ville: string;
  region: string;
  adresse: string;
  telephone: string;
  email: string;
  horaires: string;
  coordinates: { lat: number; lng: number };
  isMain: boolean;
}

export const ODC_SITES: OdcSite[] = [
  {
    id: 'antananarivo',
    ville: 'Antananarivo',
    region: 'Analamanga',
    adresse: 'Immeuble Orange, Antananarivo 101, Madagascar',
    telephone: '+261 20 22 000 00',
    email: 'odc.antananarivo@orange.mg',
    horaires: 'Lun–Ven : 8h–17h • Sam : 9h–13h',
    coordinates: { lat: -18.8792, lng: 47.5079 },
    isMain: true,
  },
  {
    id: 'fianarantsoa',
    ville: 'Fianarantsoa',
    region: 'Haute Matsiatra',
    adresse: 'Centre-ville, Fianarantsoa 301, Madagascar',
    telephone: '+261 20 75 000 00',
    email: 'odc.fianarantsoa@orange.mg',
    horaires: 'Lun–Ven : 8h–17h',
    coordinates: { lat: -21.4536, lng: 47.0858 },
    isMain: false,
  },
];

export const MAIN_SITE = ODC_SITES.find((s) => s.isMain) ?? ODC_SITES[0];

/** Villes formatées pour affichage : "Antananarivo & Fianarantsoa" */
export const VILLES_LABEL = ODC_SITES.map((s) => s.ville).join(' & ');

/** Villes formatées courtes : "Antananarivo · Fianarantsoa" */
export const VILLES_LABEL_SHORT = ODC_SITES.map((s) => s.ville).join(' · ');

/** Toutes les adresses */
export const ADRESSES_LABEL = ODC_SITES.map((s) => s.adresse);

/** Tous les téléphones */
export const TELEPHONES = ODC_SITES.map((s) => s.telephone);

/** Tous les emails */
export const EMAILS = ODC_SITES.map((s) => s.email);