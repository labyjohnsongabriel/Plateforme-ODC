// src/controllers/publicTeam.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { successResponse } from '../utils/response.util';
import { logger } from '../config/logger';

export class PublicTeamController {
  /**
   * ⭐ GET /api/public/team
   * Renvoie les membres de l'équipe ODC (staff + admins)
   */
  static async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));

      const members = await AppDataSource.getRepository(User)
        .createQueryBuilder('u')
        .leftJoin('u.role', 'r')
        .select([
          'u.id',
          'u.nom',
          'u.prenom',
          'u.email',
          'u.photoUrl',
          'u.poste',
          'u.bio',
          'u.linkedin',
        ])
        .addSelect(['r.nom', 'r.libelle'])
        .where('u.actif = :actif', { actif: true })
        .andWhere('u.deletedAt IS NULL')
        .andWhere('r.nom IN (:...roles)', {
          roles: ['ADMINISTRATEUR', 'STAFF_ODC'],
        })
        .orderBy('u.createdAt', 'ASC')
        .limit(limit)
        .getMany();

      const formatted = members.map((m) => ({
        id: m.id,
        nom: m.nom,
        prenom: m.prenom,
        email: m.email,
        photoUrl: m.photoUrl,
        poste: m.poste,
        bio: m.bio,
        linkedin: m.linkedin,
        role: m.role
          ? {
              nom: m.role.nom,
              libelle: m.role.libelle,
            }
          : null,
      }));

      successResponse(res, formatted, `${formatted.length} membres`);
    } catch (err) {
      logger.error('[PublicTeamController] Erreur', err);
      next(err);
    }
  }
}