import { NiveauFormation } from '../models/Formation.entity';

// ═══════════════════════════════════════════════════════
// 📥 CREATE
// ═══════════════════════════════════════════════════════
export interface CreateFormationDTO {
  titre: string;
  domaine: string;
  duree_heures: number;
  niveau: NiveauFormation;
  description?: string;
  prerequis?: string;
  objectifs?: string;
  programme?: string;
  image_url?: string;
  actif?: boolean;
  nb_participants_max?: number;
  domaine_id?: string;
  // ❌ PAS de prix
}

// ═══════════════════════════════════════════════════════
// ✏️ UPDATE
// ═══════════════════════════════════════════════════════
export interface UpdateFormationDTO {
  titre?: string;
  description?: string;
  domaine?: string;
  duree_heures?: number;
  niveau?: NiveauFormation;
  prerequis?: string;
  objectifs?: string;
  programme?: string;
  image_url?: string;
  actif?: boolean;
  nb_participants_max?: number;
  domaine_id?: string;
}

// ═══════════════════════════════════════════════════════
// 🔍 FILTRES
// ═══════════════════════════════════════════════════════
export interface FormationFilters {
  domaine?: string;
  niveau?: string;
  actif?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FormationResponse {
  id: string;
  titre: string;
  description: string | null;
  domaine: string;
  dureeHeures: number;
  niveau: NiveauFormation;
  actif: boolean;
  nbParticipantsMax: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  estGratuit: true;   // ✅ Toujours true
}