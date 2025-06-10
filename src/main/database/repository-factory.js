"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncStatusRepository = exports.getOrderSyncRepository = exports.getSupplierSyncRepository = exports.getPurchaseOrderRepository = exports.getRequisitionRepository = exports.getReasonRepository = exports.getSettingsRepository = exports.getSupplierReturnRepository = void 0;
exports.getDataSource = getDataSource;
exports.getCustomFieldRepository = getCustomFieldRepository;
exports.getWorkflowRepository = getWorkflowRepository;
exports.getSupplierReturnRepositoryTypeORM = getSupplierReturnRepositoryTypeORM;
var typeorm_config_1 = require("./typeorm-config");
var custom_field_repository_1 = require("./repositories/custom-field-repository");
var settings_repository_1 = require("./repositories/settings-repository");
var supplier_return_repository_1 = require("./repositories/supplier-return-repository");
var dataSource = null;
function getDataSource() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!dataSource) {
                        dataSource = (0, typeorm_config_1.getDataSource)();
                    }
                    if (!!dataSource.isInitialized) return [3 /*break*/, 2];
                    return [4 /*yield*/, dataSource.initialize()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, dataSource];
            }
        });
    });
}
// Repository factory function that returns properly initialized repositories
function getCustomFieldRepository() {
    return new custom_field_repository_1.CustomFieldRepository();
}
// Factory function for workflow repository
function getWorkflowRepository() {
    return new settings_repository_1.WorkflowRepository();
}
// Factory function for supplier return repository
function getSupplierReturnRepositoryTypeORM() {
    return new supplier_return_repository_1.SupplierReturnRepository();
}
// Re-export from repositories index for consistency
var repositories_1 = require("./repositories");
Object.defineProperty(exports, "getSupplierReturnRepository", { enumerable: true, get: function () { return repositories_1.getSupplierReturnRepository; } });
Object.defineProperty(exports, "getSettingsRepository", { enumerable: true, get: function () { return repositories_1.getSettingsRepository; } });
Object.defineProperty(exports, "getReasonRepository", { enumerable: true, get: function () { return repositories_1.getReasonRepository; } });
Object.defineProperty(exports, "getRequisitionRepository", { enumerable: true, get: function () { return repositories_1.getRequisitionRepository; } });
Object.defineProperty(exports, "getPurchaseOrderRepository", { enumerable: true, get: function () { return repositories_1.getPurchaseOrderRepository; } });
Object.defineProperty(exports, "getSupplierSyncRepository", { enumerable: true, get: function () { return repositories_1.getSupplierSyncRepository; } });
Object.defineProperty(exports, "getOrderSyncRepository", { enumerable: true, get: function () { return repositories_1.getOrderSyncRepository; } });
Object.defineProperty(exports, "getSyncStatusRepository", { enumerable: true, get: function () { return repositories_1.getSyncStatusRepository; } });
