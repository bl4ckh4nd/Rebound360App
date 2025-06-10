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
exports.ReturnProduct = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var SupplierReturn_1 = require("./SupplierReturn");
var ReturnProduct = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('return_products')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = BaseEntity_1.BaseEntity;
    var _returnId_decorators;
    var _returnId_initializers = [];
    var _returnId_extraInitializers = [];
    var _return_decorators;
    var _return_initializers = [];
    var _return_extraInitializers = [];
    var _productName_decorators;
    var _productName_initializers = [];
    var _productName_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    var _reason_decorators;
    var _reason_initializers = [];
    var _reason_extraInitializers = [];
    var _serialNumber_decorators;
    var _serialNumber_initializers = [];
    var _serialNumber_extraInitializers = [];
    var ReturnProduct = _classThis = /** @class */ (function (_super) {
        __extends(ReturnProduct_1, _super);
        function ReturnProduct_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.returnId = __runInitializers(_this, _returnId_initializers, void 0);
            _this.return = (__runInitializers(_this, _returnId_extraInitializers), __runInitializers(_this, _return_initializers, void 0));
            _this.productName = (__runInitializers(_this, _return_extraInitializers), __runInitializers(_this, _productName_initializers, void 0));
            _this.quantity = (__runInitializers(_this, _productName_extraInitializers), __runInitializers(_this, _quantity_initializers, void 0));
            _this.reason = (__runInitializers(_this, _quantity_extraInitializers), __runInitializers(_this, _reason_initializers, void 0));
            _this.serialNumber = (__runInitializers(_this, _reason_extraInitializers), __runInitializers(_this, _serialNumber_initializers, void 0));
            __runInitializers(_this, _serialNumber_extraInitializers);
            return _this;
        }
        return ReturnProduct_1;
    }(_classSuper));
    __setFunctionName(_classThis, "ReturnProduct");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _returnId_decorators = [(0, typeorm_1.Column)({ name: 'returnId', type: 'integer' })];
        _return_decorators = [(0, typeorm_1.ManyToOne)(function () { return SupplierReturn_1.SupplierReturn; }, function (supplierReturn) { return supplierReturn.products; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'returnId' })];
        _productName_decorators = [(0, typeorm_1.Column)({ name: 'productName', type: 'text' })];
        _quantity_decorators = [(0, typeorm_1.Column)({ type: 'integer' })];
        _reason_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _serialNumber_decorators = [(0, typeorm_1.Column)({ name: 'serialNumber', type: 'text', nullable: true })];
        __esDecorate(null, null, _returnId_decorators, { kind: "field", name: "returnId", static: false, private: false, access: { has: function (obj) { return "returnId" in obj; }, get: function (obj) { return obj.returnId; }, set: function (obj, value) { obj.returnId = value; } }, metadata: _metadata }, _returnId_initializers, _returnId_extraInitializers);
        __esDecorate(null, null, _return_decorators, { kind: "field", name: "return", static: false, private: false, access: { has: function (obj) { return "return" in obj; }, get: function (obj) { return obj.return; }, set: function (obj, value) { obj.return = value; } }, metadata: _metadata }, _return_initializers, _return_extraInitializers);
        __esDecorate(null, null, _productName_decorators, { kind: "field", name: "productName", static: false, private: false, access: { has: function (obj) { return "productName" in obj; }, get: function (obj) { return obj.productName; }, set: function (obj, value) { obj.productName = value; } }, metadata: _metadata }, _productName_initializers, _productName_extraInitializers);
        __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
        __esDecorate(null, null, _reason_decorators, { kind: "field", name: "reason", static: false, private: false, access: { has: function (obj) { return "reason" in obj; }, get: function (obj) { return obj.reason; }, set: function (obj, value) { obj.reason = value; } }, metadata: _metadata }, _reason_initializers, _reason_extraInitializers);
        __esDecorate(null, null, _serialNumber_decorators, { kind: "field", name: "serialNumber", static: false, private: false, access: { has: function (obj) { return "serialNumber" in obj; }, get: function (obj) { return obj.serialNumber; }, set: function (obj, value) { obj.serialNumber = value; } }, metadata: _metadata }, _serialNumber_initializers, _serialNumber_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReturnProduct = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReturnProduct = _classThis;
}();
exports.ReturnProduct = ReturnProduct;
