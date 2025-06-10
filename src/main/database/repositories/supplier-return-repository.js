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
exports.SupplierReturnRepository = void 0;
var base_repository_1 = require("./base-repository");
var SupplierReturn_1 = require("../entities/core/SupplierReturn");
var ReturnProduct_1 = require("../entities/core/ReturnProduct");
var ReturnNote_1 = require("../entities/core/ReturnNote");
var ReturnDocument_1 = require("../entities/core/ReturnDocument");
var typeorm_1 = require("typeorm");
var SupplierReturnRepository = /** @class */ (function (_super) {
    __extends(SupplierReturnRepository, _super);
    function SupplierReturnRepository() {
        return _super.call(this, SupplierReturn_1.SupplierReturn) || this;
    }
    /**
     * Use TypeORM for simple queries with relations
     */
    SupplierReturnRepository.prototype.findByStatus = function (status) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAll({
                        where: { status: status },
                        relations: ['products', 'notes', 'documents', 'workflow'],
                        order: { createdAt: 'DESC' }
                    })];
            });
        });
    };
    /**
     * Use TypeORM for finding returns by workflow
     */
    SupplierReturnRepository.prototype.findByWorkflow = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAll({
                        where: { workflowId: workflowId },
                        relations: ['products', 'notes'],
                        order: { createdAt: 'DESC' }
                    })];
            });
        });
    };
    /**
     * Create return with products using TypeORM transactions
     */
    SupplierReturnRepository.prototype.createWithProducts = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var dataSource;
            var _this = this;
            return __generator(this, function (_a) {
                dataSource = this.typeormRepo.manager.connection;
                return [2 /*return*/, dataSource.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                        var returnEntity, savedReturn, products;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    returnEntity = manager.create(SupplierReturn_1.SupplierReturn, {
                                        orderNumber: data.orderNumber,
                                        status: data.status,
                                        followUpAction: data.followUpAction,
                                        workflowId: data.workflowId,
                                        customFields: data.customFields || {}
                                    });
                                    return [4 /*yield*/, manager.save(returnEntity)];
                                case 1:
                                    savedReturn = _a.sent();
                                    if (!(data.products && data.products.length > 0)) return [3 /*break*/, 3];
                                    products = data.products.map(function (product) {
                                        return manager.create(ReturnProduct_1.ReturnProduct, __assign(__assign({}, product), { returnId: savedReturn.id }));
                                    });
                                    return [4 /*yield*/, manager.save(products)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [2 /*return*/, savedReturn];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Use better-sqlite3 for complex aggregated queries
     * This matches the existing implementation's performance
     */
    SupplierReturnRepository.prototype.getReturnsWithAggregatedData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            var _this = this;
            return __generator(this, function (_a) {
                query = "\n      SELECT \n        r.*,\n        json_group_array(\n          CASE \n            WHEN p.id IS NOT NULL THEN \n              json_object(\n                'id', p.id,\n                'productName', p.productName,\n                'quantity', p.quantity,\n                'reason', p.reason,\n                'serialNumber', p.serialNumber\n              )\n            ELSE NULL\n          END\n        ) FILTER (WHERE p.id IS NOT NULL) as products,\n        json_group_array(\n          CASE \n            WHEN n.id IS NOT NULL THEN \n              json_object(\n                'id', n.id,\n                'content', n.content,\n                'author', n.author,\n                'createdAt', n.createdAt\n              )\n            ELSE NULL\n          END\n        ) FILTER (WHERE n.id IS NOT NULL) as notes,\n        json_group_array(\n          CASE \n            WHEN d.id IS NOT NULL THEN \n              json_object(\n                'id', d.id,\n                'fileName', d.fileName,\n                'fileType', d.fileType,\n                'fileSize', d.fileSize,\n                'uploadDate', d.uploadDate\n              )\n            ELSE NULL\n          END\n        ) FILTER (WHERE d.id IS NOT NULL) as documents\n      FROM supplier_returns r\n      LEFT JOIN return_products p ON r.id = p.returnId\n      LEFT JOIN return_notes n ON r.id = n.returnId\n      LEFT JOIN return_documents d ON r.id = d.returnId\n      GROUP BY r.id\n      ORDER BY r.createdAt DESC\n    ";
                results = this.executeRawQuery(query);
                // Parse JSON fields
                return [2 /*return*/, results.map(function (row) { return (__assign(__assign({}, row), { products: _this.parseJson(row.products, []), notes: _this.parseJson(row.notes, []), documents: _this.parseJson(row.documents, []), customFields: _this.parseJson(row.customFields, {}) })); })];
            });
        });
    };
    /**
     * Use better-sqlite3 for complex status update with validation
     */
    SupplierReturnRepository.prototype.updateStatusWithValidation = function (returnId, newStatus, requiredFields) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.executeTransaction(function () {
                    // Update status
                    _this.executeRawCommand('UPDATE supplier_returns SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, returnId]);
                    // Update custom fields if provided
                    if (requiredFields && Object.keys(requiredFields).length > 0) {
                        var currentReturn = _this.executeRawQuerySingle('SELECT customFields FROM supplier_returns WHERE id = ?', [returnId]);
                        if (currentReturn) {
                            var customFields = _this.parseJson(currentReturn.customFields, {});
                            var updatedFields = __assign(__assign({}, customFields), requiredFields);
                            _this.executeRawCommand('UPDATE supplier_returns SET customFields = ? WHERE id = ?', [_this.stringifyJson(updatedFields), returnId]);
                        }
                    }
                    // Add status change note
                    _this.executeRawCommand('INSERT INTO return_notes (returnId, content, author) VALUES (?, ?, ?)', [returnId, "Status changed to: ".concat(newStatus), 'System']);
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get return statistics using raw SQL for performance
     */
    SupplierReturnRepository.prototype.getStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalResult, byStatusResults, byActionResults;
            return __generator(this, function (_a) {
                totalResult = this.executeRawQuerySingle('SELECT COUNT(*) as count FROM supplier_returns');
                byStatusResults = this.executeRawQuery('SELECT status, COUNT(*) as count FROM supplier_returns GROUP BY status');
                byActionResults = this.executeRawQuery('SELECT followUpAction, COUNT(*) as count FROM supplier_returns GROUP BY followUpAction');
                return [2 /*return*/, {
                        totalReturns: (totalResult === null || totalResult === void 0 ? void 0 : totalResult.count) || 0,
                        byStatus: byStatusResults.reduce(function (acc, row) {
                            acc[row.status] = row.count;
                            return acc;
                        }, {}),
                        byFollowUpAction: byActionResults.reduce(function (acc, row) {
                            acc[row.followUpAction] = row.count;
                            return acc;
                        }, {})
                    }];
            });
        });
    };
    // ============================================
    // PHASE 1: Enhanced CRUD Operations
    // ============================================
    /**
     * Get all returns with optional filtering (TypeORM)
     */
    SupplierReturnRepository.prototype.getAllReturns = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var whereConditions;
            return __generator(this, function (_a) {
                whereConditions = {};
                if (filters === null || filters === void 0 ? void 0 : filters.status) {
                    whereConditions.status = Array.isArray(filters.status)
                        ? (0, typeorm_1.In)(filters.status)
                        : filters.status;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.followUpAction) {
                    whereConditions.followUpAction = Array.isArray(filters.followUpAction)
                        ? (0, typeorm_1.In)(filters.followUpAction)
                        : filters.followUpAction;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.orderNumber) {
                    whereConditions.orderNumber = filters.orderNumber;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.workflowId) {
                    whereConditions.workflowId = filters.workflowId;
                }
                return [2 /*return*/, this.findAll({
                        where: whereConditions,
                        relations: ['products', 'notes', 'documents'],
                        order: { createdAt: 'DESC' },
                        take: (filters === null || filters === void 0 ? void 0 : filters.limit) || 100,
                        skip: (filters === null || filters === void 0 ? void 0 : filters.offset) || 0
                    })];
            });
        });
    };
    /**
     * Get single return by ID with all relations (TypeORM)
     */
    SupplierReturnRepository.prototype.getReturnById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findOne({
                        where: { id: id },
                        relations: ['products', 'notes', 'documents', 'workflow']
                    })];
            });
        });
    };
    /**
     * Create a new return (TypeORM with transaction)
     */
    SupplierReturnRepository.prototype.createReturn = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var dataSource;
            var _this = this;
            return __generator(this, function (_a) {
                dataSource = this.typeormRepo.manager.connection;
                return [2 /*return*/, dataSource.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                        var returnEntity, savedReturn, products, creationNote;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    returnEntity = manager.create(SupplierReturn_1.SupplierReturn, {
                                        orderNumber: data.orderNumber,
                                        status: data.status,
                                        followUpAction: data.followUpAction,
                                        workflowId: data.workflowId,
                                        customFields: data.customFields || {}
                                    });
                                    return [4 /*yield*/, manager.save(returnEntity)];
                                case 1:
                                    savedReturn = _a.sent();
                                    if (!(data.products && data.products.length > 0)) return [3 /*break*/, 3];
                                    products = data.products.map(function (product) {
                                        return manager.create(ReturnProduct_1.ReturnProduct, __assign(__assign({}, product), { returnId: savedReturn.id }));
                                    });
                                    return [4 /*yield*/, manager.save(products)];
                                case 2:
                                    _a.sent();
                                    savedReturn.products = products;
                                    _a.label = 3;
                                case 3:
                                    creationNote = manager.create(ReturnNote_1.ReturnNote, {
                                        returnId: savedReturn.id,
                                        content: "Return created with status: ".concat(data.status),
                                        author: 'System'
                                    });
                                    return [4 /*yield*/, manager.save(creationNote)];
                                case 4:
                                    _a.sent();
                                    return [2 /*return*/, savedReturn];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Update return (TypeORM)
     */
    SupplierReturnRepository.prototype.updateReturn = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existingReturn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findById(id)];
                    case 1:
                        existingReturn = _a.sent();
                        if (!existingReturn) {
                            return [2 /*return*/, null];
                        }
                        // Merge custom fields
                        if (data.customFields) {
                            data.customFields = __assign(__assign({}, existingReturn.customFields), data.customFields);
                        }
                        return [4 /*yield*/, this.typeormRepo.update(id, data)];
                    case 2:
                        _a.sent();
                        // Return updated entity with relations
                        return [2 /*return*/, this.getReturnById(id)];
                }
            });
        });
    };
    /**
     * Delete return (TypeORM with cascade)
     */
    SupplierReturnRepository.prototype.deleteReturn = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.typeormRepo.delete(id)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affected ? result.affected > 0 : false];
                }
            });
        });
    };
    /**
     * Add note to return (TypeORM)
     */
    SupplierReturnRepository.prototype.addNote = function (returnId, noteData) {
        return __awaiter(this, void 0, void 0, function () {
            var noteRepo, note;
            return __generator(this, function (_a) {
                noteRepo = this.typeormRepo.manager.getRepository(ReturnNote_1.ReturnNote);
                note = noteRepo.create({
                    returnId: returnId,
                    content: noteData.content,
                    author: noteData.author
                });
                return [2 /*return*/, noteRepo.save(note)];
            });
        });
    };
    /**
     * Get notes for return (TypeORM)
     */
    SupplierReturnRepository.prototype.getReturnNotes = function (returnId) {
        return __awaiter(this, void 0, void 0, function () {
            var noteRepo;
            return __generator(this, function (_a) {
                noteRepo = this.typeormRepo.manager.getRepository(ReturnNote_1.ReturnNote);
                return [2 /*return*/, noteRepo.find({
                        where: { returnId: returnId },
                        order: { createdAt: 'DESC' }
                    })];
            });
        });
    };
    /**
     * Delete note (TypeORM)
     */
    SupplierReturnRepository.prototype.deleteNote = function (noteId) {
        return __awaiter(this, void 0, void 0, function () {
            var noteRepo, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        noteRepo = this.typeormRepo.manager.getRepository(ReturnNote_1.ReturnNote);
                        return [4 /*yield*/, noteRepo.delete(noteId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affected ? result.affected > 0 : false];
                }
            });
        });
    };
    /**
     * Get documents for return (TypeORM)
     */
    SupplierReturnRepository.prototype.getReturnDocuments = function (returnId) {
        return __awaiter(this, void 0, void 0, function () {
            var docRepo;
            return __generator(this, function (_a) {
                docRepo = this.typeormRepo.manager.getRepository(ReturnDocument_1.ReturnDocument);
                return [2 /*return*/, docRepo.find({
                        where: { returnId: returnId },
                        order: { uploadDate: 'DESC' }
                    })];
            });
        });
    };
    /**
     * Add document to return (TypeORM)
     */
    SupplierReturnRepository.prototype.addDocument = function (returnId, documentData) {
        return __awaiter(this, void 0, void 0, function () {
            var docRepo, document;
            return __generator(this, function (_a) {
                docRepo = this.typeormRepo.manager.getRepository(ReturnDocument_1.ReturnDocument);
                document = docRepo.create({
                    returnId: returnId,
                    fileName: documentData.fileName,
                    fileType: documentData.fileType,
                    fileSize: documentData.fileSize,
                    filePath: documentData.filePath,
                    description: documentData.description,
                    thumbnailPath: documentData.thumbnailPath
                });
                return [2 /*return*/, docRepo.save(document)];
            });
        });
    };
    /**
     * Delete document (TypeORM)
     */
    SupplierReturnRepository.prototype.deleteDocument = function (documentId) {
        return __awaiter(this, void 0, void 0, function () {
            var docRepo, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        docRepo = this.typeormRepo.manager.getRepository(ReturnDocument_1.ReturnDocument);
                        return [4 /*yield*/, docRepo.delete(documentId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affected ? result.affected > 0 : false];
                }
            });
        });
    };
    /**
     * Get returns count by filter (TypeORM)
     */
    SupplierReturnRepository.prototype.getReturnsCount = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var whereConditions;
            return __generator(this, function (_a) {
                whereConditions = {};
                if (filters === null || filters === void 0 ? void 0 : filters.status) {
                    whereConditions.status = Array.isArray(filters.status)
                        ? (0, typeorm_1.In)(filters.status)
                        : filters.status;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.followUpAction) {
                    whereConditions.followUpAction = Array.isArray(filters.followUpAction)
                        ? (0, typeorm_1.In)(filters.followUpAction)
                        : filters.followUpAction;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.orderNumber) {
                    whereConditions.orderNumber = filters.orderNumber;
                }
                if (filters === null || filters === void 0 ? void 0 : filters.workflowId) {
                    whereConditions.workflowId = filters.workflowId;
                }
                return [2 /*return*/, this.typeormRepo.count({ where: whereConditions })];
            });
        });
    };
    /**
     * Search returns by multiple criteria (TypeORM with QueryBuilder)
     */
    SupplierReturnRepository.prototype.searchReturns = function (searchTerm, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var queryBuilder;
            return __generator(this, function (_a) {
                queryBuilder = this.typeormRepo.createQueryBuilder('return')
                    .leftJoinAndSelect('return.products', 'products')
                    .leftJoinAndSelect('return.notes', 'notes')
                    .leftJoinAndSelect('return.documents', 'documents');
                // Add search conditions
                queryBuilder.where('(return.orderNumber LIKE :search OR return.status LIKE :search OR return.creditNoteNumber LIKE :search)', { search: "%".concat(searchTerm, "%") });
                // Add filters
                if (filters === null || filters === void 0 ? void 0 : filters.status) {
                    if (Array.isArray(filters.status)) {
                        queryBuilder.andWhere('return.status IN (:...statuses)', { statuses: filters.status });
                    }
                    else {
                        queryBuilder.andWhere('return.status = :status', { status: filters.status });
                    }
                }
                if (filters === null || filters === void 0 ? void 0 : filters.followUpAction) {
                    if (Array.isArray(filters.followUpAction)) {
                        queryBuilder.andWhere('return.followUpAction IN (:...actions)', { actions: filters.followUpAction });
                    }
                    else {
                        queryBuilder.andWhere('return.followUpAction = :action', { action: filters.followUpAction });
                    }
                }
                // Add ordering and pagination
                queryBuilder.orderBy('return.createdAt', 'DESC');
                if (filters === null || filters === void 0 ? void 0 : filters.limit) {
                    queryBuilder.take(filters.limit);
                }
                if (filters === null || filters === void 0 ? void 0 : filters.offset) {
                    queryBuilder.skip(filters.offset);
                }
                return [2 /*return*/, queryBuilder.getMany()];
            });
        });
    };
    return SupplierReturnRepository;
}(base_repository_1.BaseRepository));
exports.SupplierReturnRepository = SupplierReturnRepository;
