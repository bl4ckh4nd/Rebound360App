import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TimestampEntity } from '../base/TimestampEntity';
import { StatusWorkflow } from './StatusWorkflow';

@Entity('status_steps')
export class StatusStep extends TimestampEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ name: 'workflow_id', type: 'text' })
  workflowId!: string;

  @ManyToOne(() => StatusWorkflow, workflow => workflow.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow!: StatusWorkflow;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text' })
  color!: string;

  @Column({ name: 'order_index', type: 'integer' })
  orderIndex!: number;

  @Column({ 
    name: 'required_fields', 
    type: 'text', 
    nullable: true,
    transformer: {
      to: (value: string[]) => value ? JSON.stringify(value) : null,
      from: (value: string) => value ? JSON.parse(value) : []
    }
  })
  requiredFields?: string[];
}