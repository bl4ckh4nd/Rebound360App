import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { SupplierOrder } from './SupplierOrder';

@Entity('order_products')
export class OrderProduct extends BaseEntity {
  @Column({ name: 'orderId', type: 'integer' })
  orderId!: number;

  @ManyToOne(() => SupplierOrder, order => order.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: SupplierOrder;

  @Column({ name: 'productName', type: 'text' })
  productName!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'real' })
  price!: number;

  @Column({ type: 'text', nullable: true })
  sku?: string;

  @Column({ name: 'serialNumber', type: 'text', nullable: true })
  serialNumber?: string;

  @Column({ name: 'jtl_id', type: 'integer', nullable: true, unique: true })
  @Index()
  jtlId?: number;

  @Column({ name: 'jtl_article_id', type: 'integer', nullable: true })
  jtlArticleId?: number;

  @Column({ name: 'last_synced', type: 'datetime', nullable: true })
  lastSynced?: Date;
}