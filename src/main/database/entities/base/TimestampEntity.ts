import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Base entity with automatic timestamp fields
 */
export abstract class TimestampEntity {
  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date;
}