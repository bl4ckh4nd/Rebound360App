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
 * Hybrid workflows API that can use TypeORM or fallback to better-sqlite3
 * This demonstrates the migration pattern for gradual rollout
 */
var router = (0, express_1.Router)();
// GET /workflows - List all workflows
router.get('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, method, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var workflowRepo;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    workflowRepo = (0, repositories_1.getWorkflowRepository)();
                                    return [4 /*yield*/, workflowRepo.getWorkflowsGroupedByAction()];
                                case 1: 
                                // getWorkflowsGroupedByAction already returns plain objects from raw SQL
                                return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () {
                        var workflows = settingsDb.getAllWorkflows();
                        // Group by follow-up action to match TypeORM implementation
                        return workflows.reduce(function (acc, workflow) {
                            if (!acc[workflow.followUpAction]) {
                                acc[workflow.followUpAction] = [];
                            }
                            acc[workflow.followUpAction].push(workflow);
                            return acc;
                        }, {});
                    }, 'get-all-workflows')];
            case 1:
                result = _a.sent();
                if ((0, feature_flags_1.enablePerformanceLogging)()) {
                    method = (0, feature_flags_1.useTypeORMForWorkflows)() ? 'TypeORM' : 'better-sqlite3';
                    console.log("\uD83D\uDCCA Workflows fetched using ".concat(method));
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching workflows:', error_1);
                res.status(500).json({ error: 'Failed to fetch workflows' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /workflows/:id - Get specific workflow
router.get('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_1, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_1 = req.params.id;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var workflowRepo, workflow;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    workflowRepo = (0, repositories_1.getWorkflowRepository)();
                                    return [4 /*yield*/, workflowRepo.getWorkflowWithSteps(id_1)];
                                case 1:
                                    workflow = _a.sent();
                                    return [2 /*return*/, workflow ? workflowRepo.entityToDTO(workflow) : null];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.getWorkflowById(id_1); }, 'get-workflow-by-id')];
            case 1:
                result = _a.sent();
                if (!result) {
                    return [2 /*return*/, res.status(404).json({ error: 'Workflow not found' })];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching workflow:', error_2);
                res.status(500).json({ error: 'Failed to fetch workflow' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /workflows/by-action/:action - Get workflow by follow-up action
router.get('/by-action/:action', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var action_1, result, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                action_1 = req.params.action;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var workflowRepo, workflow;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    workflowRepo = (0, repositories_1.getWorkflowRepository)();
                                    return [4 /*yield*/, workflowRepo.getDefaultWorkflow(action_1)];
                                case 1:
                                    workflow = _a.sent();
                                    return [2 /*return*/, workflow ? workflowRepo.entityToDTO(workflow) : null];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.getWorkflowByFollowUpAction(action_1); }, 'get-workflow-by-action')];
            case 1:
                result = _a.sent();
                if (!result) {
                    return [2 /*return*/, res.status(404).json({ error: 'Workflow not found for this action' })];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error fetching workflow by action:', error_3);
                res.status(500).json({ error: 'Failed to fetch workflow by action' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// POST /workflows - Create new workflow
router.post('/', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var workflow_1, result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                workflow_1 = req.body;
                if (!workflow_1.name || !workflow_1.followUpAction) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required workflow data' })];
                }
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var workflowRepo, created;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    workflowRepo = (0, repositories_1.getWorkflowRepository)();
                                    return [4 /*yield*/, workflowRepo.createWorkflowWithSteps({
                                            name: workflow_1.name,
                                            followUpAction: workflow_1.followUpAction,
                                            isDefault: workflow_1.isDefault,
                                            workflowType: workflow_1.workflowType,
                                            steps: (workflow_1.steps || []).map(function (step) { return ({
                                                name: step.name,
                                                description: step.description,
                                                color: step.color,
                                                orderIndex: step.order, // Map order to orderIndex
                                                requiredFields: step.requiredFields
                                            }); })
                                        })];
                                case 1:
                                    created = _a.sent();
                                    return [2 /*return*/, workflowRepo.entityToDTO(created)];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () {
                        var id = settingsDb.createWorkflow(workflow_1);
                        return settingsDb.getWorkflowById(id);
                    }, 'create-workflow')];
            case 1:
                result = _a.sent();
                res.status(201).json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error creating workflow:', error_4);
                res.status(500).json({ error: 'Failed to create workflow' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// PUT /workflows/:id - Update workflow
router.put('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_2, updates_1, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_2 = req.params.id;
                updates_1 = req.body;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var workflowRepo, updated;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    workflowRepo = (0, repositories_1.getWorkflowRepository)();
                                    return [4 /*yield*/, workflowRepo.update(id_2, updates_1)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, workflowRepo.getWorkflowWithSteps(id_2)];
                                case 2:
                                    updated = _a.sent();
                                    return [2 /*return*/, updated ? workflowRepo.entityToDTO(updated) : null];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () { return settingsDb.updateWorkflow(id_2, updates_1); }, 'update-workflow')];
            case 1:
                result = _a.sent();
                if (!result) {
                    return [2 /*return*/, res.status(404).json({ error: 'Workflow not found' })];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error updating workflow:', error_5);
                res.status(500).json({ error: 'Failed to update workflow' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// DELETE /workflows/:id - Delete workflow
router.delete('/:id', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_3, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id_3 = req.params.id;
                return [4 /*yield*/, (0, feature_flags_1.withTypeORMFallback)(
                    // TypeORM implementation
                    function () { return __awaiter(void 0, void 0, void 0, function () {
                        var workflowRepo, workflow;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    workflowRepo = (0, repositories_1.getWorkflowRepository)();
                                    return [4 /*yield*/, workflowRepo.findById(id_3)];
                                case 1:
                                    workflow = _a.sent();
                                    if (!workflow)
                                        return [2 /*return*/, null];
                                    return [4 /*yield*/, workflowRepo.delete(id_3)];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/, { success: true }];
                            }
                        });
                    }); }, 
                    // Fallback to original implementation
                    function () {
                        var workflow = settingsDb.getWorkflowById(id_3);
                        if (!workflow)
                            return null;
                        settingsDb.deleteWorkflow(id_3);
                        return { success: true };
                    }, 'delete-workflow')];
            case 1:
                result = _a.sent();
                if (!result) {
                    return [2 /*return*/, res.status(404).json({ error: 'Workflow not found' })];
                }
                res.json({ data: result });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error deleting workflow:', error_6);
                res.status(500).json({ error: 'Failed to delete workflow' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// GET /workflows/stats - Get workflow statistics (new TypeORM-only feature)
router.get('/stats', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var workflowRepo, stats, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!(0, feature_flags_1.useTypeORMForWorkflows)()) {
                    return [2 /*return*/, res.status(501).json({
                            error: 'Workflow statistics require TypeORM to be enabled'
                        })];
                }
                workflowRepo = (0, repositories_1.getWorkflowRepository)();
                return [4 /*yield*/, workflowRepo.getWorkflowStatistics()];
            case 1:
                stats = _a.sent();
                res.json({ data: stats });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('Error fetching workflow statistics:', error_7);
                res.status(500).json({ error: 'Failed to fetch workflow statistics' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
exports.default = router;
