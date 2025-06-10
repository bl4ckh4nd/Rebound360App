import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { SupplierOrder } from './SupplierOrder';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column({ name: 'jtl_id', type: 'integer', nullable: true, unique: true })
  @Index()
  jtlId?: number;

  @Column({ name: 'supplier_number', type: 'text', nullable: true })
  supplierNumber?: string;

  @Column({ name: 'company_name', type: 'text', nullable: true })
  companyName?: string;

  @Column({ name: 'company_addition', type: 'text', nullable: true })
  companyAddition?: string;

  @Column({ type: 'text', nullable: true })
  contact?: string;

  @Column({ type: 'text', nullable: true })
  phone?: string;

  @Column({ name: 'phone_direct', type: 'text', nullable: true })
  phoneDirect?: string;

  @Column({ type: 'text', nullable: true })
  fax?: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  city?: string;

  @Column({ type: 'text', nullable: true })
  country?: string;

  @Column({ name: 'postal_code', type: 'text', nullable: true })
  postalCode?: string;

  @Column({ type: 'text', nullable: true })
  street?: string;

  @Column({ name: 'customer_number', type: 'text', nullable: true })
  customerNumber?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'last_synced', type: 'datetime', nullable: true })
  lastSynced?: Date;

  // Relations
  @OneToMany(() => SupplierOrder, order => order.supplier)
  orders!: SupplierOrder[];
}