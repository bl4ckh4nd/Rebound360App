import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';
import { ShippingLabel } from './ShippingLabel';

@Entity('shipping_tracking')
@Index(['shippingLabelId'])
@Index(['trackingNumber'])
export class ShippingTracking extends BaseEntity {
  @Column({ name: 'shipping_label_id', type: 'integer' })
  shippingLabelId!: number;

  @ManyToOne(() => ShippingLabel, label => label.trackingEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipping_label_id' })
  shippingLabel!: ShippingLabel;

  @Column({ name: 'tracking_number', type: 'text' })
  trackingNumber!: string;

  @Column({ type: 'text' })
  status!: string;

  @Column({ name: 'status_description', type: 'text', nullable: true })
  statusDescription?: string;

  @Column({ type: 'text', nullable: true })
  location?: string;

  @Column({ type: 'datetime' })
  timestamp!: Date;

  @Column({ 
    name: 'event_details', 
    type: 'text', 
    nullable: true,
    transformer: {
      to: (value: any) => value ? JSON.stringify(value) : null,
      from: (value: string) => value ? JSON.parse(value) : null
    }
  })
  eventDetails?: any;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;
}