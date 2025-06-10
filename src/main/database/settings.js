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
exports.getSetting = getSetting;
exports.setSetting = setSetting;
exports.getDatabaseSettings = getDatabaseSettings;
exports.setDatabaseSettings = setDatabaseSettings;
exports.testDatabaseConnection = testDatabaseConnection;
exports.getAllWorkflows = getAllWorkflows;
exports.getWorkflowById = getWorkflowById;
exports.getWorkflowByFollowUpAction = getWorkflowByFollowUpAction;
exports.createWorkflow = createWorkflow;
exports.updateWorkflow = updateWorkflow;
exports.deleteWorkflow = deleteWorkflow;
exports.getStepById = getStepById;
exports.createStep = createStep;
exports.updateStep = updateStep;
exports.deleteStep = deleteStep;
exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.getAllReasons = getAllReasons;
exports.getReasonById = getReasonById;
exports.getReasonsByAction = getReasonsByAction;
exports.createReason = createReason;
exports.updateReason = updateReason;
exports.deleteReason = deleteReason;
exports.getAllCustomFields = getAllCustomFields;
exports.getCustomFieldById = getCustomFieldById;
exports.getCustomFieldByKey = getCustomFieldByKey;
exports.createCustomField = createCustomField;
exports.updateCustomField = updateCustomField;
exports.deleteCustomField = deleteCustomField;
exports.initializeDefaultSettings = initializeDefaultSettings;
var uuid_1 = require("uuid");
var db_1 = require("./db");
var credentials_1 = require("../services/credentials");
var procurement_init_1 = require("./procurement-init");
var crypto_1 = require("crypto");
function getSetting(key) {
    var result = db_1.default.prepare('SELECT value FROM app_settings WHERE key = ?').get(key);
    return result ? result.value : null;
}
function setSetting(key, value) {
    db_1.default.prepare("\n    INSERT INTO app_settings (key, value, last_updated)\n    VALUES (?, ?, CURRENT_TIMESTAMP)\n    ON CONFLICT (key) DO UPDATE SET\n      value = excluded.value,\n      last_updated = CURRENT_TIMESTAMP\n  ").run(key, value);
}
// Database connection settings
function getDatabaseSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var settingsJson, settings, _a, decryptError_1, parseError_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    settingsJson = getSetting('database_settings');
                    if (!settingsJson)
                        return [2 /*return*/, null];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    settings = JSON.parse(settingsJson);
                    if (!settings.password) return [3 /*break*/, 6];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 6]);
                    _a = settings;
                    return [4 /*yield*/, decryptPassword(settings.password)];
                case 3:
                    _a.password = _b.sent();
                    return [3 /*break*/, 6];
                case 4:
                    decryptError_1 = _b.sent();
                    console.error('Failed to decrypt database password:', decryptError_1);
                    // Clear invalid credentials to force re-entry
                    return [4 /*yield*/, setDatabaseSettings(__assign(__assign({}, settings), { password: '', isConnected: false }))];
                case 5:
                    // Clear invalid credentials to force re-entry
                    _b.sent();
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/, settings];
                case 7:
                    parseError_1 = _b.sent();
                    console.error('Failed to parse database settings:', parseError_1);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function setDatabaseSettings(settings) {
    return __awaiter(this, void 0, void 0, function () {
        var secureSettings, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    secureSettings = __assign({}, settings);
                    if (!secureSettings.password) return [3 /*break*/, 2];
                    _a = secureSettings;
                    return [4 /*yield*/, encryptPassword(secureSettings.password)];
                case 1:
                    _a.password = _b.sent();
                    _b.label = 2;
                case 2:
                    setSetting('database_settings', JSON.stringify(secureSettings));
                    return [2 /*return*/];
            }
        });
    });
}
function testDatabaseConnection(settings) {
    try {
        // In a real implementation, this would try to connect to the database
        // For now, we'll simulate a connection
        // TODO: Implement actual MSSQL connection testing
        var isSuccess = true; // Simulate successful connection
        // Update connection status
        var updatedSettings = __assign(__assign({}, settings), { isConnected: isSuccess, lastConnectionTest: new Date().toISOString() });
        setDatabaseSettings(updatedSettings);
        return isSuccess;
    }
    catch (error) {
        console.error('Database connection test failed:', error);
        // Update connection status
        var updatedSettings = __assign(__assign({}, settings), { isConnected: false, lastConnectionTest: new Date().toISOString() });
        setDatabaseSettings(updatedSettings);
        return false;
    }
}
// Simple encryption/decryption functions
function encryptPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var iv, key, _a, _b, _c, cipher, encrypted;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    iv = crypto_1.default.randomBytes(16);
                    _b = (_a = crypto_1.default).scryptSync;
                    return [4 /*yield*/, (0, credentials_1.getEncryptionKey)()];
                case 1:
                    _c = [_d.sent()];
                    return [4 /*yield*/, (0, credentials_1.getEncryptionSalt)()];
                case 2:
                    key = _b.apply(_a, _c.concat([_d.sent(), 32]));
                    cipher = crypto_1.default.createCipheriv('aes-256-cbc', key, iv);
                    encrypted = cipher.update(password, 'utf8', 'hex');
                    encrypted += cipher.final('hex');
                    return [2 /*return*/, "".concat(iv.toString('hex'), ":").concat(encrypted)];
            }
        });
    });
}
function decryptPassword(encryptedData) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, ivHex, encryptedPassword, iv, key, _b, _c, _d, decipher, decrypted, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    _a = encryptedData.split(':'), ivHex = _a[0], encryptedPassword = _a[1];
                    // Validate IV and encrypted data format
                    if (!ivHex || !encryptedPassword || ivHex.length !== 32) {
                        throw new Error("Invalid encrypted data format. IV length: ".concat(ivHex === null || ivHex === void 0 ? void 0 : ivHex.length, ", Data length: ").concat(encryptedPassword === null || encryptedPassword === void 0 ? void 0 : encryptedPassword.length));
                    }
                    iv = Buffer.from(ivHex, 'hex');
                    _c = (_b = crypto_1.default).scryptSync;
                    return [4 /*yield*/, (0, credentials_1.getEncryptionKey)()];
                case 1:
                    _d = [_e.sent()];
                    return [4 /*yield*/, (0, credentials_1.getEncryptionSalt)()];
                case 2:
                    key = _c.apply(_b, _d.concat([_e.sent(), 32]));
                    console.log('[Decrypt] Using IV:', ivHex);
                    console.log('[Decrypt] Key derived successfully');
                    decipher = crypto_1.default.createDecipheriv('aes-256-cbc', key, iv);
                    decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    return [2 /*return*/, decrypted];
                case 3:
                    error_1 = _e.sent();
                    console.error('Decryption failed:', {
                        error: error_1.message,
                        encryptedData: encryptedData === null || encryptedData === void 0 ? void 0 : encryptedData.substring(0, 50) // Log partial for debugging
                    });
                    throw new Error('Failed to decrypt password. Please verify encryption credentials.');
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Status workflow functions
function getAllWorkflows() {
    var workflowRows = db_1.default.prepare("\n    SELECT id, name, follow_up_action, is_default, workflow_type, created_at, updated_at \n    FROM status_workflows\n  ").all();
    return workflowRows.map(function (row) {
        // Get steps for this workflow
        var steps = getStepsByWorkflowId(row.id);
        return {
            id: row.id,
            name: row.name,
            followUpAction: row.follow_up_action,
            isDefault: Boolean(row.is_default),
            workflowType: (row.workflow_type || 'return'),
            steps: steps,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    });
}
function getWorkflowById(id) {
    var workflow = db_1.default.prepare("\n    SELECT id, name, follow_up_action, is_default, workflow_type, created_at, updated_at \n    FROM status_workflows WHERE id = ?\n  ").get(id);
    if (!workflow)
        return null;
    // Get steps for this workflow
    var steps = getStepsByWorkflowId(workflow.id);
    return {
        id: workflow.id,
        name: workflow.name,
        followUpAction: workflow.follow_up_action,
        isDefault: Boolean(workflow.is_default),
        workflowType: workflow.workflow_type || 'return',
        steps: steps,
        createdAt: workflow.created_at,
        updatedAt: workflow.updated_at
    };
}
function getWorkflowByFollowUpAction(action) {
    var workflow = db_1.default.prepare("\n    SELECT id, name, follow_up_action, is_default, workflow_type, created_at, updated_at \n    FROM status_workflows \n    WHERE follow_up_action = ? AND is_default = 1\n  ").get(action);
    if (!workflow)
        return null;
    // Get steps for this workflow
    var steps = getStepsByWorkflowId(workflow.id);
    return {
        id: workflow.id,
        name: workflow.name,
        followUpAction: workflow.follow_up_action,
        isDefault: Boolean(workflow.is_default),
        workflowType: workflow.workflow_type || 'return',
        steps: steps,
        createdAt: workflow.created_at,
        updatedAt: workflow.updated_at
    };
}
function createWorkflow(workflow) {
    var id = (0, uuid_1.v4)();
    var now = new Date().toISOString();
    db_1.default.prepare("\n    INSERT INTO status_workflows (id, name, follow_up_action, is_default, workflow_type, created_at, updated_at)\n    VALUES (?, ?, ?, ?, ?, ?, ?)\n  ").run(id, workflow.name, workflow.followUpAction, workflow.isDefault ? 1 : 0, workflow.workflowType || 'return', now, now);
    // If this is set as default, unset any other defaults for this follow-up action
    if (workflow.isDefault) {
        db_1.default.prepare("\n      UPDATE status_workflows \n      SET is_default = 0, updated_at = ?\n      WHERE follow_up_action = ? AND id != ?\n    ").run(now, workflow.followUpAction, id);
    }
    // Create steps if provided
    if (workflow.steps && workflow.steps.length > 0) {
        workflow.steps.forEach(function (step) {
            createStep(__assign(__assign({}, step), { workflowId: id }));
        });
    }
    return id;
}
function updateWorkflow(id, updates) {
    var workflow = getWorkflowById(id);
    if (!workflow)
        return false;
    var now = new Date().toISOString();
    // Update workflow properties
    db_1.default.prepare("\n    UPDATE status_workflows\n    SET name = ?, follow_up_action = ?, is_default = ?, updated_at = ?\n    WHERE id = ?\n  ").run(updates.name || workflow.name, updates.followUpAction || workflow.followUpAction, updates.isDefault !== undefined ? (updates.isDefault ? 1 : 0) : (workflow.isDefault ? 1 : 0), now, id);
    // If this is set as default, unset any other defaults for this follow-up action
    if (updates.isDefault) {
        db_1.default.prepare("\n      UPDATE status_workflows \n      SET is_default = 0, updated_at = ?\n      WHERE follow_up_action = ? AND id != ?\n    ").run(now, updates.followUpAction || workflow.followUpAction, id);
    }
    // If steps are provided, replace all steps
    if (updates.steps) {
        // Delete existing steps
        db_1.default.prepare('DELETE FROM status_steps WHERE workflow_id = ?').run(id);
        // Create new steps
        updates.steps.forEach(function (step) {
            createStep(__assign(__assign({}, step), { workflowId: id }));
        });
    }
    return true;
}
function deleteWorkflow(id) {
    // First check if this workflow exists
    var workflow = getWorkflowById(id);
    if (!workflow)
        return false;
    // Delete steps first (cascading delete should handle this, but being explicit)
    db_1.default.prepare('DELETE FROM status_steps WHERE workflow_id = ?').run(id);
    // Then delete workflow
    db_1.default.prepare('DELETE FROM status_workflows WHERE id = ?').run(id);
    return true;
}
// Status step functions
function getStepsByWorkflowId(workflowId) {
    var stepRows = db_1.default.prepare("\n    SELECT id, name, description, color, order_index, required_fields, created_at, updated_at\n    FROM status_steps\n    WHERE workflow_id = ?\n    ORDER BY order_index ASC\n  ").all(workflowId);
    return stepRows.map(function (row) { return ({
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        order: row.order_index,
        requiredFields: JSON.parse(row.required_fields || '[]'),
        workflowId: workflowId,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }); });
}
function getStepById(id) {
    var step = db_1.default.prepare("\n    SELECT id, name, description, color, order_index, required_fields, workflow_id, created_at, updated_at\n    FROM status_steps\n    WHERE id = ?\n  ").get(id);
    if (!step)
        return null;
    return {
        id: step.id,
        name: step.name,
        description: step.description,
        color: step.color,
        order: step.order_index,
        requiredFields: JSON.parse(step.required_fields || '[]'),
        workflowId: step.workflow_id,
        createdAt: step.created_at,
        updatedAt: step.updated_at
    };
}
function createStep(step) {
    var id = (0, uuid_1.v4)();
    var now = new Date().toISOString();
    db_1.default.prepare("\n    INSERT INTO status_steps (id, workflow_id, name, description, color, order_index, required_fields, created_at, updated_at)\n    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\n  ").run(id, step.workflowId, step.name, step.description || null, step.color, step.order, JSON.stringify(step.requiredFields || []), now, now);
    return id;
}
function updateStep(id, updates) {
    var step = getStepById(id);
    if (!step)
        return false;
    var now = new Date().toISOString();
    db_1.default.prepare("\n    UPDATE status_steps\n    SET name = ?, description = ?, color = ?, order_index = ?, required_fields = ?, updated_at = ?\n    WHERE id = ?\n  ").run(updates.name || step.name, updates.description !== undefined ? updates.description : step.description, updates.color || step.color, updates.order !== undefined ? updates.order : step.order, JSON.stringify(updates.requiredFields || step.requiredFields), now, id);
    return true;
}
function deleteStep(id) {
    var step = getStepById(id);
    if (!step)
        return false;
    db_1.default.prepare('DELETE FROM status_steps WHERE id = ?').run(id);
    return true;
}
// Reason category functions
function getAllCategories() {
    var categories = db_1.default.prepare("\n    SELECT id, name, description, order_index, created_at, updated_at\n    FROM reason_categories\n    ORDER BY order_index ASC\n  ").all();
    return categories.map(function (cat) { return ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        order: cat.order_index,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at
    }); });
}
function getCategoryById(id) {
    var category = db_1.default.prepare("\n    SELECT id, name, description, order_index, created_at, updated_at\n    FROM reason_categories\n    WHERE id = ?\n  ").get(id);
    if (!category)
        return null;
    return {
        id: category.id,
        name: category.name,
        description: category.description,
        order: category.order_index,
        createdAt: category.created_at,
        updatedAt: category.updated_at
    };
}
function createCategory(category) {
    var id = (0, uuid_1.v4)();
    var now = new Date().toISOString();
    db_1.default.prepare("\n    INSERT INTO reason_categories (id, name, description, order_index, created_at, updated_at)\n    VALUES (?, ?, ?, ?, ?, ?)\n  ").run(id, category.name, category.description || null, category.order, now, now);
    return id;
}
function updateCategory(id, updates) {
    var category = getCategoryById(id);
    if (!category)
        return false;
    var now = new Date().toISOString();
    db_1.default.prepare("\n    UPDATE reason_categories\n    SET name = ?, description = ?, order_index = ?, updated_at = ?\n    WHERE id = ?\n  ").run(updates.name || category.name, updates.description !== undefined ? updates.description : category.description, updates.order !== undefined ? updates.order : category.order, now, id);
    return true;
}
function deleteCategory(id) {
    // Check if category has reasons
    var reasonCount = db_1.default.prepare('SELECT COUNT(*) as count FROM return_reasons WHERE category_id = ?').get(id);
    if (reasonCount && reasonCount.count > 0) {
        throw new Error('Cannot delete category that contains reasons');
    }
    // Delete the category
    db_1.default.prepare('DELETE FROM reason_categories WHERE id = ?').run(id);
    return true;
}
// Return reason functions
function getAllReasons() {
    var reasons = db_1.default.prepare("\n    SELECT id, code, name, description, category_id, is_active, applicable_actions, created_at, updated_at\n    FROM return_reasons\n  ").all();
    return reasons.map(function (reason) { return ({
        id: reason.id,
        code: reason.code,
        name: reason.name,
        description: reason.description,
        categoryId: reason.category_id,
        isActive: Boolean(reason.is_active),
        applicableActions: JSON.parse(reason.applicable_actions || '[]'),
        createdAt: reason.created_at,
        updatedAt: reason.updated_at
    }); });
}
function getReasonById(id) {
    var reason = db_1.default.prepare("\n    SELECT id, code, name, description, category_id, is_active, applicable_actions, created_at, updated_at\n    FROM return_reasons\n    WHERE id = ?\n  ").get(id);
    if (!reason)
        return null;
    return {
        id: reason.id,
        code: reason.code,
        name: reason.name,
        description: reason.description,
        categoryId: reason.category_id,
        isActive: Boolean(reason.is_active),
        applicableActions: JSON.parse(reason.applicable_actions || '[]'),
        createdAt: reason.created_at,
        updatedAt: reason.updated_at
    };
}
function getReasonsByAction(action) {
    var reasons = db_1.default.prepare("\n    SELECT id, code, name, description, category_id, is_active, applicable_actions, created_at, updated_at\n    FROM return_reasons\n    WHERE is_active = 1\n  ").all();
    return reasons.filter(function (reason) {
        var applicableActions = JSON.parse(reason.applicable_actions || '[]');
        return applicableActions.includes(action);
    }).map(function (reason) { return ({
        id: reason.id,
        code: reason.code,
        name: reason.name,
        description: reason.description,
        categoryId: reason.category_id,
        isActive: Boolean(reason.is_active),
        applicableActions: JSON.parse(reason.applicable_actions || '[]'),
        createdAt: reason.created_at,
        updatedAt: reason.updated_at
    }); });
}
function createReason(reason) {
    var id = (0, uuid_1.v4)();
    var now = new Date().toISOString();
    db_1.default.prepare("\n    INSERT INTO return_reasons (id, code, name, description, category_id, is_active, applicable_actions, created_at, updated_at)\n    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\n  ").run(id, reason.code, reason.name, reason.description || null, reason.categoryId, reason.isActive ? 1 : 0, JSON.stringify(reason.applicableActions || []), now, now);
    return id;
}
function updateReason(id, updates) {
    var reason = getReasonById(id);
    if (!reason)
        return false;
    var now = new Date().toISOString();
    db_1.default.prepare("\n    UPDATE return_reasons\n    SET code = ?, name = ?, description = ?, category_id = ?, is_active = ?, applicable_actions = ?, updated_at = ?\n    WHERE id = ?\n  ").run(updates.code || reason.code, updates.name || reason.name, updates.description !== undefined ? updates.description : reason.description, updates.categoryId || reason.categoryId, updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : (reason.isActive ? 1 : 0), JSON.stringify(updates.applicableActions || reason.applicableActions), now, id);
    return true;
}
function deleteReason(id) {
    var reason = getReasonById(id);
    if (!reason)
        return false;
    db_1.default.prepare('DELETE FROM return_reasons WHERE id = ?').run(id);
    return true;
}
// Custom fields functions
function getAllCustomFields() {
    var fields = db_1.default.prepare("\n    SELECT id, key, label, description, type, required, default_value, options, created_at, updated_at\n    FROM custom_fields\n    ORDER BY label ASC\n  ").all();
    return fields.map(function (field) { return ({
        id: field.id,
        key: field.key,
        label: field.label,
        description: field.description,
        type: field.type,
        required: Boolean(field.required),
        defaultValue: field.default_value ? JSON.parse(field.default_value) : null,
        options: field.options ? JSON.parse(field.options) : [],
        createdAt: field.created_at,
        updatedAt: field.updated_at
    }); });
}
function getCustomFieldById(id) {
    var field = db_1.default.prepare("\n    SELECT id, key, label, description, type, required, default_value, options, created_at, updated_at\n    FROM custom_fields\n    WHERE id = ?\n  ").get(id);
    if (!field)
        return null;
    return {
        id: field.id,
        key: field.key,
        label: field.label,
        description: field.description,
        type: field.type,
        required: Boolean(field.required),
        defaultValue: field.default_value ? JSON.parse(field.default_value) : null,
        options: field.options ? JSON.parse(field.options) : [],
        createdAt: field.created_at,
        updatedAt: field.updated_at
    };
}
function getCustomFieldByKey(key) {
    var field = db_1.default.prepare("\n    SELECT id, key, label, description, type, required, default_value, options, created_at, updated_at\n    FROM custom_fields\n    WHERE key = ?\n  ").get(key);
    if (!field)
        return null;
    return {
        id: field.id,
        key: field.key,
        label: field.label,
        description: field.description,
        type: field.type,
        required: Boolean(field.required),
        defaultValue: field.default_value ? JSON.parse(field.default_value) : null,
        options: field.options ? JSON.parse(field.options) : [],
        createdAt: field.created_at,
        updatedAt: field.updated_at
    };
}
function createCustomField(field) {
    var id = (0, uuid_1.v4)();
    var now = new Date().toISOString();
    // Check if key already exists
    var existingField = getCustomFieldByKey(field.key);
    if (existingField) {
        throw new Error("Custom field with key '".concat(field.key, "' already exists"));
    }
    var defaultValueStr = field.defaultValue !== undefined ?
        JSON.stringify(field.defaultValue) : null;
    var optionsStr = field.options && field.options.length > 0 ?
        JSON.stringify(field.options) : null;
    db_1.default.prepare("\n    INSERT INTO custom_fields (id, key, label, description, type, required, default_value, options, created_at, updated_at)\n    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n  ").run(id, field.key, field.label, field.description || null, field.type, field.required ? 1 : 0, defaultValueStr, optionsStr, now, now);
    return id;
}
function updateCustomField(id, updates) {
    var field = getCustomFieldById(id);
    if (!field)
        return false;
    var now = new Date().toISOString();
    // Check if key is being changed and if new key already exists
    if (updates.key && updates.key !== field.key) {
        var existingField = getCustomFieldByKey(updates.key);
        if (existingField) {
            throw new Error("Custom field with key '".concat(updates.key, "' already exists"));
        }
    }
    var defaultValueStr = updates.defaultValue !== undefined ?
        JSON.stringify(updates.defaultValue) :
        (field.defaultValue !== null ? JSON.stringify(field.defaultValue) : null);
    var optionsStr = updates.options !== undefined ?
        (updates.options.length > 0 ? JSON.stringify(updates.options) : null) :
        (field.options && field.options.length > 0 ? JSON.stringify(field.options) : null);
    db_1.default.prepare("\n    UPDATE custom_fields\n    SET key = ?, label = ?, description = ?, type = ?, required = ?, default_value = ?, options = ?, updated_at = ?\n    WHERE id = ?\n  ").run(updates.key || field.key, updates.label || field.label, updates.description !== undefined ? updates.description : field.description, updates.type || field.type, updates.required !== undefined ? (updates.required ? 1 : 0) : (field.required ? 1 : 0), defaultValueStr, optionsStr, now, id);
    return true;
}
function deleteCustomField(id) {
    var field = getCustomFieldById(id);
    if (!field)
        return false;
    // Check if this field is used in any workflow steps
    var steps = getAllWorkflows().flatMap(function (w) { return w.steps; });
    var isFieldUsed = steps.some(function (step) { return step.requiredFields.includes(field.key); });
    if (isFieldUsed) {
        throw new Error("Cannot delete custom field '".concat(field.key, "' because it is used in workflow steps"));
    }
    db_1.default.prepare('DELETE FROM custom_fields WHERE id = ?').run(id);
    return true;
}
// Initialize default settings data
function initializeDefaultSettings() {
    console.log('Starting to initialize default settings...');
    // Create default database settings if not exist
    if (!getSetting('database_settings')) {
        console.log('Creating default database settings...');
        var defaultDbSettings = {
            host: 'localhost',
            port: 1433,
            database: 'JTL-Wawi',
            username: 'username',
            password: 'password',
            useSSL: false,
            connectionTimeout: 30000,
            isConnected: false,
            lastConnectionTest: new Date().toISOString()
        };
        setDatabaseSettings(defaultDbSettings);
        console.log('Default database settings created');
    }
    // Create default workflows for each follow-up action if they don't exist
    var followUpActions = ['gutschrift', 'ersatz', 'reparatur', 'ausschuss', 'procurement'];
    console.log('Checking and creating default workflows...');
    followUpActions.forEach(function (action) {
        var existingWorkflow = getWorkflowByFollowUpAction(action);
        if (!existingWorkflow) {
            console.log("Creating default workflow for ".concat(action, "..."));
            if (action === 'procurement') {
                createWorkflow(procurement_init_1.defaultProcurementWorkflow);
            }
            else {
                createDefaultWorkflow(action);
            }
            console.log("Default workflow for ".concat(action, " created"));
        }
    });
    // Create default reason categories if none exist
    console.log('Checking and creating default reason categories...');
    var categories = getAllCategories();
    if (categories.length === 0) {
        console.log('Creating default reason categories...');
        createDefaultReasonCategories();
        console.log('Default reason categories created');
    }
    // Create custom_fields table if it doesn't exist
    console.log('Ensuring custom_fields table exists...');
    db_1.default.prepare("\n    CREATE TABLE IF NOT EXISTS custom_fields (\n      id TEXT PRIMARY KEY,\n      key TEXT UNIQUE NOT NULL,\n      label TEXT NOT NULL,\n      description TEXT,\n      type TEXT NOT NULL,\n      required INTEGER DEFAULT 0,\n      default_value TEXT,\n      options TEXT,\n      entity_type TEXT DEFAULT 'return',\n      created_at TEXT NOT NULL,\n      updated_at TEXT NOT NULL\n    )\n  ").run();
    // Create default custom fields if none exist
    console.log('Checking and creating default custom fields...');
    var customFields = getAllCustomFields();
    if (customFields.length === 0) {
        console.log('Creating default custom fields...');
        createDefaultCustomFields();
        console.log('Default custom fields created');
    }
    // Add workflow_type column to status_workflows if it doesn't exist
    try {
        db_1.default.prepare("SELECT workflow_type FROM status_workflows LIMIT 1").get();
    }
    catch (error) {
        console.log('Adding workflow_type column to status_workflows...');
        // Column doesn't exist, add it
        db_1.default.prepare("\n      ALTER TABLE status_workflows \n      ADD COLUMN workflow_type TEXT DEFAULT 'return'\n    ").run();
        // Update existing workflows to have the return type
        db_1.default.prepare("\n      UPDATE status_workflows \n      SET workflow_type = 'return' \n      WHERE workflow_type IS NULL\n    ").run();
        console.log('Workflow_type column added and updated');
    }
    console.log('Default settings initialization completed');
}
var defaultGutschriftWorkflow = {
    name: 'Standard-Gutschrift',
    followUpAction: 'gutschrift',
    workflowType: 'return',
    isDefault: true,
    steps: [
        {
            id: (0, uuid_1.v4)(),
            name: 'Ausstehend',
            description: 'Retoure wurde erfasst',
            color: '#FFCC00',
            order: 0,
            requiredFields: [],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Beauftragt',
            description: 'Retoure wurde genehmigt',
            color: '#33CCFF',
            order: 1,
            requiredFields: ['commissioningDate'],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Versandt',
            description: 'Retoure wurde versandt',
            color: '#FF9900',
            order: 2,
            requiredFields: ['shippingDate'],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Gutgeschrieben',
            description: 'Gutschrift wurde erstellt',
            color: '#99CC00',
            order: 3,
            requiredFields: ['creditNoteNumber', 'creditAmount', 'creditDate'],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Abgeschlossen',
            description: 'Vorgang abgeschlossen',
            color: '#00CC00',
            order: 4,
            requiredFields: [],
            workflowId: '' // Will be set by createWorkflow
        }
    ]
};
var defaultErsatzWorkflow = {
    name: 'Standard-Ersatzlieferung',
    followUpAction: 'ersatz',
    workflowType: 'return',
    isDefault: true,
    steps: [
        {
            id: (0, uuid_1.v4)(),
            name: 'Ausstehend',
            description: 'Retoure wurde erfasst',
            color: '#FFCC00',
            order: 0,
            requiredFields: [],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Beauftragt',
            description: 'Ersatz wurde genehmigt',
            color: '#33CCFF',
            order: 1,
            requiredFields: ['commissioningDate'],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Versandt',
            description: 'Retoure wurde versandt',
            color: '#FF9900',
            order: 2,
            requiredFields: ['shippingDate'],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Abgeschlossen',
            description: 'Ersatzlieferung abgeschlossen',
            color: '#00CC00',
            order: 3,
            requiredFields: [],
            workflowId: '' // Will be set by createWorkflow
        }
    ]
};
var defaultReparaturWorkflow = {
    name: 'Standard-Reparatur',
    followUpAction: 'reparatur',
    workflowType: 'return',
    isDefault: true,
    steps: [
        {
            id: (0, uuid_1.v4)(),
            name: 'Ausstehend',
            description: 'Reparatur wurde erfasst',
            color: '#FFCC00',
            order: 0,
            requiredFields: [],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Beauftragt',
            description: 'Reparatur wurde genehmigt',
            color: '#33CCFF',
            order: 1,
            requiredFields: ['commissioningDate'],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Versandt',
            description: 'Gerät wurde versandt',
            color: '#FF9900',
            order: 2,
            requiredFields: ['shippingDate'],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Abgeschlossen',
            description: 'Reparatur abgeschlossen',
            color: '#00CC00',
            order: 3,
            requiredFields: [],
            workflowId: '' // Will be set by createWorkflow
        }
    ]
};
var defaultAusschussWorkflow = {
    name: 'Standard-Ausschuss',
    followUpAction: 'ausschuss',
    workflowType: 'return',
    isDefault: true,
    steps: [
        {
            id: (0, uuid_1.v4)(),
            name: 'Ausstehend',
            description: 'Ausschuss wurde erfasst',
            color: '#FFCC00',
            order: 0,
            requiredFields: [],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Beauftragt',
            description: 'Ausschuss wurde genehmigt',
            color: '#33CCFF',
            order: 1,
            requiredFields: ['commissioningDate'],
            workflowId: '' // Will be set by createWorkflow
        },
        {
            id: (0, uuid_1.v4)(),
            name: 'Abgeschlossen',
            description: 'Ausschuss abgeschlossen',
            color: '#00CC00',
            order: 2,
            requiredFields: [],
            workflowId: '' // Will be set by createWorkflow
        }
    ]
};
function createDefaultWorkflow(action) {
    var workflowId;
    switch (action) {
        case 'gutschrift':
            workflowId = createWorkflow(defaultGutschriftWorkflow);
            break;
        case 'ersatz':
            workflowId = createWorkflow(defaultErsatzWorkflow);
            break;
        case 'reparatur':
            workflowId = createWorkflow(defaultReparaturWorkflow);
            break;
        case 'ausschuss':
            workflowId = createWorkflow(defaultAusschussWorkflow);
            break;
        default:
            throw new Error("Unsupported follow-up action: ".concat(action));
    }
    return workflowId;
}
function createDefaultReasonCategories() {
    // Create some default categories
    var qualityCategory = createCategory({
        name: 'Qualitätsprobleme',
        description: 'Mängel in der Produktqualität',
        order: 0
    });
    var deliveryCategory = createCategory({
        name: 'Lieferprobleme',
        description: 'Probleme mit der Lieferung',
        order: 1
    });
    var technicalCategory = createCategory({
        name: 'Technische Probleme',
        description: 'Technische Mängel oder Defekte',
        order: 2
    });
    // Create some default reasons in each category
    createReason({
        code: 'QM-001',
        name: 'Produktionsabweichung',
        description: 'Produkt entspricht nicht den Spezifikationen',
        categoryId: qualityCategory,
        isActive: true,
        applicableActions: ['gutschrift', 'ersatz']
    });
    createReason({
        code: 'QM-002',
        name: 'Materialfehler',
        description: 'Fehler im verwendeten Material',
        categoryId: qualityCategory,
        isActive: true,
        applicableActions: ['gutschrift', 'ersatz', 'ausschuss']
    });
    createReason({
        code: 'LF-001',
        name: 'Falscher Artikel',
        description: 'Falscher Artikel wurde geliefert',
        categoryId: deliveryCategory,
        isActive: true,
        applicableActions: ['gutschrift', 'ersatz']
    });
    createReason({
        code: 'LF-002',
        name: 'Transportschaden',
        description: 'Produkt wurde während des Transports beschädigt',
        categoryId: deliveryCategory,
        isActive: true,
        applicableActions: ['gutschrift', 'ersatz', 'reparatur', 'ausschuss']
    });
    createReason({
        code: 'TP-001',
        name: 'Funktionsausfall',
        description: 'Produkt funktioniert nicht wie erwartet',
        categoryId: technicalCategory,
        isActive: true,
        applicableActions: ['gutschrift', 'ersatz', 'reparatur', 'ausschuss']
    });
    createReason({
        code: 'TP-002',
        name: 'Softwarefehler',
        description: 'Fehler in der Produktsoftware',
        categoryId: technicalCategory,
        isActive: true,
        applicableActions: ['reparatur']
    });
}
// Function to create default custom fields
function createDefaultCustomFields() {
    // Example custom fields that might be useful in a return/RMA system
    // Processor field - who is processing the return
    createCustomField({
        key: 'processor',
        label: 'Bearbeiter',
        description: 'Name des zuständigen Bearbeiters',
        type: 'text',
        required: false,
        entityType: 'return'
    });
    // Reference number field - for external reference numbers
    createCustomField({
        key: 'reference_number',
        label: 'Referenznummer',
        description: 'Externe Referenznummer des Lieferanten',
        type: 'text',
        required: false,
        entityType: 'return'
    });
    // Return reason details field - for additional information
    createCustomField({
        key: 'reason_details',
        label: 'Fehler-Details',
        description: 'Detaillierte Beschreibung des Mangels',
        type: 'text',
        required: false,
        entityType: 'return'
    });
    // Return inspection date field
    createCustomField({
        key: 'inspection_date',
        label: 'Prüfdatum',
        description: 'Datum der Warenprüfung',
        type: 'date',
        required: false,
        entityType: 'return'
    });
    // Return inspection result field
    createCustomField({
        key: 'inspection_result',
        label: 'Prüfergebnis',
        description: 'Ergebnis der Warenprüfung',
        type: 'select',
        required: false,
        options: ['Bestanden', 'Fehlerhaft', 'Nicht prüfbar'],
        entityType: 'return'
    });
    // Default procurement custom fields
    createCustomField({
        key: 'cost_center',
        label: 'Kostenstelle',
        description: 'Kostenstelle für die Beschaffung',
        type: 'text',
        required: false,
        entityType: 'requisition'
    });
    createCustomField({
        key: 'delivery_notes',
        label: 'Lieferhinweise',
        description: 'Besondere Hinweise für die Lieferung',
        type: 'text',
        required: false,
        entityType: 'requisition'
    });
    createCustomField({
        key: 'approval_notes',
        label: 'Genehmigungshinweise',
        description: 'Hinweise für den Genehmigungsprozess',
        type: 'text',
        required: false,
        entityType: 'requisition'
    });
    createCustomField({
        key: 'preferred_supplier',
        label: 'Bevorzugter Lieferant',
        description: 'ID des bevorzugten Lieferanten',
        type: 'text',
        required: false,
        entityType: 'requisition'
    });
}
