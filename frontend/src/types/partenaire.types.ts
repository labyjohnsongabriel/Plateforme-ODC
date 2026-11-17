// src/types/partenaire.types.ts

/* ═══════════════════════════════════════════════════════════════════════════
   PARTENAIRE
   ═══════════════════════════════════════════════════════════════════════════ */

export interface Partenaire {
  /** Identifiant unique (UUID) */
  id: string;

  /** Nom du partenaire */
  nom: string;

  /** Slug unique (utilisé dans l'URL) */
  slug: string;

  /** Secteur d'activité (ex: Télécommunications, Éducation…) */
  secteur?: string;

  /** Description longue */
  description?: string;

  /** Email de contact */
  contactEmail?: string;

  /** Téléphone de contact */
  contactTel?: string;

  /** Site web officiel */
  siteWeb?: string;

  /** URL du logo (relative ou absolue) */
  logoUrl?: string;

  /** Partenaire actif (visible ou non) */
  actif: boolean;

  /** Partenaire publié (visible sur le site public) */
  estPubliee: boolean;

  /** Ordre d'affichage (tri) */
  ordreAffichage: number;

  /** Date de création (ISO 8601) */
  createdAt: string;

  /** Date de dernière mise à jour (ISO 8601) */
  updatedAt: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FORMULAIRE (création / édition)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PartenaireFormValues {
  nom: string;
  slug?: string;
  secteur?: string;
  description?: string;
  contactEmail?: string;
  contactTel?: string;
  siteWeb?: string;
  logoUrl?: string;
  actif: boolean;
  estPubliee: boolean;
  ordreAffichage: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FILTRES (liste)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PartenaireFilters {
  q?: string;
  secteur?: string;
  estPubliee?: boolean;
  actif?: boolean;
  page?: number;
  limit?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   RÉPONSES API
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PartenairesListResponse {
  data: Partenaire[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface PartenaireResponse {
  success: boolean;
  message?: string;
  data: Partenaire;
}