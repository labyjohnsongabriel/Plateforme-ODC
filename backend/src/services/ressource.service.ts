// src/services/ressource.service.ts
import { ressourceRepository } from '../repositories/RessourceRepository';

export class RessourceService {
  static async findBySession(sessionId: string, visiblesSeulement = false) {
    return ressourceRepository.findBySession(sessionId, visiblesSeulement);
  }

  static async findForParticipant(participantId: string, sessionId?: string, ressourceId?: string) {
    return ressourceRepository.findForParticipant(participantId, sessionId, ressourceId);
  }

  static async create(data: any, userId: string) {
    return ressourceRepository.create({ ...data, uploadePar: userId });
  }

  static async findById(id: string) {
    return ressourceRepository.findByIdOrFail(id, ['uploadeParUser', 'session']);
  }

  static async findAll(filters: {
    sessionId?: string;
    type?: string;
    visibleParticipants?: boolean;
    formateurId?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    return ressourceRepository.findPaginated(filters);
  }

  static async update(id: string, data: any) {
    return ressourceRepository.update(id, data);
  }

  static async toggleVisibilite(id: string, visibleParticipants: boolean) {
    return ressourceRepository.update(id, { visibleParticipants });
  }

  static async reorder(sessionId: string, ordre: Array<{ id: string; ordreAffichage: number }>) {
    return ressourceRepository.reorderForSession(sessionId, ordre);
  }

  static async delete(id: string) {
    await ressourceRepository.softDelete(id);
  }

  static async statsBySession(sessionId: string) {
    const ressources = await ressourceRepository.findBySession(sessionId);
    const parType = ressources.reduce<Record<string, number>>((counts, ressource) => {
      counts[ressource.type] = (counts[ressource.type] ?? 0) + 1;
      return counts;
    }, {});

    return {
      total: ressources.length,
      parType,
      telechargements: ressources.reduce(
        (total, ressource) => total + ressource.nbTelechargements,
        0
      ),
    };
  }

  static async incrementerTelechargement(id: string) {
    await ressourceRepository.incrementerTelechargement(id);
    return ressourceRepository.findByIdOrFail(id);
  }
}

export const ressourceService = RessourceService;
