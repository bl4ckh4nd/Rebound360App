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
exports.StatusWorkflow = void 0;
var typeorm_1 = require("typeorm");
var TimestampEntity_1 = require("../base/TimestampEntity");
var StatusStep_1 = require("./StatusStep");
var SupplierReturn_1 = require("../core/SupplierReturn");
var StatusWorkflow = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('status_workflows')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = TimestampEntity_1.TimestampEntity;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _followUpAction_decorators;
    var _followUpAction_initializers = [];
    var _followUpAction_extraInitializers = [];
    var _isDefault_decorators;
    var _isDefault_initializers = [];
    var _isDefault_extraInitializers = [];
    var _workflowType_decorators;
    var _workflowType_initializers = [];
    var _workflowType_extraInitializers = [];
    var _steps_decorators;
    var _steps_initializers = [];
    var _steps_extraInitializers = [];
    var _returns_decorators;
    var _returns_initializers = [];
    var _returns_extraInitializers = [];
    var StatusWorkflow = _classThis = /** @class */ (function (_super) {
        __extends(StatusWorkflow_1, _super);
        function StatusWorkflow_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.id = __runInitializers(_this, _id_initializers, void 0);
            _this.name = (__runInitializers(_this, _id_extraInitializers), __runInitializers(_this, _name_initializers, void 0));
            _this.followUpAction = (__runInitializers(_this, _name_extraInitializers), __runInitializers(_this, _followUpAction_initializers, void 0));
            _this.isDefault = (__runInitializers(_this, _followUpAction_extraInitializers), __runInitializers(_this, _isDefault_initializers, void 0));
            _this.workflowType = (__runInitializers(_this, _isDefault_extraInitializers), __runInitializers(_this, _workflowType_initializers, void 0));
            // Relations
            _this.steps = (__runInitializers(_this, _workflowType_extraInitializers), __runInitializers(_this, _steps_initializers, void 0));
            _this.returns = (__runInitializers(_this, _steps_extraInitializers), __runInitializers(_this, _returns_initializers, void 0));
            __runInitializers(_this, _returns_extraInitializers);
            return _this;
        }
        return StatusWorkflow_1;
    }(_classSuper));
    __setFunctionName(_classThis, "StatusWorkflow");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _name_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _followUpAction_decorators = [(0, typeorm_1.Column)({ name: 'follow_up_action', type: 'text' })];
        _isDefault_decorators = [(0, typeorm_1.Column)({ name: 'is_default', type: 'boolean', default: false })];
        _workflowType_decorators = [(0, typeorm_1.Column)({ name: 'workflow_type', type: 'text', default: 'return' })];
        _steps_decorators = [(0, typeorm_1.OneToMany)(function () { return StatusStep_1.StatusStep; }, function (step) { return step.workflow; }, { cascade: true })];
        _returns_decorators = [(0, typeorm_1.OneToMany)(function () { return SupplierReturn_1.SupplierReturn; }, function (supplierReturn) { return supplierReturn.workflow; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _followUpAction_decorators, { kind: "field", name: "followUpAction", static: false, private: false, access: { has: function (obj) { return "followUpAction" in obj; }, get: function (obj) { return obj.followUpAction; }, set: function (obj, value) { obj.followUpAction = value; } }, metadata: _metadata }, _followUpAction_initializers, _followUpAction_extraInitializers);
        __esDecorate(null, null, _isDefault_decorators, { kind: "field", name: "isDefault", static: false, private: false, access: { has: function (obj) { return "isDefault" in obj; }, get: function (obj) { return obj.isDefault; }, set: function (obj, value) { obj.isDefault = value; } }, metadata: _metadata }, _isDefault_initializers, _isDefault_extraInitializers);
        __esDecorate(null, null, _workflowType_decorators, { kind: "field", name: "workflowType", static: false, private: false, access: { has: function (obj) { return "workflowType" in obj; }, get: function (obj) { return obj.workflowType; }, set: function (obj, value) { obj.workflowType = value; } }, metadata: _metadata }, _workflowType_initializers, _workflowType_extraInitializers);
        __esDecorate(null, null, _steps_decorators, { kind: "field", name: "steps", static: false, private: false, access: { has: function (obj) { return "steps" in obj; }, get: function (obj) { return obj.steps; }, set: function (obj, value) { obj.steps = value; } }, metadata: _metadata }, _steps_initializers, _steps_extraInitializers);
        __esDecorate(null, null, _returns_decorators, { kind: "field", name: "returns", static: false, private: false, access: { has: function (obj) { return "returns" in obj; }, get: function (obj) { return obj.returns; }, set: function (obj, value) { obj.returns = value; } }, metadata: _metadata }, _returns_initializers, _returns_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StatusWorkflow = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StatusWorkflow = _classThis;
}();
exports.StatusWorkflow = StatusWorkflow;
