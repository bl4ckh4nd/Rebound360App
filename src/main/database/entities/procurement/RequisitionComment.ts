import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, Check } from 'typeorm';
import { Requisition } from './Requisition';

export type CommentType = 'comment' | 'approval' | 'rejection' | 'system';

@Entity('requisition_comments')
@Check(`"type" IN ('comment', 'approval', 'rejection', 'system')`)
export class RequisitionComment {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ name: 'requisition_id', type: 'text' })
  requisitionId!: string;

  @ManyToOne(() => Requisition, requisition => requisition.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requisition_id' })
  requisition!: Requisition;

  @Column({ type: 'text' })
  text!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'user_id', type: 'text' })
  userId!: string;

  @Column({ name: 'user_name', type: 'text' })
  userName!: string;

  @Column({ type: 'text' })
  type!: CommentType;

  @Column({ name: 'is_internal', type: 'integer', default: 0 })
  isInternal!: boolean;
}