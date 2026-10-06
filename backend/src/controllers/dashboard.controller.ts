// src/controllers/DashboardController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Formation } from '../entities/Formation.entity';
import { Session } from '../entities/Session.entity';
import { Inscription } from '../entities/Inscription.entity';
import { Attestation } from '../entities/Attestation.entity';
import { Presence } from '../entities/Presence.entity';
import { successResponse } from '../utils/response.util';
import { RoleName, StatutInscription } from '../entities/enums';

export class DashboardController {
  /** GET /api/dashboard/me — Tous rôles */
  static async myStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardController.buildStats(req.userRole as RoleName, req.userId!);
      return successResponse(res, stats, 'Statistiques du tableau de bord');
    } catch (e) { next(e); }
  }

  /** GET /api/dashboard/admin */
  static async adminStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.buildStats(RoleName.ADMINISTRATEUR, req.userId!)); }
    catch (e) { next(e); }
  }

  /** GET /api/dashboard/staff */
  static async staffStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.buildStats(RoleName.STAFF_ODC, req.userId!)); }
    catch (e) { next(e); }
  }

  /** GET /api/dashboard/formateur */
  static async formateurStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.buildStats(RoleName.FORMATEUR, req.userId!)); }
    catch (e) { next(e); }
  }

  /** GET /api/dashboard/participant */
  static async participantStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.buildStats(RoleName.PARTICIPANT, req.userId!)); }
    catch (e) { next(e); }
  }

  /** GET /api/dashboard/partenaire */
  static async partenaireStats(req: Request, res: Response, next: NextFunction) {
    try { return successResponse(res, await DashboardController.buildStats(RoleName.PARTENAIRE, req.userId!)); }
    catch (e) { next(e); }
  }

  // ============================ PRIVÉ ============================
  private static async buildStats(role: RoleName, userId: string) {
    switch (role) {
      case RoleName.ADMINISTRATEUR:
      case RoleName.STAFF_ODC: {
        const [users, formations, sessions, inscriptions, attestations, presences] = await Promise.all([
          AppDataSource.getRepository(User).count({ where: { actif: true } }),
          AppDataSource.getRepository(Formation).count({ where: { actif: true } }),
          AppDataSource.getRepository(Session).count(),
          AppDataSource.getRepository(Inscription).count(),
          AppDataSource.getRepository(Attestation).count({ where: { valide: true } }),
          AppDataSource.getRepository(Presence).count(),
        ]);
        return { role, users, formations, sessions, inscriptions, attestations, presences };
      }

      case RoleName.FORMATEUR: {
        const [sessions, participants, evaluations] = await Promise.all([
          AppDataSource.getRepository(Session).count({ where: { formateurId: userId } }),
          AppDataSource.getRepository(Inscription)
            .createQueryBuilder('i')
            .leftJoin('i.session', 's')
            .where('s.formateur_id = :uid', { uid: userId })
            .andWhere('i.statut = :st', { st: StatutInscription.ACCEPTEE })
            .getCount(),
          AppDataSource.getRepository(Session)
            .createQueryBuilder('s')
            .leftJoin('s.evaluations', 'e')
            .where('s.formateur_id = :uid', { uid: userId })
            .select('COUNT(e.id)', 'count')
            .getRawOne(),
        ]);
        return { role, sessions, participants, evaluations: Number(evaluations?.count ?? 0) };
      }

      case RoleName.PARTICIPANT: {
        const [inscriptions, acceptees, attestations, presences] = await Promise.all([
          AppDataSource.getRepository(Inscription).count({ where: { participantId: userId } }),
          AppDataSource.getRepository(Inscription).count({ where: { participantId: userId, statut: StatutInscription.ACCEPTEE } }),
          AppDataSource.getRepository(Attestation).count({ where: { participantId: userId, valide: true } }),
          AppDataSource.getRepository(Presence).count({ where: { participantId: userId } }),
        ]);
        return { role, inscriptions, acceptees, attestations, presences };
      }

      case RoleName.PARTENAIRE: {
        const [formations, sessions] = await Promise.all([
          AppDataSource.getRepository(Formation).count({ where: { estPubliee: true, actif: true } }),
          AppDataSource.getRepository(Session).count({ where: { estPubliee: true } }),
        ]);
        return { role, formationsPubliees: formations, sessionsPubliees: sessions };
      }

      default:
        return { role };
    }
  }
}