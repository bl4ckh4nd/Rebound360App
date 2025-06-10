import { Repository, EntityTarget, FindManyOptions, FindOneOptions, DeepPartial, ObjectLiteral } from 'typeorm';
import Database from 'better-sqlite3';
import { getDataSource } from '../typeorm-config';
import db from '../db';

/**
 * Base repository class that implements the hybrid approach:
 * - TypeORM for standard CRUD operations
 * - better-sqlite3 for complex queries and performance-critical operations
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected typeormRepo: Repository<T>;
  protected sqlite: Database.Database;
  protected entityName: string;

  constructor(entity: EntityTarget<T>) {
    this.typeormRepo = getDataSource().getRepository(entity);
    this.sqlite = db;
    this.entityName = this.typeormRepo.metadata.tableName;
  }

  // ===== TypeORM Methods =====
  
  /**
   * Find all entities with optional relations
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.typeormRepo.find(options);
  }

  /**
   * Find one entity by options
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.typeormRepo.findOne(options);
  }

  /**
   * Find entity by ID
   */
  async findById(id: number | string, relations?: string[]): Promise<T | null> {
    return this.typeormRepo.findOne({
      where: { id } as any,
      relations
    });
  }

  /**
   * Save entity (create or update)
   */
  async save(entity: DeepPartial<T>): Promise<T> {
    return this.typeormRepo.save(entity as any);
  }

  /**
   * Create entity instance (without saving)
   */
  create(data: DeepPartial<T>): T {
    return this.typeormRepo.create(data);
  }

  /**
   * Update entity by ID
   */
  async update(id: number | string, data: DeepPartial<T>): Promise<void> {
    await this.typeormRepo.update(id, data as any);
  }

  /**
   * Delete entity by ID
   */
  async delete(id: number | string): Promise<void> {
    await this.typeormRepo.delete(id);
  }

  /**
   * Count entities
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.typeormRepo.count(options);
  }

  // ===== better-sqlite3 Methods for Complex Queries =====
  
  /**
   * Execute raw SQL query with better-sqlite3
   * Use this for complex queries that TypeORM can't handle efficiently
   */
  protected executeRawQuery<R = any>(sql: string, params: any[] = []): R[] {
    const stmt = this.sqlite.prepare(sql);
    return stmt.all(...params) as R[];
  }

  /**
   * Execute raw SQL query and get single result
   */
  protected executeRawQuerySingle<R = any>(sql: string, params: any[] = []): R | undefined {
    const stmt = this.sqlite.prepare(sql);
    return stmt.get(...params) as R | undefined;
  }

  /**
   * Execute raw SQL command (INSERT, UPDATE, DELETE)
   */
  protected executeRawCommand(sql: string, params: any[] = []): Database.RunResult {
    const stmt = this.sqlite.prepare(sql);
    return stmt.run(...params);
  }

  /**
   * Execute transaction with better-sqlite3
   * Use this for complex transactions that need to be atomic
   */
  protected executeTransaction<R>(fn: () => R): R {
    const transaction = this.sqlite.transaction(fn);
    return transaction();
  }

  // ===== Utility Methods =====

  /**
   * Parse JSON field safely
   */
  protected parseJson<T>(value: string | null, defaultValue: T): T {
    if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Stringify JSON field safely
   */
  protected stringifyJson(value: any): string | null {
    if (value === null || value === undefined) return null;
    return JSON.stringify(value);
  }
}