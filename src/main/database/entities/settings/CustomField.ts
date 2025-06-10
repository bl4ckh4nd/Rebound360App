import { Entity, Column, PrimaryColumn } from 'typeorm';
import { TimestampEntity } from '../base/TimestampEntity';

export type CustomFieldType = 'text' | 'number' | 'date' | 'money' | 'email' | 'phone' | 'select';
export type EntityType = 'return' | 'requisition' | 'purchase_order' | 'supplier';

@Entity('custom_fields')
export class CustomField extends TimestampEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text', unique: true })
  key!: string;

  @Column({ type: 'text' })
  label!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text' })
  type!: CustomFieldType;

  @Column({ type: 'integer', default: 0 })
  required!: boolean;

  @Column({ name: 'default_value', type: 'text', nullable: true })
  defaultValue?: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    transformer: {
      to: (value: string[]) => value ? JSON.stringify(value) : null,
      from: (value: string) => value ? JSON.parse(value) : null
    }
  })
  options?: string[];

  @Column({ name: 'entity_type', type: 'text', default: 'return' })
  entityType!: EntityType;
}