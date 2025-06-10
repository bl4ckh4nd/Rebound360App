import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { TimestampEntity } from '../base/TimestampEntity';
import { ReturnReason } from './ReturnReason';

@Entity('reason_categories')
export class ReasonCategory extends TimestampEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'order_index', type: 'integer' })
  orderIndex!: number;

  // Relations
  @OneToMany(() => ReturnReason, reason => reason.category)
  reasons!: ReturnReason[];
}