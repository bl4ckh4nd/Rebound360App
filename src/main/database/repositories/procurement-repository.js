"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.PurchaseOrderRepository = exports.RequisitionRepository = void 0;
var base_repository_1 = require("./base-repository");
var Requisition_1 = require("../entities/procurement/Requisition");
var RequisitionItem_1 = require("../entities/procurement/RequisitionItem");
var RequisitionComment_1 = require("../entities/procurement/RequisitionComment");
var PurchaseOrder_1 = require("../entities/procurement/PurchaseOrder");
var typeorm_config_1 = require("../typeorm-config");
/**
 * Repository for procurement requisitions with complex workflow support
 */
var RequisitionRepository = /** @class */ (function (_super) {
    __extends(RequisitionRepository, _super);
    function RequisitionRepository() {
        return _super.call(this, Requisition_1.Requisition) || this;
    }
    /**
     * Get requisition with all relations using TypeORM
     */
    RequisitionRepository.prototype.getRequisitionWithDetails = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findOne({
                        where: { id: id },
                        relations: ['items', 'comments', 'purchaseOrders']
                    })];
            });
        });
    };
    /**
     * Get requisitions by status with pagination
     */
    RequisitionRepository.prototype.getRequisitionsByStatus = function (status_1) {
        return __awaiter(this, arguments, void 0, function (status, page, limit) {
            var _a, data, total;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 20; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.typeormRepo.findAndCount({
                            where: { status: status },
                            relations: ['items'],
                            order: { createdAt: 'DESC' },
                            skip: (page - 1) * limit,
                            take: limit
                        })];
                    case 1:
                        _a = _b.sent(), data = _a[0], total = _a[1];
                        return [2 /*return*/, { data: data, total: total }];
                }
            });
        });
    };
    /**
     * Create requisition with items using TypeORM transaction
     */
    RequisitionRepository.prototype.createRequisitionWithItems = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var dataSource;
            var _this = this;
            return __generator(this, function (_a) {
                dataSource = (0, typeorm_config_1.getDataSource)();
                return [2 /*return*/, dataSource.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                        var totalAmount, requisition, savedRequisition, items, comment;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    totalAmount = data.items.reduce(function (sum, item) { return sum + (item.quantity * item.unitPrice); }, 0);
                                    requisition = manager.create(Requisition_1.Requisition, __assign(__assign({ id: crypto.randomUUID() }, data), { totalAmount: totalAmount, status: 'draft' }));
                                    return [4 /*yield*/, manager.save(requisition)];
                                case 1:
                                    savedRequisition = _a.sent();
                                    if (!(data.items && data.items.length > 0)) return [3 /*break*/, 3];
                                    items = data.items.map(function (item) {
                                        return manager.create(RequisitionItem_1.RequisitionItem, __assign(__assign({ id: crypto.randomUUID() }, item), { requisitionId: savedRequisition.id }));
                                    });
                                    return [4 /*yield*/, manager.save(items)];
                                case 2:
                                    _a.sent();
                                    savedRequisition.items = items;
                                    _a.label = 3;
                                case 3:
                                    comment = manager.create(RequisitionComment_1.RequisitionComment, {
                                        id: crypto.randomUUID(),
                                        requisitionId: savedRequisition.id,
                                        text: 'Requisition created',
                                        userId: data.requesterId,
                                        userName: data.requesterName,
                                        type: 'system'
                                    });
                                    return [4 /*yield*/, manager.save(comment)];
                                case 4:
                                    _a.sent();
                                    return [2 /*return*/, savedRequisition];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Update requisition status with approval workflow
     */
    RequisitionRepository.prototype.updateRequisitionStatus = function (id, newStatus, approverId, approverName, comment) {
        return __awaiter(this, void 0, void 0, function () {
            var dataSource;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataSource = (0, typeorm_config_1.getDataSource)();
                        return [4 /*yield*/, dataSource.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                                var commentType, approvalComment;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // Update status
                                        return [4 /*yield*/, manager.update(Requisition_1.Requisition, id, {
                                                status: newStatus,
                                                approverId: approverId,
                                                approverName: approverName,
                                                currentApprover: this.getNextApprover(newStatus) || undefined
                                            })];
                                        case 1:
                                            // Update status
                                            _a.sent();
                                            commentType = newStatus === 'approved' ? 'approval' :
                                                newStatus === 'rejected' ? 'rejection' :
                                                    'comment';
                                            approvalComment = manager.create(RequisitionComment_1.RequisitionComment, {
                                                id: crypto.randomUUID(),
                                                requisitionId: id,
                                                text: comment || "Status changed to ".concat(newStatus),
                                                userId: approverId,
                                                userName: approverName,
                                                type: commentType,
                                                isInternal: true
                                            });
                                            return [4 /*yield*/, manager.save(approvalComment)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get approval queue for a specific approver
     * Uses raw SQL for complex filtering
     */
    RequisitionRepository.prototype.getApprovalQueue = function (approverId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            var _this = this;
            return __generator(this, function (_a) {
                query = "\n      SELECT \n        r.*,\n        json_group_array(\n          json_object(\n            'id', i.id,\n            'description', i.description,\n            'quantity', i.quantity,\n            'unitPrice', i.unit_price,\n            'unit', i.unit,\n            'supplierName', i.supplier_name\n          )\n        ) as items,\n        (\n          SELECT json_group_array(\n            json_object(\n              'id', c.id,\n              'text', c.text,\n              'userName', c.user_name,\n              'createdAt', c.created_at,\n              'type', c.type\n            )\n          )\n          FROM requisition_comments c\n          WHERE c.requisition_id = r.id\n          AND c.is_internal = 0\n          ORDER BY c.created_at DESC\n          LIMIT 5\n        ) as recentComments\n      FROM requisitions r\n      LEFT JOIN requisition_items i ON r.id = i.requisition_id\n      WHERE r.current_approver = ?\n      AND r.status IN ('submitted', 'manager_approval', 'finance_approval')\n      GROUP BY r.id\n      ORDER BY \n        CASE r.priority \n          WHEN 'high' THEN 1 \n          WHEN 'normal' THEN 2 \n          WHEN 'low' THEN 3 \n        END,\n        r.created_at ASC\n    ";
                results = this.executeRawQuery(query, [approverId]);
                return [2 /*return*/, results.map(function (row) { return (__assign(__assign({}, row), { items: JSON.parse(row.items), recentComments: JSON.parse(row.recentComments || '[]'), customFields: _this.parseJson(row.custom_fields, {}) })); })];
            });
        });
    };
    /**
     * Get requisition statistics by department
     */
    RequisitionRepository.prototype.getStatisticsByDepartment = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var dateFilter, params, query;
            return __generator(this, function (_a) {
                dateFilter = '';
                params = [];
                if (startDate && endDate) {
                    dateFilter = 'WHERE r.created_at BETWEEN ? AND ?';
                    params.push(startDate.toISOString(), endDate.toISOString());
                }
                query = "\n      SELECT \n        r.department,\n        COUNT(DISTINCT r.id) as totalRequisitions,\n        SUM(r.total_amount) as totalAmount,\n        AVG(r.total_amount) as avgAmount,\n        COUNT(DISTINCT CASE WHEN r.status = 'approved' THEN r.id END) as approvedCount,\n        COUNT(DISTINCT CASE WHEN r.status = 'rejected' THEN r.id END) as rejectedCount,\n        COUNT(DISTINCT CASE WHEN r.status IN ('submitted', 'manager_approval', 'finance_approval') THEN r.id END) as pendingCount\n      FROM requisitions r\n      ".concat(dateFilter, "\n      GROUP BY r.department\n      ORDER BY totalAmount DESC\n    ");
                return [2 /*return*/, this.executeRawQuery(query, params)];
            });
        });
    };
    /**
     * Helper method to determine next approver based on status
     */
    RequisitionRepository.prototype.getNextApprover = function (status) {
        switch (status) {
            case 'submitted':
                return 'manager';
            case 'manager_approval':
                return 'finance';
            case 'finance_approval':
                return 'procurement';
            default:
                return null;
        }
    };
    return RequisitionRepository;
}(base_repository_1.BaseRepository));
exports.RequisitionRepository = RequisitionRepository;
/**
 * Repository for purchase orders
 */
var PurchaseOrderRepository = /** @class */ (function (_super) {
    __extends(PurchaseOrderRepository, _super);
    function PurchaseOrderRepository() {
        return _super.call(this, PurchaseOrder_1.PurchaseOrder) || this;
    }
    /**
     * Create PO from approved requisition
     */
    PurchaseOrderRepository.prototype.createFromRequisition = function (requisitionId) {
        return __awaiter(this, void 0, void 0, function () {
            var requisitionRepo, requisition, dataSource;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requisitionRepo = new RequisitionRepository();
                        return [4 /*yield*/, requisitionRepo.getRequisitionWithDetails(requisitionId)];
                    case 1:
                        requisition = _a.sent();
                        if (!requisition) {
                            throw new Error('Requisition not found');
                        }
                        if (requisition.status !== 'approved') {
                            throw new Error('Only approved requisitions can be converted to POs');
                        }
                        dataSource = (0, typeorm_config_1.getDataSource)();
                        return [2 /*return*/, dataSource.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                                var poNumber, po, _a, _b, _c, savedPO, comment;
                                var _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0: return [4 /*yield*/, this.generatePONumber()];
                                        case 1:
                                            poNumber = _e.sent();
                                            _b = (_a = manager).create;
                                            _c = [PurchaseOrder_1.PurchaseOrder];
                                            _d = {
                                                id: crypto.randomUUID(),
                                                requisitionId: requisitionId,
                                                orderNumber: poNumber,
                                                title: requisition.title,
                                                description: requisition.description,
                                                requesterId: requisition.requesterId,
                                                requesterName: requisition.requesterName,
                                                department: requisition.department,
                                                priority: requisition.priority,
                                                status: 'draft',
                                                procurementType: requisition.procurementType,
                                                customFields: requisition.customFields,
                                                totalAmount: requisition.totalAmount,
                                                currency: requisition.currency,
                                                items: requisition.items.map(function (item) { return ({
                                                    id: item.id,
                                                    description: item.description,
                                                    quantity: item.quantity,
                                                    unitPrice: item.unitPrice,
                                                    unit: item.unit,
                                                    supplierName: item.supplierName,
                                                    sku: item.sku,
                                                    notes: item.notes
                                                }); })
                                            };
                                            return [4 /*yield*/, this.getDefaultBillingAddress()];
                                        case 2:
                                            _d.billingAddress = _e.sent();
                                            return [4 /*yield*/, this.getDefaultShippingAddress()];
                                        case 3:
                                            po = _b.apply(_a, _c.concat([(_d.shippingAddress = _e.sent(),
                                                    _d)]));
                                            return [4 /*yield*/, manager.save(po)];
                                        case 4:
                                            savedPO = _e.sent();
                                            // Update requisition status
                                            return [4 /*yield*/, manager.update(Requisition_1.Requisition, requisitionId, {
                                                    status: 'converted'
                                                })];
                                        case 5:
                                            // Update requisition status
                                            _e.sent();
                                            comment = manager.create(RequisitionComment_1.RequisitionComment, {
                                                id: crypto.randomUUID(),
                                                requisitionId: requisitionId,
                                                text: "Converted to Purchase Order ".concat(poNumber),
                                                userId: 'system',
                                                userName: 'System',
                                                type: 'system'
                                            });
                                            return [4 /*yield*/, manager.save(comment)];
                                        case 6:
                                            _e.sent();
                                            return [2 /*return*/, savedPO];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    /**
     * Generate unique PO number
     */
    PurchaseOrderRepository.prototype.generatePONumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, nextNumber;
            return __generator(this, function (_a) {
                result = this.executeRawQuerySingle("SELECT MAX(CAST(SUBSTR(order_number, 4) AS INTEGER)) as maxNumber \n       FROM purchase_orders \n       WHERE order_number LIKE 'PO-%'");
                nextNumber = ((result === null || result === void 0 ? void 0 : result.maxNumber) || 0) + 1;
                return [2 /*return*/, "PO-".concat(nextNumber.toString().padStart(6, '0'))];
            });
        });
    };
    /**
     * Get default addresses from settings
     */
    PurchaseOrderRepository.prototype.getDefaultBillingAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with settings repository
                return [2 /*return*/, {
                        name: 'Company Name',
                        street: '123 Main St',
                        city: 'City',
                        postalCode: '12345',
                        country: 'Country'
                    }];
            });
        });
    };
    PurchaseOrderRepository.prototype.getDefaultShippingAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would integrate with settings repository
                return [2 /*return*/, {
                        name: 'Company Warehouse',
                        street: '456 Warehouse Ave',
                        city: 'City',
                        postalCode: '12345',
                        country: 'Country'
                    }];
            });
        });
    };
    /**
     * Get purchase orders with aggregated data
     */
    PurchaseOrderRepository.prototype.getPurchaseOrdersWithStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            var _this = this;
            return __generator(this, function (_a) {
                query = "\n      SELECT \n        p.*,\n        r.title as requisitionTitle,\n        COUNT(DISTINCT json_extract(value, '$.id')) as itemCount,\n        SUM(json_extract(value, '$.quantity')) as totalQuantity\n      FROM purchase_orders p\n      LEFT JOIN requisitions r ON p.requisition_id = r.id\n      CROSS JOIN json_each(p.items)\n      GROUP BY p.id\n      ORDER BY p.created_at DESC\n    ";
                results = this.executeRawQuery(query);
                return [2 /*return*/, results.map(function (row) { return (__assign(__assign({}, row), { items: JSON.parse(row.items), customFields: _this.parseJson(row.custom_fields, {}), billingAddress: JSON.parse(row.billing_address), shippingAddress: JSON.parse(row.shipping_address) })); })];
            });
        });
    };
    return PurchaseOrderRepository;
}(base_repository_1.BaseRepository));
exports.PurchaseOrderRepository = PurchaseOrderRepository;
