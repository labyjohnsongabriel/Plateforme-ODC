// src/utils/jwt.util.ts
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './ApiError';  // ⭐ Utilise ApiError au lieu de HTTP_STATUS

/* ============================================================================
   TYPES
   ============================================================================ */

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/* ============================================================================
   GÉNÉRATION
   ============================================================================ */

export function generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

/* ============================================================================
   ⭐ VÉRIFICATION — FIX PRINCIPAL
   ============================================================================ */
// ⚠️ AVANT : ligne 100 → HTTP_STATUS.UNAUTHORIZED (undefined)
// ✅ APRÈS : ApiError.unauthorized() (qui importe HTTP_STATUS correctement)

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Session expirée');
      }
      if (error.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Token invalide');
      }
      if (error.name === 'NotBeforeError') {
        throw ApiError.unauthorized('Token pas encore actif');
      }
    }
    throw ApiError.unauthorized('Token invalide');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Refresh token expiré');
      }
    }
    throw ApiError.unauthorized('Refresh token invalide');
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch {
    return null;
  }
}