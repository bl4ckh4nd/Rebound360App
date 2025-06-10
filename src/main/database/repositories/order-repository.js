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
exports.OrderRepository = void 0;
var base_repository_1 = require("./base-repository");
var SupplierOrder_1 = require("../entities/jtl/SupplierOrder");
/**
 * Repository for SupplierOrder entity with hybrid approach
 * Extends JTL sync capabilities with additional business logic for order management
 */
var OrderRepository = /** @class */ (function (_super) {
    __extends(OrderRepository, _super);
    function OrderRepository() {
        return _super.call(this, SupplierOrder_1.SupplierOrder) || this;
    }
    /**
     * Get all orders with optional filtering
     */
    OrderRepository.prototype.getAllOrders = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var whereConditions, params, query, results;
            return __generator(this, function (_a) {
                try {
                    whereConditions = ['1=1'];
                    params = [];
                    if (filters === null || filters === void 0 ? void 0 : filters.status) {
                        whereConditions.push('o.status = ?');
                        params.push(filters.status);
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.supplierName) {
                        whereConditions.push('o.supplierName LIKE ?');
                        params.push("%".concat(filters.supplierName, "%"));
                    }
                    if (filters === null || filters === void 0 ? void 0 : filters.orderNumber) {
                        whereConditions.push('o.orderNumber LIKE ?');
                        params.push("%".concat(filters.orderNumber, "%"));
                    }
                    if ((filters === null || filters === void 0 ? void 0 : filters.startDate) && (filters === null || filters === void 0 ? void 0 : filters.endDate)) {
                        whereConditions.push('o.orderDate BETWEEN ? AND ?');
                        params.push(filters.startDate, filters.endDate);
                    }
                    query = "\n        SELECT \n          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, \n          o.supplierName, o.status, o.deliveryDate, o.supplierReference, \n          o.last_synced,\n          json_group_array(\n            json_object(\n              'id', COALESCE(p.id, 0),\n              'jtl_id', p.jtl_id,\n              'jtl_article_id', p.jtl_article_id,\n              'productName', p.productName,\n              'quantity', p.quantity,\n              'price', p.price,\n              'sku', p.sku\n            )\n          ) as products\n        FROM supplier_orders o\n        LEFT JOIN order_products p ON o.jtl_id = p.orderId\n        WHERE ".concat(whereConditions.join(' AND '), "\n        GROUP BY o.jtl_id\n        ORDER BY o.orderDate DESC\n      ");
                    results = this.executeRawQuery(query, params);
                    return [2 /*return*/, results.map(function (row) { return ({
                            jtl_id: row.jtl_id,
                            orderNumber: row.orderNumber,
                            orderDate: row.orderDate,
                            jtl_supplier_id: row.jtl_supplier_id,
                            supplierName: row.supplierName,
                            status: row.status,
                            deliveryDate: row.deliveryDate,
                            supplierReference: row.supplierReference,
                            last_synced: row.last_synced,
                            products: row.products ? JSON.parse(row.products).filter(function (p) { return p.jtl_id !== null; }) : [],
                            notes: [],
                            documents: []
                        }); })];
                }
                catch (error) {
                    console.error('Error in getAllOrders:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get order by JTL ID with full details
     */
    OrderRepository.prototype.getOrderByJtlId = function (jtlId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, orderResults, order, productsQuery, products;
            return __generator(this, function (_a) {
                try {
                    query = "\n        SELECT \n          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, \n          o.supplierName, o.status, o.deliveryDate, o.supplierReference, \n          o.last_synced\n        FROM supplier_orders o\n        WHERE o.jtl_id = ?\n      ";
                    orderResults = this.executeRawQuery(query, [jtlId]);
                    if (orderResults.length === 0) {
                        return [2 /*return*/, null];
                    }
                    order = orderResults[0];
                    productsQuery = "\n        SELECT \n          id, jtl_id, jtl_article_id, productName, \n          quantity, price, sku\n        FROM order_products \n        WHERE orderId = ?\n      ";
                    products = this.executeRawQuery(productsQuery, [jtlId]);
                    return [2 /*return*/, {
                            jtl_id: order.jtl_id,
                            orderNumber: order.orderNumber,
                            orderDate: order.orderDate,
                            jtl_supplier_id: order.jtl_supplier_id,
                            supplierName: order.supplierName,
                            status: order.status,
                            deliveryDate: order.deliveryDate,
                            supplierReference: order.supplierReference,
                            last_synced: order.last_synced,
                            products: products.map(function (p) { return ({
                                id: p.id || 0,
                                jtl_id: p.jtl_id,
                                jtl_article_id: p.jtl_article_id,
                                productName: p.productName,
                                quantity: p.quantity,
                                price: p.price,
                                sku: p.sku
                            }); }),
                            notes: [],
                            documents: []
                        }];
                }
                catch (error) {
                    console.error('Error in getOrderByJtlId:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Search orders with advanced criteria
     */
    OrderRepository.prototype.searchOrders = function (searchTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPattern, query, results;
            return __generator(this, function (_a) {
                try {
                    searchPattern = "%".concat(searchTerm, "%");
                    query = "\n        SELECT \n          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, \n          o.supplierName, o.status, o.deliveryDate, o.supplierReference, \n          o.last_synced,\n          json_group_array(\n            CASE WHEN p.jtl_id IS NOT NULL THEN\n              json_object(\n                'id', COALESCE(p.id, 0),\n                'jtl_id', p.jtl_id,\n                'jtl_article_id', p.jtl_article_id,\n                'productName', p.productName,\n                'quantity', p.quantity,\n                'price', p.price,\n                'sku', p.sku\n              )\n            END\n          ) as products\n        FROM supplier_orders o\n        LEFT JOIN order_products p ON o.jtl_id = p.orderId\n        WHERE \n          o.orderNumber LIKE ? OR\n          o.supplierName LIKE ? OR\n          o.supplierReference LIKE ? OR\n          p.productName LIKE ? OR\n          p.sku LIKE ?\n        GROUP BY o.jtl_id\n        ORDER BY \n          CASE \n            WHEN o.orderNumber LIKE ? THEN 1\n            WHEN o.supplierName LIKE ? THEN 2\n            ELSE 3\n          END,\n          o.orderDate DESC\n        LIMIT 50\n      ";
                    results = this.executeRawQuery(query, [
                        searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
                        searchPattern, searchPattern
                    ]);
                    return [2 /*return*/, results.map(function (row) { return ({
                            jtl_id: row.jtl_id,
                            orderNumber: row.orderNumber,
                            orderDate: row.orderDate,
                            jtl_supplier_id: row.jtl_supplier_id,
                            supplierName: row.supplierName,
                            status: row.status,
                            deliveryDate: row.deliveryDate,
                            supplierReference: row.supplierReference,
                            last_synced: row.last_synced,
                            products: row.products ? JSON.parse(row.products).filter(function (p) { return p !== null; }) : [],
                            notes: [],
                            documents: []
                        }); })];
                }
                catch (error) {
                    console.error('Error in searchOrders:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Update order status
     */
    OrderRepository.prototype.updateOrderStatus = function (jtlId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            return __generator(this, function (_a) {
                try {
                    query = "\n        UPDATE supplier_orders\n        SET status = ?, last_synced = ?\n        WHERE jtl_id = ?\n      ";
                    result = this.executeRawCommand(query, [
                        status,
                        new Date().toISOString(),
                        jtlId
                    ]);
                    return [2 /*return*/, result.changes > 0];
                }
                catch (error) {
                    console.error('Error in updateOrderStatus:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get order statistics and metrics
     */
    OrderRepository.prototype.getOrderStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statsQuery, statusQuery, statsResults, statusResults, ordersByStatus_1, stats;
            return __generator(this, function (_a) {
                try {
                    statsQuery = "\n        SELECT \n          COUNT(DISTINCT o.jtl_id) as totalOrders,\n          COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN o.jtl_id END) as ordersWithProducts,\n          COUNT(DISTINCT CASE WHEN sr.id IS NOT NULL THEN o.jtl_id END) as ordersWithReturns,\n          COUNT(DISTINCT CASE WHEN o.last_synced > datetime('now', '-7 days') THEN o.jtl_id END) as recentlyUpdated,\n          COALESCE(SUM(p.quantity * p.price), 0) as totalValue\n        FROM supplier_orders o\n        LEFT JOIN order_products p ON o.jtl_id = p.orderId\n        LEFT JOIN supplier_returns sr ON o.jtl_id = sr.orderId\n      ";
                    statusQuery = "\n        SELECT \n          status,\n          COUNT(*) as count\n        FROM supplier_orders\n        GROUP BY status\n      ";
                    statsResults = this.executeRawQuery(statsQuery);
                    statusResults = this.executeRawQuery(statusQuery);
                    ordersByStatus_1 = {};
                    statusResults.forEach(function (row) {
                        ordersByStatus_1[row.status] = row.count;
                    });
                    if (statsResults.length > 0) {
                        stats = statsResults[0];
                        return [2 /*return*/, {
                                totalOrders: stats.totalOrders || 0,
                                ordersByStatus: ordersByStatus_1,
                                ordersWithProducts: stats.ordersWithProducts || 0,
                                ordersWithReturns: stats.ordersWithReturns || 0,
                                recentlyUpdated: stats.recentlyUpdated || 0,
                                totalValue: stats.totalValue || 0
                            }];
                    }
                    return [2 /*return*/, {
                            totalOrders: 0,
                            ordersByStatus: ordersByStatus_1,
                            ordersWithProducts: 0,
                            ordersWithReturns: 0,
                            recentlyUpdated: 0,
                            totalValue: 0
                        }];
                }
                catch (error) {
                    console.error('Error in getOrderStatistics:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get orders by supplier with aggregated data
     */
    OrderRepository.prototype.getOrdersBySupplier = function (jtlSupplierId) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, params, query, results;
            return __generator(this, function (_a) {
                try {
                    whereClause = '1=1';
                    params = [];
                    if (jtlSupplierId) {
                        whereClause = 'o.jtl_supplier_id = ?';
                        params.push(jtlSupplierId);
                    }
                    query = "\n        SELECT \n          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, \n          o.supplierName, o.status, o.deliveryDate, o.supplierReference, \n          o.last_synced,\n          COUNT(DISTINCT p.id) as productCount,\n          COUNT(DISTINCT sr.id) as returnCount,\n          json_group_array(\n            CASE WHEN p.jtl_id IS NOT NULL THEN\n              json_object(\n                'id', COALESCE(p.id, 0),\n                'jtl_id', p.jtl_id,\n                'jtl_article_id', p.jtl_article_id,\n                'productName', p.productName,\n                'quantity', p.quantity,\n                'price', p.price,\n                'sku', p.sku\n              )\n            END\n          ) as products\n        FROM supplier_orders o\n        LEFT JOIN order_products p ON o.jtl_id = p.orderId\n        LEFT JOIN supplier_returns sr ON o.jtl_id = sr.orderId\n        WHERE ".concat(whereClause, "\n        GROUP BY o.jtl_id\n        ORDER BY o.orderDate DESC\n      ");
                    results = this.executeRawQuery(query, params);
                    return [2 /*return*/, results.map(function (row) { return ({
                            jtl_id: row.jtl_id,
                            orderNumber: row.orderNumber,
                            orderDate: row.orderDate,
                            jtl_supplier_id: row.jtl_supplier_id,
                            supplierName: row.supplierName,
                            status: row.status,
                            deliveryDate: row.deliveryDate,
                            supplierReference: row.supplierReference,
                            last_synced: row.last_synced,
                            products: row.products ? JSON.parse(row.products).filter(function (p) { return p !== null; }) : [],
                            notes: [],
                            documents: [],
                            productCount: row.productCount || 0,
                            returnCount: row.returnCount || 0
                        }); })];
                }
                catch (error) {
                    console.error('Error in getOrdersBySupplier:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get orders needing sync (not synced in last 24 hours)
     */
    OrderRepository.prototype.getOrdersNeedingSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            return __generator(this, function (_a) {
                try {
                    query = "\n        SELECT \n          o.jtl_id, o.orderNumber, o.orderDate, o.jtl_supplier_id, \n          o.supplierName, o.status, o.deliveryDate, o.supplierReference, \n          o.last_synced\n        FROM supplier_orders o\n        WHERE \n          o.last_synced IS NULL OR \n          o.last_synced < datetime('now', '-24 hours')\n        ORDER BY o.last_synced ASC NULLS FIRST\n      ";
                    results = this.executeRawQuery(query);
                    return [2 /*return*/, results.map(function (row) { return ({
                            jtl_id: row.jtl_id,
                            orderNumber: row.orderNumber,
                            orderDate: row.orderDate,
                            jtl_supplier_id: row.jtl_supplier_id,
                            supplierName: row.supplierName,
                            status: row.status,
                            deliveryDate: row.deliveryDate,
                            supplierReference: row.supplierReference,
                            last_synced: row.last_synced,
                            products: [],
                            notes: [],
                            documents: []
                        }); })];
                }
                catch (error) {
                    console.error('Error in getOrdersNeedingSync:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Transform TypeORM entity to shared type
     */
    OrderRepository.prototype.entityToDTO = function (entity) {
        var _a;
        return {
            jtl_id: entity.jtlId || 0,
            orderNumber: entity.orderNumber,
            orderDate: entity.orderDate,
            jtl_supplier_id: entity.jtlSupplierId || 0,
            supplierName: entity.supplierName,
            status: entity.status,
            deliveryDate: entity.deliveryDate,
            supplierReference: entity.supplierReference,
            last_synced: ((_a = entity.lastSynced) === null || _a === void 0 ? void 0 : _a.toISOString()) || '',
            products: (entity.products || []).map(function (p) { return ({
                id: p.id || 0,
                jtl_id: p.jtlId || 0,
                jtl_article_id: p.jtlArticleId || 0,
                productName: p.productName,
                quantity: p.quantity,
                price: p.price,
                sku: p.sku || ''
            }); }),
            notes: [],
            documents: []
        };
    };
    /**
     * Transform array of TypeORM entities to shared types
     */
    OrderRepository.prototype.entitiesToDTOs = function (entities) {
        var _this = this;
        return entities.map(function (entity) { return _this.entityToDTO(entity); });
    };
    return OrderRepository;
}(base_repository_1.BaseRepository));
exports.OrderRepository = OrderRepository;
