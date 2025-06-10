import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { SupplierReturn } from './SupplierReturn';

@Entity('return_documents')
export class ReturnDocument extends BaseEntity {
  @Column({ name: 'returnId', type: 'integer' })
  returnId!: number;

  @ManyToOne(() => SupplierReturn, supplierReturn => supplierReturn.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'returnId' })
  return!: SupplierReturn;

  @Column({ name: 'fileName', type: 'text' })
  fileName!: string;

  @Column({ name: 'fileType', type: 'text' })
  fileType!: string;

  @Column({ name: 'fileSize', type: 'integer' })
  fileSize!: number;

  @Column({ name: 'filePath', type: 'text' })
  filePath!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'thumbnailPath', type: 'text', nullable: true })
  thumbnailPath?: string;

  @CreateDateColumn({ name: 'uploadDate', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  uploadDate!: Date;
}