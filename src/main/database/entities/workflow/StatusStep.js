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
exports.StatusStep = void 0;
var typeorm_1 = require("typeorm");
var TimestampEntity_1 = require("../base/TimestampEntity");
var StatusWorkflow_1 = require("./StatusWorkflow");
var StatusStep = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('status_steps')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = TimestampEntity_1.TimestampEntity;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _workflowId_decorators;
    var _workflowId_initializers = [];
    var _workflowId_extraInitializers = [];
    var _workflow_decorators;
    var _workflow_initializers = [];
    var _workflow_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _color_decorators;
    var _color_initializers = [];
    var _color_extraInitializers = [];
    var _orderIndex_decorators;
    var _orderIndex_initializers = [];
    var _orderIndex_extraInitializers = [];
    var _requiredFields_decorators;
    var _requiredFields_initializers = [];
    var _requiredFields_extraInitializers = [];
    var StatusStep = _classThis = /** @class */ (function (_super) {
        __extends(StatusStep_1, _super);
        function StatusStep_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.id = __runInitializers(_this, _id_initializers, void 0);
            _this.workflowId = (__runInitializers(_this, _id_extraInitializers), __runInitializers(_this, _workflowId_initializers, void 0));
            _this.workflow = (__runInitializers(_this, _workflowId_extraInitializers), __runInitializers(_this, _workflow_initializers, void 0));
            _this.name = (__runInitializers(_this, _workflow_extraInitializers), __runInitializers(_this, _name_initializers, void 0));
            _this.description = (__runInitializers(_this, _name_extraInitializers), __runInitializers(_this, _description_initializers, void 0));
            _this.color = (__runInitializers(_this, _description_extraInitializers), __runInitializers(_this, _color_initializers, void 0));
            _this.orderIndex = (__runInitializers(_this, _color_extraInitializers), __runInitializers(_this, _orderIndex_initializers, void 0));
            _this.requiredFields = (__runInitializers(_this, _orderIndex_extraInitializers), __runInitializers(_this, _requiredFields_initializers, void 0));
            __runInitializers(_this, _requiredFields_extraInitializers);
            return _this;
        }
        return StatusStep_1;
    }(_classSuper));
    __setFunctionName(_classThis, "StatusStep");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _workflowId_decorators = [(0, typeorm_1.Column)({ name: 'workflow_id', type: 'text' })];
        _workflow_decorators = [(0, typeorm_1.ManyToOne)(function () { return StatusWorkflow_1.StatusWorkflow; }, function (workflow) { return workflow.steps; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'workflow_id' })];
        _name_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _description_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _color_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _orderIndex_decorators = [(0, typeorm_1.Column)({ name: 'order_index', type: 'integer' })];
        _requiredFields_decorators = [(0, typeorm_1.Column)({
                name: 'required_fields',
                type: 'text',
                nullable: true,
                transformer: {
                    to: function (value) { return value ? JSON.stringify(value) : null; },
                    from: function (value) { return value ? JSON.parse(value) : []; }
                }
            })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _workflowId_decorators, { kind: "field", name: "workflowId", static: false, private: false, access: { has: function (obj) { return "workflowId" in obj; }, get: function (obj) { return obj.workflowId; }, set: function (obj, value) { obj.workflowId = value; } }, metadata: _metadata }, _workflowId_initializers, _workflowId_extraInitializers);
        __esDecorate(null, null, _workflow_decorators, { kind: "field", name: "workflow", static: false, private: false, access: { has: function (obj) { return "workflow" in obj; }, get: function (obj) { return obj.workflow; }, set: function (obj, value) { obj.workflow = value; } }, metadata: _metadata }, _workflow_initializers, _workflow_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _color_decorators, { kind: "field", name: "color", static: false, private: false, access: { has: function (obj) { return "color" in obj; }, get: function (obj) { return obj.color; }, set: function (obj, value) { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
        __esDecorate(null, null, _orderIndex_decorators, { kind: "field", name: "orderIndex", static: false, private: false, access: { has: function (obj) { return "orderIndex" in obj; }, get: function (obj) { return obj.orderIndex; }, set: function (obj, value) { obj.orderIndex = value; } }, metadata: _metadata }, _orderIndex_initializers, _orderIndex_extraInitializers);
        __esDecorate(null, null, _requiredFields_decorators, { kind: "field", name: "requiredFields", static: false, private: false, access: { has: function (obj) { return "requiredFields" in obj; }, get: function (obj) { return obj.requiredFields; }, set: function (obj, value) { obj.requiredFields = value; } }, metadata: _metadata }, _requiredFields_initializers, _requiredFields_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        StatusStep = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return StatusStep = _classThis;
}();
exports.StatusStep = StatusStep;
