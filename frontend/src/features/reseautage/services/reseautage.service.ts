import { reseautageApi } from '@/services/reseautage.api';
import type {
  Connection,
  MemberUser,
  MesConnectionsResponse,
  DirectoryFilters,
} from '../types/reseautage.types';
import type { PaginatedResponse } from '@/types/common.types';

// ============================================================================
//  RÉSEAUTAGE SERVICE
// ============================================================================

export class ReseautageService {
  /**
   * Annuaire des membres
   */
  static async getAnnuaire(filters?: DirectoryFilters): Promise<PaginatedResponse<MemberUser>> {
    return reseautageApi.annuaire(filters);
  }

  /**
   * Suggestions
   */
  static async getSuggestions(limit = 10): Promise<MemberUser[]> {
    return reseautageApi.suggestions(limit);
  }

  /**
   * Mes connexions acceptées
   */
  static async getMesConnections(): Promise<MesConnectionsResponse[]> {
    return reseautageApi.mesConnections();
  }

  /**
   * Demandes en attente
   */
  static async getDemandes(): Promise<Connection[]> {
    return reseautageApi.demandeEnAttente();
  }

  /**
   * Envoyer une demande
   */
  static async envoyerDemande(destinataireId: string, message?: string): Promise<Connection> {
    return reseautageApi.envoyerDemande({ destinataireId, message });
  }

  /**
   * Accepter une demande
   */
  static async accepter(connectionId: string): Promise<Connection> {
    return reseautageApi.repondre(connectionId, { statut: 'ACCEPTEE' as any });
  }

  /**
   * Refuser une demande
   */
  static async refuser(connectionId: string): Promise<Connection> {
    return reseautageApi.repondre(connectionId, { statut: 'REFUSEE' as any });
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  /**
   * Filtrer localement
   */
  static filterMembers(
    members: MemberUser[],
    search: string,
    role?: string,
    ville?: string
  ): MemberUser[] {
    let result = members;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.nom.toLowerCase().includes(q) ||
          m.prenom.toLowerCase().includes(q) ||
          m.entreprise?.toLowerCase().includes(q) ||
          m.poste?.toLowerCase().includes(q) ||
          m.competences?.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (role) result = result.filter((m) => m.role.nom === role);
    if (ville) result = result.filter((m) => m.ville?.toLowerCase().includes(ville.toLowerCase()));

    return result;
  }

  /**
   * Obtenir les initiales
   */
  static getInitials(member: MemberUser): string {
    return `${member.prenom?.[0] || ''}${member.nom?.[0] || ''}`.toUpperCase();
  }

  /**
   * Extraire les compétences uniques
   */
  static extractSkills(members: MemberUser[]): string[] {
    const skills = new Set<string>();
    members.forEach((m) => m.competences?.forEach((s) => skills.add(s)));
    return Array.from(skills).sort();
  }

  /**
   * Extraire les villes uniques
   */
  static extractCities(members: MemberUser[]): string[] {
    const cities = new Set<string>();
    members.forEach((m) => m.ville && cities.add(m.ville));
    return Array.from(cities).sort();
  }
}