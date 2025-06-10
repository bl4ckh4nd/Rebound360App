import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { SupplierReturn } from './SupplierReturn';

@Entity('return_notes')
export class ReturnNote extends BaseEntity {
  @Column({ name: 'returnId', type: 'integer' })
  returnId!: number;

  @ManyToOne(() => SupplierReturn, supplierReturn => supplierReturn.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'returnId' })
  return!: SupplierReturn;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'text' })
  author!: string;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}