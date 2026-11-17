// src/services/attestation.service.ts
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { attestationRepository } from '../repositories/attestation.repository';
import { Attestation } from '../entities/Attestation.entity';
import { AppDataSource } from '../config/database';
import { Inscription } from '../entities/Inscription.entity';
import { Presence } from '../entities/Presence.entity';
import { Note } from '../entities/Note.entity';
import { Session } from '../entities/Session.entity';
import { User } from '../entities/User.entity';
import { StatutInscription } from '../entities/enums';
import { PdfService } from './pdf.service';
import { MailService } from './mail.service';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { NotFoundError, BadRequestError, ConflictError } from '../errors/AppError';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface EligibilityCriteria {
  presenceMin: number;
  noteMin: number;
  selectionValidee: boolean;
  inscriptionValidee: boolean;
}

const DEFAULT_CRITERIA: EligibilityCriteria = {
  presenceMin: env.ATTESTATION_CRITERIA_PRESENCE_MIN ?? 75,
  noteMin: env.ATTESTATION_CRITERIA_NOTE_MIN ?? 10,
  selectionValidee: true,
  inscriptionValidee: true,
};

export interface PresenceCalculation {
  taux: number;
  presentes: number;
  retards: number;
  absents: number;
  excuses: number;
  total: number;
}

export interface AttestationFile {
  buffer: Buffer;
  nom: string;
  contentType: string;
}

/* ============================================================================
   SERVICE
   ============================================================================ */

export class AttestationService {
  /* ════════════════════════════════════════════════════════════════════════
     ⭐ CACHE LOGO — Chargé une seule fois par process
     ════════════════════════════════════════════════════════════════════════ */
  private static _logoCache: string | null | undefined = undefined;

  private static getLogoDataUrl(): string | undefined {
    if (this._logoCache !== undefined) return this._logoCache ?? undefined;

    const candidates: string[] = [
      path.resolve(process.cwd(), 'src/assets/brand/logo-odc.png'),
      path.resolve(process.cwd(), 'assets/brand/logo-odc.png'),
      path.resolve(__dirname, '../assets/brand/logo-odc.png'),
      path.resolve(process.cwd(), 'public/images/brand/logo-odc.png'),
      path.resolve(process.cwd(), '../frontend/public/images/brand/logo-odc.png'),
      path.resolve(process.cwd(), 'frontend/public/images/brand/logo-odc.png'),
      'E:\\Dossier\\odc-platform\\frontend\\public\\images\\brand\\logo-odc.png',
    ];

    for (const p of candidates) {
      try {
        if (!fs.existsSync(p)) continue;
        const buffer = fs.readFileSync(p);
        const ext = path.extname(p).toLowerCase();
        const mime =
          ext === '.svg'
            ? 'image/svg+xml'
            : ext === '.jpg' || ext === '.jpeg'
              ? 'image/jpeg'
              : ext === '.webp'
                ? 'image/webp'
                : 'image/png';

        this._logoCache = `data:${mime};base64,${buffer.toString('base64')}`;
        logger.info(`[attestation] Logo ODC chargé depuis : ${p}`);
        return this._logoCache;
      } catch {
        /* next */
      }
    }

    logger.warn(
      '[attestation] Logo ODC introuvable. Copie "logo-odc.png" dans backend/src/assets/brand/'
    );
    this._logoCache = null;
    return undefined;
  }

  /* ════════════════════════════════════════════════════════════════════════
     HELPER — Détection sélection
     ════════════════════════════════════════════════════════════════════════ */
  private static isSelected(inscription: Inscription): boolean {
    const raw = inscription as any;
    const date = raw.dateSelection ?? raw.date_selection;
    return date !== null && date !== undefined;
  }

  /* ════════════════════════════════════════════════════════════════════════
     HELPER — Calcul présence
     ════════════════════════════════════════════════════════════════════════ */
  private static calculerPresence(presences: Presence[]): PresenceCalculation {
    const total = presences.length;
    if (total === 0) {
      return { taux: 0, presentes: 0, retards: 0, absents: 0, excuses: 0, total: 0 };
    }

    let presentes = 0,
      retards = 0,
      absents = 0,
      excuses = 0;

    for (const p of presences) {
      const raw = p as any;
      const statut = String(raw.statut ?? raw.status ?? '')
        .toUpperCase()
        .trim();

      if (statut === 'PRESENT' || statut === 'PRÉSENT' || statut === 'PRESENTE') {
        presentes++;
        continue;
      }
      if (statut === 'RETARD') {
        retards++;
        continue;
      }
      if (statut === 'ABSENT') {
        absents++;
        continue;
      }
      if (statut === 'EXCUSE' || statut === 'EXCUSÉ' || statut === 'JUSTIFIE') {
        excuses++;
        continue;
      }

      if (typeof raw.estPresent === 'boolean') {
        if (raw.estPresent) presentes++;
        else absents++;
        continue;
      }
      if (typeof raw.present === 'boolean') {
        if (raw.present) presentes++;
        else absents++;
        continue;
      }
      absents++;
    }

    const valides = presentes + retards;
    const denominateur = total - excuses;
    const taux = denominateur > 0 ? Math.round((valides / denominateur) * 100) : 0;

    return { taux, presentes, retards, absents, excuses, total };
  }

  /* ════════════════════════════════════════════════════════════════════════
     READ
     ════════════════════════════════════════════════════════════════════════ */
  static async findAll(query: any) {
    return attestationRepository.search({
      page: query.page,
      limit: query.limit,
      sessionId: query.sessionId,
      participantId: query.participantId,
      formationId: query.formationId,
      valide: query.valide,
      search: query.search,
      dateDebut: query.dateDebut,
      dateFin: query.dateFin,
    });
  }

  static async findOne(id: string): Promise<Attestation> {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) throw new NotFoundError('Attestation introuvable');
    return attestation;
  }

  static async findOneForParticipant(id: string, userId: string): Promise<Attestation> {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) throw new NotFoundError('Attestation introuvable');
    if (attestation.participantId !== userId) {
      throw new NotFoundError('Attestation introuvable');
    }
    return attestation;
  }

  static async getStats() {
    const [total, valides, invalides, ceMois] = await Promise.all([
      attestationRepository.count(),
      attestationRepository.countValid(),
      attestationRepository.countInvalid(),
      attestationRepository.countThisMonth(),
    ]);
    return { total, valides, invalides, ceMois };
  }

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ VÉRIFICATION PUBLIQUE (QR)
     ⭐ FIX : retiré 'session.formation.domaine' des relations
     ════════════════════════════════════════════════════════════════════════ */
  static async verifierAuthenticite(numero: string) {
    const attestation = await attestationRepository.findByNumero(numero);
    if (!attestation) return { valide: false, attestation: null };

    return {
      valide: attestation.valide,
      attestation: this.serialize(attestation),
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ MES ATTESTATIONS
     ⭐ FIX : retiré .leftJoinAndSelect('formation.domaine', 'domaine')
     ════════════════════════════════════════════════════════════════════════ */
  static async mesAttestations(userId: string): Promise<Attestation[]> {
    return (
      AppDataSource.getRepository(Attestation)
        .createQueryBuilder('att')
        .leftJoinAndSelect('att.session', 'session')
        .leftJoinAndSelect('session.formation', 'formation')
        // ⭐ SUPPRIMÉ : .leftJoinAndSelect('formation.domaine', 'domaine')
        .where('att.participantId = :userId', { userId })
        .andWhere('att.deletedAt IS NULL')
        .orderBy('att.dateEmission', 'DESC')
        .getMany()
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     HELPER — Notes
     ════════════════════════════════════════════════════════════════════════ */
  private static async getNotesForSessionParticipant(
    sessionId: string,
    participantId: string
  ): Promise<Note[]> {
    return AppDataSource.getRepository(Note)
      .createQueryBuilder('note')
      .innerJoin('note.evaluation', 'evaluation')
      .where('evaluation.sessionId = :sessionId', { sessionId })
      .andWhere('note.participantId = :participantId', { participantId })
      .getMany();
  }

  private static calculateNoteFinale(notes: Note[]): number {
    if (notes.length === 0) return 0;
    const sum = notes.reduce((acc, n) => {
      const v = Number((n as any).note);
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);
    const avg = sum / notes.length;
    return Number.isFinite(avg) ? Number(avg.toFixed(2)) : 0;
  }

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ VÉRIFIER ÉLIGIBILITÉ
     ⭐ FIX : retiré 'formation.domaine' des relations
     ════════════════════════════════════════════════════════════════════════ */
  static async verifierEligibilite(
    sessionId: string,
    participantId: string,
    criteria: EligibilityCriteria = DEFAULT_CRITERIA
  ) {
    const raisons: string[] = [];

    const session = await AppDataSource.getRepository(Session).findOne({
      where: { id: sessionId },
      relations: ['formation'], // ⭐ SUPPRIMÉ : 'formation.domaine'
    });
    if (!session) throw new NotFoundError('Session introuvable');

    const inscription = await AppDataSource.getRepository(Inscription).findOne({
      where: { sessionId, participantId },
    });

    if (!inscription) {
      raisons.push('Aucune inscription trouvée');
    } else if (
      criteria.inscriptionValidee &&
      inscription.statut !== StatutInscription.ACCEPTEE
    ) {
      raisons.push(`Inscription non validée (statut : ${inscription.statut})`);
    }

    const estSelectionne = inscription ? this.isSelected(inscription) : false;
    if (criteria.selectionValidee && inscription && !estSelectionne) {
      raisons.push('Participant non sélectionné');
    }

    const presences = await AppDataSource.getRepository(Presence).find({
      where: { sessionId, participantId },
      order: { datePresence: 'ASC' },
    });
    const presenceCalc = this.calculerPresence(presences);

    if (presenceCalc.taux < criteria.presenceMin) {
      raisons.push(
        `Taux de présence insuffisant (${presenceCalc.taux}% < ${criteria.presenceMin}%) — ${presenceCalc.presentes + presenceCalc.retards}/${presenceCalc.total} séances`
      );
    }

    const notes = await this.getNotesForSessionParticipant(sessionId, participantId);
    const noteFinale = this.calculateNoteFinale(notes);

    if (noteFinale < criteria.noteMin) {
      raisons.push(`Note insuffisante (${noteFinale.toFixed(1)}/20 < ${criteria.noteMin}/20)`);
    }

    const existing = await attestationRepository.findBySessionAndParticipant(
      sessionId,
      participantId
    );

    return {
      eligible: raisons.length === 0,
      raisons,
      estSelectionne,
      dateSelection: (inscription as any)?.dateSelection ?? null,
      tauxPresence: presenceCalc.taux,
      presencesPresentes: presenceCalc.presentes,
      presencesRetards: presenceCalc.retards,
      presencesAbsentes: presenceCalc.absents,
      presencesExcusees: presenceCalc.excuses,
      totalSeances: presenceCalc.total,
      noteFinale,
      dejaGeneree: !!existing,
      attestationId: existing?.id,
      session: this.serializeSession(session),
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ APERÇU SESSION
     ⭐ FIX : retiré 'formation.domaine' des relations
     ════════════════════════════════════════════════════════════════════════ */
  static async previewSession(sessionId: string, criteria: EligibilityCriteria = DEFAULT_CRITERIA) {
    const session = await AppDataSource.getRepository(Session).findOne({
      where: { id: sessionId },
      relations: ['formation'], // ⭐ SUPPRIMÉ : 'formation.domaine'
    });
    if (!session) throw new NotFoundError('Session introuvable');

    const inscriptions = await AppDataSource.getRepository(Inscription)
      .createQueryBuilder('inscription')
      .innerJoinAndSelect('inscription.participant', 'participant')
      .where('inscription.sessionId = :sessionId', { sessionId })
      .andWhere('inscription.deletedAt IS NULL')
      .getMany();

    if (inscriptions.length === 0) {
      return {
        session: this.serializeSession(session),
        criteres: criteria,
        participants: [],
        stats: { total: 0, eligibles: 0, ineligibles: 0, dejaGenerees: 0 },
      };
    }

    const participantIds = inscriptions.map((i) => i.participantId);

    const allPresences = await AppDataSource.getRepository(Presence).find({
      where: { sessionId },
    });
    const presencesByParticipant = new Map<string, Presence[]>();
    for (const p of allPresences) {
      const arr = presencesByParticipant.get(p.participantId) ?? [];
      arr.push(p);
      presencesByParticipant.set(p.participantId, arr);
    }

    const allNotes = await AppDataSource.getRepository(Note)
      .createQueryBuilder('note')
      .innerJoin('note.evaluation', 'evaluation')
      .where('evaluation.sessionId = :sessionId', { sessionId })
      .andWhere('note.participantId IN (:...participantIds)', { participantIds })
      .getMany();

    const notesByParticipant = new Map<string, Note[]>();
    for (const n of allNotes) {
      const arr = notesByParticipant.get(n.participantId) ?? [];
      arr.push(n);
      notesByParticipant.set(n.participantId, arr);
    }

    const existingAttestations = await AppDataSource.getRepository(Attestation)
      .createQueryBuilder('att')
      .where('att.sessionId = :sessionId', { sessionId })
      .andWhere('att.participantId IN (:...participantIds)', { participantIds })
      .andWhere('att.deletedAt IS NULL')
      .getMany();

    const attestationByParticipant = new Map<string, Attestation>();
    for (const a of existingAttestations) {
      attestationByParticipant.set(a.participantId, a);
    }

    const participants = inscriptions
      .map((inscription) => {
        const participant = inscription.participant;
        if (!participant) return null;

        const raisons: string[] = [];

        if (
          criteria.inscriptionValidee &&
          inscription.statut !== StatutInscription.ACCEPTEE
        ) {
          raisons.push(`Inscription non validée (${inscription.statut})`);
        }

        const estSelectionne = this.isSelected(inscription);
        if (criteria.selectionValidee && !estSelectionne) {
          raisons.push('Participant non sélectionné');
        }

        const presences = presencesByParticipant.get(participant.id) ?? [];
        const presenceCalc = this.calculerPresence(presences);
        if (presenceCalc.taux < criteria.presenceMin) {
          raisons.push(`Présence insuffisante (${presenceCalc.taux}% < ${criteria.presenceMin}%)`);
        }

        const notes = notesByParticipant.get(participant.id) ?? [];
        const noteFinale = this.calculateNoteFinale(notes);
        if (noteFinale < criteria.noteMin) {
          raisons.push(`Note insuffisante (${noteFinale.toFixed(1)}/20 < ${criteria.noteMin}/20)`);
        }

        const existing = attestationByParticipant.get(participant.id);

        return {
          participantId: participant.id,
          participant: {
            id: participant.id,
            nom: participant.nom,
            prenom: participant.prenom,
            email: participant.email,
            photoUrl: participant.photoUrl,
          },
          estSelectionne,
          dateSelection: (inscription as any).dateSelection ?? null,
          tauxPresence: presenceCalc.taux,
          presencesPresentes: presenceCalc.presentes,
          presencesRetards: presenceCalc.retards,
          presencesAbsentes: presenceCalc.absents,
          presencesExcusees: presenceCalc.excuses,
          totalSeances: presenceCalc.total,
          noteFinale,
          eligible: raisons.length === 0,
          raisons,
          dejaGeneree: !!existing,
          attestationId: existing?.id,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    const stats = {
      total: participants.length,
      eligibles: participants.filter((p) => p.eligible).length,
      ineligibles: participants.filter((p) => !p.eligible).length,
      dejaGenerees: participants.filter((p) => p.dejaGeneree).length,
    };

    return { session: this.serializeSession(session), criteres: criteria, participants, stats };
  }

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ GÉNÉRER
     ════════════════════════════════════════════════════════════════════════ */
  static async generer(sessionId: string, participantId: string): Promise<Attestation> {
    const eligibility = await this.verifierEligibilite(sessionId, participantId);

    if (!eligibility.eligible) {
      throw new BadRequestError(`Participant non éligible : ${eligibility.raisons.join(', ')}`);
    }
    if (eligibility.dejaGeneree) {
      throw new ConflictError('Une attestation existe déjà pour ce participant');
    }

    const numero = await this.generateNumero();
    const hash = this.generateHash(numero, participantId, sessionId);

    const attestation = await attestationRepository.create({
      numero,
      hash,
      sessionId,
      participantId,
      noteFinale: eligibility.noteFinale,
      tauxPresence: eligibility.tauxPresence,
      dateEmission: new Date(),
      valide: true,
      telechargee: false,
    });

    try {
      const pdfUrl = await this.generateAndSavePdf(attestation);
      if (pdfUrl) {
        await attestationRepository.update(attestation.id, { fichierUrl: pdfUrl } as any);
        attestation.fichierUrl = pdfUrl;
      }
    } catch (pdfError) {
      logger.error('[generer] Erreur PDF (non bloquant):', pdfError);
    }

    this.envoyerParEmail(attestation.id).catch((err) => {
      logger.error('[generer] Erreur email (non bloquant):', err);
    });

    return attestation;
  }

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ GÉNÉRER PAR SESSION
     ════════════════════════════════════════════════════════════════════════ */
  static async genererParSession(
    sessionId: string,
    criteria: EligibilityCriteria = DEFAULT_CRITERIA
  ) {
    const preview = await this.previewSession(sessionId, criteria);

    const result = {
      generes: 0,
      ignores: 0,
      erreurs: 0,
      attestations: [] as Array<{
        id: string;
        numero: string;
        participantId: string;
        participantNom: string;
      }>,
      details: {
        participantsTotal: preview.participants.length,
        participantsEligibles: 0,
        participantsIgnores: 0,
        dejaGenerees: 0,
      },
    };

    for (const p of preview.participants) {
      if (p.dejaGeneree) {
        result.ignores++;
        result.details.participantsIgnores++;
        result.details.dejaGenerees++;
        logger.warn(`[ATTESTATION] Déjà générée pour ${p.participantId} (${p.attestationId})`);
        continue;
      }
      if (!p.eligible) {
        result.ignores++;
        result.details.participantsIgnores++;
        logger.info(`[ATTESTATION] Ignoré ${p.participantId}: ${p.raisons.join(', ')}`);
        continue;
      }
      try {
        const attestation = await this.generer(sessionId, p.participantId);
        result.generes++;
        result.details.participantsEligibles++;
        result.attestations.push({
          id: attestation.id,
          numero: attestation.numero,
          participantId: p.participantId,
          participantNom: `${p.participant.prenom} ${p.participant.nom}`,
        });
      } catch (e) {
        result.erreurs++;
        result.details.participantsIgnores++;
        logger.error(`[ATTESTATION] Erreur génération ${p.participantId}`, e);
      }
    }

    return result;
  }

  /* ════════════════════════════════════════════════════════════════════════
     INVALIDER / RÉACTIVER
     ════════════════════════════════════════════════════════════════════════ */
  static async invalider(id: string, motif: string): Promise<Attestation> {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) throw new NotFoundError('Attestation introuvable');
    const updated = await attestationRepository.updateValidity(id, false, motif);
    return updated!;
  }

  static async reactiver(id: string): Promise<Attestation> {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) throw new NotFoundError('Attestation introuvable');
    const updated = await attestationRepository.updateValidity(id, true);
    return updated!;
  }

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ TÉLÉCHARGER
     ════════════════════════════════════════════════════════════════════════ */
  static async telecharger(id: string, userId: string): Promise<AttestationFile> {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) throw new NotFoundError('Attestation introuvable');

    const isOwner = attestation.participantId === userId;
    if (!isOwner && !(await this.isAdminOrStaff(userId))) {
      throw new BadRequestError('Non autorisé à télécharger cette attestation');
    }

    let buffer: Buffer;
    try {
      const pdfData = await this.buildPdfData(attestation);
      buffer = await PdfService.genererAttestation(pdfData);
    } catch (pdfError) {
      logger.error('[telecharger] Erreur génération PDF:', pdfError);
      throw new BadRequestError(`Impossible de générer le PDF : ${(pdfError as Error).message}`);
    }

    attestationRepository.markAsDownloaded(id).catch((e) => {
      logger.error('[telecharger] markAsDownloaded:', e);
    });

    return {
      buffer,
      nom: `attestation-${attestation.numero}.pdf`,
      contentType: 'application/pdf',
    };
  }

  /* ════════════════════════════════════════════════════════════════════════
     ⭐ ENVOYER PAR EMAIL
     ⭐ FIX : passe urlVerification + noteFinale + tauxPresence à MailService
     ════════════════════════════════════════════════════════════════════════ */
  static async envoyerParEmail(attestationId: string): Promise<boolean> {
    try {
      const attestation = await attestationRepository.findByIdWithRelations(attestationId);
      if (!attestation) throw new NotFoundError('Attestation introuvable');

      const participant = attestation.participant;
      if (!participant?.email) {
        logger.warn(`[envoyerParEmail] Aucun email pour ${attestation.participantId}`);
        return false;
      }

      let pdfBuffer: Buffer;
      try {
        const pdfData = await this.buildPdfData(attestation);
        pdfBuffer = await PdfService.genererAttestation(pdfData);
      } catch (pdfError) {
        logger.error(
          `[envoyerParEmail] Erreur génération PDF pour ${attestation.numero}:`,
          pdfError
        );
        return false;
      }

      try {
        await MailService.envoyerAttestation({
          destinataire: participant.email,
          nomParticipant: `${participant.prenom ?? ''} ${participant.nom ?? ''}`.trim(),
          formationTitre: attestation.session?.formation?.titre ?? 'Formation',
          numeroAttestation: attestation.numero,
          pdfBuffer,
          noteFinale: attestation.noteFinale ?? undefined, // ⭐
          tauxPresence: attestation.tauxPresence ?? undefined, // ⭐
          urlVerification: this.buildVerificationUrl(attestation.numero), // ⭐
        });
        logger.info(`📧 Attestation ${attestation.numero} envoyée à ${participant.email}`);
        return true;
      } catch (mailError) {
        logger.error(
          `[envoyerParEmail] Erreur envoi email pour ${attestation.numero} à ${participant.email}:`,
          mailError
        );
        return false;
      }
    } catch (err) {
      logger.error('[envoyerParEmail] Erreur:', err);
      return false;
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     HELPERS PRIVÉS
     ════════════════════════════════════════════════════════════════════════ */

  /**
   * ⭐ Construit les données PDF (avec logo)
   *    Centralisé pour éviter les duplications
   */
  private static async buildPdfData(attestation: Attestation) {
    return PdfService.buildDataAsync(attestation, {
      verificationUrl: this.buildVerificationUrl(attestation.numero),
      logoDataUrl: this.getLogoDataUrl(),
    });
  }

  private static async generateAndSavePdf(attestation: Attestation): Promise<string | null> {
    try {
      const full = await attestationRepository.findByIdWithRelations(attestation.id);
      if (!full) {
        logger.warn(`[generateAndSavePdf] Attestation ${attestation.id} introuvable`);
        return null;
      }

      const pdfData = await this.buildPdfData(full);
      const buffer = await PdfService.genererAttestation(pdfData);

      const fileName = `attestation-${full.numero}.pdf`;
      await PdfService.sauvegarderPdf(buffer, fileName);

      logger.info(`📄 PDF généré et sauvegardé : ${fileName}`);
      return `/uploads/attestations/${fileName}`;
    } catch (err) {
      logger.error('[generateAndSavePdf] Erreur:', err);
      return null;
    }
  }

  private static buildVerificationUrl(numero: string): string {
    const baseUrl = (env.CLIENT_URL ?? 'https://odc.mg').replace(/\/+$/, '');
    return `${baseUrl}/verifier-attestation/${numero}`;
  }

  private static async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ATT-${year}-`;

    const last = await AppDataSource.getRepository(Attestation)
      .createQueryBuilder('att')
      .where('att.numero LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('att.numero', 'DESC')
      .getOne();

    let lastSeq = 0;
    if (last?.numero) {
      const m = last.numero.match(/(\d+)$/);
      if (m) lastSeq = parseInt(m[1], 10) || 0;
    }
    return `${prefix}${String(lastSeq + 1).padStart(6, '0')}`;
  }

  private static generateHash(numero: string, participantId: string, sessionId: string): string {
    return crypto
      .createHash('sha256')
      .update(`${numero}:${participantId}:${sessionId}:${Date.now()}`)
      .digest('hex');
  }

  private static async isAdminOrStaff(userId: string): Promise<boolean> {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: ['role'],
    });
    return user?.role?.nom === 'ADMINISTRATEUR' || user?.role?.nom === 'STAFF_ODC';
  }

  /* ════════════════════════════════════════════════════════════════════════
     SERIALIZE
     ════════════════════════════════════════════════════════════════════════ */
  private static serialize(attestation: Attestation): any {
    return {
      id: attestation.id,
      numero: attestation.numero,
      hash: attestation.hash,
      participantId: attestation.participantId,
      participant: attestation.participant
        ? {
            id: attestation.participant.id,
            nom: attestation.participant.nom,
            prenom: attestation.participant.prenom,
            email: attestation.participant.email,
            photoUrl: attestation.participant.photoUrl,
          }
        : undefined,
      sessionId: attestation.sessionId,
      session: attestation.session ? this.serializeSession(attestation.session) : undefined,
      noteFinale: attestation.noteFinale !== null ? Number(attestation.noteFinale) : undefined,
      tauxPresence:
        attestation.tauxPresence !== null ? Number(attestation.tauxPresence) : undefined,
      dateEmission: attestation.dateEmission,
      fichierUrl: attestation.fichierUrl,
      qrCodeUrl: attestation.qrCodeUrl,
      valide: attestation.valide,
      motifInvalidation: attestation.motifInvalidation,
      telechargee: attestation.telechargee,
      dateTelechargement: attestation.dateTelechargement,
    };
  }

  /**
   * ⭐ Récupère le domaine de façon robuste SANS jointure.
   *    - Cas A : formation.domaine = string
   *    - Cas B : formation.domaine = objet { nom }
   *    - Cas C : formation.domaineRelation.nom
   *    - Fallback : formation.domaineNom
   */
  private static serializeSession(session: Session): any {
    if (!session) return undefined;

    const formation: any = session.formation;
    let domaine: string | undefined;

    if (formation) {
      const d = formation.domaine;
      if (typeof d === 'string') domaine = d;
      else if (d && typeof d === 'object' && d.nom) domaine = d.nom;
      else if (formation.domaineRelation?.nom) domaine = formation.domaineRelation.nom;
      else if (formation.domaineNom) domaine = formation.domaineNom;
    }

    return {
      id: session.id,
      codeSession: session.codeSession,
      dateDebut: session.dateDebut,
      dateFin: session.dateFin,
      statut: session.statut,
      formation: formation
        ? {
            id: formation.id,
            titre: formation.titre,
            dureeHeures: formation.dureeHeures,
            domaine,
          }
        : undefined,
    };
  }
}
