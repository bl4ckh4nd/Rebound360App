import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';

@Entity('migrations')
export class Migration extends BaseEntity {
  @Column({ type: 'text', unique: true })
  name!: string;

  @CreateDateColumn({ name: 'applied_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt!: Date;
}