import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CustomFieldType } from './types';

@Entity('custom_fields')
export class CustomFieldEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  label: string;

  @Column()
  type: CustomFieldType;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  required: boolean;

  @Column({ nullable: true })
  defaultValue?: string;

  @Column('json', { nullable: true })
  options?: string[];

  @Column({ nullable: true })
  placeholder?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}