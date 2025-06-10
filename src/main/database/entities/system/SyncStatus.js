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
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatus = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var SyncStatus = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('sync_status')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = BaseEntity_1.BaseEntity;
    var _entityType_decorators;
    var _entityType_initializers = [];
    var _entityType_extraInitializers = [];
    var _lastSuccessfulSync_decorators;
    var _lastSuccessfulSync_initializers = [];
    var _lastSuccessfulSync_extraInitializers = [];
    var _recordsSynced_decorators;
    var _recordsSynced_initializers = [];
    var _recordsSynced_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _errorMessage_decorators;
    var _errorMessage_initializers = [];
    var _errorMessage_extraInitializers = [];
    var _lastAttempt_decorators;
    var _lastAttempt_initializers = [];
    var _lastAttempt_extraInitializers = [];
    var SyncStatus = _classThis = /** @class */ (function (_super) {
        __extends(SyncStatus_1, _super);
        function SyncStatus_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.entityType = __runInitializers(_this, _entityType_initializers, void 0);
            _this.lastSuccessfulSync = (__runInitializers(_this, _entityType_extraInitializers), __runInitializers(_this, _lastSuccessfulSync_initializers, void 0));
            _this.recordsSynced = (__runInitializers(_this, _lastSuccessfulSync_extraInitializers), __runInitializers(_this, _recordsSynced_initializers, void 0));
            _this.status = (__runInitializers(_this, _recordsSynced_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            _this.errorMessage = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _errorMessage_initializers, void 0));
            _this.lastAttempt = (__runInitializers(_this, _errorMessage_extraInitializers), __runInitializers(_this, _lastAttempt_initializers, void 0));
            __runInitializers(_this, _lastAttempt_extraInitializers);
            return _this;
        }
        return SyncStatus_1;
    }(_classSuper));
    __setFunctionName(_classThis, "SyncStatus");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _entityType_decorators = [(0, typeorm_1.Column)({ name: 'entity_type', type: 'text', unique: true })];
        _lastSuccessfulSync_decorators = [(0, typeorm_1.Column)({ name: 'last_successful_sync', type: 'datetime', nullable: true })];
        _recordsSynced_decorators = [(0, typeorm_1.Column)({ name: 'records_synced', type: 'integer', default: 0 })];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _errorMessage_decorators = [(0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true })];
        _lastAttempt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'last_attempt', type: 'datetime', default: function () { return 'CURRENT_TIMESTAMP'; } })];
        __esDecorate(null, null, _entityType_decorators, { kind: "field", name: "entityType", static: false, private: false, access: { has: function (obj) { return "entityType" in obj; }, get: function (obj) { return obj.entityType; }, set: function (obj, value) { obj.entityType = value; } }, metadata: _metadata }, _entityType_initializers, _entityType_extraInitializers);
        __esDecorate(null, null, _lastSuccessfulSync_decorators, { kind: "field", name: "lastSuccessfulSync", static: false, private: false, access: { has: function (obj) { return "lastSuccessfulSync" in obj; }, get: function (obj) { return obj.lastSuccessfulSync; }, set: function (obj, value) { obj.lastSuccessfulSync = value; } }, metadata: _metadata }, _lastSuccessfulSync_initializers, _lastSuccessfulSync_extraInitializers);
        __esDecorate(null, null, _recordsSynced_decorators, { kind: "field", name: "recordsSynced", static: false, private: false, access: { has: function (obj) { return "recordsSynced" in obj; }, get: function (obj) { return obj.recordsSynced; }, set: function (obj, value) { obj.recordsSynced = value; } }, metadata: _metadata }, _recordsSynced_initializers, _recordsSynced_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _errorMessage_decorators, { kind: "field", name: "errorMessage", static: false, private: false, access: { has: function (obj) { return "errorMessage" in obj; }, get: function (obj) { return obj.errorMessage; }, set: function (obj, value) { obj.errorMessage = value; } }, metadata: _metadata }, _errorMessage_initializers, _errorMessage_extraInitializers);
        __esDecorate(null, null, _lastAttempt_decorators, { kind: "field", name: "lastAttempt", static: false, private: false, access: { has: function (obj) { return "lastAttempt" in obj; }, get: function (obj) { return obj.lastAttempt; }, set: function (obj, value) { obj.lastAttempt = value; } }, metadata: _metadata }, _lastAttempt_initializers, _lastAttempt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SyncStatus = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SyncStatus = _classThis;
}();
exports.SyncStatus = SyncStatus;
