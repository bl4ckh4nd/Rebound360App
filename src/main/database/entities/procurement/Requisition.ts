import { Entity, Column, PrimaryColumn, OneToMany, OneToOne, Check } from 'typeorm';
import { TimestampEntity } from '../base/TimestampEntity';
import { RequisitionItem } from './RequisitionItem';
import { RequisitionComment } from './RequisitionComment';
import { PurchaseOrder } from './PurchaseOrder';

export type RequisitionStatus = 'draft' | 'submitted' | 'manager_approval' | 'finance_approval' | 'approved' | 'rejected' | 'cancelled' | 'converted';
export type Priority = 'low' | 'normal' | 'high';
export type ProcurementType = 'material' | 'service' | 'asset';

@Entity('requisitions')
@Check(`"priority" IN ('low', 'normal', 'high')`)
@Check(`"status" IN ('draft', 'submitted', 'manager_approval', 'finance_approval', 'approved', 'rejected', 'cancelled', 'converted')`)
@Check(`"procurement_type" IN ('material', 'service', 'asset')`)
export class Requisition extends TimestampEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'requester_id', type: 'text' })
  requesterId!: string;

  @Column({ name: 'requester_name', type: 'text' })
  requesterName!: string;

  @Column({ name: 'requester_email', type: 'text' })
  requesterEmail!: string;

  @Column({ type: 'text' })
  department!: string;

  @Column({ type: 'text' })
  priority!: Priority;

  @Column({ type: 'text' })
  status!: RequisitionStatus;

  @Column({ name: 'needed_by', type: 'text', nullable: true })
  neededBy?: string;

  @Column({ name: 'budget_code', type: 'text', nullable: true })
  budgetCode?: string;

  @Column({ name: 'total_amount', type: 'real' })
  totalAmount!: number;

  @Column({ type: 'text' })
  currency!: string;

  @Column({ name: 'current_approver', type: 'text', nullable: true })
  currentApprover?: string;

  @Column({ name: 'procurement_type', type: 'text' })
  procurementType!: ProcurementType;

  @Column({ 
    name: 'custom_fields', 
    type: 'text', 
    nullable: true,
    transformer: {
      to: (value: Record<string, any>) => value ? JSON.stringify(value) : null,
      from: (value: string) => value ? JSON.parse(value) : {}
    }
  })
  customFields?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'approver_id', type: 'text', nullable: true })
  approverId?: string;

  @Column({ name: 'approver_name', type: 'text', nullable: true })
  approverName?: string;

  // Relations
  @OneToMany(() => RequisitionItem, item => item.requisition, { cascade: true })
  items!: RequisitionItem[];

  @OneToMany(() => RequisitionComment, comment => comment.requisition, { cascade: true })
  comments!: RequisitionComment[];

  @OneToOne(() => PurchaseOrder, po => po.requisition)
  purchaseOrder?: PurchaseOrder;
}