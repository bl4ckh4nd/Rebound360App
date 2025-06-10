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
exports.setupSettingsHybridApi = setupSettingsHybridApi;
var express_1 = require("express");
var settingsDb = require("../database/settings");
var workflows_hybrid_1 = require("./workflows-hybrid");
var custom_fields_hybrid_1 = require("./custom-fields-hybrid");
var reasons_hybrid_1 = require("./reasons-hybrid");
var feature_flags_1 = require("../utils/feature-flags");
/**
 * Complete hybrid settings API that routes to appropriate implementations
 * Combines database settings, workflows, custom fields, and reasons
 */
var router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var flagStatus, healthData;
    return __generator(this, function (_a) {
        try {
            flagStatus = feature_flags_1.featureFlags.getAllFlags();
            healthData = {
                status: 'healthy',
                message: 'Settings API operational',
                featureFlags: {
                    workflows: flagStatus.useTypeORMForWorkflows,
                    customFields: flagStatus.useTypeORMForCustomFields,
                    reasons: flagStatus.useTypeORMForReasons,
                    performanceLogging: flagStatus.enablePerformanceLogging
                },
                timestamp: new Date().toISOString()
            };
            if ((0, feature_flags_1.enablePerformanceLogging)()) {
                console.log('🏥 Settings API health check completed', healthData);
            }
            res.json({ data: healthData });
        }
        catch (error) {
            console.error('Error in settings health check:', error);
            res.status(500).json({
                data: {
                    status: 'unhealthy',
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                }
            });
        }
        return [2 /*return*/];
    });
}); }));
// Database settings endpoints (non-TypeORM, security-sensitive)
router.get('/database', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, secureSettings, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, settingsDb.getDatabaseSettings()];
            case 1:
                settings = _a.sent();
                if (!settings) {
                    res.status(404).json({ error: 'Database settings not found' });
                    return [2 /*return*/];
                }
                secureSettings = __assign(__assign({}, settings), { password: '********' });
                res.json({ data: secureSettings });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching database settings:', error_1);
                res.status(500).json({ error: 'Failed to fetch database settings' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
router.post('/database', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, existingSettings, secureSettings, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                settings = req.body;
                if (!settings.host || !settings.port || !settings.database || !settings.username) {
                    res.status(400).json({ error: 'Missing required database settings' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, settingsDb.getDatabaseSettings()];
            case 1:
                existingSettings = _a.sent();
                if (existingSettings && !settings.password) {
                    settings.password = existingSettings.password;
                }
                settingsDb.setDatabaseSettings(settings);
                secureSettings = __assign(__assign({}, settings), { password: '********' });
                res.json({ data: secureSettings });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error updating database settings:', error_2);
                res.status(500).json({ error: 'Failed to update database settings' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
router.post('/database/test', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sql, settings, lastConnectionTest, config, pool, err_1, errorMessage, closeErr_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('mssql'); })];
            case 1:
                sql = _a.sent();
                settings = req.body;
                lastConnectionTest = new Date().toISOString();
                console.log('[API /database/test] Received settings:', __assign(__assign({}, settings), { password: '****' }));
                // Validate required settings
                if (!settings.host || !settings.port || !settings.database || !settings.username) {
                    console.log('[API /database/test] Validation failed');
                    res.status(400).json({
                        success: false,
                        message: 'Fehler: Hostname, Port, Datenbankname und Benutzername sind erforderlich.',
                        lastConnectionTest: lastConnectionTest
                    });
                    return [2 /*return*/];
                }
                config = {
                    user: settings.username,
                    password: settings.password,
                    server: settings.host,
                    port: settings.port,
                    database: settings.database,
                    options: {
                        encrypt: settings.useSSL,
                        trustServerCertificate: true
                    },
                    connectionTimeout: settings.connectionTimeout || 15000,
                    requestTimeout: settings.connectionTimeout || 15000
                };
                console.log('[API /database/test] Using connection config:', __assign(__assign({}, config), { password: '****' }));
                pool = null;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 10]);
                console.log("[API /database/test] Attempting DB connection to ".concat(config.server, ":").concat(config.port, "/").concat(config.database, " as ").concat(config.user));
                pool = new sql.ConnectionPool(config);
                return [4 /*yield*/, pool.connect()];
            case 3:
                _a.sent();
                console.log('[API /database/test] DB Connection successful');
                res.json({
                    success: true,
                    message: 'Verbindung erfolgreich hergestellt.',
                    lastConnectionTest: lastConnectionTest
                });
                return [3 /*break*/, 10];
            case 4:
                err_1 = _a.sent();
                console.error('[API /database/test] DB Connection failed:', err_1);
                errorMessage = (err_1 instanceof Error) ? err_1.message : String(err_1);
                res.status(400).json({
                    success: false,
                    message: "Verbindung fehlgeschlagen: ".concat(errorMessage),
                    lastConnectionTest: lastConnectionTest
                });
                return [3 /*break*/, 10];
            case 5:
                if (!pool) return [3 /*break*/, 9];
                _a.label = 6;
            case 6:
                _a.trys.push([6, 8, , 9]);
                return [4 /*yield*/, pool.close()];
            case 7:
                _a.sent();
                console.log('DB Connection pool closed.');
                return [3 /*break*/, 9];
            case 8:
                closeErr_1 = _a.sent();
                console.error('Error closing DB connection pool:', closeErr_1);
                return [3 /*break*/, 9];
            case 9: return [7 /*endfinally*/];
            case 10: return [2 /*return*/];
        }
    });
}); }));
// Mount hybrid sub-routers for different settings areas
router.use('/workflows', workflows_hybrid_1.default);
router.use('/custom-fields', custom_fields_hybrid_1.default);
router.use('/', reasons_hybrid_1.default); // Includes /reason-categories and /reasons
// Feature flag status endpoint
router.get('/feature-flags', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var flags, settingsFlags;
    return __generator(this, function (_a) {
        try {
            flags = feature_flags_1.featureFlags.getAllFlags();
            settingsFlags = {
                workflows: flags.useTypeORMForWorkflows,
                customFields: flags.useTypeORMForCustomFields,
                reasons: flags.useTypeORMForReasons,
                performanceLogging: flags.enablePerformanceLogging,
                autoFallback: flags.enableAutoFallback
            };
            if ((0, feature_flags_1.enablePerformanceLogging)()) {
                console.log('🚩 Settings feature flags requested:', settingsFlags);
            }
            res.json({ data: settingsFlags });
        }
        catch (error) {
            console.error('Error fetching feature flags:', error);
            res.status(500).json({ error: 'Failed to fetch feature flags' });
        }
        return [2 /*return*/];
    });
}); }));
// Settings summary endpoint (TypeORM-enhanced feature)
router.get('/summary', (function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var summary, error_3;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = {};
                _b = {};
                return [4 /*yield*/, settingsDb.getDatabaseSettings()];
            case 1:
                summary = (_a.database = (_b.configured = !!(_c.sent()),
                    _b.lastTested = null // Could be enhanced
                ,
                    _b),
                    _a.workflows = {
                        implementation: feature_flags_1.featureFlags.isEnabled('useTypeORMForWorkflows') ? 'typeorm' : 'sqlite',
                        available: true
                    },
                    _a.customFields = {
                        implementation: feature_flags_1.featureFlags.isEnabled('useTypeORMForCustomFields') ? 'typeorm' : 'sqlite',
                        available: true
                    },
                    _a.reasons = {
                        implementation: feature_flags_1.featureFlags.isEnabled('useTypeORMForReasons') ? 'typeorm' : 'sqlite',
                        available: true
                    },
                    _a.timestamp = new Date().toISOString(),
                    _a);
                if ((0, feature_flags_1.enablePerformanceLogging)()) {
                    console.log('📊 Settings summary requested:', summary);
                }
                res.json({ data: summary });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _c.sent();
                console.error('Error fetching settings summary:', error_3);
                res.status(500).json({ error: 'Failed to fetch settings summary' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); }));
// Export the setup function to match main.ts expectation
function setupSettingsHybridApi() {
    // Log feature flag status on API setup
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Settings Hybrid API initialized');
        feature_flags_1.featureFlags.logStatus();
    }
    return router;
}
exports.default = router;
