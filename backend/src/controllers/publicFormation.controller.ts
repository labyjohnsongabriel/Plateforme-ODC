// src/controllers/publicFormation.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { successResponse } from '../utils/response.util';
import { logger } from '../config/logger';

export class PublicFormationController {
  /**
   * GET /api/public/formations/:id/temoignages
   * Récupère les témoignages publiés pour une formation.
   * Retourne [] si la table n'existe pas encore.
   */
  static async getTemoignages(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;

      // ⭐ Vérifier que la table existe avant de requêter
      const tableExists = await PublicFormationController.tableExists(
        'temoignages',
      );

      if (!tableExists) {
        logger.warn(
          '[PublicFormationController.getTemoignages] Table "temoignages" absente — retour []',
        );
        successResponse(res, []);
        return;
      }

      // Requête normale
      const rows = await AppDataSource.query(
        `
        SELECT
          t.id,
          t.contenu,
          t.note,
          t.created_at,
          u.prenom AS "auteurPrenom",
          u.nom AS "auteurNom",
          u.photo_url AS "auteurPhotoUrl",
          p.libelle AS "auteurPromotion"
        FROM temoignages t
        LEFT JOIN users u ON u.id = t.participant_id
        LEFT JOIN promotions p ON p.id = t.promotion_id
        WHERE t.formation_id = $1
          AND t.est_publiee = true
          AND t.deleted_at IS NULL
        ORDER BY t.created_at DESC
        LIMIT 6
        `,
        [id],
      );

      const data = rows.map((r: any) => ({
        id: r.id,
        contenu: r.contenu,
        note: r.note,
        createdAt: r.created_at,
        auteur: r.auteurPrenom
          ? {
              prenom: r.auteurPrenom,
              nom: r.auteurNom,
              photoUrl: r.auteurPhotoUrl,
              promotion: r.auteurPromotion,
            }
          : null,
      }));

      successResponse(res, data);
    } catch (error) {
      logger.error('[PublicFormationController.getTemoignages] Erreur', error);
      next(error);
    }
  }

  /**
   * ⭐ Vérifie si une table existe dans le schéma public.
   */
  private static async tableExists(tableName: string): Promise<boolean> {
    try {
      const rows = await AppDataSource.query(
        `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = $1
        ) AS exists
        `,
        [tableName],
      );
      return rows[0]?.exists === true;
    } catch {
      return false;
    }
  }
}