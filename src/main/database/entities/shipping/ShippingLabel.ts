import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { SupplierReturn } from '../core/SupplierReturn';
import { ShippingTracking } from './ShippingTracking';

@Entity('shipping_labels')
@Index(['returnId'])
@Index(['shipmentNumber'])
@Index(['trackingNumber'])
export class ShippingLabel extends BaseEntity {
  @Column({ name: 'return_id', type: 'integer' })
  returnId!: number;

  @ManyToOne(() => SupplierReturn, supplierReturn => supplierReturn.shippingLabels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_id' })
  return!: SupplierReturn;

  @Column({ name: 'shipment_number', type: 'text', unique: true })
  shipmentNumber!: string;

  @Column({ name: 'tracking_number', type: 'text', nullable: true })
  trackingNumber?: string;

  @Column({ name: 'routing_code', type: 'text', nullable: true })
  routingCode?: string;

  @Column({ name: 'label_data', type: 'text' })
  labelData!: string; // Base64 encoded PDF

  @Column({ name: 'label_filename', type: 'text', nullable: true })
  labelFilename?: string;

  // Shipper information
  @Column({ name: 'shipper_name', type: 'text' })
  shipperName!: string;

  @Column({ name: 'shipper_address', type: 'text' })
  shipperAddress!: string;

  @Column({ name: 'shipper_city', type: 'text' })
  shipperCity!: string;

  @Column({ name: 'shipper_postal_code', type: 'text' })
  shipperPostalCode!: string;

  @Column({ name: 'shipper_country', type: 'text' })
  shipperCountry!: string;

  @Column({ name: 'shipper_phone', type: 'text', nullable: true })
  shipperPhone?: string;

  @Column({ name: 'shipper_email', type: 'text', nullable: true })
  shipperEmail?: string;

  // Consignee information
  @Column({ name: 'consignee_name', type: 'text' })
  consigneeName!: string;

  @Column({ name: 'consignee_address', type: 'text' })
  consigneeAddress!: string;

  @Column({ name: 'consignee_city', type: 'text' })
  consigneeCity!: string;

  @Column({ name: 'consignee_postal_code', type: 'text' })
  consigneePostalCode!: string;

  @Column({ name: 'consignee_country', type: 'text' })
  consigneeCountry!: string;

  @Column({ name: 'consignee_phone', type: 'text', nullable: true })
  consigneePhone?: string;

  @Column({ name: 'consignee_email', type: 'text', nullable: true })
  consigneeEmail?: string;

  // Package details
  @Column({ name: 'service_type', type: 'text', default: 'V01PAK' })
  serviceType!: string;

  @Column({ type: 'real' })
  weight!: number;

  @Column({ type: 'real', nullable: true })
  length?: number;

  @Column({ type: 'real', nullable: true })
  width?: number;

  @Column({ type: 'real', nullable: true })
  height?: number;

  @Column({ type: 'text', default: 'created' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => ShippingTracking, tracking => tracking.shippingLabel)
  trackingEvents!: ShippingTracking[];
}