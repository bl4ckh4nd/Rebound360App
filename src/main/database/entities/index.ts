/**
 * TypeORM Entity Models for Rebound360App
 * 
 * This file contains all entity definitions based on the existing database schema.
 * The entities are designed to work with TypeORM while maintaining compatibility
 * with the current SQLite database structure.
 */

// Export all entities
export * from './core/SupplierReturn';
export * from './core/ReturnProduct';
export * from './core/ReturnNote';
export * from './core/ReturnDocument';

export * from './workflow/StatusWorkflow';
export * from './workflow/StatusStep';

export * from './settings/AppSetting';
export * from './settings/ReasonCategory';
export * from './settings/ReturnReason';
export * from './settings/CustomField';
export * from './custom-field.entity';

export * from './jtl/Supplier';
export * from './jtl/SupplierOrder';
export * from './jtl/OrderProduct';

export * from './procurement/Requisition';
export * from './procurement/RequisitionItem';
export * from './procurement/RequisitionComment';
export * from './procurement/PurchaseOrder';

export * from './shipping/ShippingLabel';
export * from './shipping/ShippingTracking';

export * from './system/Migration';
export * from './system/SyncStatus';

// Re-export base entities
export * from './base/BaseEntity';
export * from './base/TimestampEntity';