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
exports.SyncStatusRepository = exports.OrderSyncRepository = exports.SupplierSyncRepository = void 0;
var base_repository_1 = require("./base-repository");
var Supplier_1 = require("../entities/jtl/Supplier");
var SupplierOrder_1 = require("../entities/jtl/SupplierOrder");
var OrderProduct_1 = require("../entities/jtl/OrderProduct");
var SyncStatus_1 = require("../entities/system/SyncStatus");
var typeorm_config_1 = require("../typeorm-config");
/**
 * Repository for JTL supplier synchronization
 */
var SupplierSyncRepository = /** @class */ (function (_super) {
    __extends(SupplierSyncRepository, _super);
    function SupplierSyncRepository() {
        return _super.call(this, Supplier_1.Supplier) || this;
    }
    /**
     * Upsert suppliers from JTL sync
     * Uses raw SQL for efficient bulk operations
     */
    SupplierSyncRepository.prototype.upsertSuppliersFromJTL = function (suppliers) {
        return __awaiter(this, void 0, void 0, function () {
            var placeholders, values, query, result;
            return __generator(this, function (_a) {
                if (suppliers.length === 0)
                    return [2 /*return*/, 0];
                placeholders = suppliers.map(function () {
                    return '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                }).join(', ');
                values = [];
                suppliers.forEach(function (supplier) {
                    values.push(supplier.jtlId, supplier.supplierNumber || null, supplier.companyName || null, supplier.contact || null, supplier.email || null, supplier.phone || null, supplier.city || null, supplier.country || null, supplier.postalCode || null, supplier.street || null, new Date().toISOString());
                });
                query = "\n      INSERT OR REPLACE INTO suppliers (\n        jtl_id, supplier_number, company_name, contact, email,\n        phone, city, country, postal_code, street, last_synced\n      ) VALUES ".concat(placeholders, "\n    ");
                result = this.executeRawCommand(query, values);
                return [2 /*return*/, result.changes];
            });
        });
    };
    /**
     * Get suppliers needing sync (not synced in last 24 hours)
     */
    SupplierSyncRepository.prototype.getSuppliersNeedingSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var yesterday;
            return __generator(this, function (_a) {
                yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return [2 /*return*/, this.findAll({
                        where: [
                            { lastSynced: null },
                            { lastSynced: { $lt: yesterday } }
                        ]
                    })];
            });
        });
    };
    /**
     * Search suppliers with TypeORM
     */
    SupplierSyncRepository.prototype.searchSuppliers = function (searchTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var query, searchPattern;
            return __generator(this, function (_a) {
                query = "\n      SELECT * FROM suppliers\n      WHERE company_name LIKE ?\n      OR supplier_number LIKE ?\n      OR contact LIKE ?\n      OR email LIKE ?\n      ORDER BY company_name\n      LIMIT 50\n    ";
                searchPattern = "%".concat(searchTerm, "%");
                return [2 /*return*/, this.executeRawQuery(query, [
                        searchPattern, searchPattern, searchPattern, searchPattern
                    ])];
            });
        });
    };
    return SupplierSyncRepository;
}(base_repository_1.BaseRepository));
exports.SupplierSyncRepository = SupplierSyncRepository;
/**
 * Repository for JTL order synchronization
 */
var OrderSyncRepository = /** @class */ (function (_super) {
    __extends(OrderSyncRepository, _super);
    function OrderSyncRepository() {
        return _super.call(this, SupplierOrder_1.SupplierOrder) || this;
    }
    /**
     * Get orders with products and supplier using TypeORM
     */
    OrderSyncRepository.prototype.getOrderWithDetails = function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findOne({
                        where: { id: orderId },
                        relations: ['products', 'supplier', 'returns']
                    })];
            });
        });
    };
    /**
     * Sync orders from JTL with products
     * Uses transaction for consistency
     */
    OrderSyncRepository.prototype.syncOrdersFromJTL = function (orders) {
        return __awaiter(this, void 0, void 0, function () {
            var dataSource, ordersCreated, productsCreated;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataSource = (0, typeorm_config_1.getDataSource)();
                        ordersCreated = 0;
                        productsCreated = 0;
                        return [4 /*yield*/, dataSource.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, orders_1, orderData, existingOrder, order, _a, _b, productData, product;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _i = 0, orders_1 = orders;
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < orders_1.length)) return [3 /*break*/, 12];
                                            orderData = orders_1[_i];
                                            return [4 /*yield*/, manager.findOne(SupplierOrder_1.SupplierOrder, {
                                                    where: { jtlId: orderData.jtlId }
                                                })];
                                        case 2:
                                            existingOrder = _c.sent();
                                            order = void 0;
                                            if (!existingOrder) return [3 /*break*/, 4];
                                            // Update existing order
                                            return [4 /*yield*/, manager.update(SupplierOrder_1.SupplierOrder, existingOrder.id, {
                                                    orderNumber: orderData.orderNumber,
                                                    supplierReference: orderData.supplierReference,
                                                    orderDate: orderData.orderDate,
                                                    deliveryDate: orderData.deliveryDate,
                                                    supplierName: orderData.supplierName,
                                                    status: orderData.status,
                                                    jtlSupplierId: orderData.jtlSupplierId,
                                                    lastSynced: new Date()
                                                })];
                                        case 3:
                                            // Update existing order
                                            _c.sent();
                                            order = existingOrder;
                                            return [3 /*break*/, 6];
                                        case 4:
                                            // Create new order
                                            order = manager.create(SupplierOrder_1.SupplierOrder, __assign(__assign({}, orderData), { lastSynced: new Date() }));
                                            return [4 /*yield*/, manager.save(order)];
                                        case 5:
                                            order = _c.sent();
                                            ordersCreated++;
                                            _c.label = 6;
                                        case 6: 
                                        // Sync products
                                        // Delete existing products for full refresh
                                        return [4 /*yield*/, manager.delete(OrderProduct_1.OrderProduct, { orderId: order.id })];
                                        case 7:
                                            // Sync products
                                            // Delete existing products for full refresh
                                            _c.sent();
                                            _a = 0, _b = orderData.products;
                                            _c.label = 8;
                                        case 8:
                                            if (!(_a < _b.length)) return [3 /*break*/, 11];
                                            productData = _b[_a];
                                            product = manager.create(OrderProduct_1.OrderProduct, __assign(__assign({}, productData), { orderId: order.id, lastSynced: new Date() }));
                                            return [4 /*yield*/, manager.save(product)];
                                        case 9:
                                            _c.sent();
                                            productsCreated++;
                                            _c.label = 10;
                                        case 10:
                                            _a++;
                                            return [3 /*break*/, 8];
                                        case 11:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 12: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { ordersCreated: ordersCreated, productsCreated: productsCreated }];
                }
            });
        });
    };
    /**
     * Get order statistics by supplier
     */
    OrderSyncRepository.prototype.getOrderStatsBySupplier = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = "\n      SELECT \n        s.company_name as supplierName,\n        s.id as supplierId,\n        COUNT(DISTINCT o.id) as totalOrders,\n        COUNT(DISTINCT CASE WHEN o.status = 'bestellt' THEN o.id END) as orderedCount,\n        COUNT(DISTINCT CASE WHEN o.status = 'geliefert' THEN o.id END) as deliveredCount,\n        COUNT(DISTINCT CASE WHEN o.status = 'teilgeliefert' THEN o.id END) as partialCount,\n        COUNT(DISTINCT CASE WHEN o.status = 'storniert' THEN o.id END) as cancelledCount,\n        COUNT(DISTINCT r.id) as totalReturns,\n        SUM(p.quantity * p.price) as totalValue\n      FROM suppliers s\n      LEFT JOIN supplier_orders o ON s.jtl_id = o.jtl_supplier_id\n      LEFT JOIN order_products p ON o.id = p.orderId\n      LEFT JOIN supplier_returns r ON o.id = r.orderId\n      WHERE s.company_name IS NOT NULL\n      GROUP BY s.id, s.company_name\n      ORDER BY totalOrders DESC\n    ";
                return [2 /*return*/, this.executeRawQuery(query)];
            });
        });
    };
    /**
     * Search orders with complex criteria
     */
    OrderSyncRepository.prototype.searchOrders = function (criteria) {
        return __awaiter(this, void 0, void 0, function () {
            var conditions, params, whereClause, query, results;
            return __generator(this, function (_a) {
                conditions = [];
                params = [];
                if (criteria.orderNumber) {
                    conditions.push('o.orderNumber LIKE ?');
                    params.push("%".concat(criteria.orderNumber, "%"));
                }
                if (criteria.supplierName) {
                    conditions.push('o.supplierName LIKE ?');
                    params.push("%".concat(criteria.supplierName, "%"));
                }
                if (criteria.status) {
                    conditions.push('o.status = ?');
                    params.push(criteria.status);
                }
                if (criteria.startDate && criteria.endDate) {
                    conditions.push('o.orderDate BETWEEN ? AND ?');
                    params.push(criteria.startDate.toISOString(), criteria.endDate.toISOString());
                }
                whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                query = "\n      SELECT \n        o.*,\n        json_group_array(\n          json_object(\n            'id', p.id,\n            'productName', p.productName,\n            'quantity', p.quantity,\n            'price', p.price,\n            'sku', p.sku\n          )\n        ) as products\n      FROM supplier_orders o\n      LEFT JOIN order_products p ON o.id = p.orderId\n      ".concat(whereClause, "\n      GROUP BY o.id\n      ORDER BY o.orderDate DESC\n      LIMIT 100\n    ");
                results = this.executeRawQuery(query, params);
                return [2 /*return*/, results.map(function (row) { return (__assign(__assign({}, row), { products: JSON.parse(row.products) })); })];
            });
        });
    };
    return OrderSyncRepository;
}(base_repository_1.BaseRepository));
exports.OrderSyncRepository = OrderSyncRepository;
/**
 * Repository for sync status tracking
 */
var SyncStatusRepository = /** @class */ (function (_super) {
    __extends(SyncStatusRepository, _super);
    function SyncStatusRepository() {
        return _super.call(this, SyncStatus_1.SyncStatus) || this;
    }
    /**
     * Update sync status for an entity type
     */
    SyncStatusRepository.prototype.updateSyncStatus = function (entityType_1, recordsSynced_1) {
        return __awaiter(this, arguments, void 0, function (entityType, recordsSynced, status, errorMessage) {
            var existing;
            if (status === void 0) { status = 'success'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({ where: { entityType: entityType } })];
                    case 1:
                        existing = _a.sent();
                        if (!existing) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.update(existing.id, {
                                lastSuccessfulSync: status === 'success' ? new Date() : existing.lastSuccessfulSync,
                                recordsSynced: recordsSynced,
                                status: status,
                                errorMessage: errorMessage || undefined,
                                lastAttempt: new Date()
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.save({
                            entityType: entityType,
                            lastSuccessfulSync: status === 'success' ? new Date() : undefined,
                            recordsSynced: recordsSynced,
                            status: status,
                            errorMessage: errorMessage || undefined,
                            lastAttempt: new Date()
                        })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get sync status summary
     */
    SyncStatusRepository.prototype.getSyncSummary = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAll({
                        order: { entityType: 'ASC' }
                    })];
            });
        });
    };
    /**
     * Check if sync is needed (last sync > 1 hour ago)
     */
    SyncStatusRepository.prototype.isSyncNeeded = function (entityType) {
        return __awaiter(this, void 0, void 0, function () {
            var status, oneHourAgo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({ where: { entityType: entityType } })];
                    case 1:
                        status = _a.sent();
                        if (!status || !status.lastSuccessfulSync) {
                            return [2 /*return*/, true];
                        }
                        oneHourAgo = new Date();
                        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                        return [2 /*return*/, status.lastSuccessfulSync < oneHourAgo];
                }
            });
        });
    };
    return SyncStatusRepository;
}(base_repository_1.BaseRepository));
exports.SyncStatusRepository = SyncStatusRepository;
