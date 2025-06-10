"use strict";
/**
 * TypeORM Entity Models for Rebound360App
 *
 * This file contains all entity definitions based on the existing database schema.
 * The entities are designed to work with TypeORM while maintaining compatibility
 * with the current SQLite database structure.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Export all entities
__exportStar(require("./core/SupplierReturn"), exports);
__exportStar(require("./core/ReturnProduct"), exports);
__exportStar(require("./core/ReturnNote"), exports);
__exportStar(require("./core/ReturnDocument"), exports);
__exportStar(require("./workflow/StatusWorkflow"), exports);
__exportStar(require("./workflow/StatusStep"), exports);
__exportStar(require("./settings/AppSetting"), exports);
__exportStar(require("./settings/ReasonCategory"), exports);
__exportStar(require("./settings/ReturnReason"), exports);
__exportStar(require("./settings/CustomField"), exports);
__exportStar(require("./custom-field.entity"), exports);
__exportStar(require("./jtl/Supplier"), exports);
__exportStar(require("./jtl/SupplierOrder"), exports);
__exportStar(require("./jtl/OrderProduct"), exports);
__exportStar(require("./procurement/Requisition"), exports);
__exportStar(require("./procurement/RequisitionItem"), exports);
__exportStar(require("./procurement/RequisitionComment"), exports);
__exportStar(require("./procurement/PurchaseOrder"), exports);
__exportStar(require("./shipping/ShippingLabel"), exports);
__exportStar(require("./shipping/ShippingTracking"), exports);
__exportStar(require("./system/Migration"), exports);
__exportStar(require("./system/SyncStatus"), exports);
// Re-export base entities
__exportStar(require("./base/BaseEntity"), exports);
__exportStar(require("./base/TimestampEntity"), exports);
