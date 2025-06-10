import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { SupplierReturn } from './SupplierReturn';

@Entity('return_products')
export class ReturnProduct extends BaseEntity {
  @Column({ name: 'returnId', type: 'integer' })
  returnId!: number;

  @ManyToOne(() => SupplierReturn, supplierReturn => supplierReturn.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'returnId' })
  return!: SupplierReturn;

  @Column({ name: 'productName', type: 'text' })
  productName!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'serialNumber', type: 'text', nullable: true })
  serialNumber?: string;
}