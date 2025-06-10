"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
exports.getSupplierReturnRepository = getSupplierReturnRepository;
exports.getSupplierRepositoryTypeORM = getSupplierRepositoryTypeORM;
exports.getOrderRepositoryTypeORM = getOrderRepositoryTypeORM;
exports.getSettingsRepository = getSettingsRepository;
exports.getWorkflowRepository = getWorkflowRepository;
exports.getReasonRepository = getReasonRepository;
exports.getReasonCategoryRepositoryTypeORM = getReasonCategoryRepositoryTypeORM;
exports.getCustomFieldRepository = getCustomFieldRepository;
exports.getRequisitionRepository = getRequisitionRepository;
exports.getPurchaseOrderRepository = getPurchaseOrderRepository;
exports.getSupplierSyncRepository = getSupplierSyncRepository;
exports.getOrderSyncRepository = getOrderSyncRepository;
exports.getSyncStatusRepository = getSyncStatusRepository;
exports.getReturnProductRepository = getReturnProductRepository;
exports.getReturnNoteRepository = getReturnNoteRepository;
exports.getReturnDocumentRepository = getReturnDocumentRepository;
exports.getStatusWorkflowRepository = getStatusWorkflowRepository;
exports.getStatusStepRepository = getStatusStepRepository;
exports.getAppSettingRepository = getAppSettingRepository;
exports.getReasonCategoryRepository = getReasonCategoryRepository;
exports.getReturnReasonRepository = getReturnReasonRepository;
exports.getSettingsCustomFieldRepository = getSettingsCustomFieldRepository;
exports.getTypeORMCustomFieldRepository = getTypeORMCustomFieldRepository;
exports.getSupplierRepository = getSupplierRepository;
exports.getSupplierOrderRepository = getSupplierOrderRepository;
exports.getOrderProductRepository = getOrderProductRepository;
exports.getRequisitionItemRepository = getRequisitionItemRepository;
exports.getRequisitionCommentRepository = getRequisitionCommentRepository;
exports.getShippingLabelRepository = getShippingLabelRepository;
exports.getShippingTrackingRepository = getShippingTrackingRepository;
exports.getMigrationRepository = getMigrationRepository;
var typeorm_config_1 = require("../typeorm-config");
var ReturnProduct_1 = require("../entities/core/ReturnProduct");
var ReturnNote_1 = require("../entities/core/ReturnNote");
var ReturnDocument_1 = require("../entities/core/ReturnDocument");
var StatusWorkflow_1 = require("../entities/workflow/StatusWorkflow");
var StatusStep_1 = require("../entities/workflow/StatusStep");
var AppSetting_1 = require("../entities/settings/AppSetting");
var ReasonCategory_1 = require("../entities/settings/ReasonCategory");
var ReturnReason_1 = require("../entities/settings/ReturnReason");
var CustomField_1 = require("../entities/settings/CustomField");
var Supplier_1 = require("../entities/jtl/Supplier");
var SupplierOrder_1 = require("../entities/jtl/SupplierOrder");
var OrderProduct_1 = require("../entities/jtl/OrderProduct");
var RequisitionItem_1 = require("../entities/procurement/RequisitionItem");
var RequisitionComment_1 = require("../entities/procurement/RequisitionComment");
var ShippingLabel_1 = require("../entities/shipping/ShippingLabel");
var ShippingTracking_1 = require("../entities/shipping/ShippingTracking");
var Migration_1 = require("../entities/system/Migration");
// Import custom repositories
var supplier_return_repository_1 = require("./supplier-return-repository");
var supplier_repository_1 = require("./supplier-repository");
var order_repository_1 = require("./order-repository");
var settings_repository_1 = require("./settings-repository");
var custom_field_repository_1 = require("./custom-field-repository");
var procurement_repository_1 = require("./procurement-repository");
var jtl_sync_repository_1 = require("./jtl-sync-repository");
// Custom repository factory functions
function getSupplierReturnRepository() {
    return new supplier_return_repository_1.SupplierReturnRepository();
}
function getSupplierRepositoryTypeORM() {
    return new supplier_repository_1.SupplierRepository();
}
function getOrderRepositoryTypeORM() {
    return new order_repository_1.OrderRepository();
}
function getSettingsRepository() {
    return new settings_repository_1.SettingsRepository();
}
function getWorkflowRepository() {
    return new settings_repository_1.WorkflowRepository();
}
function getReasonRepository() {
    return new settings_repository_1.ReasonRepository();
}
// Add category repository for reasons hybrid API
function getReasonCategoryRepositoryTypeORM() {
    return (0, typeorm_config_1.getDataSource)().getRepository(ReasonCategory_1.ReasonCategory);
}
function getCustomFieldRepository() {
    return new custom_field_repository_1.CustomFieldRepository();
}
function getRequisitionRepository() {
    return new procurement_repository_1.RequisitionRepository();
}
function getPurchaseOrderRepository() {
    return new procurement_repository_1.PurchaseOrderRepository();
}
function getSupplierSyncRepository() {
    return new jtl_sync_repository_1.SupplierSyncRepository();
}
function getOrderSyncRepository() {
    return new jtl_sync_repository_1.OrderSyncRepository();
}
function getSyncStatusRepository() {
    return new jtl_sync_repository_1.SyncStatusRepository();
}
// Generic repository getters for simple entities
function getReturnProductRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(ReturnProduct_1.ReturnProduct);
}
function getReturnNoteRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(ReturnNote_1.ReturnNote);
}
function getReturnDocumentRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(ReturnDocument_1.ReturnDocument);
}
function getStatusWorkflowRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(StatusWorkflow_1.StatusWorkflow);
}
function getStatusStepRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(StatusStep_1.StatusStep);
}
function getAppSettingRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(AppSetting_1.AppSetting);
}
function getReasonCategoryRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(ReasonCategory_1.ReasonCategory);
}
function getReturnReasonRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(ReturnReason_1.ReturnReason);
}
// Legacy CustomField repository (from settings)
function getSettingsCustomFieldRepository() {
    return new settings_repository_1.CustomFieldRepository();
}
function getTypeORMCustomFieldRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(CustomField_1.CustomField);
}
function getSupplierRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(Supplier_1.Supplier);
}
function getSupplierOrderRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(SupplierOrder_1.SupplierOrder);
}
function getOrderProductRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(OrderProduct_1.OrderProduct);
}
function getRequisitionItemRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(RequisitionItem_1.RequisitionItem);
}
function getRequisitionCommentRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(RequisitionComment_1.RequisitionComment);
}
function getShippingLabelRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(ShippingLabel_1.ShippingLabel);
}
function getShippingTrackingRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(ShippingTracking_1.ShippingTracking);
}
function getMigrationRepository() {
    return (0, typeorm_config_1.getDataSource)().getRepository(Migration_1.Migration);
}
// Export base repository for extension
var base_repository_1 = require("./base-repository");
Object.defineProperty(exports, "BaseRepository", { enumerable: true, get: function () { return base_repository_1.BaseRepository; } });
