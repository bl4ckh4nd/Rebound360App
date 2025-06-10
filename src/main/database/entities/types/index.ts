/**
 * TypeScript type definitions and enums for TypeORM entities
 * These types ensure consistency between entity definitions and application code
 */

// Core types
export type FollowUpAction = 'gutschrift' | 'ersatz' | 'reparatur' | 'ausschuss' | 'procurement';
export type CreditNoteStatus = 'erstellt' | 'abgestimmt';
export type OrderStatus = 'bestellt' | 'geliefert' | 'teilgeliefert' | 'storniert';

// Workflow types
export type WorkflowType = 'return' | 'procurement';

// Custom field types
export type CustomFieldType = 'text' | 'number' | 'date' | 'money' | 'email' | 'phone' | 'select' | 'boolean' | 'textarea';
export type EntityType = 'return' | 'requisition' | 'purchase_order' | 'supplier';

// Procurement types
export type RequisitionStatus = 
  | 'draft'
  | 'submitted' 
  | 'manager_approval' 
  | 'finance_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'converted';

export type Priority = 'low' | 'normal' | 'high';
export type ProcurementType = 'material' | 'service' | 'asset';
export type CommentType = 'comment' | 'approval' | 'rejection' | 'system';
export type POStatus = 'draft' | 'sent' | 'acknowledged' | 'partially_received' | 'completed' | 'cancelled';

// Address interface
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressLine2?: string;
}

// JSON transformer utilities
export const JsonTransformer = {
  to: (value: any) => value ? JSON.stringify(value) : null,
  from: (value: string) => value ? JSON.parse(value) : null
};

export const ArrayTransformer = {
  to: (value: any[]) => value ? JSON.stringify(value) : null,
  from: (value: string) => value ? JSON.parse(value) : []
};

export const ObjectTransformer = {
  to: (value: Record<string, any>) => value ? JSON.stringify(value) : null,
  from: (value: string) => value ? JSON.parse(value) : {}
};