import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TimestampEntity } from '../base/TimestampEntity';
import { Requisition } from './Requisition';

@Entity('requisition_items')
export class RequisitionItem extends TimestampEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ name: 'requisition_id', type: 'text' })
  requisitionId!: string;

  @ManyToOne(() => Requisition, requisition => requisition.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requisition_id' })
  requisition!: Requisition;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'real' })
  unitPrice!: number;

  @Column({ type: 'text' })
  unit!: string;

  @Column({ name: 'supplier_id', type: 'text', nullable: true })
  supplierId?: string;

  @Column({ name: 'supplier_name', type: 'text', nullable: true })
  supplierName?: string;

  @Column({ name: 'catalog_item_id', type: 'text', nullable: true })
  catalogItemId?: string;

  @Column({ type: 'text', nullable: true })
  sku?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'estimated_delivery', type: 'text', nullable: true })
  estimatedDelivery?: string;
}