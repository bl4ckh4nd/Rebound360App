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
exports.CustomFieldRepository = exports.ReasonRepository = exports.WorkflowRepository = exports.SettingsRepository = void 0;
var base_repository_1 = require("./base-repository");
var AppSetting_1 = require("../entities/settings/AppSetting");
var StatusWorkflow_1 = require("../entities/workflow/StatusWorkflow");
var StatusStep_1 = require("../entities/workflow/StatusStep");
var ReturnReason_1 = require("../entities/settings/ReturnReason");
var CustomField_1 = require("../entities/settings/CustomField");
var typeorm_config_1 = require("../typeorm-config");
var crypto = require("crypto");
/**
 * Repository for managing application settings
 * Uses TypeORM for simple operations and better-sqlite3 for encrypted settings
 */
var SettingsRepository = /** @class */ (function (_super) {
    __extends(SettingsRepository, _super);
    function SettingsRepository() {
        return _super.call(this, AppSetting_1.AppSetting) || this;
    }
    /**
     * Get setting value by key
     */
    SettingsRepository.prototype.getSetting = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var setting;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({ where: { key: key } })];
                    case 1:
                        setting = _a.sent();
                        return [2 /*return*/, (setting === null || setting === void 0 ? void 0 : setting.value) || null];
                }
            });
        });
    };
    /**
     * Set or update a setting
     */
    SettingsRepository.prototype.setSetting = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne({ where: { key: key } })];
                    case 1:
                        existing = _a.sent();
                        if (!existing) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.update(key, { value: value })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.save({ key: key, value: value })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get database credentials (decrypted)
     * Uses better-sqlite3 for direct access to encrypted data
     */
    SettingsRepository.prototype.getDatabaseCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = this.executeRawQuerySingle('SELECT value FROM app_settings WHERE key = ?', ['jtl_database']);
                if (!result)
                    return [2 /*return*/, null];
                try {
                    return [2 /*return*/, JSON.parse(result.value)];
                }
                catch (_b) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get all settings as key-value pairs
     */
    SettingsRepository.prototype.getAllSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findAll()];
                    case 1:
                        settings = _a.sent();
                        return [2 /*return*/, settings.reduce(function (acc, setting) {
                                acc[setting.key] = setting.value;
                                return acc;
                            }, {})];
                }
            });
        });
    };
    return SettingsRepository;
}(base_repository_1.BaseRepository));
exports.SettingsRepository = SettingsRepository;
/**
 * Repository for workflow management with complex queries
 */
var WorkflowRepository = /** @class */ (function (_super) {
    __extends(WorkflowRepository, _super);
    function WorkflowRepository() {
        return _super.call(this, StatusWorkflow_1.StatusWorkflow) || this;
    }
    /**
     * Get workflow with steps using TypeORM relations
     */
    WorkflowRepository.prototype.getWorkflowWithSteps = function (workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findOne({
                        where: { id: workflowId },
                        relations: ['steps'],
                        order: {
                            steps: {
                                orderIndex: 'ASC'
                            }
                        }
                    })];
            });
        });
    };
    /**
     * Get default workflow for follow-up action
     */
    WorkflowRepository.prototype.getDefaultWorkflow = function (followUpAction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findOne({
                        where: {
                            followUpAction: followUpAction,
                            isDefault: true
                        },
                        relations: ['steps']
                    })];
            });
        });
    };
    /**
     * Create workflow with steps using TypeORM transaction
     */
    WorkflowRepository.prototype.createWorkflowWithSteps = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var dataSource;
            var _this = this;
            return __generator(this, function (_a) {
                dataSource = (0, typeorm_config_1.getDataSource)();
                return [2 /*return*/, dataSource.transaction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
                        var workflow, savedWorkflow, steps;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    workflow = manager.create(StatusWorkflow_1.StatusWorkflow, {
                                        id: crypto.randomUUID(),
                                        name: data.name,
                                        followUpAction: data.followUpAction,
                                        isDefault: data.isDefault || false,
                                        workflowType: data.workflowType || 'return'
                                    });
                                    return [4 /*yield*/, manager.save(workflow)];
                                case 1:
                                    savedWorkflow = _a.sent();
                                    if (!(data.steps && data.steps.length > 0)) return [3 /*break*/, 3];
                                    steps = data.steps.map(function (step) {
                                        return manager.create(StatusStep_1.StatusStep, __assign(__assign({ id: crypto.randomUUID() }, step), { workflowId: savedWorkflow.id }));
                                    });
                                    return [4 /*yield*/, manager.save(steps)];
                                case 2:
                                    _a.sent();
                                    savedWorkflow.steps = steps;
                                    _a.label = 3;
                                case 3: return [2 /*return*/, savedWorkflow];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Get all workflows grouped by follow-up action
     * Uses raw SQL for efficient grouping
     */
    WorkflowRepository.prototype.getWorkflowsGroupedByAction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results, workflows;
            return __generator(this, function (_a) {
                query = "\n      SELECT \n        w.*,\n        json_group_array(\n          json_object(\n            'id', s.id,\n            'name', s.name,\n            'description', s.description,\n            'color', s.color,\n            'orderIndex', s.order_index,\n            'requiredFields', s.required_fields\n          )\n        ) as steps\n      FROM status_workflows w\n      LEFT JOIN status_steps s ON w.id = s.workflow_id\n      GROUP BY w.id\n      ORDER BY w.follow_up_action, w.name\n    ";
                results = this.executeRawQuery(query);
                workflows = results.map(function (row) { return (__assign(__assign({}, row), { steps: JSON.parse(row.steps) })); });
                // Group by follow-up action
                return [2 /*return*/, workflows.reduce(function (acc, workflow) {
                        if (!acc[workflow.follow_up_action]) {
                            acc[workflow.follow_up_action] = [];
                        }
                        acc[workflow.follow_up_action].push(workflow);
                        return acc;
                    }, {})];
            });
        });
    };
    /**
     * Get workflow statistics by follow-up action
     * Public method for accessing raw query functionality
     */
    WorkflowRepository.prototype.getWorkflowStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = "\n      SELECT \n        w.follow_up_action,\n        COUNT(DISTINCT w.id) as workflow_count,\n        COUNT(DISTINCT s.id) as step_count,\n        AVG(s.order_index) as avg_steps_per_workflow\n      FROM status_workflows w\n      LEFT JOIN status_steps s ON w.id = s.workflow_id\n      GROUP BY w.follow_up_action\n      ORDER BY workflow_count DESC\n    ";
                return [2 /*return*/, this.executeRawQuery(query)];
            });
        });
    };
    /**
     * Execute raw query (public wrapper for protected method)
     * Use only for complex queries that TypeORM can't handle
     */
    WorkflowRepository.prototype.executeRawQuery = function (query, params) {
        if (params === void 0) { params = []; }
        return _super.prototype.executeRawQuery.call(this, query, params);
    };
    /**
     * Convert entity to DTO (removes TypeORM relations like 'returns')
     */
    WorkflowRepository.prototype.entityToDTO = function (entity) {
        var _a, _b, _c;
        return {
            id: entity.id,
            name: entity.name,
            followUpAction: entity.followUpAction,
            isDefault: entity.isDefault,
            workflowType: entity.workflowType,
            steps: ((_a = entity.steps) === null || _a === void 0 ? void 0 : _a.map(function (step) { return ({
                id: step.id,
                name: step.name,
                description: step.description,
                color: step.color,
                order: step.orderIndex, // Map orderIndex to order
                requiredFields: step.requiredFields || [],
                workflowId: step.workflowId
            }); })) || [],
            createdAt: (_b = entity.createdAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
            updatedAt: (_c = entity.updatedAt) === null || _c === void 0 ? void 0 : _c.toISOString()
        };
    };
    /**
     * Convert entities to DTOs
     */
    WorkflowRepository.prototype.entitiesToDTOs = function (entities) {
        var _this = this;
        return entities.map(function (entity) { return _this.entityToDTO(entity); });
    };
    return WorkflowRepository;
}(base_repository_1.BaseRepository));
exports.WorkflowRepository = WorkflowRepository;
/**
 * Repository for reason management
 */
var ReasonRepository = /** @class */ (function (_super) {
    __extends(ReasonRepository, _super);
    function ReasonRepository() {
        return _super.call(this, ReturnReason_1.ReturnReason) || this;
    }
    /**
     * Get reasons by category with TypeORM
     */
    ReasonRepository.prototype.getReasonsByCategory = function (categoryId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAll({
                        where: { categoryId: categoryId, isActive: true },
                        relations: ['category']
                    })];
            });
        });
    };
    /**
     * Get reasons applicable for specific follow-up actions
     * Uses JSON querying for flexible filtering
     */
    ReasonRepository.prototype.getReasonsForActions = function (actions) {
        return __awaiter(this, void 0, void 0, function () {
            var placeholders, query, results;
            return __generator(this, function (_a) {
                placeholders = actions.map(function () { return '?'; }).join(',');
                query = "\n      SELECT r.*, c.name as categoryName\n      FROM return_reasons r\n      LEFT JOIN reason_categories c ON r.category_id = c.id\n      WHERE r.is_active = 1\n      AND EXISTS (\n        SELECT 1 FROM json_each(r.applicable_actions) \n        WHERE json_each.value IN (".concat(placeholders, ")\n      )\n      ORDER BY c.order_index, r.name\n    ");
                results = this.executeRawQuery(query, actions);
                return [2 /*return*/, results.map(function (row) { return (__assign(__assign({}, row), { applicableActions: JSON.parse(row.applicable_actions || '[]') })); })];
            });
        });
    };
    /**
     * Get all reasons grouped by category
     */
    ReasonRepository.prototype.getReasonsGroupedByCategory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            return __generator(this, function (_a) {
                query = "\n      SELECT \n        c.id as categoryId,\n        c.name as categoryName,\n        c.order_index as categoryOrder,\n        json_group_array(\n          CASE WHEN r.id IS NOT NULL THEN\n            json_object(\n              'id', r.id,\n              'code', r.code,\n              'name', r.name,\n              'description', r.description,\n              'isActive', r.is_active,\n              'applicableActions', r.applicable_actions\n            )\n          END\n        ) FILTER (WHERE r.id IS NOT NULL) as reasons\n      FROM reason_categories c\n      LEFT JOIN return_reasons r ON c.id = r.category_id\n      GROUP BY c.id\n      ORDER BY c.order_index\n    ";
                results = this.executeRawQuery(query);
                return [2 /*return*/, results.reduce(function (acc, row) {
                        acc[row.categoryName] = JSON.parse(row.reasons).map(function (reason) { return (__assign(__assign({}, reason), { applicableActions: JSON.parse(reason.applicableActions || '[]') })); });
                        return acc;
                    }, {})];
            });
        });
    };
    return ReasonRepository;
}(base_repository_1.BaseRepository));
exports.ReasonRepository = ReasonRepository;
/**
 * Repository for custom fields
 */
var CustomFieldRepository = /** @class */ (function (_super) {
    __extends(CustomFieldRepository, _super);
    function CustomFieldRepository() {
        return _super.call(this, CustomField_1.CustomField) || this;
    }
    /**
     * Get custom fields by entity type
     */
    CustomFieldRepository.prototype.getFieldsByEntityType = function () {
        return __awaiter(this, arguments, void 0, function (entityType) {
            if (entityType === void 0) { entityType = 'return'; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAll({
                        where: { entityType: entityType },
                        order: { label: 'ASC' }
                    })];
            });
        });
    };
    /**
     * Get required fields for entity type
     */
    CustomFieldRepository.prototype.getRequiredFields = function () {
        return __awaiter(this, arguments, void 0, function (entityType) {
            if (entityType === void 0) { entityType = 'return'; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAll({
                        where: {
                            entityType: entityType,
                            required: true
                        }
                    })];
            });
        });
    };
    /**
     * Validate field values against definitions
     */
    CustomFieldRepository.prototype.validateFieldValues = function (values_1) {
        return __awaiter(this, arguments, void 0, function (values, entityType) {
            var fields, errors, _i, fields_1, field, value, options;
            if (entityType === void 0) { entityType = 'return'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFieldsByEntityType(entityType)];
                    case 1:
                        fields = _a.sent();
                        errors = [];
                        for (_i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                            field = fields_1[_i];
                            value = values[field.key];
                            // Check required fields
                            if (field.required && (value === undefined || value === null || value === '')) {
                                errors.push("".concat(field.label, " is required"));
                                continue;
                            }
                            // Type validation
                            if (value !== undefined && value !== null) {
                                switch (field.type) {
                                    case 'number':
                                        if (typeof value !== 'number' && isNaN(Number(value))) {
                                            errors.push("".concat(field.label, " must be a number"));
                                        }
                                        break;
                                    case 'date':
                                        if (isNaN(Date.parse(value))) {
                                            errors.push("".concat(field.label, " must be a valid date"));
                                        }
                                        break;
                                    case 'select':
                                        options = field.options || [];
                                        if (options.length > 0 && !options.includes(value)) {
                                            errors.push("".concat(field.label, " must be one of: ").concat(options.join(', ')));
                                        }
                                        break;
                                }
                            }
                        }
                        return [2 /*return*/, {
                                valid: errors.length === 0,
                                errors: errors
                            }];
                }
            });
        });
    };
    return CustomFieldRepository;
}(base_repository_1.BaseRepository));
exports.CustomFieldRepository = CustomFieldRepository;
