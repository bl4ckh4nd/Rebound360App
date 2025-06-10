import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, Check } from 'typeorm';
import { TimestampEntity } from '../base/TimestampEntity';
import { Requisition, Priority, ProcurementType } from './Requisition';
import { RequisitionItem } from './RequisitionItem';

export type POStatus = 'draft' | 'sent' | 'acknowledged' | 'partially_received' | 'completed' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressLine2?: string;
}

@Entity('purchase_orders')
@Check(`"priority" IN ('low', 'normal', 'high')`)
@Check(`"status" IN ('draft', 'sent', 'acknowledged', 'partially_received', 'completed', 'cancelled')`)
@Check(`"procurement_type" IN ('material', 'service', 'asset')`)
export class PurchaseOrder extends TimestampEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ name: 'requisition_id', type: 'text', nullable: true })
  requisitionId?: string;

  @OneToOne(() => Requisition, requisition => requisition.purchaseOrder, { nullable: true })
  @JoinColumn({ name: 'requisition_id' })
  requisition?: Requisition;

  @Column({ name: 'order_number', type: 'text', unique: true })
  orderNumber!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'requester_id', type: 'text' })
  requesterId!: string;

  @Column({ name: 'requester_name', type: 'text' })
  requesterName!: string;

  @Column({ type: 'text' })
  department!: string;

  @Column({ type: 'text' })
  priority!: Priority;

  @Column({ type: 'text' })
  status!: POStatus;

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

  @Column({ name: 'supplier_reference', type: 'text', nullable: true })
  supplierReference?: string;

  @Column({ name: 'payment_terms', type: 'text', nullable: true })
  paymentTerms?: string;

  @Column({ name: 'expected_delivery_date', type: 'text', nullable: true })
  expectedDeliveryDate?: string;

  @Column({ 
    name: 'billing_address', 
    type: 'text',
    transformer: {
      to: (value: Address) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value)
    }
  })
  billingAddress!: Address;

  @Column({ 
    name: 'shipping_address', 
    type: 'text',
    transformer: {
      to: (value: Address) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value)
    }
  })
  shippingAddress!: Address;

  @Column({ name: 'total_amount', type: 'real' })
  totalAmount!: number;

  @Column({ type: 'text' })
  currency!: string;

  @Column({ 
    type: 'text', 
    default: '[]',
    transformer: {
      to: (value: RequisitionItem[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value)
    }
  })
  items!: RequisitionItem[];
}