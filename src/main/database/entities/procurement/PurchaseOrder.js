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
exports.PurchaseOrder = void 0;
var typeorm_1 = require("typeorm");
var TimestampEntity_1 = require("../base/TimestampEntity");
var Requisition_1 = require("./Requisition");
var PurchaseOrder = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('purchase_orders'), (0, typeorm_1.Check)("\"priority\" IN ('low', 'normal', 'high')"), (0, typeorm_1.Check)("\"status\" IN ('draft', 'sent', 'acknowledged', 'partially_received', 'completed', 'cancelled')"), (0, typeorm_1.Check)("\"procurement_type\" IN ('material', 'service', 'asset')")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = TimestampEntity_1.TimestampEntity;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _requisitionId_decorators;
    var _requisitionId_initializers = [];
    var _requisitionId_extraInitializers = [];
    var _requisition_decorators;
    var _requisition_initializers = [];
    var _requisition_extraInitializers = [];
    var _orderNumber_decorators;
    var _orderNumber_initializers = [];
    var _orderNumber_extraInitializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _requesterId_decorators;
    var _requesterId_initializers = [];
    var _requesterId_extraInitializers = [];
    var _requesterName_decorators;
    var _requesterName_initializers = [];
    var _requesterName_extraInitializers = [];
    var _department_decorators;
    var _department_initializers = [];
    var _department_extraInitializers = [];
    var _priority_decorators;
    var _priority_initializers = [];
    var _priority_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _procurementType_decorators;
    var _procurementType_initializers = [];
    var _procurementType_extraInitializers = [];
    var _customFields_decorators;
    var _customFields_initializers = [];
    var _customFields_extraInitializers = [];
    var _supplierReference_decorators;
    var _supplierReference_initializers = [];
    var _supplierReference_extraInitializers = [];
    var _paymentTerms_decorators;
    var _paymentTerms_initializers = [];
    var _paymentTerms_extraInitializers = [];
    var _expectedDeliveryDate_decorators;
    var _expectedDeliveryDate_initializers = [];
    var _expectedDeliveryDate_extraInitializers = [];
    var _billingAddress_decorators;
    var _billingAddress_initializers = [];
    var _billingAddress_extraInitializers = [];
    var _shippingAddress_decorators;
    var _shippingAddress_initializers = [];
    var _shippingAddress_extraInitializers = [];
    var _totalAmount_decorators;
    var _totalAmount_initializers = [];
    var _totalAmount_extraInitializers = [];
    var _currency_decorators;
    var _currency_initializers = [];
    var _currency_extraInitializers = [];
    var _items_decorators;
    var _items_initializers = [];
    var _items_extraInitializers = [];
    var PurchaseOrder = _classThis = /** @class */ (function (_super) {
        __extends(PurchaseOrder_1, _super);
        function PurchaseOrder_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.id = __runInitializers(_this, _id_initializers, void 0);
            _this.requisitionId = (__runInitializers(_this, _id_extraInitializers), __runInitializers(_this, _requisitionId_initializers, void 0));
            _this.requisition = (__runInitializers(_this, _requisitionId_extraInitializers), __runInitializers(_this, _requisition_initializers, void 0));
            _this.orderNumber = (__runInitializers(_this, _requisition_extraInitializers), __runInitializers(_this, _orderNumber_initializers, void 0));
            _this.title = (__runInitializers(_this, _orderNumber_extraInitializers), __runInitializers(_this, _title_initializers, void 0));
            _this.description = (__runInitializers(_this, _title_extraInitializers), __runInitializers(_this, _description_initializers, void 0));
            _this.requesterId = (__runInitializers(_this, _description_extraInitializers), __runInitializers(_this, _requesterId_initializers, void 0));
            _this.requesterName = (__runInitializers(_this, _requesterId_extraInitializers), __runInitializers(_this, _requesterName_initializers, void 0));
            _this.department = (__runInitializers(_this, _requesterName_extraInitializers), __runInitializers(_this, _department_initializers, void 0));
            _this.priority = (__runInitializers(_this, _department_extraInitializers), __runInitializers(_this, _priority_initializers, void 0));
            _this.status = (__runInitializers(_this, _priority_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            _this.procurementType = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _procurementType_initializers, void 0));
            _this.customFields = (__runInitializers(_this, _procurementType_extraInitializers), __runInitializers(_this, _customFields_initializers, void 0));
            _this.supplierReference = (__runInitializers(_this, _customFields_extraInitializers), __runInitializers(_this, _supplierReference_initializers, void 0));
            _this.paymentTerms = (__runInitializers(_this, _supplierReference_extraInitializers), __runInitializers(_this, _paymentTerms_initializers, void 0));
            _this.expectedDeliveryDate = (__runInitializers(_this, _paymentTerms_extraInitializers), __runInitializers(_this, _expectedDeliveryDate_initializers, void 0));
            _this.billingAddress = (__runInitializers(_this, _expectedDeliveryDate_extraInitializers), __runInitializers(_this, _billingAddress_initializers, void 0));
            _this.shippingAddress = (__runInitializers(_this, _billingAddress_extraInitializers), __runInitializers(_this, _shippingAddress_initializers, void 0));
            _this.totalAmount = (__runInitializers(_this, _shippingAddress_extraInitializers), __runInitializers(_this, _totalAmount_initializers, void 0));
            _this.currency = (__runInitializers(_this, _totalAmount_extraInitializers), __runInitializers(_this, _currency_initializers, void 0));
            _this.items = (__runInitializers(_this, _currency_extraInitializers), __runInitializers(_this, _items_initializers, void 0));
            __runInitializers(_this, _items_extraInitializers);
            return _this;
        }
        return PurchaseOrder_1;
    }(_classSuper));
    __setFunctionName(_classThis, "PurchaseOrder");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _requisitionId_decorators = [(0, typeorm_1.Column)({ name: 'requisition_id', type: 'text', nullable: true })];
        _requisition_decorators = [(0, typeorm_1.OneToOne)(function () { return Requisition_1.Requisition; }, function (requisition) { return requisition.purchaseOrder; }, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'requisition_id' })];
        _orderNumber_decorators = [(0, typeorm_1.Column)({ name: 'order_number', type: 'text', unique: true })];
        _title_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _description_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _requesterId_decorators = [(0, typeorm_1.Column)({ name: 'requester_id', type: 'text' })];
        _requesterName_decorators = [(0, typeorm_1.Column)({ name: 'requester_name', type: 'text' })];
        _department_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _priority_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _procurementType_decorators = [(0, typeorm_1.Column)({ name: 'procurement_type', type: 'text' })];
        _customFields_decorators = [(0, typeorm_1.Column)({
                name: 'custom_fields',
                type: 'text',
                nullable: true,
                transformer: {
                    to: function (value) { return value ? JSON.stringify(value) : null; },
                    from: function (value) { return value ? JSON.parse(value) : {}; }
                }
            })];
        _supplierReference_decorators = [(0, typeorm_1.Column)({ name: 'supplier_reference', type: 'text', nullable: true })];
        _paymentTerms_decorators = [(0, typeorm_1.Column)({ name: 'payment_terms', type: 'text', nullable: true })];
        _expectedDeliveryDate_decorators = [(0, typeorm_1.Column)({ name: 'expected_delivery_date', type: 'text', nullable: true })];
        _billingAddress_decorators = [(0, typeorm_1.Column)({
                name: 'billing_address',
                type: 'text',
                transformer: {
                    to: function (value) { return JSON.stringify(value); },
                    from: function (value) { return JSON.parse(value); }
                }
            })];
        _shippingAddress_decorators = [(0, typeorm_1.Column)({
                name: 'shipping_address',
                type: 'text',
                transformer: {
                    to: function (value) { return JSON.stringify(value); },
                    from: function (value) { return JSON.parse(value); }
                }
            })];
        _totalAmount_decorators = [(0, typeorm_1.Column)({ name: 'total_amount', type: 'real' })];
        _currency_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _items_decorators = [(0, typeorm_1.Column)({
                type: 'text',
                default: '[]',
                transformer: {
                    to: function (value) { return JSON.stringify(value); },
                    from: function (value) { return JSON.parse(value); }
                }
            })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _requisitionId_decorators, { kind: "field", name: "requisitionId", static: false, private: false, access: { has: function (obj) { return "requisitionId" in obj; }, get: function (obj) { return obj.requisitionId; }, set: function (obj, value) { obj.requisitionId = value; } }, metadata: _metadata }, _requisitionId_initializers, _requisitionId_extraInitializers);
        __esDecorate(null, null, _requisition_decorators, { kind: "field", name: "requisition", static: false, private: false, access: { has: function (obj) { return "requisition" in obj; }, get: function (obj) { return obj.requisition; }, set: function (obj, value) { obj.requisition = value; } }, metadata: _metadata }, _requisition_initializers, _requisition_extraInitializers);
        __esDecorate(null, null, _orderNumber_decorators, { kind: "field", name: "orderNumber", static: false, private: false, access: { has: function (obj) { return "orderNumber" in obj; }, get: function (obj) { return obj.orderNumber; }, set: function (obj, value) { obj.orderNumber = value; } }, metadata: _metadata }, _orderNumber_initializers, _orderNumber_extraInitializers);
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _requesterId_decorators, { kind: "field", name: "requesterId", static: false, private: false, access: { has: function (obj) { return "requesterId" in obj; }, get: function (obj) { return obj.requesterId; }, set: function (obj, value) { obj.requesterId = value; } }, metadata: _metadata }, _requesterId_initializers, _requesterId_extraInitializers);
        __esDecorate(null, null, _requesterName_decorators, { kind: "field", name: "requesterName", static: false, private: false, access: { has: function (obj) { return "requesterName" in obj; }, get: function (obj) { return obj.requesterName; }, set: function (obj, value) { obj.requesterName = value; } }, metadata: _metadata }, _requesterName_initializers, _requesterName_extraInitializers);
        __esDecorate(null, null, _department_decorators, { kind: "field", name: "department", static: false, private: false, access: { has: function (obj) { return "department" in obj; }, get: function (obj) { return obj.department; }, set: function (obj, value) { obj.department = value; } }, metadata: _metadata }, _department_initializers, _department_extraInitializers);
        __esDecorate(null, null, _priority_decorators, { kind: "field", name: "priority", static: false, private: false, access: { has: function (obj) { return "priority" in obj; }, get: function (obj) { return obj.priority; }, set: function (obj, value) { obj.priority = value; } }, metadata: _metadata }, _priority_initializers, _priority_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _procurementType_decorators, { kind: "field", name: "procurementType", static: false, private: false, access: { has: function (obj) { return "procurementType" in obj; }, get: function (obj) { return obj.procurementType; }, set: function (obj, value) { obj.procurementType = value; } }, metadata: _metadata }, _procurementType_initializers, _procurementType_extraInitializers);
        __esDecorate(null, null, _customFields_decorators, { kind: "field", name: "customFields", static: false, private: false, access: { has: function (obj) { return "customFields" in obj; }, get: function (obj) { return obj.customFields; }, set: function (obj, value) { obj.customFields = value; } }, metadata: _metadata }, _customFields_initializers, _customFields_extraInitializers);
        __esDecorate(null, null, _supplierReference_decorators, { kind: "field", name: "supplierReference", static: false, private: false, access: { has: function (obj) { return "supplierReference" in obj; }, get: function (obj) { return obj.supplierReference; }, set: function (obj, value) { obj.supplierReference = value; } }, metadata: _metadata }, _supplierReference_initializers, _supplierReference_extraInitializers);
        __esDecorate(null, null, _paymentTerms_decorators, { kind: "field", name: "paymentTerms", static: false, private: false, access: { has: function (obj) { return "paymentTerms" in obj; }, get: function (obj) { return obj.paymentTerms; }, set: function (obj, value) { obj.paymentTerms = value; } }, metadata: _metadata }, _paymentTerms_initializers, _paymentTerms_extraInitializers);
        __esDecorate(null, null, _expectedDeliveryDate_decorators, { kind: "field", name: "expectedDeliveryDate", static: false, private: false, access: { has: function (obj) { return "expectedDeliveryDate" in obj; }, get: function (obj) { return obj.expectedDeliveryDate; }, set: function (obj, value) { obj.expectedDeliveryDate = value; } }, metadata: _metadata }, _expectedDeliveryDate_initializers, _expectedDeliveryDate_extraInitializers);
        __esDecorate(null, null, _billingAddress_decorators, { kind: "field", name: "billingAddress", static: false, private: false, access: { has: function (obj) { return "billingAddress" in obj; }, get: function (obj) { return obj.billingAddress; }, set: function (obj, value) { obj.billingAddress = value; } }, metadata: _metadata }, _billingAddress_initializers, _billingAddress_extraInitializers);
        __esDecorate(null, null, _shippingAddress_decorators, { kind: "field", name: "shippingAddress", static: false, private: false, access: { has: function (obj) { return "shippingAddress" in obj; }, get: function (obj) { return obj.shippingAddress; }, set: function (obj, value) { obj.shippingAddress = value; } }, metadata: _metadata }, _shippingAddress_initializers, _shippingAddress_extraInitializers);
        __esDecorate(null, null, _totalAmount_decorators, { kind: "field", name: "totalAmount", static: false, private: false, access: { has: function (obj) { return "totalAmount" in obj; }, get: function (obj) { return obj.totalAmount; }, set: function (obj, value) { obj.totalAmount = value; } }, metadata: _metadata }, _totalAmount_initializers, _totalAmount_extraInitializers);
        __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: function (obj) { return "currency" in obj; }, get: function (obj) { return obj.currency; }, set: function (obj, value) { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
        __esDecorate(null, null, _items_decorators, { kind: "field", name: "items", static: false, private: false, access: { has: function (obj) { return "items" in obj; }, get: function (obj) { return obj.items; }, set: function (obj, value) { obj.items = value; } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PurchaseOrder = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PurchaseOrder = _classThis;
}();
exports.PurchaseOrder = PurchaseOrder;
