// src/services/presence.service.ts
import { timingSafeEqual } from 'crypto';
import { QueryFailedError } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Presence } from '../entities/Presence.entity';
import { presenceRepository } from '../repositories/presence.repository';
import {
  MethodePresence,
  RoleName,
  StatutPresence,
} from '../entities/enums';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/AppError';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { QrCodeService } from './qrcode.service';

const RETARD_THRESHOLD_MIN = 15;

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function getUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function toValidDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function getDayRange(value: Date): { startOfDay: Date; endOfDay: Date } {
  const startOfDay = new Date(value);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(value);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
}

function isPresenceDuplicate(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) return false;
  const driverError = error.driverError as {
    code?: string;
    constraint?: string;
  };
  return (
    driverError.code === '23505' &&
    driverError.constraint === 'UQ_presence_session_participant_date'
  );
}

async function savePresence(presence: Presence): Promise<Presence> {
  try {
    return await presenceRepository.save(presence);
  } catch (error) {
    if (isPresenceDuplicate(error)) {
      throw new ConflictError(
        'Présence déjà enregistrée pour cette session aujourd’hui',
      );
    }
    throw error;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   VÉRIFICATION FENÊTRE TEMPORELLE
   ═══════════════════════════════════════════════════════════════════════════ */

interface WindowCheckResult {
  allowed: boolean;
  reason?: string;
  details?: {
    now?: Date;
    startOfFirstDay?: Date;
    endOfLastDay?: Date;
  };
}

function checkTimeWindow(
  session: { date_debut: unknown; date_fin: unknown },
  now: Date = new Date(),
): WindowCheckResult {
  const skipWindow = env.QR_SKIP_TIME_WINDOW === true;
  if (skipWindow) {
    logger.debug('[TimeWindow] Bypass activé (QR_SKIP_TIME_WINDOW=true)');
    return { allowed: true };
  }

  const dateDebut = toValidDate(session.date_debut);
  const dateFin = toValidDate(session.date_fin);

  if (!dateDebut && !dateFin) {
    return { allowed: true, details: { now } };
  }

  if (dateDebut && !dateFin) {
    const { startOfDay } = getDayRange(dateDebut);
    if (now < startOfDay) {
      return {
        allowed: false,
        reason: `La session commence le ${dateDebut.toLocaleString('fr-FR')}`,
        details: { now, startOfFirstDay: startOfDay },
      };
    }
    return { allowed: true, details: { now, startOfFirstDay: startOfDay } };
  }

  if (!dateDebut && dateFin) {
    const { endOfDay } = getDayRange(dateFin);
    if (now > endOfDay) {
      return {
        allowed: false,
        reason: `La session s'est terminée le ${dateFin.toLocaleString('fr-FR')}`,
        details: { now, endOfLastDay: endOfDay },
      };
    }
    return { allowed: true, details: { now, endOfLastDay: endOfDay } };
  }

  const { startOfDay: startOfFirstDay } = getDayRange(dateDebut!);
  const { endOfDay: endOfLastDay } = getDayRange(dateFin!);

  if (now < startOfFirstDay) {
    return {
      allowed: false,
      reason: `La session n'a pas encore commencé. Elle débute le ${dateDebut!.toLocaleString('fr-FR')}.`,
      details: { now, startOfFirstDay, endOfLastDay },
    };
  }
  if (now > endOfLastDay) {
    return {
      allowed: false,
      reason: `La session est terminée. Elle s'est achevée le ${dateFin!.toLocaleString('fr-FR')}.`,
      details: { now, startOfFirstDay, endOfLastDay },
    };
  }

  return { allowed: true, details: { now, startOfFirstDay, endOfLastDay } };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICE
   ═══════════════════════════════════════════════════════════════════════════ */

export class PresenceService {
  /* ══════════════════════════════════════════════════════════════════════════
     GÉNÉRATION DU QR
     ══════════════════════════════════════════════════════════════════════════ */
  static async generateQr(
    sessionId: string,
    actorId: string,
    actorRole: RoleName,
    dureeMinutes?: number,
  ) {
    if (!AppDataSource.isInitialized) {
      throw new Error('Base de données non initialisée');
    }

    const rows = await AppDataSource.query(
      `SELECT id, code_session, presence_ouverte, formateur_id,
              date_debut, date_fin
       FROM sessions
       WHERE id = $1 AND deleted_at IS NULL`,
      [sessionId],
    );

    const row = rows[0];
    if (!row) throw new NotFoundError('Session introuvable');

    const canManage =
      actorRole === RoleName.ADMINISTRATEUR ||
      actorRole === RoleName.STAFF_ODC ||
      (actorRole === RoleName.FORMATEUR && row.formateur_id === actorId);

    if (!canManage) {
      throw new ForbiddenError(
        'Vous ne pouvez pas générer de QR code pour cette session',
      );
    }

    if (!row.presence_ouverte) {
      throw new ForbiddenError(
        "La session n'accepte pas les présences actuellement. Ouvrez d'abord les présences.",
      );
    }

    const windowCheck = checkTimeWindow(row);
    if (!windowCheck.allowed) {
      logger.warn('[QR GENERATE] Fenêtre temporelle refusée', {
        sessionId,
        reason: windowCheck.reason,
        details: windowCheck.details,
      });
      throw new ForbiddenError(
        windowCheck.reason ?? "La session n'est pas dans sa fenêtre temporelle",
      );
    }

    const now = new Date();
    const ttl =
      typeof dureeMinutes === 'number' && dureeMinutes > 0
        ? dureeMinutes
        : env.QR_TOKEN_TTL_MINUTES;

    const token = QrCodeService.genererTokenSession(sessionId, ttl);
    const expiresAt = new Date(now.getTime() + ttl * 60 * 1000);

    logger.info('[QR GENERATE] Début', {
      sessionId,
      ttl,
      expiresAt: expiresAt.toISOString(),
      tokenLength: token.length,
      skipWindow: env.QR_SKIP_TIME_WINDOW,
    });

    await AppDataSource.query(
      `UPDATE sessions
       SET qr_code_secret = $1, qr_code_expires_at = $2
       WHERE id = $3`,
      [token, expiresAt, sessionId],
    );

    const [verify] = await AppDataSource.query(
      `SELECT qr_code_secret, qr_code_expires_at FROM sessions WHERE id = $1`,
      [sessionId],
    );

    if (!verify?.qr_code_expires_at) {
      throw new Error("La date d'expiration n'a pas pu être enregistrée en DB.");
    }

    logger.info('[QR GENERATE] OK', {
      sessionId,
      expiresAt: verify.qr_code_expires_at,
    });

    const scannerUrl = new URL(
      '/participant/presences/scanner',
      env.CLIENT_URL,
    );
    scannerUrl.searchParams.set('session', sessionId);
    scannerUrl.searchParams.set('token', token);

    return {
      sessionId,
      qrToken: token,
      expiresAt,
      expiresIn: ttl * 60,
      url: scannerUrl.toString(),
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     SCAN QR
     ══════════════════════════════════════════════════════════════════════════ */
  static async scannerQr(
    participantId: string,
    sessionId: string,
    qrToken: string,
    ip?: string,
  ): Promise<Presence> {
    const rows = await AppDataSource.query(
      `SELECT id, code_session, presence_ouverte,
              date_debut, date_fin,
              qr_code_secret, qr_code_expires_at
       FROM sessions
       WHERE id = $1 AND deleted_at IS NULL`,
      [sessionId],
    );

    const row = rows[0];
    if (!row) throw new NotFoundError('Session introuvable');

    if (!row.presence_ouverte) {
      throw new ForbiddenError('Présence fermée pour cette session');
    }

    const verify = QrCodeService.verifierTokenSession(qrToken, sessionId);
    if (!verify.valid) {
      const messages: Record<string, string> = {
        malformed: 'QR code mal formé',
        invalid_signature: 'Signature QR invalide',
        expired: 'QR code expiré — demandez-en un nouveau',
        wrong_session: 'QR code non associé à cette session',
        invalid_version: 'Version de QR non supportée',
      };
      throw new BadRequestError(messages[verify.reason] ?? 'QR code invalide');
    }

    if (!row.qr_code_secret) {
      throw new BadRequestError(
        'Aucun QR code actif — demandez-en un à votre formateur',
      );
    }

    const expiresAt = toValidDate(row.qr_code_expires_at);
    const now = new Date();

    if (!expiresAt) {
      throw new BadRequestError(
        "Configuration QR invalide — l'expiration n'est pas enregistrée.",
      );
    }

    if (expiresAt < now) {
      const expiredSinceSeconds = Math.floor(
        (now.getTime() - expiresAt.getTime()) / 1000,
      );
      throw new BadRequestError(
        `QR code expiré depuis ${expiredSinceSeconds}s — demandez-en un nouveau`,
      );
    }

    const storedBuf = Buffer.from(row.qr_code_secret, 'utf8');
    const providedBuf = Buffer.from(qrToken, 'utf8');

    if (
      storedBuf.length !== providedBuf.length ||
      !timingSafeEqual(storedBuf, providedBuf)
    ) {
      throw new BadRequestError('QR code obsolète — scannez le dernier affiché');
    }

    const windowCheck = checkTimeWindow(row, now);
    if (!windowCheck.allowed) {
      throw new ForbiddenError(
        windowCheck.reason ?? "La session n'est pas ouverte actuellement",
      );
    }

    const inscription = await AppDataSource.query(
      `SELECT id, statut
       FROM inscriptions
       WHERE session_id = $1 AND participant_id = $2`,
      [sessionId, participantId],
    );

    const inscriptionRow = inscription[0];

    if (!inscriptionRow) {
      throw new ForbiddenError(
        "Vous n'êtes pas inscrit à cette session. Contactez votre formateur.",
      );
    }

    const STATUTS_VALIDES = ['ACCEPTEE', 'ACCEPTE', 'VALIDEE', 'CONFIRMEE'];
    const statutNormalisé = String(inscriptionRow.statut).toUpperCase();

    if (!STATUTS_VALIDES.includes(statutNormalisé)) {
      throw new ForbiddenError(
        `Votre inscription est en statut "${inscriptionRow.statut}". Elle doit être acceptée par un formateur pour pouvoir scanner.`,
      );
    }

    const today = getUtcDateString();
    const existing = await AppDataSource.query(
      `SELECT id FROM presences
       WHERE session_id = $1 AND participant_id = $2 AND date_presence = $3`,
      [sessionId, participantId, today],
    );

    if (existing.length > 0) {
      throw new ConflictError(
        'Présence déjà enregistrée pour cette session aujourd’hui',
      );
    }

    const dateDebut = toValidDate(row.date_debut);
    let statut = StatutPresence.PRESENT;
    if (dateDebut) {
      const { startOfDay } = getDayRange(dateDebut);
      const minutesLate = (now.getTime() - startOfDay.getTime()) / 60000;
      statut =
        minutesLate > RETARD_THRESHOLD_MIN
          ? StatutPresence.RETARD
          : StatutPresence.PRESENT;
    }

    const presence = await savePresence(
      presenceRepository.create({
        sessionId,
        participantId,
        statut,
        methode: MethodePresence.QR_CODE,
        datePresence: new Date(today),
        scanneLe: now,
        heureScan: now.toTimeString().slice(0, 8),
        qrToken,
        ipAddress: ip ?? null,
        commentaire: null,
      }),
    );

    logger.info(
      `✅ Présence QR : user=${participantId} session=${row.code_session} statut=${statut}`,
    );
    return presence;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     SAISIE MANUELLE
     ══════════════════════════════════════════════════════════════════════════ */
  static async marquerManuel(
    sessionId: string,
    participantId: string,
    present: boolean,
    commentaire: string | undefined,
    actorId: string,
    actorRole: RoleName,
  ): Promise<Presence> {
    const rows = await AppDataSource.query(
      `SELECT id, code_session, formateur_id
       FROM sessions WHERE id = $1 AND deleted_at IS NULL`,
      [sessionId],
    );

    const session = rows[0];
    if (!session) throw new NotFoundError('Session introuvable');

    const canManage =
      actorRole === RoleName.ADMINISTRATEUR ||
      actorRole === RoleName.STAFF_ODC ||
      (actorRole === RoleName.FORMATEUR && session.formateur_id === actorId);

    if (!canManage) {
      throw new ForbiddenError(
        'Vous ne pouvez pas gérer les présences de cette session',
      );
    }

    const inscriptionRows = await AppDataSource.query(
      `SELECT id, statut FROM inscriptions
       WHERE session_id = $1 AND participant_id = $2`,
      [sessionId, participantId],
    );

    const inscriptionRow = inscriptionRows[0];

    if (!inscriptionRow) {
      throw new ForbiddenError(
        'Ce participant ne possède pas d’inscription à cette session',
      );
    }

    const STATUTS_VALIDES = ['ACCEPTEE', 'ACCEPTE', 'VALIDEE', 'CONFIRMEE'];
    if (
      !STATUTS_VALIDES.includes(String(inscriptionRow.statut).toUpperCase())
    ) {
      throw new ForbiddenError(
        'L’inscription de ce participant n’est pas acceptée',
      );
    }

    const today = getUtcDateString();
    const now = new Date();
    const statut = present ? StatutPresence.PRESENT : StatutPresence.ABSENT;

    const existingRows = await AppDataSource.query(
      `SELECT id, statut FROM presences
       WHERE session_id = $1 AND participant_id = $2 AND date_presence = $3`,
      [sessionId, participantId, today],
    );

    if (existingRows[0]) {
      /* ── Mise à jour ────────────────────────────────────── */
      await AppDataSource.query(
        `UPDATE presences
         SET statut = $1, methode = $2, updated_at = NOW()
         WHERE id = $3`,
        [statut, MethodePresence.MANUEL, existingRows[0].id],
      );

      /* ⭐ findById — PAS findOne({ where: ... }) */
      const updated = await presenceRepository.findById(existingRows[0].id);
      if (!updated) {
        throw new NotFoundError('Présence introuvable après mise à jour');
      }

      // ⭐ NE PAS toucher à `updated.present` (c'est un getter)
      return updated;
    }

    /* ── Création ─────────────────────────────────────────── */
    const created = await savePresence(
      presenceRepository.create({
        sessionId,
        participantId,
        statut,
        methode: MethodePresence.MANUEL,
        datePresence: new Date(today),
        scanneLe: now,
        heureScan: now.toTimeString().slice(0, 8),
        commentaire: commentaire ?? null,
        ipAddress: null,
        qrToken: null,
      }),
    );

    // ⭐ NE PAS toucher à `created.present` (c'est un getter)
    return created;
  }

  /* ══════════════════════════════════════════════════════════════════════════
     OUVRIR / FERMER
     ══════════════════════════════════════════════════════════════════════════ */
  static async ouvrirPresences(
    sessionId: string,
    actorId: string,
    actorRole: RoleName,
  ): Promise<void> {
    const rows = await AppDataSource.query(
      `SELECT id, code_session, formateur_id FROM sessions
       WHERE id = $1 AND deleted_at IS NULL`,
      [sessionId],
    );

    const session = rows[0];
    if (!session) throw new NotFoundError('Session introuvable');

    const canManage =
      actorRole === RoleName.ADMINISTRATEUR ||
      actorRole === RoleName.STAFF_ODC ||
      (actorRole === RoleName.FORMATEUR && session.formateur_id === actorId);

    if (!canManage) {
      throw new ForbiddenError(
        'Vous ne pouvez pas ouvrir les présences de cette session',
      );
    }

    await AppDataSource.query(
      `UPDATE sessions SET presence_ouverte = true WHERE id = $1`,
      [sessionId],
    );

    logger.info(
      `🔓 Présences ouvertes : session=${session.code_session} par=${actorId}`,
    );
  }

  static async fermerPresences(
    sessionId: string,
    actorId: string,
    actorRole: RoleName,
  ): Promise<void> {
    const rows = await AppDataSource.query(
      `SELECT id, code_session, formateur_id FROM sessions
       WHERE id = $1 AND deleted_at IS NULL`,
      [sessionId],
    );

    const session = rows[0];
    if (!session) throw new NotFoundError('Session introuvable');

    const canManage =
      actorRole === RoleName.ADMINISTRATEUR ||
      actorRole === RoleName.STAFF_ODC ||
      (actorRole === RoleName.FORMATEUR && session.formateur_id === actorId);

    if (!canManage) {
      throw new ForbiddenError(
        'Vous ne pouvez pas fermer les présences de cette session',
      );
    }

    await AppDataSource.query(
      `UPDATE sessions
       SET presence_ouverte = false, qr_code_secret = NULL, qr_code_expires_at = NULL
       WHERE id = $1`,
      [sessionId],
    );

    logger.info(
      `🔒 Présences fermées : session=${session.code_session} par=${actorId}`,
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     CONSULTATION
     ══════════════════════════════════════════════════════════════════════════ */
  static async findBySession(sessionId: string, page = 1, limit = 20) {
    return presenceRepository.search({ sessionId, page, limit });
  }

  static async stats(sessionId: string) {
    return presenceRepository.statsBySession(sessionId);
  }

  static async tauxPresence(
    sessionId: string,
    participantId: string,
  ): Promise<number> {
    return presenceRepository.tauxPresence(sessionId, participantId);
  }

  static async mesPresences(participantId: string) {
    return presenceRepository.findByParticipant(participantId);
  }
}