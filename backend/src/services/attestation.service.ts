<<<<<<< HEAD
import { AppDataSource } from '../config/database';
import { Attestation } from '../models/Attestation.entity';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { Presence } from '../models/Presence.entity';
import { Note } from '../models/Note.entity';
import { Session } from '../models/Session.entity';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { logger } from '../config/logger';
import crypto from 'crypto';
import { getPagination } from '../utils/pagination.util';

export class AttestationService {
  private static get repo() { return AppDataSource.getRepository(Attestation); }

  static async verifierEligibilite(sessionId: string, participantId: string) {
    const raisons: string[] = [];
    const inscription = await AppDataSource.getRepository(Inscription).findOne({
      where: { sessionId, participantId, statut: StatutInscription.ACCEPTEE },
    });
    if (!inscription) raisons.push('Inscription non acceptee');

    const presenceRepo = AppDataSource.getRepository(Presence);
    const total = await presenceRepo.createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'total')
      .where('p.session_id = :sid', { sid: sessionId }).getRawOne();
    const pres = await presenceRepo.createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'count')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('p.present = true').getRawOne();
    const taux = total.total && total.total !== '0' ? (Number(pres.count) / Number(total.total)) * 100 : 0;
    if (taux < 75) raisons.push(`Presence insuffisante (${taux.toFixed(1)}%)`);

    const notes = await AppDataSource.getRepository(Note).createQueryBuilder('n')
      .leftJoin('n.evaluation', 'e')
      .where('e.session_id = :sid', { sid: sessionId })
      .andWhere('n.participant_id = :pid', { pid: participantId }).getMany();
    const moyenne = notes.length > 0 ? notes.reduce((s, n) => s + Number(n.note), 0) / notes.length : 0;
    if (moyenne < 10) raisons.push(`Note insuffisante (${moyenne.toFixed(2)})`);

    return { eligible: raisons.length === 0, raisons, details: { taux: Math.round(taux * 100) / 100, moyenne: Math.round(moyenne * 100) / 100 } };
  }

  static async generer(sessionId: string, participantId: string) {
    const existing = await this.repo.findOne({ where: { sessionId, participantId } });
    if (existing) return existing;
    const { eligible, raisons, details } = await this.verifierEligibilite(sessionId, participantId);
    if (!eligible) throw new ConflictError(raisons.join(', '));

    const session = await AppDataSource.getRepository(Session).findOne({ where: { id: sessionId }, relations: ['formation'] });
    if (!session) throw new NotFoundError('Session introuvable');

    const domaine = session.formation.domaine.substring(0, 3).toUpperCase();
    const numero = `ODC-${new Date().getFullYear()}-${domaine}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const dateEmission = new Date();
    const hash = crypto.createHash('sha256').update(`${numero}|${participantId}|${sessionId}|${dateEmission.toISOString()}`).digest('hex');

    const a = this.repo.create({
      numero, hash, sessionId, participantId,
      noteFinale: details.moyenne, tauxPresence: details.taux,
      dateEmission, fichierUrl: `/uploads/attestations/${numero}.pdf`,
    });
    await this.repo.save(a);
    logger.info(`Attestation generee : ${numero}`);
    return a;
  }

  static async genererParSession(sessionId: string) {
    const inscriptions = await AppDataSource.getRepository(Inscription).find({
      where: { sessionId, statut: StatutInscription.ACCEPTEE },
    });
    let succes = 0, echecs = 0;
    const details: any[] = [];
    for (const i of inscriptions) {
      try { await this.generer(sessionId, i.participantId); succes++; details.push({ id: i.participantId, ok: true }); }
      catch (e: any) { echecs++; details.push({ id: i.participantId, ok: false, raison: e.message }); }
    }
    return { succes, echecs, details };
  }

  static async verifierAuthenticite(numero: string) {
    const a = await this.repo.findOne({ where: { numero }, relations: ['participant', 'session', 'session.formation'] });
    if (!a) return { valide: false };
    return {
      valide: true,
      attestation: {
        numero: a.numero,
        participant: `${a.participant.prenom} ${a.participant.nom}`,
        formation: a.session.formation.titre,
        dateEmission: a.dateEmission,
        noteFinale: a.noteFinale,
=======
// src/services/attestation.service.ts
import crypto from 'crypto';
import { attestationRepository } from '../repositories/attestation.repository';
import { sessionRepository } from '../repositories/session.repository';
import { presenceRepository } from '../repositories/presence.repository';
import { noteRepository } from '../repositories/note.repository';
import { inscriptionRepository } from '../repositories/inscription.repository';
import { StatutInscription } from '../entities/enums';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/AppError';
import { notificationService } from './notification.service';
import { logger } from '../config/logger';

export interface Eligibilite {
  eligible: boolean;
  raison?: string;
  tauxPresence: number;
  moyenne: number;
}

export class AttestationService {
  /** Numéro unique : ODC-ATT-YYYY-NNNNNN */
  private static async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await attestationRepository.count();
    return `ODC-ATT-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  /** Hash de vérification */
  private static generateHash(sessionId: string, participantId: string): string {
    return crypto
      .createHash('sha256')
      .update(`${sessionId}:${participantId}:${Date.now()}`)
      .digest('hex');
  }

  /** Vérifie l'éligibilité d'un participant à une attestation */
  static async verifierEligibilite(sessionId: string, participantId: string): Promise<Eligibilite> {
    const inscription = await inscriptionRepository.findBySessionAndParticipant(sessionId, participantId);
    if (!inscription || inscription.statut !== StatutInscription.ACCEPTEE) {
      return { eligible: false, raison: 'Participant non accepté dans la session', tauxPresence: 0, moyenne: 0 };
    }

    const tauxPresence = await presenceRepository.tauxPresence(sessionId, participantId);
    const notes = await noteRepository.findBySessionAndParticipant(sessionId, participantId);
    const moyenne = notes.length
      ? Math.round((notes.reduce((s, n) => s + Number(n.note), 0) / notes.length) * 100) / 100
      : 0;

    const SEUIL_PRESENCE = 75;
    const SEUIL_NOTE = 10;

    if (tauxPresence < SEUIL_PRESENCE) {
      return { eligible: false, raison: `Taux de présence insuffisant (${tauxPresence}% < ${SEUIL_PRESENCE}%)`, tauxPresence, moyenne };
    }
    if (notes.length > 0 && moyenne < SEUIL_NOTE) {
      return { eligible: false, raison: `Moyenne insuffisante (${moyenne} < ${SEUIL_NOTE})`, tauxPresence, moyenne };
    }
    return { eligible: true, tauxPresence, moyenne };
  }

  /** Génère une attestation individuelle */
  static async generer(sessionId: string, participantId: string) {
    const existing = await attestationRepository.findBySessionAndParticipant(sessionId, participantId);
    if (existing) throw new ConflictError('Une attestation existe déjà pour ce participant');

    const elig = await this.verifierEligibilite(sessionId, participantId);
    if (!elig.eligible) throw new BadRequestError(elig.raison ?? 'Participant non éligible');

    const numero = await this.generateNumero();
    const hash = this.generateHash(sessionId, participantId);

    const attestation = await attestationRepository.create({
      numero,
      hash,
      sessionId,
      participantId,
      noteFinale: elig.moyenne,
      tauxPresence: elig.tauxPresence,
      dateEmission: new Date(),
      valide: true,
    });

    // TODO: générer PDF + QR + signature numérique
    // const fileUrl = await pdfService.generateAttestation(attestation);
    // attestation.fichierUrl = fileUrl;
    // await attestationRepository.save(attestation);

    await notificationService.create({
      userId: participantId,
      titre: '🎓 Attestation disponible',
      message: `Votre attestation ${numero} est disponible au téléchargement`,
      metadata: { attestationId: attestation.id },
    });

    logger.info(`🎓 Attestation générée : ${numero}`);
    return attestation;
  }

  /** Génération pour toute une session */
  static async genererParSession(sessionId: string) {
    const session = await sessionRepository.findByIdOrFail(sessionId, ['formation']);
    const inscriptions = await inscriptionRepository.findBySession(sessionId);
    const acceptes = inscriptions.filter((i) => i.statut === StatutInscription.ACCEPTEE);

    const result = { total: acceptes.length, generes: 0, ignores: 0, erreurs: [] as Array<{ participantId: string; raison: string }> };

    for (const insc of acceptes) {
      try {
        await this.generer(sessionId, insc.participantId);
        result.generes++;
      } catch (e: any) {
        result.ignores++;
        result.erreurs.push({ participantId: insc.participantId, raison: e.message });
      }
    }

    logger.info(`🎓 Génération session=${session.codeSession} : ${result.generes}/${result.total}`);
    return result;
  }

  /** Vérification publique */
  static async verifierAuthenticite(numero: string) {
    const att = await attestationRepository.findByNumero(numero);
    if (!att) return { valide: false };
    return {
      valide: true,
      attestation: {
        numero: att.numero,
        dateEmission: att.dateEmission,
        participant: `${att.participant.prenom} ${att.participant.nom}`,
        formation: att.session.formation.titre,
        noteFinale: att.noteFinale,
        tauxPresence: att.tauxPresence,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      },
    };
  }

<<<<<<< HEAD
  static async mesAttestations(participantId: string) {
    return this.repo.find({ where: { participantId }, relations: ['session', 'session.formation'], order: { dateEmission: 'DESC' } });
  }

  static async findAll(params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);
    const query = this.repo.createQueryBuilder('a')
      .leftJoinAndSelect('a.participant', 'participant')
      .leftJoinAndSelect('a.session', 'session')
      .leftJoinAndSelect('session.formation', 'formation')
      .orderBy('a.dateEmission', 'DESC')
      .skip(skip)
      .take(limit);

    if (params.search) {
      query.andWhere(
        '(a.numero ILIKE :search OR participant.nom ILIKE :search OR participant.prenom ILIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
=======
  /** Mes attestations (participant) */
  static async mesAttestations(participantId: string) {
    return attestationRepository.findByParticipant(participantId);
  }

  /** Liste admin/staff */
  static async findAll(filters: any) {
    return attestationRepository.search({
      sessionId: filters.sessionId,
      participantId: filters.participantId,
      valide: filters.valide === 'true' ? true : filters.valide === 'false' ? false : undefined,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 10,
    });
  }

  /** Téléchargement (participant) */
  static async telecharger(id: string, userId: string) {
    const att = await attestationRepository.findByIdOrFail(id);
    if (att.participantId !== userId) {
      throw new NotFoundError('Attestation introuvable');
    }
    if (!att.fichierUrl) throw new NotFoundError('Fichier non disponible');

    att.telechargee = true;
    att.dateTelechargement = new Date();
    await attestationRepository.save(att);

    return {
      path: att.fichierUrl,
      nom: `attestation-${att.numero}.pdf`,
    };
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  }
}