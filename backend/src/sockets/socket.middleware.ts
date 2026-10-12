// backend/src/sockets/socket.middleware.ts
import { Socket } from 'socket.io';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { logger } from '../config/logger';

/* ============================================================================
   ERREURS SOCKET
   ============================================================================ */

export const SOCKET_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  NO_TOKEN: 'NO_TOKEN',
} as const;

export type SocketErrorCode = keyof typeof SOCKET_ERRORS;

/* ============================================================================
   MIDDLEWARE D'AUTHENTIFICATION SOCKET
   ============================================================================ */

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): void {
  try {
    /* -------------------- Récupérer le token -------------------- */
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      (socket.handshake.headers?.authorization as string | undefined)?.replace(
        /^Bearer\s+/,
        '',
      );

    if (!token) {
      logger.warn(`❌ Socket auth : ${SOCKET_ERRORS.NO_TOKEN}`);
      return next(new Error(SOCKET_ERRORS.NO_TOKEN));
    }

    /* -------------------- Vérifier le token -------------------- */
    const payload = verifyAccessToken(token);

    // Attacher le payload au socket
    (socket as any).user = payload;
    (socket as any).userId = payload.sub;
    (socket as any).userRole = payload.role;

    logger.info(`✅ Socket authentifié : ${payload.email} (${payload.role})`);
    next();
  } catch (error) {
    const err = error as Error;

    if (err.name === 'TokenExpiredError') {
      logger.warn(`❌ Socket auth : ${SOCKET_ERRORS.TOKEN_EXPIRED}`);
      return next(new Error(SOCKET_ERRORS.TOKEN_EXPIRED));
    }

    if (err.name === 'JsonWebTokenError') {
      logger.warn(`❌ Socket auth : ${SOCKET_ERRORS.INVALID_TOKEN}`);
      return next(new Error(SOCKET_ERRORS.INVALID_TOKEN));
    }

    logger.error('❌ Socket auth échouée :', err.message);
    return next(new Error(SOCKET_ERRORS.UNAUTHORIZED));
  }
}