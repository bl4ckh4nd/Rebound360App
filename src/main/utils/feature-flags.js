"use strict";
/**
 * Feature flag system for TypeORM migration rollout
 * Allows gradual migration with easy rollback
 */
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
exports.enableAutoFallback = exports.enablePerformanceLogging = exports.useTypeORMForProcurement = exports.useTypeORMForOrders = exports.useTypeORMForSuppliers = exports.useTypeORMForReturns = exports.useTypeORMForReasons = exports.useTypeORMForCustomFields = exports.useTypeORMForWorkflows = exports.useTypeORMForSettings = exports.featureFlags = void 0;
exports.withTypeORMFallback = withTypeORMFallback;
exports.enableTypeORMForDevelopment = enableTypeORMForDevelopment;
var FeatureFlagManager = /** @class */ (function () {
    function FeatureFlagManager() {
        this.overrides = {};
        this.flags = this.getDefaultFlags();
        this.loadEnvironmentOverrides();
    }
    /**
     * Default feature flag configuration
     */
    FeatureFlagManager.prototype.getDefaultFlags = function () {
        return {
            // Start with TypeORM disabled for production safety
            useTypeORMForSettings: false,
            useTypeORMForWorkflows: false,
            useTypeORMForCustomFields: false,
            useTypeORMForReasons: false,
            useTypeORMForReturns: false,
            useTypeORMForSuppliers: false,
            useTypeORMForOrders: false,
            useTypeORMForProcurement: false,
            useTypeORMForReporting: false,
            // Enable monitoring in development
            enablePerformanceLogging: process.env.NODE_ENV === 'development',
            enableTypeORMQueryLogging: process.env.NODE_ENV === 'development',
            enableHybridQueryComparison: process.env.NODE_ENV === 'development',
            // Conservative rollout settings
            typeormRolloutPercentage: 0,
            enableAutoFallback: true
        };
    };
    /**
     * Load overrides from environment variables
     */
    FeatureFlagManager.prototype.loadEnvironmentOverrides = function () {
        // TypeORM feature flags
        if (process.env.TYPEORM_SETTINGS === 'true') {
            this.overrides.useTypeORMForSettings = true;
        }
        if (process.env.TYPEORM_WORKFLOWS === 'true') {
            this.overrides.useTypeORMForWorkflows = true;
        }
        if (process.env.TYPEORM_CUSTOM_FIELDS === 'true') {
            this.overrides.useTypeORMForCustomFields = true;
        }
        if (process.env.TYPEORM_REASONS === 'true') {
            this.overrides.useTypeORMForReasons = true;
        }
        // Advanced features (typically disabled in production)
        if (process.env.TYPEORM_RETURNS === 'true') {
            this.overrides.useTypeORMForReturns = true;
        }
        if (process.env.TYPEORM_SUPPLIERS === 'true') {
            this.overrides.useTypeORMForSuppliers = true;
        }
        if (process.env.TYPEORM_ORDERS === 'true') {
            this.overrides.useTypeORMForOrders = true;
        }
        if (process.env.TYPEORM_PROCUREMENT === 'true') {
            this.overrides.useTypeORMForProcurement = true;
        }
        // Monitoring flags
        if (process.env.ENABLE_PERFORMANCE_LOGGING === 'true') {
            this.overrides.enablePerformanceLogging = true;
        }
        if (process.env.ENABLE_TYPEORM_LOGGING === 'true') {
            this.overrides.enableTypeORMQueryLogging = true;
        }
        // Rollout percentage
        if (process.env.TYPEORM_ROLLOUT_PERCENTAGE) {
            var percentage = parseInt(process.env.TYPEORM_ROLLOUT_PERCENTAGE, 10);
            if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
                this.overrides.typeormRolloutPercentage = percentage;
            }
        }
        // Auto fallback
        if (process.env.DISABLE_AUTO_FALLBACK === 'true') {
            this.overrides.enableAutoFallback = false;
        }
    };
    /**
     * Get a feature flag value
     */
    FeatureFlagManager.prototype.isEnabled = function (flag) {
        var _a;
        return (_a = this.overrides[flag]) !== null && _a !== void 0 ? _a : this.flags[flag];
    };
    /**
     * Temporarily override a flag (for testing)
     */
    FeatureFlagManager.prototype.setOverride = function (flag, value) {
        this.overrides[flag] = value;
    };
    /**
     * Clear all overrides
     */
    FeatureFlagManager.prototype.clearOverrides = function () {
        this.overrides = {};
    };
    /**
     * Check if user should get TypeORM version based on rollout percentage
     */
    FeatureFlagManager.prototype.shouldUseTypeORM = function (userId) {
        var rolloutPercentage = this.isEnabled('typeormRolloutPercentage');
        if (rolloutPercentage === 0)
            return false;
        if (rolloutPercentage === 100)
            return true;
        // Use deterministic hash for consistent user experience
        if (userId) {
            var hash = this.hashUserId(userId);
            return hash < rolloutPercentage;
        }
        // Fallback to random for anonymous users
        return Math.random() * 100 < rolloutPercentage;
    };
    /**
     * Simple hash function for consistent user assignment
     */
    FeatureFlagManager.prototype.hashUserId = function (userId) {
        var hash = 0;
        for (var i = 0; i < userId.length; i++) {
            var char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) % 100;
    };
    /**
     * Get all current flag values (for debugging)
     */
    FeatureFlagManager.prototype.getAllFlags = function () {
        return __assign(__assign({}, this.flags), this.overrides);
    };
    /**
     * Log current flag status
     */
    FeatureFlagManager.prototype.logStatus = function () {
        var _this = this;
        console.log('🚩 Feature Flags Status:');
        console.log('='.repeat(30));
        var flags = this.getAllFlags();
        Object.entries(flags).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var icon = value ? '✅' : '❌';
            var override = key in _this.overrides ? ' (override)' : '';
            console.log("".concat(icon, " ").concat(key, ": ").concat(value).concat(override));
        });
        console.log('='.repeat(30));
    };
    return FeatureFlagManager;
}());
// Singleton instance
exports.featureFlags = new FeatureFlagManager();
// Convenience functions for common checks
var useTypeORMForSettings = function () { return exports.featureFlags.isEnabled('useTypeORMForSettings'); };
exports.useTypeORMForSettings = useTypeORMForSettings;
var useTypeORMForWorkflows = function () { return exports.featureFlags.isEnabled('useTypeORMForWorkflows'); };
exports.useTypeORMForWorkflows = useTypeORMForWorkflows;
var useTypeORMForCustomFields = function () { return exports.featureFlags.isEnabled('useTypeORMForCustomFields'); };
exports.useTypeORMForCustomFields = useTypeORMForCustomFields;
var useTypeORMForReasons = function () { return exports.featureFlags.isEnabled('useTypeORMForReasons'); };
exports.useTypeORMForReasons = useTypeORMForReasons;
var useTypeORMForReturns = function () { return exports.featureFlags.isEnabled('useTypeORMForReturns'); };
exports.useTypeORMForReturns = useTypeORMForReturns;
var useTypeORMForSuppliers = function () { return exports.featureFlags.isEnabled('useTypeORMForSuppliers'); };
exports.useTypeORMForSuppliers = useTypeORMForSuppliers;
var useTypeORMForOrders = function () { return exports.featureFlags.isEnabled('useTypeORMForOrders'); };
exports.useTypeORMForOrders = useTypeORMForOrders;
var useTypeORMForProcurement = function () { return exports.featureFlags.isEnabled('useTypeORMForProcurement'); };
exports.useTypeORMForProcurement = useTypeORMForProcurement;
var enablePerformanceLogging = function () { return exports.featureFlags.isEnabled('enablePerformanceLogging'); };
exports.enablePerformanceLogging = enablePerformanceLogging;
var enableAutoFallback = function () { return exports.featureFlags.isEnabled('enableAutoFallback'); };
exports.enableAutoFallback = enableAutoFallback;
/**
 * Wrapper function for gradual TypeORM rollout
 */
function withTypeORMFallback(typeormOperation_1, fallbackOperation_1) {
    return __awaiter(this, arguments, void 0, function (typeormOperation, fallbackOperation, operationName) {
        var shouldFallback, start, result, error_1;
        if (operationName === void 0) { operationName = 'unknown'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    shouldFallback = !exports.featureFlags.isEnabled('enableAutoFallback');
                    if (!shouldFallback) return [3 /*break*/, 2];
                    return [4 /*yield*/, fallbackOperation()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    _a.trys.push([2, 4, , 8]);
                    start = Date.now();
                    return [4 /*yield*/, typeormOperation()];
                case 3:
                    result = _a.sent();
                    if (exports.featureFlags.isEnabled('enablePerformanceLogging')) {
                        console.log("\u26A1 TypeORM ".concat(operationName, ": ").concat(Date.now() - start, "ms"));
                    }
                    return [2 /*return*/, result];
                case 4:
                    error_1 = _a.sent();
                    console.error("\u274C TypeORM ".concat(operationName, " failed, falling back:"), error_1 instanceof Error ? error_1.message : error_1);
                    if (!exports.featureFlags.isEnabled('enableAutoFallback')) return [3 /*break*/, 6];
                    return [4 /*yield*/, fallbackOperation()];
                case 5: return [2 /*return*/, _a.sent()];
                case 6: throw error_1;
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Development helper to quickly enable TypeORM features
 */
function enableTypeORMForDevelopment() {
    if (process.env.NODE_ENV !== 'development') {
        console.warn('⚠️  enableTypeORMForDevelopment() should only be used in development');
        return;
    }
    console.log('🚀 Enabling TypeORM features for development...');
    exports.featureFlags.setOverride('useTypeORMForSettings', true);
    exports.featureFlags.setOverride('useTypeORMForWorkflows', true);
    exports.featureFlags.setOverride('useTypeORMForCustomFields', true);
    exports.featureFlags.setOverride('useTypeORMForReasons', true);
    exports.featureFlags.setOverride('enablePerformanceLogging', true);
    exports.featureFlags.setOverride('enableTypeORMQueryLogging', true);
    exports.featureFlags.logStatus();
}
