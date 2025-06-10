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
exports.SupplierRepository = void 0;
var base_repository_1 = require("./base-repository");
var Supplier_1 = require("../entities/jtl/Supplier");
/**
 * Repository for Supplier entity with hybrid approach
 * Extends JTL sync capabilities with additional business logic
 */
var SupplierRepository = /** @class */ (function (_super) {
    __extends(SupplierRepository, _super);
    function SupplierRepository() {
        return _super.call(this, Supplier_1.Supplier) || this;
    }
    /**
     * Get all suppliers with optional filtering
     */
    SupplierRepository.prototype.getAllSuppliers = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var whereConditions, params, query, results;
            return __generator(this, function (_a) {
                try {
                    whereConditions = ['1=1'];
                    params = [];
                    if (filters === null || filters === void 0 ? void 0 : filters.companyName) {
                        whereConditions.push('company_name LIKE ?');
                        params.push("%".concat(filters.companyName, "%"));
                    }
                    query = "\n        SELECT \n          jtl_id, supplier_number, company_name, company_addition, \n          contact, phone, phone_direct, fax, email, city, country, \n          postal_code, street, customer_number, notes, last_synced\n        FROM suppliers \n        WHERE ".concat(whereConditions.join(' AND '), "\n        ORDER BY company_name ASC\n      ");
                    results = this.executeRawQuery(query, params);
                    // Transform to shared types format
                    return [2 /*return*/, results.map(function (row) { return ({
                            jtl_id: row.jtl_id,
                            supplier_number: row.supplier_number,
                            company_name: row.company_name,
                            company_addition: row.company_addition,
                            contact: row.contact,
                            phone: row.phone,
                            phone_direct: row.phone_direct,
                            fax: row.fax,
                            email: row.email,
                            city: row.city,
                            country: row.country,
                            postal_code: row.postal_code,
                            street: row.street,
                            customer_number: row.customer_number,
                            notes: row.notes,
                            last_synced: row.last_synced
                        }); })];
                }
                catch (error) {
                    console.error('Error in getAllSuppliers:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get supplier by JTL ID
     */
    SupplierRepository.prototype.getSupplierByJtlId = function (jtlId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, results, row;
            return __generator(this, function (_a) {
                try {
                    query = "\n        SELECT \n          jtl_id, supplier_number, company_name, company_addition,\n          contact, phone, phone_direct, fax, email, city, country,\n          postal_code, street, customer_number, notes, last_synced\n        FROM suppliers \n        WHERE jtl_id = ?\n      ";
                    results = this.executeRawQuery(query, [jtlId]);
                    if (results.length === 0) {
                        return [2 /*return*/, null];
                    }
                    row = results[0];
                    return [2 /*return*/, {
                            jtl_id: row.jtl_id,
                            supplier_number: row.supplier_number,
                            company_name: row.company_name,
                            company_addition: row.company_addition,
                            contact: row.contact,
                            phone: row.phone,
                            phone_direct: row.phone_direct,
                            fax: row.fax,
                            email: row.email,
                            city: row.city,
                            country: row.country,
                            postal_code: row.postal_code,
                            street: row.street,
                            customer_number: row.customer_number,
                            notes: row.notes,
                            last_synced: row.last_synced
                        }];
                }
                catch (error) {
                    console.error('Error in getSupplierByJtlId:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get supplier by supplier number
     */
    SupplierRepository.prototype.getSupplierByNumber = function (supplierNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var query, results, row;
            return __generator(this, function (_a) {
                try {
                    query = "\n        SELECT \n          jtl_id, supplier_number, company_name, company_addition,\n          contact, phone, phone_direct, fax, email, city, country,\n          postal_code, street, customer_number, notes, last_synced\n        FROM suppliers \n        WHERE supplier_number = ?\n      ";
                    results = this.executeRawQuery(query, [supplierNumber]);
                    if (results.length === 0) {
                        return [2 /*return*/, null];
                    }
                    row = results[0];
                    return [2 /*return*/, {
                            jtl_id: row.jtl_id,
                            supplier_number: row.supplier_number,
                            company_name: row.company_name,
                            company_addition: row.company_addition,
                            contact: row.contact,
                            phone: row.phone,
                            phone_direct: row.phone_direct,
                            fax: row.fax,
                            email: row.email,
                            city: row.city,
                            country: row.country,
                            postal_code: row.postal_code,
                            street: row.street,
                            customer_number: row.customer_number,
                            notes: row.notes,
                            last_synced: row.last_synced
                        }];
                }
                catch (error) {
                    console.error('Error in getSupplierByNumber:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Search suppliers with TypeORM query builder
     */
    SupplierRepository.prototype.searchSuppliers = function (searchTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPattern, query, results;
            return __generator(this, function (_a) {
                try {
                    searchPattern = "%".concat(searchTerm, "%");
                    query = "\n        SELECT \n          jtl_id, supplier_number, company_name, company_addition,\n          contact, phone, phone_direct, fax, email, city, country,\n          postal_code, street, customer_number, notes, last_synced\n        FROM suppliers\n        WHERE \n          company_name LIKE ? OR\n          supplier_number LIKE ? OR\n          contact LIKE ? OR\n          email LIKE ? OR\n          city LIKE ?\n        ORDER BY \n          CASE \n            WHEN company_name LIKE ? THEN 1\n            WHEN supplier_number LIKE ? THEN 2\n            ELSE 3\n          END,\n          company_name ASC\n        LIMIT 50\n      ";
                    results = this.executeRawQuery(query, [
                        searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
                        searchPattern, searchPattern
                    ]);
                    return [2 /*return*/, results.map(function (row) { return ({
                            jtl_id: row.jtl_id,
                            supplier_number: row.supplier_number,
                            company_name: row.company_name,
                            company_addition: row.company_addition,
                            contact: row.contact,
                            phone: row.phone,
                            phone_direct: row.phone_direct,
                            fax: row.fax,
                            email: row.email,
                            city: row.city,
                            country: row.country,
                            postal_code: row.postal_code,
                            street: row.street,
                            customer_number: row.customer_number,
                            notes: row.notes,
                            last_synced: row.last_synced
                        }); })];
                }
                catch (error) {
                    console.error('Error in searchSuppliers:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get supplier statistics and metrics
     */
    SupplierRepository.prototype.getSupplierStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results, row;
            return __generator(this, function (_a) {
                try {
                    query = "\n        SELECT \n          COUNT(DISTINCT s.jtl_id) as totalSuppliers,\n          COUNT(DISTINCT CASE WHEN so.id IS NOT NULL THEN s.jtl_id END) as suppliersWithOrders,\n          COUNT(DISTINCT CASE WHEN sr.id IS NOT NULL THEN s.jtl_id END) as suppliersWithReturns,\n          COUNT(DISTINCT CASE WHEN s.last_synced > datetime('now', '-7 days') THEN s.jtl_id END) as recentlyUpdated\n        FROM suppliers s\n        LEFT JOIN supplier_orders so ON s.jtl_id = so.jtl_supplier_id\n        LEFT JOIN supplier_returns sr ON so.id = sr.orderId\n      ";
                    results = this.executeRawQuery(query);
                    if (results.length > 0) {
                        row = results[0];
                        return [2 /*return*/, {
                                totalSuppliers: row.totalSuppliers || 0,
                                suppliersWithOrders: row.suppliersWithOrders || 0,
                                suppliersWithReturns: row.suppliersWithReturns || 0,
                                recentlyUpdated: row.recentlyUpdated || 0
                            }];
                    }
                    return [2 /*return*/, {
                            totalSuppliers: 0,
                            suppliersWithOrders: 0,
                            suppliersWithReturns: 0,
                            recentlyUpdated: 0
                        }];
                }
                catch (error) {
                    console.error('Error in getSupplierStatistics:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get suppliers with their order summary
     */
    SupplierRepository.prototype.getSuppliersWithOrderSummary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            return __generator(this, function (_a) {
                try {
                    query = "\n        SELECT \n          s.jtl_id, s.supplier_number, s.company_name, s.company_addition,\n          s.contact, s.phone, s.phone_direct, s.fax, s.email, s.city, \n          s.country, s.postal_code, s.street, s.customer_number, \n          s.notes, s.last_synced,\n          COUNT(DISTINCT so.id) as orderCount,\n          COUNT(DISTINCT sr.id) as returnCount,\n          MAX(so.order_date) as lastOrderDate\n        FROM suppliers s\n        LEFT JOIN supplier_orders so ON s.jtl_id = so.jtl_supplier_id\n        LEFT JOIN supplier_returns sr ON so.id = sr.orderId\n        GROUP BY s.jtl_id\n        ORDER BY s.company_name ASC\n      ";
                    results = this.executeRawQuery(query);
                    return [2 /*return*/, results.map(function (row) { return ({
                            jtl_id: row.jtl_id,
                            supplier_number: row.supplier_number,
                            company_name: row.company_name,
                            company_addition: row.company_addition,
                            contact: row.contact,
                            phone: row.phone,
                            phone_direct: row.phone_direct,
                            fax: row.fax,
                            email: row.email,
                            city: row.city,
                            country: row.country,
                            postal_code: row.postal_code,
                            street: row.street,
                            customer_number: row.customer_number,
                            notes: row.notes,
                            last_synced: row.last_synced,
                            orderCount: row.orderCount || 0,
                            returnCount: row.returnCount || 0,
                            lastOrderDate: row.lastOrderDate
                        }); })];
                }
                catch (error) {
                    console.error('Error in getSuppliersWithOrderSummary:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get suppliers needing sync (not synced in last 24 hours)
     */
    SupplierRepository.prototype.getSuppliersNeedingSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            return __generator(this, function (_a) {
                try {
                    query = "\n        SELECT \n          jtl_id, supplier_number, company_name, company_addition,\n          contact, phone, phone_direct, fax, email, city, country,\n          postal_code, street, customer_number, notes, last_synced\n        FROM suppliers\n        WHERE \n          last_synced IS NULL OR \n          last_synced < datetime('now', '-24 hours')\n        ORDER BY last_synced ASC NULLS FIRST\n      ";
                    results = this.executeRawQuery(query);
                    return [2 /*return*/, results.map(function (row) { return ({
                            jtl_id: row.jtl_id,
                            supplier_number: row.supplier_number,
                            company_name: row.company_name,
                            company_addition: row.company_addition,
                            contact: row.contact,
                            phone: row.phone,
                            phone_direct: row.phone_direct,
                            fax: row.fax,
                            email: row.email,
                            city: row.city,
                            country: row.country,
                            postal_code: row.postal_code,
                            street: row.street,
                            customer_number: row.customer_number,
                            notes: row.notes,
                            last_synced: row.last_synced
                        }); })];
                }
                catch (error) {
                    console.error('Error in getSuppliersNeedingSync:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Transform TypeORM entity to shared type
     */
    SupplierRepository.prototype.entityToDTO = function (entity) {
        var _a;
        return {
            jtl_id: entity.jtlId || 0,
            supplier_number: entity.supplierNumber || '',
            company_name: entity.companyName || '',
            company_addition: entity.companyAddition || '',
            contact: entity.contact || '',
            phone: entity.phone || '',
            phone_direct: entity.phoneDirect || '',
            fax: entity.fax || '',
            email: entity.email || '',
            city: entity.city || '',
            country: entity.country || '',
            postal_code: entity.postalCode || '',
            street: entity.street || '',
            customer_number: entity.customerNumber || '',
            notes: entity.notes || '',
            last_synced: ((_a = entity.lastSynced) === null || _a === void 0 ? void 0 : _a.toISOString()) || ''
        };
    };
    /**
     * Transform array of TypeORM entities to shared types
     */
    SupplierRepository.prototype.entitiesToDTOs = function (entities) {
        var _this = this;
        return entities.map(function (entity) { return _this.entityToDTO(entity); });
    };
    return SupplierRepository;
}(base_repository_1.BaseRepository));
exports.SupplierRepository = SupplierRepository;
