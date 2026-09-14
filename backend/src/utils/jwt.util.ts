import jwt, { SignOptions, JwtPayload as BaseJwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError, ErrorCode } from '../errors/AppError';

export interface JwtPayload extends BaseJwtPayload {
  userId: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Génère un access token (courte durée)
 */
export function generateAccessToken(
  payload: Omit<JwtPayload, 'type'>,
  options?: SignOptions
): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: 'odc-platform',
      audience: 'odc-client',
      ...options,
    } as SignOptions
  );
}

/**
 * Génère un refresh token (longue durée)
 */
export function generateRefreshToken(
  payload: Omit<JwtPayload, 'type'>,
  options?: SignOptions
): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      issuer: 'odc-platform',
      audience: 'odc-client',
      ...options,
    } as SignOptions
  );
}

/**
 * Génère la paire de tokens
 */
export function generateTokens(payload: Omit<JwtPayload, 'type'>): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const decoded = jwt.decode(accessToken) as BaseJwtPayload;
  const expiresIn = decoded.exp
    ? decoded.exp - Math.floor(Date.now() / 1000)
    : 900;

  return { accessToken, refreshToken, expiresIn };
}

/**
 * Vérifie un access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'odc-platform',
      audience: 'odc-client',
    }) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new AppError('Type de token invalide', {
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
      });
    }

    return decoded;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Token expiré', {
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        details: { reason: 'TOKEN_EXPIRED' },
      });
    }
    if (err.name === 'JsonWebTokenError') {
      throw new AppError('Token invalide', {
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        details: { reason: 'TOKEN_INVALID' },
      });
    }
    throw err;
  }
}

/**
 * Vérifie un refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'odc-platform',
      audience: 'odc-client',
    }) as JwtPayload;

    if (decoded.type !== 'refresh') {
      throw new AppError('Type de token invalide', {
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
      });
    }

    return decoded;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expiré', {
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
        details: { reason: 'REFRESH_EXPIRED' },
      });
    }
    if (err.name === 'JsonWebTokenError') {
      throw new AppError('Refresh token invalide', {
        statusCode: 401,
        code: ErrorCode.UNAUTHORIZED,
      });
    }
    throw err;
  }
}

/**
 * Décode un token sans vérification (utile pour debug)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extrait un token du header Authorization
 */
export function extractTokenFromHeader(header?: string): string | null {
  if (!header) return null;
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

/**
 * Vérifie si un token est expiré (sans lever d'erreur)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as BaseJwtPayload;
    if (!decoded?.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}