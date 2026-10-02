import { AppDataSource } from '../config/database';
import { DeepPartial, ILike } from 'typeorm';
import { Formation } from '../models/Formation.entity';
import { Session, StatutSession } from '../models/Session.entity';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { getPagination } from '../utils/pagination.util';
import { MESSAGES } from '../constants/messages';
import { logger } from '../config/logger';

export class FormationService {
  private static get repo() {
    return AppDataSource.getRepository(Formation);
  }

  static async create(data: DeepPartial<Formation>) {
    //verifier une métier
     if (!data.titre || data.titre.trim().length < 3) {
    throw new Error('Le titre doit contenir au moins 3 caractères');
     }
     if (data.dureeHeures !== undefined && data.dureeHeures <= 0) {
    throw new Error('La durée doit être supérieure à 0');
  }

  if (data.nbParticipantsMax !== undefined && data.nbParticipantsMax < 0) {
    throw new Error('Le nombre de participants ne peut pas être négatif');
  }
          
  const existing = await this.repo.findOne({ 
    where: { titre: data.titre, deletedAt: null as any },
   });
    if (existing) throw new ConflictError('Formation deja existante');

    // Créer la formation
    const formation = this.repo.create(data);
    await this.repo.save(formation);
    logger.info(`Formation creee : ${formation.titre}`);
    return formation;
  }

  static async findAll(params: any) {
    const { page, limit, skip } = getPagination(params.page, params.limit);

    const where: any = {
      ...(params.actif !== undefined ? { actif: params.actif } : {}),
      ...(params.domaine ? { domaine: ILike(`%${params.domaine}%`) } : {}),
      ...(params.niveau ? { niveau: params.niveau } : {}),
    };

    const filters = params.search
      ? [
        { ...where, titre: ILike(`%${params.search}%`) },
        { ...where, description: ILike(`%${params.search}%`) },
      ]
      : where;

    const [data, total] = await this.repo.findAndCount({
      where: filters,
      relations: { sessions: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  static async findById(id: string) {
    const formation = await this.repo.findOne({
      where: { id },
      relations: ['sessions', 'sessions.formateur'],
    });
    if (!formation) throw new NotFoundError(MESSAGES.FORMATION.NOT_FOUND);
    return formation;
  }

  static async update(id: string, data: any) {
    const formation = await this.findById(id);
    // Whitelist : on ne modifie QUE ces champs
  const allowedFields = [
    'titre', 'description', 'domaine', 'dureeHeures', 'niveau',
    'prerequis', 'objectifs', 'programme', 'imageUrl',
    'actif', 'nbParticipantsMax', 'domaineRelation',
  ];

   for (const field of allowedFields) {
    if (data[field] !== undefined) {
      (formation as any)[field] = data[field];
    }
  }
  
  await this.repo.save(formation);
  logger.info(`Formation mise à jour : ${formation.titre}`);
  return formation;
}

  static async delete(id: string) {
    await this.findById(id);
    await this.repo.softDelete({ id });
    logger.info(`Formation supprumée : ${id}`);
    return{message:'Formation supprimee avec succ'}
  }

  static async getTop(limit = 5) {
    return this.repo.createQueryBuilder('f')
      .innerJoin('f.sessions', 's')
      .innerJoin('s.inscriptions', 'i')
      .select('f.titre', 'titre')
      .addSelect('COUNT(i.id)', 'inscriptions')
      .where('i.statut = :statut', { statut: 'ACCEPTEE' })
      .andWhere('f.actif = true', { actif: true })
      .andWhere('f.deleted at IS NULL')
      .groupBy('f.id')
      .addGroupBy('f.titre')
      .orderBy('inscriptions', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  static async countByDomaine() {
    return this.repo.createQueryBuilder('f')
      .select('f.domaine', 'domaine')
      .addSelect('COUNT(f.id)', 'count')
      .where('f.actif = true')
      .groupBy('f.domaine')
      .getRawMany();
  }
}