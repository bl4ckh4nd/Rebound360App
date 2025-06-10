"use strict";
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
exports.RequisitionComment = void 0;
var typeorm_1 = require("typeorm");
var Requisition_1 = require("./Requisition");
var RequisitionComment = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('requisition_comments'), (0, typeorm_1.Check)("\"type\" IN ('comment', 'approval', 'rejection', 'system')")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _requisitionId_decorators;
    var _requisitionId_initializers = [];
    var _requisitionId_extraInitializers = [];
    var _requisition_decorators;
    var _requisition_initializers = [];
    var _requisition_extraInitializers = [];
    var _text_decorators;
    var _text_initializers = [];
    var _text_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _userName_decorators;
    var _userName_initializers = [];
    var _userName_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _isInternal_decorators;
    var _isInternal_initializers = [];
    var _isInternal_extraInitializers = [];
    var RequisitionComment = _classThis = /** @class */ (function () {
        function RequisitionComment_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.requisitionId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _requisitionId_initializers, void 0));
            this.requisition = (__runInitializers(this, _requisitionId_extraInitializers), __runInitializers(this, _requisition_initializers, void 0));
            this.text = (__runInitializers(this, _requisition_extraInitializers), __runInitializers(this, _text_initializers, void 0));
            this.createdAt = (__runInitializers(this, _text_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.userId = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.userName = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _userName_initializers, void 0));
            this.type = (__runInitializers(this, _userName_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.isInternal = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _isInternal_initializers, void 0));
            __runInitializers(this, _isInternal_extraInitializers);
        }
        return RequisitionComment_1;
    }());
    __setFunctionName(_classThis, "RequisitionComment");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _requisitionId_decorators = [(0, typeorm_1.Column)({ name: 'requisition_id', type: 'text' })];
        _requisition_decorators = [(0, typeorm_1.ManyToOne)(function () { return Requisition_1.Requisition; }, function (requisition) { return requisition.comments; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'requisition_id' })];
        _text_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'datetime', default: function () { return 'CURRENT_TIMESTAMP'; } })];
        _userId_decorators = [(0, typeorm_1.Column)({ name: 'user_id', type: 'text' })];
        _userName_decorators = [(0, typeorm_1.Column)({ name: 'user_name', type: 'text' })];
        _type_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _isInternal_decorators = [(0, typeorm_1.Column)({ name: 'is_internal', type: 'integer', default: 0 })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _requisitionId_decorators, { kind: "field", name: "requisitionId", static: false, private: false, access: { has: function (obj) { return "requisitionId" in obj; }, get: function (obj) { return obj.requisitionId; }, set: function (obj, value) { obj.requisitionId = value; } }, metadata: _metadata }, _requisitionId_initializers, _requisitionId_extraInitializers);
        __esDecorate(null, null, _requisition_decorators, { kind: "field", name: "requisition", static: false, private: false, access: { has: function (obj) { return "requisition" in obj; }, get: function (obj) { return obj.requisition; }, set: function (obj, value) { obj.requisition = value; } }, metadata: _metadata }, _requisition_initializers, _requisition_extraInitializers);
        __esDecorate(null, null, _text_decorators, { kind: "field", name: "text", static: false, private: false, access: { has: function (obj) { return "text" in obj; }, get: function (obj) { return obj.text; }, set: function (obj, value) { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _userName_decorators, { kind: "field", name: "userName", static: false, private: false, access: { has: function (obj) { return "userName" in obj; }, get: function (obj) { return obj.userName; }, set: function (obj, value) { obj.userName = value; } }, metadata: _metadata }, _userName_initializers, _userName_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _isInternal_decorators, { kind: "field", name: "isInternal", static: false, private: false, access: { has: function (obj) { return "isInternal" in obj; }, get: function (obj) { return obj.isInternal; }, set: function (obj, value) { obj.isInternal = value; } }, metadata: _metadata }, _isInternal_initializers, _isInternal_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RequisitionComment = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RequisitionComment = _classThis;
}();
exports.RequisitionComment = RequisitionComment;
