import { DataSource, DataSourceOptions } from 'typeorm';
import { app } from 'electron';
import path from 'path';

// Import all entities
import { SupplierReturn } from '../core/SupplierReturn';
import { ReturnProduct } from '../core/ReturnProduct';
import { ReturnNote } from '../core/ReturnNote';
import { ReturnDocument } from '../core/ReturnDocument';
import { StatusWorkflow } from '../workflow/StatusWorkflow';
import { StatusStep } from '../workflow/StatusStep';
import { AppSetting } from '../settings/AppSetting';
import { ReasonCategory } from '../settings/ReasonCategory';
import { ReturnReason } from '../settings/ReturnReason';
import { CustomField } from '../settings/CustomField';
import { Supplier } from '../jtl/Supplier';
import { SupplierOrder } from '../jtl/SupplierOrder';
import { OrderProduct } from '../jtl/OrderProduct';
import { Requisition } from '../procurement/Requisition';
import { RequisitionItem } from '../procurement/RequisitionItem';
import { RequisitionComment } from '../procurement/RequisitionComment';
import { PurchaseOrder } from '../procurement/PurchaseOrder';
import { ShippingLabel } from '../shipping/ShippingLabel';
import { ShippingTracking } from '../shipping/ShippingTracking';
import { Migration } from '../system/Migration';
import { SyncStatus } from '../system/SyncStatus';

// Entity list
export const entities = [
  // Core entities
  SupplierReturn,
  ReturnProduct,
  ReturnNote,
  ReturnDocument,
  
  // Workflow entities
  StatusWorkflow,
  StatusStep,
  
  // Settings entities
  AppSetting,
  ReasonCategory,
  ReturnReason,
  CustomField,
  
  // JTL sync entities
  Supplier,
  SupplierOrder,
  OrderProduct,
  
  // Procurement entities
  Requisition,
  RequisitionItem,
  RequisitionComment,
  PurchaseOrder,
  
  // Shipping entities
  ShippingLabel,
  ShippingTracking,
  
  // System entities
  Migration,
  SyncStatus
];

// TypeORM configuration for SQLite
export const getDatabaseConfig = (): DataSourceOptions => ({
  type: 'better-sqlite3',
  database: 'supplier_returns.db',
  entities,
  synchronize: false, // Don't auto-sync in production
  logging: process.env.NODE_ENV === 'development',
  migrations: [path.join(__dirname, '../migrations/*.{js,ts}')],
  migrationsTableName: 'typeorm_migrations',
});

// Create data source instance
export const AppDataSource = new DataSource(getDatabaseConfig());

// Initialize TypeORM
export async function initializeTypeORM(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('TypeORM initialized successfully');
  }
  return AppDataSource;
}

// Close TypeORM connection
export async function closeTypeORM(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('TypeORM connection closed');
  }
}