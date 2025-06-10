import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';

@Entity('sync_status')
export class SyncStatus extends BaseEntity {
  @Column({ name: 'entity_type', type: 'text', unique: true })
  entityType!: string;

  @Column({ name: 'last_successful_sync', type: 'datetime', nullable: true })
  lastSuccessfulSync?: Date;

  @Column({ name: 'records_synced', type: 'integer', default: 0 })
  recordsSynced!: number;

  @Column({ type: 'text', nullable: true })
  status?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @UpdateDateColumn({ name: 'last_attempt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  lastAttempt!: Date;
}