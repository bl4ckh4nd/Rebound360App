import { PrimaryGeneratedColumn } from 'typeorm';

/**
 * Base entity for numeric primary keys
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
}