import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, Index, Check } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { TimestampEntity } from '../base/TimestampEntity';
import { SupplierOrder } from '../jtl/SupplierOrder';
import { StatusWorkflow } from '../workflow/StatusWorkflow';
import { ReturnProduct } from './ReturnProduct';
import { ReturnNote } from './ReturnNote';
import { ReturnDocument } from './ReturnDocument';
import { ShippingLabel } from '../shipping/ShippingLabel';

export type FollowUpAction = 'gutschrift' | 'ersatz' | 'reparatur' | 'ausschuss';
export type CreditNoteStatus = 'erstellt' | 'abgestimmt';

@Entity('supplier_returns')
@Check(`"followUpAction" IN ('gutschrift', 'ersatz', 'reparatur', 'ausschuss')`)
@Check(`"creditNoteStatus" IN ('erstellt', 'abgestimmt')`)
export class SupplierReturn extends BaseEntity {
  @Column({ name: 'orderNumber', type: 'text', nullable: true })
  orderNumber?: string;

  @Column({ type: 'text' })
  status!: string;

  @Column({ name: 'followUpAction', type: 'text' })
  followUpAction!: FollowUpAction;

  @Column({ name: 'workflow_id', type: 'text', nullable: true })
  workflowId?: string;

  @ManyToOne(() => StatusWorkflow, { nullable: true })
  @JoinColumn({ name: 'workflow_id' })
  workflow?: StatusWorkflow;

  @Column({ name: 'supplierReference', type: 'text', nullable: true })
  supplierReference?: string;

  @Column({ name: 'commissioningDate', type: 'text', nullable: true })
  commissioningDate?: string;

  @Column({ name: 'shippingDate', type: 'text', nullable: true })
  shippingDate?: string;

  @Column({ name: 'creditNoteNumber', type: 'text', nullable: true })
  creditNoteNumber?: string;

  @Column({ name: 'creditAmount', type: 'real', nullable: true })
  creditAmount?: number;

  @Column({ name: 'originalInvoiceNumber', type: 'text', nullable: true })
  originalInvoiceNumber?: string;

  @Column({ name: 'creditDate', type: 'text', nullable: true })
  creditDate?: string;

  @Column({ name: 'creditNoteStatus', type: 'text', nullable: true })
  creditNoteStatus?: CreditNoteStatus;

  @Column({ name: 'reconciliationDate', type: 'text', nullable: true })
  reconciliationDate?: string;

  @Column({ name: 'reconciliationInvoiceNumber', type: 'text', nullable: true })
  reconciliationInvoiceNumber?: string;

  @Column({ name: 'orderId', type: 'integer', nullable: true })
  orderId?: number;

  @ManyToOne(() => SupplierOrder, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order?: SupplierOrder;

  @Column({ name: 'creditorNumber', type: 'text', nullable: true })
  creditorNumber?: string;

  @Column({ name: 'customFields', type: 'text', nullable: true, transformer: {
    to: (value: Record<string, any>) => value ? JSON.stringify(value) : null,
    from: (value: string) => value ? JSON.parse(value) : {}
  }})
  customFields?: Record<string, any>;

  @Column({ name: 'createdAt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updatedAt', type: 'datetime', nullable: true })
  updatedAt?: Date;

  // Relations
  @OneToMany(() => ReturnProduct, product => product.return, { cascade: true })
  products!: ReturnProduct[];

  @OneToMany(() => ReturnNote, note => note.return, { cascade: true })
  notes!: ReturnNote[];

  @OneToMany(() => ReturnDocument, document => document.return, { cascade: true })
  documents!: ReturnDocument[];

  @OneToMany(() => ShippingLabel, label => label.return)
  shippingLabels!: ShippingLabel[];
}