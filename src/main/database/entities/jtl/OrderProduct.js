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
exports.OrderProduct = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var SupplierOrder_1 = require("./SupplierOrder");
var OrderProduct = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('order_products')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = BaseEntity_1.BaseEntity;
    var _orderId_decorators;
    var _orderId_initializers = [];
    var _orderId_extraInitializers = [];
    var _order_decorators;
    var _order_initializers = [];
    var _order_extraInitializers = [];
    var _productName_decorators;
    var _productName_initializers = [];
    var _productName_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    var _price_decorators;
    var _price_initializers = [];
    var _price_extraInitializers = [];
    var _sku_decorators;
    var _sku_initializers = [];
    var _sku_extraInitializers = [];
    var _serialNumber_decorators;
    var _serialNumber_initializers = [];
    var _serialNumber_extraInitializers = [];
    var _jtlId_decorators;
    var _jtlId_initializers = [];
    var _jtlId_extraInitializers = [];
    var _jtlArticleId_decorators;
    var _jtlArticleId_initializers = [];
    var _jtlArticleId_extraInitializers = [];
    var _lastSynced_decorators;
    var _lastSynced_initializers = [];
    var _lastSynced_extraInitializers = [];
    var OrderProduct = _classThis = /** @class */ (function (_super) {
        __extends(OrderProduct_1, _super);
        function OrderProduct_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.orderId = __runInitializers(_this, _orderId_initializers, void 0);
            _this.order = (__runInitializers(_this, _orderId_extraInitializers), __runInitializers(_this, _order_initializers, void 0));
            _this.productName = (__runInitializers(_this, _order_extraInitializers), __runInitializers(_this, _productName_initializers, void 0));
            _this.quantity = (__runInitializers(_this, _productName_extraInitializers), __runInitializers(_this, _quantity_initializers, void 0));
            _this.price = (__runInitializers(_this, _quantity_extraInitializers), __runInitializers(_this, _price_initializers, void 0));
            _this.sku = (__runInitializers(_this, _price_extraInitializers), __runInitializers(_this, _sku_initializers, void 0));
            _this.serialNumber = (__runInitializers(_this, _sku_extraInitializers), __runInitializers(_this, _serialNumber_initializers, void 0));
            _this.jtlId = (__runInitializers(_this, _serialNumber_extraInitializers), __runInitializers(_this, _jtlId_initializers, void 0));
            _this.jtlArticleId = (__runInitializers(_this, _jtlId_extraInitializers), __runInitializers(_this, _jtlArticleId_initializers, void 0));
            _this.lastSynced = (__runInitializers(_this, _jtlArticleId_extraInitializers), __runInitializers(_this, _lastSynced_initializers, void 0));
            __runInitializers(_this, _lastSynced_extraInitializers);
            return _this;
        }
        return OrderProduct_1;
    }(_classSuper));
    __setFunctionName(_classThis, "OrderProduct");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _orderId_decorators = [(0, typeorm_1.Column)({ name: 'orderId', type: 'integer' })];
        _order_decorators = [(0, typeorm_1.ManyToOne)(function () { return SupplierOrder_1.SupplierOrder; }, function (order) { return order.products; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'orderId' })];
        _productName_decorators = [(0, typeorm_1.Column)({ name: 'productName', type: 'text' })];
        _quantity_decorators = [(0, typeorm_1.Column)({ type: 'integer' })];
        _price_decorators = [(0, typeorm_1.Column)({ type: 'real' })];
        _sku_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _serialNumber_decorators = [(0, typeorm_1.Column)({ name: 'serialNumber', type: 'text', nullable: true })];
        _jtlId_decorators = [(0, typeorm_1.Column)({ name: 'jtl_id', type: 'integer', nullable: true, unique: true }), (0, typeorm_1.Index)()];
        _jtlArticleId_decorators = [(0, typeorm_1.Column)({ name: 'jtl_article_id', type: 'integer', nullable: true })];
        _lastSynced_decorators = [(0, typeorm_1.Column)({ name: 'last_synced', type: 'datetime', nullable: true })];
        __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: function (obj) { return "orderId" in obj; }, get: function (obj) { return obj.orderId; }, set: function (obj, value) { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
        __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: function (obj) { return "order" in obj; }, get: function (obj) { return obj.order; }, set: function (obj, value) { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
        __esDecorate(null, null, _productName_decorators, { kind: "field", name: "productName", static: false, private: false, access: { has: function (obj) { return "productName" in obj; }, get: function (obj) { return obj.productName; }, set: function (obj, value) { obj.productName = value; } }, metadata: _metadata }, _productName_initializers, _productName_extraInitializers);
        __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
        __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
        __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: function (obj) { return "sku" in obj; }, get: function (obj) { return obj.sku; }, set: function (obj, value) { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
        __esDecorate(null, null, _serialNumber_decorators, { kind: "field", name: "serialNumber", static: false, private: false, access: { has: function (obj) { return "serialNumber" in obj; }, get: function (obj) { return obj.serialNumber; }, set: function (obj, value) { obj.serialNumber = value; } }, metadata: _metadata }, _serialNumber_initializers, _serialNumber_extraInitializers);
        __esDecorate(null, null, _jtlId_decorators, { kind: "field", name: "jtlId", static: false, private: false, access: { has: function (obj) { return "jtlId" in obj; }, get: function (obj) { return obj.jtlId; }, set: function (obj, value) { obj.jtlId = value; } }, metadata: _metadata }, _jtlId_initializers, _jtlId_extraInitializers);
        __esDecorate(null, null, _jtlArticleId_decorators, { kind: "field", name: "jtlArticleId", static: false, private: false, access: { has: function (obj) { return "jtlArticleId" in obj; }, get: function (obj) { return obj.jtlArticleId; }, set: function (obj, value) { obj.jtlArticleId = value; } }, metadata: _metadata }, _jtlArticleId_initializers, _jtlArticleId_extraInitializers);
        __esDecorate(null, null, _lastSynced_decorators, { kind: "field", name: "lastSynced", static: false, private: false, access: { has: function (obj) { return "lastSynced" in obj; }, get: function (obj) { return obj.lastSynced; }, set: function (obj, value) { obj.lastSynced = value; } }, metadata: _metadata }, _lastSynced_initializers, _lastSynced_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OrderProduct = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OrderProduct = _classThis;
}();
exports.OrderProduct = OrderProduct;
