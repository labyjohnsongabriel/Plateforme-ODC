// src/repositories/BaseRepository.ts
import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  DeepPartial,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';
import { AppDataSource } from '../config/database';
import { NotFoundError } from '../errors/AppError';
import { BaseEntity } from '../entities/BaseEntity';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Repository générique réutilisable pour toutes les entités.
 * Fournit les opérations CRUD + pagination + soft delete.
 */
export abstract class BaseRepository<T extends BaseEntity & ObjectLiteral> {
  protected repo: Repository<T>;

  constructor(entity: new () => T) {
    this.repo = AppDataSource.getRepository(entity);
  }

  // ============================================================
  // LECTURE
  // ============================================================
  async findById(id: string, relations: string[] = []): Promise<T | null> {
    return this.repo.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });
  }

  async findByIdOrFail(id: string, relations: string[] = []): Promise<T> {
    const entity = await this.findById(id, relations);
    if (!entity) throw new NotFoundError('Ressource introuvable');
    return entity;
  }

  async findOne(where: FindOptionsWhere<T>, relations: string[] = []): Promise<T | null> {
    return this.repo.findOne({ where, relations });
  }

  async findMany(options: FindManyOptions<T> = {}): Promise<T[]> {
    return this.repo.find(options);
  }

  async count(where: FindOptionsWhere<T> = {}): Promise<number> {
    return this.repo.count({ where });
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    return this.repo.exists({ where });
  }

  // ============================================================
  // PAGINATION
  // ============================================================
  async paginate(
    options: FindManyOptions<T> & PaginationOptions = {},
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ============================================================
  // ÉCRITURE
  // ============================================================
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findByIdOrFail(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  async save(entity: T): Promise<T> {
    return this.repo.save(entity);
  }

  async saveMany(entities: T[]): Promise<T[]> {
    return this.repo.save(entities);
  }

  // ============================================================
  // SUPPRESSION
  // ============================================================
  async softDelete(id: string): Promise<void> {
    const result = await this.repo.softDelete(id);
    if (!result.affected) throw new NotFoundError('Ressource introuvable');
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundError('Ressource introuvable');
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
  }

  // ============================================================
  // QUERY BUILDER HELPER
  // ============================================================
  protected qb(alias: string): SelectQueryBuilder<T> {
    return this.repo.createQueryBuilder(alias);
  }

  /** Expose le repo TypeORM sous-jacent si nécessaire */
  get raw(): Repository<T> {
    return this.repo;
  }
}