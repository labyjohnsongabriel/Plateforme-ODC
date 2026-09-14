import {
  Repository,
  ObjectLiteral,
  FindOptionsWhere,
  FindManyOptions,
  DeepPartial,
} from 'typeorm';
import { AppDataSource } from '../config/database';
import { PAGINATION } from '../config/constants.config';

/**
 * Repository générique avec opérations CRUD communes
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(entity: new () => T) {
    this.repository = AppDataSource.getRepository(entity);
  }

  /**
   * Crée une entité
   */
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  /**
   * Crée plusieurs entités
   */
  async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data);
    return this.repository.save(entities);
  }

  /**
   * Trouve par ID
   */
  async findById(id: string, relations: string[] = []): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });
  }

  /**
   * Trouve un par critères
   */
  async findOne(
    where: FindOptionsWhere<T>,
    relations: string[] = []
  ): Promise<T | null> {
    return this.repository.findOne({ where, relations });
  }

  /**
   * Trouve tous
   */
  async findAll(
    options: FindManyOptions<T> = {}
  ): Promise<T[]> {
    return this.repository.find(options);
  }

  /**
   * Trouve avec pagination
   */
  async findPaginated(
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    options: FindManyOptions<T> = {}
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const p = Math.max(1, page);
    const l = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, limit));

    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip: (p - 1) * l,
      take: l,
    });

    return { data, total, page: p, limit: l };
  }

  /**
   * Compte
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Existe
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * Met à jour
   */
  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findById(id);
    if (!entity) return null;
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  /**
   * Supprime (soft delete si activé)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Supprime définitivement
   */
  async hardDelete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Restaure
   */
  async restore(id: string): Promise<boolean> {
    const result = await this.repository.restore(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * QueryBuilder
   */
  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}