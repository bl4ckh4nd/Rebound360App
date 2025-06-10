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
exports.SupplierOrder = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var Supplier_1 = require("./Supplier");
var OrderProduct_1 = require("./OrderProduct");
var SupplierReturn_1 = require("../core/SupplierReturn");
var SupplierOrder = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('supplier_orders'), (0, typeorm_1.Check)("\"status\" IN ('bestellt', 'geliefert', 'teilgeliefert', 'storniert')")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = BaseEntity_1.BaseEntity;
    var _orderNumber_decorators;
    var _orderNumber_initializers = [];
    var _orderNumber_extraInitializers = [];
    var _supplierReference_decorators;
    var _supplierReference_initializers = [];
    var _supplierReference_extraInitializers = [];
    var _orderDate_decorators;
    var _orderDate_initializers = [];
    var _orderDate_extraInitializers = [];
    var _deliveryDate_decorators;
    var _deliveryDate_initializers = [];
    var _deliveryDate_extraInitializers = [];
    var _supplierName_decorators;
    var _supplierName_initializers = [];
    var _supplierName_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _jtlId_decorators;
    var _jtlId_initializers = [];
    var _jtlId_extraInitializers = [];
    var _jtlSupplierId_decorators;
    var _jtlSupplierId_initializers = [];
    var _jtlSupplierId_extraInitializers = [];
    var _supplier_decorators;
    var _supplier_initializers = [];
    var _supplier_extraInitializers = [];
    var _lastSynced_decorators;
    var _lastSynced_initializers = [];
    var _lastSynced_extraInitializers = [];
    var _products_decorators;
    var _products_initializers = [];
    var _products_extraInitializers = [];
    var _returns_decorators;
    var _returns_initializers = [];
    var _returns_extraInitializers = [];
    var SupplierOrder = _classThis = /** @class */ (function (_super) {
        __extends(SupplierOrder_1, _super);
        function SupplierOrder_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.orderNumber = __runInitializers(_this, _orderNumber_initializers, void 0);
            _this.supplierReference = (__runInitializers(_this, _orderNumber_extraInitializers), __runInitializers(_this, _supplierReference_initializers, void 0));
            _this.orderDate = (__runInitializers(_this, _supplierReference_extraInitializers), __runInitializers(_this, _orderDate_initializers, void 0));
            _this.deliveryDate = (__runInitializers(_this, _orderDate_extraInitializers), __runInitializers(_this, _deliveryDate_initializers, void 0));
            _this.supplierName = (__runInitializers(_this, _deliveryDate_extraInitializers), __runInitializers(_this, _supplierName_initializers, void 0));
            _this.status = (__runInitializers(_this, _supplierName_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            _this.createdAt = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _createdAt_initializers, void 0));
            _this.updatedAt = (__runInitializers(_this, _createdAt_extraInitializers), __runInitializers(_this, _updatedAt_initializers, void 0));
            _this.jtlId = (__runInitializers(_this, _updatedAt_extraInitializers), __runInitializers(_this, _jtlId_initializers, void 0));
            _this.jtlSupplierId = (__runInitializers(_this, _jtlId_extraInitializers), __runInitializers(_this, _jtlSupplierId_initializers, void 0));
            _this.supplier = (__runInitializers(_this, _jtlSupplierId_extraInitializers), __runInitializers(_this, _supplier_initializers, void 0));
            _this.lastSynced = (__runInitializers(_this, _supplier_extraInitializers), __runInitializers(_this, _lastSynced_initializers, void 0));
            // Relations
            _this.products = (__runInitializers(_this, _lastSynced_extraInitializers), __runInitializers(_this, _products_initializers, void 0));
            _this.returns = (__runInitializers(_this, _products_extraInitializers), __runInitializers(_this, _returns_initializers, void 0));
            __runInitializers(_this, _returns_extraInitializers);
            return _this;
        }
        return SupplierOrder_1;
    }(_classSuper));
    __setFunctionName(_classThis, "SupplierOrder");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _orderNumber_decorators = [(0, typeorm_1.Column)({ name: 'orderNumber', type: 'text' })];
        _supplierReference_decorators = [(0, typeorm_1.Column)({ name: 'supplierReference', type: 'text', nullable: true })];
        _orderDate_decorators = [(0, typeorm_1.Column)({ name: 'orderDate', type: 'text' })];
        _deliveryDate_decorators = [(0, typeorm_1.Column)({ name: 'deliveryDate', type: 'text', nullable: true })];
        _supplierName_decorators = [(0, typeorm_1.Column)({ name: 'supplierName', type: 'text' })];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _createdAt_decorators = [(0, typeorm_1.Column)({ name: 'createdAt', type: 'datetime', default: function () { return 'CURRENT_TIMESTAMP'; } })];
        _updatedAt_decorators = [(0, typeorm_1.Column)({ name: 'updatedAt', type: 'datetime', nullable: true })];
        _jtlId_decorators = [(0, typeorm_1.Column)({ name: 'jtl_id', type: 'integer', nullable: true, unique: true }), (0, typeorm_1.Index)()];
        _jtlSupplierId_decorators = [(0, typeorm_1.Column)({ name: 'jtl_supplier_id', type: 'integer', nullable: true })];
        _supplier_decorators = [(0, typeorm_1.ManyToOne)(function () { return Supplier_1.Supplier; }, function (supplier) { return supplier.orders; }, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'jtl_supplier_id', referencedColumnName: 'jtlId' })];
        _lastSynced_decorators = [(0, typeorm_1.Column)({ name: 'last_synced', type: 'datetime', nullable: true })];
        _products_decorators = [(0, typeorm_1.OneToMany)(function () { return OrderProduct_1.OrderProduct; }, function (product) { return product.order; }, { cascade: true })];
        _returns_decorators = [(0, typeorm_1.OneToMany)(function () { return SupplierReturn_1.SupplierReturn; }, function (supplierReturn) { return supplierReturn.order; })];
        __esDecorate(null, null, _orderNumber_decorators, { kind: "field", name: "orderNumber", static: false, private: false, access: { has: function (obj) { return "orderNumber" in obj; }, get: function (obj) { return obj.orderNumber; }, set: function (obj, value) { obj.orderNumber = value; } }, metadata: _metadata }, _orderNumber_initializers, _orderNumber_extraInitializers);
        __esDecorate(null, null, _supplierReference_decorators, { kind: "field", name: "supplierReference", static: false, private: false, access: { has: function (obj) { return "supplierReference" in obj; }, get: function (obj) { return obj.supplierReference; }, set: function (obj, value) { obj.supplierReference = value; } }, metadata: _metadata }, _supplierReference_initializers, _supplierReference_extraInitializers);
        __esDecorate(null, null, _orderDate_decorators, { kind: "field", name: "orderDate", static: false, private: false, access: { has: function (obj) { return "orderDate" in obj; }, get: function (obj) { return obj.orderDate; }, set: function (obj, value) { obj.orderDate = value; } }, metadata: _metadata }, _orderDate_initializers, _orderDate_extraInitializers);
        __esDecorate(null, null, _deliveryDate_decorators, { kind: "field", name: "deliveryDate", static: false, private: false, access: { has: function (obj) { return "deliveryDate" in obj; }, get: function (obj) { return obj.deliveryDate; }, set: function (obj, value) { obj.deliveryDate = value; } }, metadata: _metadata }, _deliveryDate_initializers, _deliveryDate_extraInitializers);
        __esDecorate(null, null, _supplierName_decorators, { kind: "field", name: "supplierName", static: false, private: false, access: { has: function (obj) { return "supplierName" in obj; }, get: function (obj) { return obj.supplierName; }, set: function (obj, value) { obj.supplierName = value; } }, metadata: _metadata }, _supplierName_initializers, _supplierName_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _jtlId_decorators, { kind: "field", name: "jtlId", static: false, private: false, access: { has: function (obj) { return "jtlId" in obj; }, get: function (obj) { return obj.jtlId; }, set: function (obj, value) { obj.jtlId = value; } }, metadata: _metadata }, _jtlId_initializers, _jtlId_extraInitializers);
        __esDecorate(null, null, _jtlSupplierId_decorators, { kind: "field", name: "jtlSupplierId", static: false, private: false, access: { has: function (obj) { return "jtlSupplierId" in obj; }, get: function (obj) { return obj.jtlSupplierId; }, set: function (obj, value) { obj.jtlSupplierId = value; } }, metadata: _metadata }, _jtlSupplierId_initializers, _jtlSupplierId_extraInitializers);
        __esDecorate(null, null, _supplier_decorators, { kind: "field", name: "supplier", static: false, private: false, access: { has: function (obj) { return "supplier" in obj; }, get: function (obj) { return obj.supplier; }, set: function (obj, value) { obj.supplier = value; } }, metadata: _metadata }, _supplier_initializers, _supplier_extraInitializers);
        __esDecorate(null, null, _lastSynced_decorators, { kind: "field", name: "lastSynced", static: false, private: false, access: { has: function (obj) { return "lastSynced" in obj; }, get: function (obj) { return obj.lastSynced; }, set: function (obj, value) { obj.lastSynced = value; } }, metadata: _metadata }, _lastSynced_initializers, _lastSynced_extraInitializers);
        __esDecorate(null, null, _products_decorators, { kind: "field", name: "products", static: false, private: false, access: { has: function (obj) { return "products" in obj; }, get: function (obj) { return obj.products; }, set: function (obj, value) { obj.products = value; } }, metadata: _metadata }, _products_initializers, _products_extraInitializers);
        __esDecorate(null, null, _returns_decorators, { kind: "field", name: "returns", static: false, private: false, access: { has: function (obj) { return "returns" in obj; }, get: function (obj) { return obj.returns; }, set: function (obj, value) { obj.returns = value; } }, metadata: _metadata }, _returns_initializers, _returns_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SupplierOrder = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SupplierOrder = _classThis;
}();
exports.SupplierOrder = SupplierOrder;
