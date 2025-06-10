import { getDataSource } from '../typeorm-config';
import { Repository } from 'typeorm';

// Import entities
import { SupplierReturn } from '../entities/core/SupplierReturn';
import { ReturnProduct } from '../entities/core/ReturnProduct';
import { ReturnNote } from '../entities/core/ReturnNote';
import { ReturnDocument } from '../entities/core/ReturnDocument';
import { StatusWorkflow } from '../entities/workflow/StatusWorkflow';
import { StatusStep } from '../entities/workflow/StatusStep';
import { AppSetting } from '../entities/settings/AppSetting';
import { ReasonCategory } from '../entities/settings/ReasonCategory';
import { ReturnReason } from '../entities/settings/ReturnReason';
import { CustomField } from '../entities/settings/CustomField';
import { Supplier } from '../entities/jtl/Supplier';
import { SupplierOrder } from '../entities/jtl/SupplierOrder';
import { OrderProduct } from '../entities/jtl/OrderProduct';
import { Requisition } from '../entities/procurement/Requisition';
import { RequisitionItem } from '../entities/procurement/RequisitionItem';
import { RequisitionComment } from '../entities/procurement/RequisitionComment';
import { PurchaseOrder } from '../entities/procurement/PurchaseOrder';
import { ShippingLabel } from '../entities/shipping/ShippingLabel';
import { ShippingTracking } from '../entities/shipping/ShippingTracking';
import { Migration } from '../entities/system/Migration';
import { SyncStatus } from '../entities/system/SyncStatus';

// Import custom repositories
import { SupplierReturnRepository } from './supplier-return-repository';
import { SupplierRepository } from './supplier-repository';
import { OrderRepository } from './order-repository';
import { 
  SettingsRepository, 
  WorkflowRepository, 
  ReasonRepository, 
  CustomFieldRepository as SettingsCustomFieldRepository
} from './settings-repository';
import { CustomFieldRepository } from './custom-field-repository';
import { 
  RequisitionRepository, 
  PurchaseOrderRepository 
} from './procurement-repository';
import { 
  SupplierSyncRepository, 
  OrderSyncRepository, 
  SyncStatusRepository 
} from './jtl-sync-repository';
import { 
  ShippingRepository, 
  ShippingTrackingRepository 
} from './shipping-repository';
import { DocumentRepository } from './document-repository';

// Custom repository factory functions
export function getSupplierReturnRepository(): SupplierReturnRepository {
  return new SupplierReturnRepository();
}

export function getSupplierRepositoryTypeORM(): SupplierRepository {
  return new SupplierRepository();
}

export function getOrderRepositoryTypeORM(): OrderRepository {
  return new OrderRepository();
}

export function getSettingsRepository(): SettingsRepository {
  return new SettingsRepository();
}

export function getWorkflowRepository(): WorkflowRepository {
  return new WorkflowRepository();
}

export function getReasonRepository(): ReasonRepository {
  return new ReasonRepository();
}

// Add category repository for reasons hybrid API
export function getReasonCategoryRepositoryTypeORM(): Repository<ReasonCategory> {
  return getDataSource().getRepository(ReasonCategory);
}

export function getCustomFieldRepository(): CustomFieldRepository {
  return new CustomFieldRepository();
}

export function getRequisitionRepository(): RequisitionRepository {
  return new RequisitionRepository();
}

export function getPurchaseOrderRepository(): PurchaseOrderRepository {
  return new PurchaseOrderRepository();
}

export function getSupplierSyncRepository(): SupplierSyncRepository {
  return new SupplierSyncRepository();
}

export function getOrderSyncRepository(): OrderSyncRepository {
  return new OrderSyncRepository();
}

export function getSyncStatusRepository(): SyncStatusRepository {
  return new SyncStatusRepository();
}

export function getShippingRepository(): ShippingRepository {
  return new ShippingRepository();
}

export function getShippingTrackingRepository(): ShippingTrackingRepository {
  return new ShippingTrackingRepository();
}

export function getDocumentRepository(): DocumentRepository {
  return new DocumentRepository();
}

// Generic repository getters for simple entities
export function getReturnProductRepository(): Repository<ReturnProduct> {
  return getDataSource().getRepository(ReturnProduct);
}

export function getReturnNoteRepository(): Repository<ReturnNote> {
  return getDataSource().getRepository(ReturnNote);
}

export function getReturnDocumentRepository(): Repository<ReturnDocument> {
  return getDataSource().getRepository(ReturnDocument);
}

export function getStatusWorkflowRepository(): Repository<StatusWorkflow> {
  return getDataSource().getRepository(StatusWorkflow);
}

export function getStatusStepRepository(): Repository<StatusStep> {
  return getDataSource().getRepository(StatusStep);
}

export function getAppSettingRepository(): Repository<AppSetting> {
  return getDataSource().getRepository(AppSetting);
}

export function getReasonCategoryRepository(): Repository<ReasonCategory> {
  return getDataSource().getRepository(ReasonCategory);
}

export function getReturnReasonRepository(): Repository<ReturnReason> {
  return getDataSource().getRepository(ReturnReason);
}

// Legacy CustomField repository (from settings)
export function getSettingsCustomFieldRepository(): SettingsCustomFieldRepository {
  return new SettingsCustomFieldRepository();
}

export function getTypeORMCustomFieldRepository(): Repository<CustomField> {
  return getDataSource().getRepository(CustomField);
}

export function getSupplierRepository(): Repository<Supplier> {
  return getDataSource().getRepository(Supplier);
}

export function getSupplierOrderRepository(): Repository<SupplierOrder> {
  return getDataSource().getRepository(SupplierOrder);
}

export function getOrderProductRepository(): Repository<OrderProduct> {
  return getDataSource().getRepository(OrderProduct);
}

export function getRequisitionItemRepository(): Repository<RequisitionItem> {
  return getDataSource().getRepository(RequisitionItem);
}

export function getRequisitionCommentRepository(): Repository<RequisitionComment> {
  return getDataSource().getRepository(RequisitionComment);
}

export function getShippingLabelRepository(): Repository<ShippingLabel> {
  return getDataSource().getRepository(ShippingLabel);
}

export function getShippingTrackingRepository(): Repository<ShippingTracking> {
  return getDataSource().getRepository(ShippingTracking);
}

export function getMigrationRepository(): Repository<Migration> {
  return getDataSource().getRepository(Migration);
}

// Export base repository for extension
export { BaseRepository } from './base-repository';