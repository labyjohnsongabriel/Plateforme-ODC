// src/controllers/UploadController.ts
import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { successResponse } from '../utils/response.util';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { logger } from '../config/logger';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export class UploadController {
  // ==========================================================================
  // 🖼️ IMAGE SIMPLE
  // ==========================================================================
  /**
   * POST /api/uploads/image
   * Body : multipart/form-data avec champ `fichier`
   */
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier fourni');

      const url = `/uploads/${req.file.filename}`;

      logger.info(`🖼️ Image uploadée : ${req.file.filename} (${req.file.size} octets)`);

      return successResponse(res, {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }, 'Image uploadée', 201);
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 🖼️ IMAGES MULTIPLES
  // ==========================================================================
  /**
   * POST /api/uploads/images
   * Body : multipart/form-data avec champ `fichiers` (max 5)
   */
  static async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        throw new BadRequestError('Aucun fichier fourni');
      }

      const result = files.map((f) => ({
        url: `/uploads/${f.filename}`,
        filename: f.filename,
        originalName: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
      }));

      logger.info(`🖼️ ${files.length} image(s) uploadée(s)`);

      return successResponse(res, result, `${files.length} image(s) uploadée(s)`, 201);
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 📄 DOCUMENT (PDF / Word / PowerPoint / Vidéo)
  // ==========================================================================
  /**
   * POST /api/uploads/document
   * Body : multipart/form-data avec champ `fichier`
   */
  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Aucun fichier fourni');

      const url = `/uploads/documents/${req.file.filename}`;

      logger.info(`📄 Document uploadé : ${req.file.filename} (${req.file.size} octets)`);

      return successResponse(res, {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        sizeReadable: UploadController.formatSize(req.file.size),
        mimetype: req.file.mimetype,
      }, 'Document uploadé', 201);
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 🗑️ SUPPRESSION
  // ==========================================================================
  /**
   * DELETE /api/uploads/:filename
   * Supprime un fichier uploadé (sécurité : empêche path traversal).
   */
  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      if (!filename) throw new BadRequestError('filename requis');

      // Sécurité : empêcher le path traversal
      const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
      const fullPath = path.join(UPLOAD_DIR, safeName);

      // Vérifier que le chemin final est bien dans UPLOAD_DIR
      if (!fullPath.startsWith(UPLOAD_DIR)) {
        throw new BadRequestError('Chemin de fichier invalide');
      }

      try {
        await fs.unlink(fullPath);
        logger.info(`🗑️ Fichier supprimé : ${safeName}`);
        return successResponse(res, null, 'Fichier supprimé');
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          throw new NotFoundError('Fichier introuvable');
        }
        throw err;
      }
    } catch (e) { next(e); }
  }

  // ==========================================================================
  // 🔧 UTILITAIRES
  // ==========================================================================
  private static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
}