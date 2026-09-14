import { Request, Response, NextFunction } from 'express';

/**
 * Gestion des routes non trouvées (404)
 */
export function notFoundMiddleware(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    message: `Route non trouvée : ${req.method} ${req.originalUrl}`,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    hint: 'Vérifiez l\'URL et la méthode HTTP utilisée',
  });
}