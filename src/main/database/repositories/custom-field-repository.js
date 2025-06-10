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
exports.CustomFieldRepository = void 0;
var base_repository_1 = require("./base-repository");
var custom_field_entity_1 = require("../entities/custom-field.entity");
var CustomFieldRepository = /** @class */ (function (_super) {
    __extends(CustomFieldRepository, _super);
    function CustomFieldRepository() {
        return _super.call(this, custom_field_entity_1.CustomFieldEntity) || this;
    }
    /**
     * Get all custom fields ordered by sortOrder
     */
    CustomFieldRepository.prototype.getAllCustomFields = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entities;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.typeormRepo.find({
                            order: { sortOrder: 'ASC', createdAt: 'ASC' }
                        })];
                    case 1:
                        entities = _a.sent();
                        return [2 /*return*/, entities.map(this.entityToType)];
                }
            });
        });
    };
    /**
     * Get custom field by ID
     */
    CustomFieldRepository.prototype.getCustomFieldById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.typeormRepo.findOne({
                            where: { id: id }
                        })];
                    case 1:
                        entity = _a.sent();
                        return [2 /*return*/, entity ? this.entityToType(entity) : null];
                }
            });
        });
    };
    /**
     * Get custom field by key
     */
    CustomFieldRepository.prototype.getCustomFieldByKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.typeormRepo.findOne({
                            where: { key: key }
                        })];
                    case 1:
                        entity = _a.sent();
                        return [2 /*return*/, entity ? this.entityToType(entity) : null];
                }
            });
        });
    };
    /**
     * Create new custom field
     */
    CustomFieldRepository.prototype.createCustomField = function (field) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, entity, saved, savedEntity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCustomFieldByKey(field.key)];
                    case 1:
                        existing = _a.sent();
                        if (existing) {
                            throw new Error("Custom field with key '".concat(field.key, "' already exists"));
                        }
                        entity = this.typeormRepo.create({
                            key: field.key,
                            label: field.label,
                            type: field.type, // Type assertion for CustomFieldType compatibility
                            description: field.description,
                            required: field.required || false,
                            defaultValue: field.defaultValue,
                            options: field.options,
                            placeholder: field.placeholder,
                            isActive: field.isActive !== undefined ? field.isActive : true,
                            sortOrder: field.sortOrder || 0
                        });
                        return [4 /*yield*/, this.typeormRepo.save(entity)];
                    case 2:
                        saved = _a.sent();
                        savedEntity = Array.isArray(saved) ? saved[0] : saved;
                        return [2 /*return*/, savedEntity.id];
                }
            });
        });
    };
    /**
     * Update custom field
     */
    CustomFieldRepository.prototype.updateCustomField = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updateData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!updates.key) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getCustomFieldByKey(updates.key)];
                    case 1:
                        existing = _a.sent();
                        if (existing && existing.id !== id) {
                            throw new Error("Custom field with key '".concat(updates.key, "' already exists"));
                        }
                        _a.label = 2;
                    case 2:
                        updateData = {};
                        if (updates.key !== undefined)
                            updateData.key = updates.key;
                        if (updates.label !== undefined)
                            updateData.label = updates.label;
                        if (updates.type !== undefined)
                            updateData.type = updates.type;
                        if (updates.description !== undefined)
                            updateData.description = updates.description;
                        if (updates.required !== undefined)
                            updateData.required = updates.required;
                        if (updates.defaultValue !== undefined)
                            updateData.defaultValue = updates.defaultValue;
                        if (updates.options !== undefined)
                            updateData.options = updates.options;
                        if (updates.placeholder !== undefined)
                            updateData.placeholder = updates.placeholder;
                        if (updates.isActive !== undefined)
                            updateData.isActive = updates.isActive;
                        if (updates.sortOrder !== undefined)
                            updateData.sortOrder = updates.sortOrder;
                        return [4 /*yield*/, this.typeormRepo.update(id, updateData)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result.affected ? result.affected > 0 : false];
                }
            });
        });
    };
    /**
     * Delete custom field (with validation)
     */
    CustomFieldRepository.prototype.deleteCustomField = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var usageCheck, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        usageCheck = this.executeRawQuery("SELECT COUNT(*) as count FROM status_steps \n       WHERE json_extract(requiredFields, '$') LIKE '%\"' || ? || '\"%'", [id]);
                        if (usageCheck.length > 0 && usageCheck[0].count > 0) {
                            throw new Error('Cannot delete custom field: it is used in workflow steps');
                        }
                        return [4 /*yield*/, this.typeormRepo.delete(id)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affected ? result.affected > 0 : false];
                }
            });
        });
    };
    /**
     * Get active custom fields only
     */
    CustomFieldRepository.prototype.getActiveCustomFields = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entities;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.typeormRepo.find({
                            where: { isActive: true },
                            order: { sortOrder: 'ASC', createdAt: 'ASC' }
                        })];
                    case 1:
                        entities = _a.sent();
                        return [2 /*return*/, entities.map(this.entityToType)];
                }
            });
        });
    };
    /**
     * Get custom fields by entity type
     */
    CustomFieldRepository.prototype.getFieldsByEntityType = function () {
        return __awaiter(this, arguments, void 0, function (entityType) {
            if (entityType === void 0) { entityType = 'return'; }
            return __generator(this, function (_a) {
                // Since the CustomFieldEntity doesn't have entityType field, 
                // we'll return all active fields for now
                // TODO: Add entityType field to CustomFieldEntity if needed
                return [2 /*return*/, this.getActiveCustomFields()];
            });
        });
    };
    /**
     * Validate field values against definitions
     */
    CustomFieldRepository.prototype.validateFieldValues = function (values_1) {
        return __awaiter(this, arguments, void 0, function (values, entityType) {
            var fields, errors, _i, fields_1, field, value;
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
                            if (value !== undefined && value !== null && value !== '') {
                                switch (field.type) {
                                    case 'number':
                                        if (typeof value !== 'number' && isNaN(Number(value))) {
                                            errors.push("".concat(field.label, " must be a number"));
                                        }
                                        break;
                                    case 'boolean':
                                        if (typeof value !== 'boolean') {
                                            errors.push("".concat(field.label, " must be a boolean"));
                                        }
                                        break;
                                    case 'date':
                                        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
                                            errors.push("".concat(field.label, " must be a valid date"));
                                        }
                                        break;
                                    case 'select':
                                        if (field.options && !field.options.includes(value)) {
                                            errors.push("".concat(field.label, " must be one of: ").concat(field.options.join(', ')));
                                        }
                                        break;
                                }
                            }
                        }
                        return [2 /*return*/, { valid: errors.length === 0, errors: errors }];
                }
            });
        });
    };
    /**
     * Performance-critical operation using raw SQL for complex queries
     */
    CustomFieldRepository.prototype.getCustomFieldsWithUsageStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            return __generator(this, function (_a) {
                query = "\n      SELECT cf.*,\n             COALESCE(usage.count, 0) as usageCount\n      FROM custom_fields cf\n      LEFT JOIN (\n        SELECT json_extract(value, '$.fieldId') as fieldId, COUNT(*) as count\n        FROM status_steps,\n             json_each(requiredFields)\n        WHERE json_extract(value, '$.fieldId') IS NOT NULL\n        GROUP BY json_extract(value, '$.fieldId')\n      ) usage ON cf.id = usage.fieldId\n      ORDER BY cf.sortOrder ASC, cf.createdAt ASC\n    ";
                results = this.executeRawQuery(query);
                return [2 /*return*/, results.map(function (row) { return ({
                        id: row.id,
                        key: row.key,
                        label: row.label,
                        type: row.type,
                        description: row.description,
                        required: row.required,
                        defaultValue: row.defaultValue,
                        options: row.options ? JSON.parse(row.options) : null,
                        placeholder: row.placeholder,
                        isActive: row.isActive,
                        sortOrder: row.sortOrder,
                        createdAt: row.createdAt,
                        updatedAt: row.updatedAt,
                        usageCount: row.usageCount || 0
                    }); })];
            });
        });
    };
    /**
     * Convert entity to business type
     */
    CustomFieldRepository.prototype.entityToType = function (entity) {
        return {
            id: entity.id,
            key: entity.key,
            label: entity.label,
            type: entity.type,
            description: entity.description,
            required: entity.required,
            defaultValue: entity.defaultValue,
            options: entity.options,
            placeholder: entity.placeholder,
            isActive: entity.isActive,
            sortOrder: entity.sortOrder,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString()
        };
    };
    return CustomFieldRepository;
}(base_repository_1.BaseRepository));
exports.CustomFieldRepository = CustomFieldRepository;
