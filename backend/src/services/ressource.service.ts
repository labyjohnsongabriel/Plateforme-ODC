// src/services/ressource.service.ts
import { ressourceRepository } from '../repositories/RessourceRepository';
import { NotFoundError, ForbiddenError } from '../errors/AppError';

export class RessourceService {
  static async findBySession(sessionId: string, visiblesSeulement = false) {
    return ressourceRepository.findBySession(sessionId, visiblesSeulement);
  }

  static async create(data: any, userId: string) {
    return ressourceRepository.create({ ...data, uploadePar: userId });
  }

  static async update(id: string, data: any) {
    return ressourceRepository.update(id, data);
  }

  static async delete(id: string) {
    await ressourceRepository.softDelete(id);
  }

  static async incrementerTelechargement(id: string) {
    await ressourceRepository.incrementerTelechargement(id);
    return ressourceRepository.findByIdOrFail(id);
  }
}