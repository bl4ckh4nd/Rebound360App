import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { TimestampEntity } from '../base/TimestampEntity';
import { StatusStep } from './StatusStep';
import { SupplierReturn } from '../core/SupplierReturn';

export type WorkflowType = 'return' | 'procurement';

@Entity('status_workflows')
export class StatusWorkflow extends TimestampEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'follow_up_action', type: 'text' })
  followUpAction!: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ name: 'workflow_type', type: 'text', default: 'return' })
  workflowType!: WorkflowType;

  // Relations
  @OneToMany(() => StatusStep, step => step.workflow, { cascade: true })
  steps!: StatusStep[];

  @OneToMany(() => SupplierReturn, supplierReturn => supplierReturn.workflow)
  returns!: SupplierReturn[];
}