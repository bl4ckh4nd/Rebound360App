/**
 * Repository factory for TypeORM entities
 * Provides typed repository access for all entities
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';

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

// Repository getters
export const getSupplierReturnRepository = (): Repository<SupplierReturn> => 
  AppDataSource.getRepository(SupplierReturn);

export const getReturnProductRepository = (): Repository<ReturnProduct> => 
  AppDataSource.getRepository(ReturnProduct);

export const getReturnNoteRepository = (): Repository<ReturnNote> => 
  AppDataSource.getRepository(ReturnNote);

export const getReturnDocumentRepository = (): Repository<ReturnDocument> => 
  AppDataSource.getRepository(ReturnDocument);

export const getStatusWorkflowRepository = (): Repository<StatusWorkflow> => 
  AppDataSource.getRepository(StatusWorkflow);

export const getStatusStepRepository = (): Repository<StatusStep> => 
  AppDataSource.getRepository(StatusStep);

export const getAppSettingRepository = (): Repository<AppSetting> => 
  AppDataSource.getRepository(AppSetting);

export const getReasonCategoryRepository = (): Repository<ReasonCategory> => 
  AppDataSource.getRepository(ReasonCategory);

export const getReturnReasonRepository = (): Repository<ReturnReason> => 
  AppDataSource.getRepository(ReturnReason);

export const getCustomFieldRepository = (): Repository<CustomField> => 
  AppDataSource.getRepository(CustomField);

export const getSupplierRepository = (): Repository<Supplier> => 
  AppDataSource.getRepository(Supplier);

export const getSupplierOrderRepository = (): Repository<SupplierOrder> => 
  AppDataSource.getRepository(SupplierOrder);

export const getOrderProductRepository = (): Repository<OrderProduct> => 
  AppDataSource.getRepository(OrderProduct);

export const getRequisitionRepository = (): Repository<Requisition> => 
  AppDataSource.getRepository(Requisition);

export const getRequisitionItemRepository = (): Repository<RequisitionItem> => 
  AppDataSource.getRepository(RequisitionItem);

export const getRequisitionCommentRepository = (): Repository<RequisitionComment> => 
  AppDataSource.getRepository(RequisitionComment);

export const getPurchaseOrderRepository = (): Repository<PurchaseOrder> => 
  AppDataSource.getRepository(PurchaseOrder);

export const getShippingLabelRepository = (): Repository<ShippingLabel> => 
  AppDataSource.getRepository(ShippingLabel);

export const getShippingTrackingRepository = (): Repository<ShippingTracking> => 
  AppDataSource.getRepository(ShippingTracking);

export const getMigrationRepository = (): Repository<Migration> => 
  AppDataSource.getRepository(Migration);

export const getSyncStatusRepository = (): Repository<SyncStatus> => 
  AppDataSource.getRepository(SyncStatus);

// Repository collection for convenience
export const repositories = {
  supplierReturn: getSupplierReturnRepository,
  returnProduct: getReturnProductRepository,
  returnNote: getReturnNoteRepository,
  returnDocument: getReturnDocumentRepository,
  statusWorkflow: getStatusWorkflowRepository,
  statusStep: getStatusStepRepository,
  appSetting: getAppSettingRepository,
  reasonCategory: getReasonCategoryRepository,
  returnReason: getReturnReasonRepository,
  customField: getCustomFieldRepository,
  supplier: getSupplierRepository,
  supplierOrder: getSupplierOrderRepository,
  orderProduct: getOrderProductRepository,
  requisition: getRequisitionRepository,
  requisitionItem: getRequisitionItemRepository,
  requisitionComment: getRequisitionCommentRepository,
  purchaseOrder: getPurchaseOrderRepository,
  shippingLabel: getShippingLabelRepository,
  shippingTracking: getShippingTrackingRepository,
  migration: getMigrationRepository,
  syncStatus: getSyncStatusRepository
};