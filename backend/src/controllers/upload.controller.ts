import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response.util';
import { ValidationError } from '../errors/AppError';

export class UploadController {
  static async avatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError('Aucun fichier');
      return successResponse(res, { url: `/uploads/avatars/${req.file.filename}` }, 'Avatar uploade', 201);
    } catch (e) { next(e); }
  }
  static async file(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError('Aucun fichier');
      return successResponse(res, { url: `/uploads/temp/${req.file.filename}`, filename: req.file.filename, size: req.file.size }, 'Fichier uploade', 201);
    } catch (e) { next(e); }
  }
}