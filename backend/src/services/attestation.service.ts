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
      },
    };
  }

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
  }
}