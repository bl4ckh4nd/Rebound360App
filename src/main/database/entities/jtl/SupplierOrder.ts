import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, Index, Check } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { Supplier } from './Supplier';
import { OrderProduct } from './OrderProduct';
import { SupplierReturn } from '../core/SupplierReturn';

export type OrderStatus = 'bestellt' | 'geliefert' | 'teilgeliefert' | 'storniert';

@Entity('supplier_orders')
@Check(`"status" IN ('bestellt', 'geliefert', 'teilgeliefert', 'storniert')`)
export class SupplierOrder extends BaseEntity {
  @Column({ name: 'orderNumber', type: 'text' })
  orderNumber!: string;

  @Column({ name: 'supplierReference', type: 'text', nullable: true })
  supplierReference?: string;

  @Column({ name: 'orderDate', type: 'text' })
  orderDate!: string;

  @Column({ name: 'deliveryDate', type: 'text', nullable: true })
  deliveryDate?: string;

  @Column({ name: 'supplierName', type: 'text' })
  supplierName!: string;

  @Column({ type: 'text' })
  status!: OrderStatus;

  @Column({ name: 'createdAt', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ name: 'updatedAt', type: 'datetime', nullable: true })
  updatedAt?: Date;

  @Column({ name: 'jtl_id', type: 'integer', nullable: true, unique: true })
  @Index()
  jtlId?: number;

  @Column({ name: 'jtl_supplier_id', type: 'integer', nullable: true })
  jtlSupplierId?: number;

  @ManyToOne(() => Supplier, supplier => supplier.orders, { nullable: true })
  @JoinColumn({ name: 'jtl_supplier_id', referencedColumnName: 'jtlId' })
  supplier?: Supplier;

  @Column({ name: 'last_synced', type: 'datetime', nullable: true })
  lastSynced?: Date;

  // Relations
  @OneToMany(() => OrderProduct, product => product.order, { cascade: true })
  products!: OrderProduct[];

  @OneToMany(() => SupplierReturn, supplierReturn => supplierReturn.order)
  returns!: SupplierReturn[];
}