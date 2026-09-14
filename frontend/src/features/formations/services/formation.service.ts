import { formationApi } from '@/services/formation.api';
import type { ID } from '@/types/common.types';
import type {
  Formation,
  CreateFormationFormData,
  UpdateFormationFormData,
  NiveauFormation,
} from '../types/formation.types';

// ============================================================================
//  FORMATION SERVICE
// ============================================================================

export class FormationService {
  // ========================================================================
  //  CRUD
  // ========================================================================

  static async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    domaine?: string;
    niveau?: NiveauFormation;
  }) {
    return formationApi.list(params);
  }

  static async getById(id: ID): Promise<Formation> {
    const res = await formationApi.getById(id);
    return res.data;
  }

  static async create(payload: CreateFormationFormData): Promise<Formation> {
    const res = await formationApi.create(payload);
    return res.data;
  }

  static async update(
    id: ID,
    payload: UpdateFormationFormData
  ): Promise<Formation> {
    const res = await formationApi.update(id, payload);
    return res.data;
  }

  static async delete(id: ID): Promise<void> {
    await formationApi.delete(id);
  }

  // ========================================================================
  //  HELPERS UI
  // ========================================================================

  static getNiveauVariant(
    niveau: NiveauFormation
  ): 'success' | 'warning' | 'error' | 'neutral' {
    switch (niveau) {
      case 'DEBUTANT':
        return 'success';
      case 'INTERMEDIAIRE':
        return 'warning';
      case 'AVANCE':
        return 'error';
      default:
        return 'neutral';
    }
  }

  static formatNiveau(niveau: NiveauFormation): string {
    switch (niveau) {
      case 'DEBUTANT':
        return 'Débutant';
      case 'INTERMEDIAIRE':
        return 'Intermédiaire';
      case 'AVANCE':
        return 'Avancé';
      default:
        return niveau;
    }
  }

  static getDomaines(): Array<{ value: string; label: string }> {
    return [
      { value: 'WEB', label: 'Développement Web' },
      { value: 'DATA', label: 'Data & Analytics' },
      { value: 'CYBER', label: 'Cybersécurité' },
      { value: 'IA', label: 'Intelligence Artificielle' },
      { value: 'DESIGN', label: 'Design & UX' },
      { value: 'CLOUD', label: 'Cloud & DevOps' },
      { value: 'MOBILE', label: 'Développement Mobile' },
      { value: 'MARKETING', label: 'Marketing Digital' },
    ];
  }
}