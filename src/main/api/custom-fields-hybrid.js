"use strict";
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
var express_1 = require("express");
var settingsDb = require("../database/settings");
var feature_flags_1 = require("../utils/feature-flags");
var repository_factory_1 = require("../database/repository-factory");
var router = (0, express_1.Router)();
// GET /custom-fields - Get all custom fields
router.get('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var customFieldRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    customFieldRepo = (0, repository_factory_1.getCustomFieldRepository)();
                                    return [4 /*yield*/, customFieldRepo.getAllCustomFields()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, function () { return settingsDb.getAllCustomFields(); }, 'get-all-custom-fields')];
            case 1:
                result = _a.sent();
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching custom fields:', error_1);
                res.status(500).json({ error: 'Failed to fetch custom fields' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /custom-fields/active - Get active custom fields only
router.get('/active', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var customFieldRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    customFieldRepo = (0, repository_factory_1.getCustomFieldRepository)();
                                    return [4 /*yield*/, customFieldRepo.getActiveCustomFields()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, function () { return settingsDb.getAllCustomFields().filter(function (field) { return field.isActive; }); }, 'get-active-custom-fields')];
            case 1:
                result = _a.sent();
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching active custom fields:', error_2);
                res.status(500).json({ error: 'Failed to fetch active custom fields' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /custom-fields/usage-stats - Get custom fields with usage statistics
router.get('/usage-stats', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var customFieldRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    customFieldRepo = (0, repository_factory_1.getCustomFieldRepository)();
                                    return [4 /*yield*/, customFieldRepo.getCustomFieldsWithUsageStats()];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, function () {
                        // Fallback: just return basic fields without usage stats
                        return settingsDb.getAllCustomFields().map(function (field) { return (__assign(__assign({}, field), { usageCount: 0 // Simplified fallback
                         })); });
                    }, 'get-custom-fields-usage-stats')];
            case 1:
                result = _a.sent();
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error fetching custom fields usage stats:', error_3);
                res.status(500).json({ error: 'Failed to fetch custom fields usage stats' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /custom-fields/:id - Get custom field by ID
router.get('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var customFieldRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    customFieldRepo = (0, repository_factory_1.getCustomFieldRepository)();
                                    return [4 /*yield*/, customFieldRepo.getCustomFieldById(req.params.id)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, function () { return settingsDb.getCustomFieldById(req.params.id); }, 'get-custom-field-by-id')];
            case 1:
                result = _a.sent();
                if (!result) {
                    return [2 /*return*/, res.status(404).json({ error: 'Custom field not found' })];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error fetching custom field:', error_4);
                res.status(500).json({ error: 'Failed to fetch custom field' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// POST /custom-fields - Create new custom field
router.post('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var field_1, result, error_5, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                field_1 = req.body;
                if (!field_1.key || !field_1.label || !field_1.type) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required custom field data' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var customFieldRepo, id;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    customFieldRepo = (0, repository_factory_1.getCustomFieldRepository)();
                                    return [4 /*yield*/, customFieldRepo.createCustomField(field_1)];
                                case 1:
                                    id = _a.sent();
                                    return [4 /*yield*/, customFieldRepo.getCustomFieldById(id)];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, function () {
                        var id = settingsDb.createCustomField(field_1);
                        return settingsDb.getCustomFieldById(id);
                    }, 'create-custom-field')];
            case 2:
                result = _a.sent();
                res.status(201).json({ data: result });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                if (error_5.message.includes('already exists')) {
                    return [2 /*return*/, res.status(409).json({ error: error_5.message })];
                }
                throw error_5;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_6 = _a.sent();
                console.error('Error creating custom field:', error_6);
                res.status(500).json({ error: 'Failed to create custom field' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); }));
// PUT /custom-fields/:id - Update custom field
router.put('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var updates_1, result, error_7, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                updates_1 = req.body;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var customFieldRepo, isUpdated;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    customFieldRepo = (0, repository_factory_1.getCustomFieldRepository)();
                                    return [4 /*yield*/, customFieldRepo.updateCustomField(req.params.id, updates_1)];
                                case 1:
                                    isUpdated = _a.sent();
                                    if (!isUpdated) {
                                        return [2 /*return*/, null];
                                    }
                                    return [4 /*yield*/, customFieldRepo.getCustomFieldById(req.params.id)];
                                case 2: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, function () {
                        var isUpdated = settingsDb.updateCustomField(req.params.id, updates_1);
                        if (!isUpdated) {
                            return null;
                        }
                        return settingsDb.getCustomFieldById(req.params.id);
                    }, 'update-custom-field')];
            case 2:
                result = _a.sent();
                if (!result) {
                    return [2 /*return*/, res.status(404).json({ error: 'Custom field not found' })];
                }
                res.json({ data: result });
                return [3 /*break*/, 4];
            case 3:
                error_7 = _a.sent();
                if (error_7.message.includes('already exists')) {
                    return [2 /*return*/, res.status(409).json({ error: error_7.message })];
                }
                throw error_7;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_8 = _a.sent();
                console.error('Error updating custom field:', error_8);
                res.status(500).json({ error: 'Failed to update custom field' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); }));
// DELETE /custom-fields/:id - Delete custom field
router.delete('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_9, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var customFieldRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    customFieldRepo = (0, repository_factory_1.getCustomFieldRepository)();
                                    return [4 /*yield*/, customFieldRepo.deleteCustomField(req.params.id)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, function () { return settingsDb.deleteCustomField(req.params.id); }, 'delete-custom-field')];
            case 2:
                result = _a.sent();
                if (!result) {
                    return [2 /*return*/, res.status(404).json({ error: 'Custom field not found' })];
                }
                res.status(204).send();
                return [3 /*break*/, 4];
            case 3:
                error_9 = _a.sent();
                if (error_9.message.includes('used in workflow steps')) {
                    return [2 /*return*/, res.status(409).json({ error: error_9.message })];
                }
                throw error_9;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_10 = _a.sent();
                console.error('Error deleting custom field:', error_10);
                res.status(500).json({ error: 'Failed to delete custom field' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); }));
exports.default = router;
