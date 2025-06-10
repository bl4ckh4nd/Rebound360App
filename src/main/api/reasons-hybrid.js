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
var express_1 = require("express");
var settingsDb = require("../database/settings");
var repositories_1 = require("../database/repositories");
var feature_flags_1 = require("../utils/feature-flags");
/**
 * Hybrid reasons API that can use TypeORM or fallback to better-sqlite3
 * Handles reason categories and return reasons management
 */
var router = (0, express_1.Router)();
// GET /reason-categories - List all reason categories
router.get('/reason-categories', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, method, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo, grouped;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    return [4 /*yield*/, reasonRepo.getReasonsGroupedByCategory()];
                                case 1:
                                    grouped = _a.sent();
                                    // Transform to match legacy format
                                    return [2 /*return*/, Object.entries(grouped).map(function (_a) {
                                            var categoryName = _a[0], reasons = _a[1];
                                            var firstReason = reasons[0];
                                            return {
                                                id: (firstReason === null || firstReason === void 0 ? void 0 : firstReason.categoryId) || categoryName,
                                                name: categoryName,
                                                order: 0, // Could be enhanced to get from category
                                                reasons: reasons
                                            };
                                        })];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.getAllCategories(); }, 'get-all-reason-categories')];
            case 1:
                result = _a.sent();
                if ((0, feature_flags_1.enablePerformanceLogging)()) {
                    method = (0, feature_flags_1.useTypeORMForReasons)() ? 'TypeORM' : 'better-sqlite3';
                    console.log("\uD83D\uDCCA Reason categories fetched using ".concat(method));
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching reason categories:', error_1);
                res.status(500).json({ error: 'Failed to fetch reason categories' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /reason-categories/:id - Get specific reason category
router.get('/reason-categories/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_1, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_1 = req.params.id;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var categoryRepo, category;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    categoryRepo = (0, repositories_1.getReasonCategoryRepositoryTypeORM)();
                                    return [4 /*yield*/, categoryRepo.findOne({
                                            where: { id: id_1 },
                                            relations: ['reasons']
                                        })];
                                case 1:
                                    category = _a.sent();
                                    if (!category)
                                        return [2 /*return*/, null];
                                    return [2 /*return*/, {
                                            id: category.id,
                                            name: category.name,
                                            description: category.description,
                                            order: category.orderIndex,
                                            reasons: category.reasons || []
                                        }];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.getCategoryById(id_1); }, 'get-reason-category-by-id')];
            case 1:
                result = _a.sent();
                if (!result) {
                    res.status(404).json({ error: 'Category not found' });
                    return [2 /*return*/];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching category:', error_2);
                res.status(500).json({ error: 'Failed to fetch category' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// POST /reason-categories - Create new reason category
router.post('/reason-categories', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category_1, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                category_1 = req.body;
                if (!category_1.name) {
                    res.status(400).json({ error: 'Missing required category data' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var categoryRepo, created;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    categoryRepo = (0, repositories_1.getReasonCategoryRepositoryTypeORM)();
                                    return [4 /*yield*/, categoryRepo.save({
                                            id: "category_".concat(Date.now()), // Generate ID
                                            name: category_1.name,
                                            description: category_1.description,
                                            orderIndex: category_1.order || 0
                                        })];
                                case 1:
                                    created = _c.sent();
                                    // Transform to match types.ts interface
                                    return [2 /*return*/, {
                                            id: created.id,
                                            name: created.name,
                                            description: created.description,
                                            order: created.orderIndex,
                                            createdAt: (_a = created.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                                            updatedAt: (_b = created.updatedAt) === null || _b === void 0 ? void 0 : _b.toISOString()
                                        }];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () {
                        var id = settingsDb.createCategory(category_1);
                        return settingsDb.getCategoryById(id);
                    }, 'create-reason-category')];
            case 1:
                result = _a.sent();
                res.status(201).json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error creating category:', error_3);
                res.status(500).json({ error: 'Failed to create category' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// PUT /reason-categories/:id - Update reason category
router.put('/reason-categories/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_2, updates_1, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_2 = req.params.id;
                updates_1 = req.body;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var categoryRepo, updated;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    categoryRepo = (0, repositories_1.getReasonCategoryRepositoryTypeORM)();
                                    return [4 /*yield*/, categoryRepo.update(id_2, updates_1)];
                                case 1:
                                    _c.sent();
                                    return [4 /*yield*/, categoryRepo.findOne({ where: { id: id_2 } })];
                                case 2:
                                    updated = _c.sent();
                                    if (!updated)
                                        return [2 /*return*/, null];
                                    // Transform to match types.ts interface
                                    return [2 /*return*/, {
                                            id: updated.id,
                                            name: updated.name,
                                            description: updated.description,
                                            order: updated.orderIndex,
                                            createdAt: (_a = updated.createdAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                                            updatedAt: (_b = updated.updatedAt) === null || _b === void 0 ? void 0 : _b.toISOString()
                                        }];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () {
                        var isUpdated = settingsDb.updateCategory(id_2, updates_1);
                        return isUpdated ? settingsDb.getCategoryById(id_2) : null;
                    }, 'update-reason-category')];
            case 1:
                result = _a.sent();
                if (!result) {
                    res.status(404).json({ error: 'Category not found' });
                    return [2 /*return*/];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error updating category:', error_4);
                res.status(500).json({ error: 'Failed to update category' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// DELETE /reason-categories/:id - Delete reason category
router.delete('/reason-categories/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_3, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_3 = req.params.id;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var categoryRepo, category;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    categoryRepo = (0, repositories_1.getReasonCategoryRepositoryTypeORM)();
                                    return [4 /*yield*/, categoryRepo.findOne({ where: { id: id_3 } })];
                                case 1:
                                    category = _a.sent();
                                    if (!category)
                                        return [2 /*return*/, false];
                                    return [4 /*yield*/, categoryRepo.delete(id_3)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, true];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.deleteCategory(id_3); }, 'delete-reason-category')];
            case 1:
                result = _a.sent();
                if (!result) {
                    res.status(404).json({ error: 'Category not found' });
                    return [2 /*return*/];
                }
                res.status(204).send();
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error deleting category:', error_5);
                res.status(500).json({ error: 'Failed to delete category' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /reasons - List all reasons
router.get('/reasons', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, method, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    return [4 /*yield*/, reasonRepo.findAll({
                                            relations: ['category'],
                                            order: { name: 'ASC' }
                                        })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.getAllReasons(); }, 'get-all-reasons')];
            case 1:
                result = _a.sent();
                if ((0, feature_flags_1.enablePerformanceLogging)()) {
                    method = (0, feature_flags_1.useTypeORMForReasons)() ? 'TypeORM' : 'better-sqlite3';
                    console.log("\uD83D\uDCCA Reasons fetched using ".concat(method, ", count: ").concat(result.length));
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error fetching return reasons:', error_6);
                res.status(500).json({ error: 'Failed to fetch return reasons' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /reasons/by-action/:action - Get reasons by follow-up action
router.get('/reasons/by-action/:action', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var action_1, result, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                action_1 = req.params.action;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    return [4 /*yield*/, reasonRepo.getReasonsForActions([action_1])];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.getReasonsByAction(action_1); }, 'get-reasons-by-action')];
            case 1:
                result = _a.sent();
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error fetching reasons by action:', error_7);
                res.status(500).json({ error: 'Failed to fetch reasons by action' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /reasons/:id - Get specific reason
router.get('/reasons/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_4, result, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_4 = req.params.id;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    return [4 /*yield*/, reasonRepo.findOne({
                                            where: { id: id_4 },
                                            relations: ['category']
                                        })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.getReasonById(id_4); }, 'get-reason-by-id')];
            case 1:
                result = _a.sent();
                if (!result) {
                    res.status(404).json({ error: 'Reason not found' });
                    return [2 /*return*/];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('Error fetching reason:', error_8);
                res.status(500).json({ error: 'Failed to fetch reason' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// POST /reasons - Create new reason
router.post('/reasons', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reason_1, result, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                reason_1 = req.body;
                if (!reason_1.name || !reason_1.categoryId || !reason_1.code) {
                    res.status(400).json({ error: 'Missing required reason data' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo, created;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    return [4 /*yield*/, reasonRepo.save({
                                            id: "reason_".concat(Date.now()), // Generate ID
                                            code: reason_1.code,
                                            name: reason_1.name,
                                            description: reason_1.description,
                                            categoryId: reason_1.categoryId,
                                            isActive: reason_1.isActive !== false,
                                            applicableActions: reason_1.applicableActions || []
                                        })];
                                case 1:
                                    created = _a.sent();
                                    return [2 /*return*/, created];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () {
                        var id = settingsDb.createReason(reason_1);
                        return settingsDb.getReasonById(id);
                    }, 'create-reason')];
            case 1:
                result = _a.sent();
                res.status(201).json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error creating reason:', error_9);
                res.status(500).json({ error: 'Failed to create reason' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// PUT /reasons/:id - Update reason
router.put('/reasons/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_5, updates_2, result, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_5 = req.params.id;
                updates_2 = req.body;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    return [4 /*yield*/, reasonRepo.update(id_5, updates_2)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, reasonRepo.findOne({
                                            where: { id: id_5 },
                                            relations: ['category']
                                        })];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () {
                        var isUpdated = settingsDb.updateReason(id_5, updates_2);
                        return isUpdated ? settingsDb.getReasonById(id_5) : null;
                    }, 'update-reason')];
            case 1:
                result = _a.sent();
                if (!result) {
                    res.status(404).json({ error: 'Reason not found' });
                    return [2 /*return*/];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                console.error('Error updating reason:', error_10);
                res.status(500).json({ error: 'Failed to update reason' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// DELETE /reasons/:id - Delete reason
router.delete('/reasons/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_6, result, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_6 = req.params.id;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo, reason;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    return [4 /*yield*/, reasonRepo.findOne({ where: { id: id_6 } })];
                                case 1:
                                    reason = _a.sent();
                                    if (!reason)
                                        return [2 /*return*/, false];
                                    return [4 /*yield*/, reasonRepo.delete(id_6)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, true];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.deleteReason(id_6); }, 'delete-reason')];
            case 1:
                result = _a.sent();
                if (!result) {
                    res.status(404).json({ error: 'Reason not found' });
                    return [2 /*return*/];
                }
                res.status(204).send();
                return [3 /*break*/, 3];
            case 2:
                error_11 = _a.sent();
                console.error('Error deleting reason:', error_11);
                res.status(500).json({ error: 'Failed to delete reason' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /reasons/grouped - Get reasons grouped by category (TypeORM-enhanced feature)
router.get('/reasons/grouped', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation with enhanced grouping
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    return [4 /*yield*/, reasonRepo.getReasonsGroupedByCategory()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, 
                    // Fallback to basic grouping
                    function () {
                        var categories = settingsDb.getAllCategories();
                        var reasons = settingsDb.getAllReasons();
                        return categories.reduce(function (acc, category) {
                            acc[category.name] = reasons.filter(function (reason) {
                                return reason.categoryId === category.id;
                            });
                            return acc;
                        }, {});
                    }, 'get-reasons-grouped')];
            case 1:
                result = _a.sent();
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_12 = _a.sent();
                console.error('Error fetching grouped reasons:', error_12);
                res.status(500).json({ error: 'Failed to fetch grouped reasons' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// Health check endpoint
router.get('/health', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM health check
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var reasonRepo, categoryRepo, categoriesCount, reasonsCount;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    reasonRepo = (0, repositories_1.getReasonRepository)();
                                    categoryRepo = (0, repositories_1.getReasonCategoryRepositoryTypeORM)();
                                    return [4 /*yield*/, categoryRepo.count()];
                                case 1:
                                    categoriesCount = _a.sent();
                                    return [4 /*yield*/, reasonRepo.count()];
                                case 2:
                                    reasonsCount = _a.sent();
                                    return [2 /*return*/, {
                                            status: 'healthy',
                                            implementation: 'typeorm',
                                            categoriesCount: categoriesCount,
                                            reasonsCount: reasonsCount,
                                            timestamp: new Date().toISOString()
                                        }];
                            }
                        });
                    }); }, 
                    // Fallback health check
                    function () {
                        var categories = settingsDb.getAllCategories();
                        var reasons = settingsDb.getAllReasons();
                        return {
                            status: 'healthy',
                            implementation: 'better-sqlite3',
                            categoriesCount: categories.length,
                            reasonsCount: reasons.length,
                            timestamp: new Date().toISOString()
                        };
                    }, 'reasons-health-check')];
            case 1:
                result = _a.sent();
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_13 = _a.sent();
                console.error('Error in reasons health check:', error_13);
                res.status(500).json({
                    data: {
                        status: 'unhealthy',
                        error: error_13 instanceof Error ? error_13.message : 'Unknown error',
                        timestamp: new Date().toISOString()
                    }
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
exports.default = router;
