import { AppDataSource } from '../config/database';
import { Presence } from '../models/Presence.entity';
import { Inscription, StatutInscription } from '../models/Inscription.entity';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { QrCodeService } from './qrcode.service';

export class PresenceService {
  private static get repo() { return AppDataSource.getRepository(Presence); }

  static async scannerQr(participantId: string, sessionId: string, qrToken: string) {
    const inscription = await AppDataSource.getRepository(Inscription).findOne({
      where: { sessionId, participantId, statut: StatutInscription.ACCEPTEE },
    });
    if (!inscription) throw new ForbiddenError('Non inscrit ou accepte');
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.repo.createQueryBuilder('p')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('DATE(p.date_presence) = :today', { today })
      .getOne();
    if (existing) throw new ConflictError('Presence deja enregistree');
    const presence = this.repo.create({
      sessionId, participantId, datePresence: new Date(),
      heureScan: new Date().toTimeString().split(' ')[0], present: true, qrToken,
    });
    await this.repo.save(presence);
    return presence;
  }

  static async marquerManuel(sessionId: string, participantId: string, present: boolean, commentaire?: string) {
    const today = new Date().toISOString().split('T')[0];
    let p = await this.repo.createQueryBuilder('p')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('DATE(p.date_presence) = :today', { today })
      .getOne();
    if (!p) p = this.repo.create({ sessionId, participantId, datePresence: new Date(), present, commentaire });
    else { p.present = present; if (commentaire) p.commentaire = commentaire; }
    await this.repo.save(p);
    return p;
  }

  static async findBySession(sessionId: string, params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);
    const [data, total] = await this.repo.findAndCount({
      where: { sessionId }, relations: ['participant'], skip, take: limit,
      order: { datePresence: 'DESC' },
    });
    return { data, total, page, limit };
  }

  static async calculerTauxPresence(sessionId: string, participantId: string): Promise<number> {
    const total = await this.repo.createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'total')
      .where('p.session_id = :sid', { sid: sessionId }).getRawOne();
    const presences = await this.repo.createQueryBuilder('p')
      .select('COUNT(DISTINCT DATE(p.date_presence))', 'count')
      .where('p.session_id = :sid', { sid: sessionId })
      .andWhere('p.participant_id = :pid', { pid: participantId })
      .andWhere('p.present = true').getRawOne();
    if (!total.total || total.total === '0') return 0;
    return (Number(presences.count) / Number(total.total)) * 100;
  }

  static async getStats(sessionId: string) {
    const records = await this.repo.find({ where: { sessionId } });
    const total = records.length;
    const presents = records.filter((presence) => presence.present).length;
    const absents = total - presents;
    const tauxPresence = total ? Math.round((presents / total) * 100) : 0;

    return {
      total,
      presents,
      absents,
      retards: 0,
      excuses: records.filter((presence) => presence.justifiee).length,
      tauxPresence,
      tauxAbsence: total ? 100 - tauxPresence : 0,
    };
  }

  static async generateQr(sessionId: string) {
    return QrCodeService.genererQrSession(sessionId);
  }
}