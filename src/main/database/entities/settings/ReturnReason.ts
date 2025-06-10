import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TimestampEntity } from '../base/TimestampEntity';
import { ReasonCategory } from './ReasonCategory';
import { FollowUpAction } from '../core/SupplierReturn';

@Entity('return_reasons')
export class ReturnReason extends TimestampEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'category_id', type: 'text' })
  categoryId!: string;

  @ManyToOne(() => ReasonCategory, category => category.reasons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: ReasonCategory;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ 
    name: 'applicable_actions', 
    type: 'text', 
    nullable: true,
    transformer: {
      to: (value: FollowUpAction[]) => value ? JSON.stringify(value) : null,
      from: (value: string) => value ? JSON.parse(value) : []
    }
  })
  applicableActions?: FollowUpAction[];
}