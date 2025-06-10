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
exports.SupplierReturn = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var SupplierOrder_1 = require("../jtl/SupplierOrder");
var StatusWorkflow_1 = require("../workflow/StatusWorkflow");
var ReturnProduct_1 = require("./ReturnProduct");
var ReturnNote_1 = require("./ReturnNote");
var ReturnDocument_1 = require("./ReturnDocument");
var ShippingLabel_1 = require("../shipping/ShippingLabel");
var SupplierReturn = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('supplier_returns'), (0, typeorm_1.Check)("\"followUpAction\" IN ('gutschrift', 'ersatz', 'reparatur', 'ausschuss')"), (0, typeorm_1.Check)("\"creditNoteStatus\" IN ('erstellt', 'abgestimmt')")];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = BaseEntity_1.BaseEntity;
    var _orderNumber_decorators;
    var _orderNumber_initializers = [];
    var _orderNumber_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _followUpAction_decorators;
    var _followUpAction_initializers = [];
    var _followUpAction_extraInitializers = [];
    var _workflowId_decorators;
    var _workflowId_initializers = [];
    var _workflowId_extraInitializers = [];
    var _workflow_decorators;
    var _workflow_initializers = [];
    var _workflow_extraInitializers = [];
    var _supplierReference_decorators;
    var _supplierReference_initializers = [];
    var _supplierReference_extraInitializers = [];
    var _commissioningDate_decorators;
    var _commissioningDate_initializers = [];
    var _commissioningDate_extraInitializers = [];
    var _shippingDate_decorators;
    var _shippingDate_initializers = [];
    var _shippingDate_extraInitializers = [];
    var _creditNoteNumber_decorators;
    var _creditNoteNumber_initializers = [];
    var _creditNoteNumber_extraInitializers = [];
    var _creditAmount_decorators;
    var _creditAmount_initializers = [];
    var _creditAmount_extraInitializers = [];
    var _originalInvoiceNumber_decorators;
    var _originalInvoiceNumber_initializers = [];
    var _originalInvoiceNumber_extraInitializers = [];
    var _creditDate_decorators;
    var _creditDate_initializers = [];
    var _creditDate_extraInitializers = [];
    var _creditNoteStatus_decorators;
    var _creditNoteStatus_initializers = [];
    var _creditNoteStatus_extraInitializers = [];
    var _reconciliationDate_decorators;
    var _reconciliationDate_initializers = [];
    var _reconciliationDate_extraInitializers = [];
    var _reconciliationInvoiceNumber_decorators;
    var _reconciliationInvoiceNumber_initializers = [];
    var _reconciliationInvoiceNumber_extraInitializers = [];
    var _orderId_decorators;
    var _orderId_initializers = [];
    var _orderId_extraInitializers = [];
    var _order_decorators;
    var _order_initializers = [];
    var _order_extraInitializers = [];
    var _creditorNumber_decorators;
    var _creditorNumber_initializers = [];
    var _creditorNumber_extraInitializers = [];
    var _customFields_decorators;
    var _customFields_initializers = [];
    var _customFields_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _products_decorators;
    var _products_initializers = [];
    var _products_extraInitializers = [];
    var _notes_decorators;
    var _notes_initializers = [];
    var _notes_extraInitializers = [];
    var _documents_decorators;
    var _documents_initializers = [];
    var _documents_extraInitializers = [];
    var _shippingLabels_decorators;
    var _shippingLabels_initializers = [];
    var _shippingLabels_extraInitializers = [];
    var SupplierReturn = _classThis = /** @class */ (function (_super) {
        __extends(SupplierReturn_1, _super);
        function SupplierReturn_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.orderNumber = __runInitializers(_this, _orderNumber_initializers, void 0);
            _this.status = (__runInitializers(_this, _orderNumber_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            _this.followUpAction = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _followUpAction_initializers, void 0));
            _this.workflowId = (__runInitializers(_this, _followUpAction_extraInitializers), __runInitializers(_this, _workflowId_initializers, void 0));
            _this.workflow = (__runInitializers(_this, _workflowId_extraInitializers), __runInitializers(_this, _workflow_initializers, void 0));
            _this.supplierReference = (__runInitializers(_this, _workflow_extraInitializers), __runInitializers(_this, _supplierReference_initializers, void 0));
            _this.commissioningDate = (__runInitializers(_this, _supplierReference_extraInitializers), __runInitializers(_this, _commissioningDate_initializers, void 0));
            _this.shippingDate = (__runInitializers(_this, _commissioningDate_extraInitializers), __runInitializers(_this, _shippingDate_initializers, void 0));
            _this.creditNoteNumber = (__runInitializers(_this, _shippingDate_extraInitializers), __runInitializers(_this, _creditNoteNumber_initializers, void 0));
            _this.creditAmount = (__runInitializers(_this, _creditNoteNumber_extraInitializers), __runInitializers(_this, _creditAmount_initializers, void 0));
            _this.originalInvoiceNumber = (__runInitializers(_this, _creditAmount_extraInitializers), __runInitializers(_this, _originalInvoiceNumber_initializers, void 0));
            _this.creditDate = (__runInitializers(_this, _originalInvoiceNumber_extraInitializers), __runInitializers(_this, _creditDate_initializers, void 0));
            _this.creditNoteStatus = (__runInitializers(_this, _creditDate_extraInitializers), __runInitializers(_this, _creditNoteStatus_initializers, void 0));
            _this.reconciliationDate = (__runInitializers(_this, _creditNoteStatus_extraInitializers), __runInitializers(_this, _reconciliationDate_initializers, void 0));
            _this.reconciliationInvoiceNumber = (__runInitializers(_this, _reconciliationDate_extraInitializers), __runInitializers(_this, _reconciliationInvoiceNumber_initializers, void 0));
            _this.orderId = (__runInitializers(_this, _reconciliationInvoiceNumber_extraInitializers), __runInitializers(_this, _orderId_initializers, void 0));
            _this.order = (__runInitializers(_this, _orderId_extraInitializers), __runInitializers(_this, _order_initializers, void 0));
            _this.creditorNumber = (__runInitializers(_this, _order_extraInitializers), __runInitializers(_this, _creditorNumber_initializers, void 0));
            _this.customFields = (__runInitializers(_this, _creditorNumber_extraInitializers), __runInitializers(_this, _customFields_initializers, void 0));
            _this.createdAt = (__runInitializers(_this, _customFields_extraInitializers), __runInitializers(_this, _createdAt_initializers, void 0));
            _this.updatedAt = (__runInitializers(_this, _createdAt_extraInitializers), __runInitializers(_this, _updatedAt_initializers, void 0));
            // Relations
            _this.products = (__runInitializers(_this, _updatedAt_extraInitializers), __runInitializers(_this, _products_initializers, void 0));
            _this.notes = (__runInitializers(_this, _products_extraInitializers), __runInitializers(_this, _notes_initializers, void 0));
            _this.documents = (__runInitializers(_this, _notes_extraInitializers), __runInitializers(_this, _documents_initializers, void 0));
            _this.shippingLabels = (__runInitializers(_this, _documents_extraInitializers), __runInitializers(_this, _shippingLabels_initializers, void 0));
            __runInitializers(_this, _shippingLabels_extraInitializers);
            return _this;
        }
        return SupplierReturn_1;
    }(_classSuper));
    __setFunctionName(_classThis, "SupplierReturn");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _orderNumber_decorators = [(0, typeorm_1.Column)({ name: 'orderNumber', type: 'text', nullable: true })];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _followUpAction_decorators = [(0, typeorm_1.Column)({ name: 'followUpAction', type: 'text' })];
        _workflowId_decorators = [(0, typeorm_1.Column)({ name: 'workflow_id', type: 'text', nullable: true })];
        _workflow_decorators = [(0, typeorm_1.ManyToOne)(function () { return StatusWorkflow_1.StatusWorkflow; }, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'workflow_id' })];
        _supplierReference_decorators = [(0, typeorm_1.Column)({ name: 'supplierReference', type: 'text', nullable: true })];
        _commissioningDate_decorators = [(0, typeorm_1.Column)({ name: 'commissioningDate', type: 'text', nullable: true })];
        _shippingDate_decorators = [(0, typeorm_1.Column)({ name: 'shippingDate', type: 'text', nullable: true })];
        _creditNoteNumber_decorators = [(0, typeorm_1.Column)({ name: 'creditNoteNumber', type: 'text', nullable: true })];
        _creditAmount_decorators = [(0, typeorm_1.Column)({ name: 'creditAmount', type: 'real', nullable: true })];
        _originalInvoiceNumber_decorators = [(0, typeorm_1.Column)({ name: 'originalInvoiceNumber', type: 'text', nullable: true })];
        _creditDate_decorators = [(0, typeorm_1.Column)({ name: 'creditDate', type: 'text', nullable: true })];
        _creditNoteStatus_decorators = [(0, typeorm_1.Column)({ name: 'creditNoteStatus', type: 'text', nullable: true })];
        _reconciliationDate_decorators = [(0, typeorm_1.Column)({ name: 'reconciliationDate', type: 'text', nullable: true })];
        _reconciliationInvoiceNumber_decorators = [(0, typeorm_1.Column)({ name: 'reconciliationInvoiceNumber', type: 'text', nullable: true })];
        _orderId_decorators = [(0, typeorm_1.Column)({ name: 'orderId', type: 'integer', nullable: true })];
        _order_decorators = [(0, typeorm_1.ManyToOne)(function () { return SupplierOrder_1.SupplierOrder; }, { nullable: true }), (0, typeorm_1.JoinColumn)({ name: 'orderId' })];
        _creditorNumber_decorators = [(0, typeorm_1.Column)({ name: 'creditorNumber', type: 'text', nullable: true })];
        _customFields_decorators = [(0, typeorm_1.Column)({ name: 'customFields', type: 'text', nullable: true, transformer: {
                    to: function (value) { return value ? JSON.stringify(value) : null; },
                    from: function (value) { return value ? JSON.parse(value) : {}; }
                } })];
        _createdAt_decorators = [(0, typeorm_1.Column)({ name: 'createdAt', type: 'datetime', default: function () { return 'CURRENT_TIMESTAMP'; } })];
        _updatedAt_decorators = [(0, typeorm_1.Column)({ name: 'updatedAt', type: 'datetime', nullable: true })];
        _products_decorators = [(0, typeorm_1.OneToMany)(function () { return ReturnProduct_1.ReturnProduct; }, function (product) { return product.return; }, { cascade: true })];
        _notes_decorators = [(0, typeorm_1.OneToMany)(function () { return ReturnNote_1.ReturnNote; }, function (note) { return note.return; }, { cascade: true })];
        _documents_decorators = [(0, typeorm_1.OneToMany)(function () { return ReturnDocument_1.ReturnDocument; }, function (document) { return document.return; }, { cascade: true })];
        _shippingLabels_decorators = [(0, typeorm_1.OneToMany)(function () { return ShippingLabel_1.ShippingLabel; }, function (label) { return label.return; })];
        __esDecorate(null, null, _orderNumber_decorators, { kind: "field", name: "orderNumber", static: false, private: false, access: { has: function (obj) { return "orderNumber" in obj; }, get: function (obj) { return obj.orderNumber; }, set: function (obj, value) { obj.orderNumber = value; } }, metadata: _metadata }, _orderNumber_initializers, _orderNumber_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _followUpAction_decorators, { kind: "field", name: "followUpAction", static: false, private: false, access: { has: function (obj) { return "followUpAction" in obj; }, get: function (obj) { return obj.followUpAction; }, set: function (obj, value) { obj.followUpAction = value; } }, metadata: _metadata }, _followUpAction_initializers, _followUpAction_extraInitializers);
        __esDecorate(null, null, _workflowId_decorators, { kind: "field", name: "workflowId", static: false, private: false, access: { has: function (obj) { return "workflowId" in obj; }, get: function (obj) { return obj.workflowId; }, set: function (obj, value) { obj.workflowId = value; } }, metadata: _metadata }, _workflowId_initializers, _workflowId_extraInitializers);
        __esDecorate(null, null, _workflow_decorators, { kind: "field", name: "workflow", static: false, private: false, access: { has: function (obj) { return "workflow" in obj; }, get: function (obj) { return obj.workflow; }, set: function (obj, value) { obj.workflow = value; } }, metadata: _metadata }, _workflow_initializers, _workflow_extraInitializers);
        __esDecorate(null, null, _supplierReference_decorators, { kind: "field", name: "supplierReference", static: false, private: false, access: { has: function (obj) { return "supplierReference" in obj; }, get: function (obj) { return obj.supplierReference; }, set: function (obj, value) { obj.supplierReference = value; } }, metadata: _metadata }, _supplierReference_initializers, _supplierReference_extraInitializers);
        __esDecorate(null, null, _commissioningDate_decorators, { kind: "field", name: "commissioningDate", static: false, private: false, access: { has: function (obj) { return "commissioningDate" in obj; }, get: function (obj) { return obj.commissioningDate; }, set: function (obj, value) { obj.commissioningDate = value; } }, metadata: _metadata }, _commissioningDate_initializers, _commissioningDate_extraInitializers);
        __esDecorate(null, null, _shippingDate_decorators, { kind: "field", name: "shippingDate", static: false, private: false, access: { has: function (obj) { return "shippingDate" in obj; }, get: function (obj) { return obj.shippingDate; }, set: function (obj, value) { obj.shippingDate = value; } }, metadata: _metadata }, _shippingDate_initializers, _shippingDate_extraInitializers);
        __esDecorate(null, null, _creditNoteNumber_decorators, { kind: "field", name: "creditNoteNumber", static: false, private: false, access: { has: function (obj) { return "creditNoteNumber" in obj; }, get: function (obj) { return obj.creditNoteNumber; }, set: function (obj, value) { obj.creditNoteNumber = value; } }, metadata: _metadata }, _creditNoteNumber_initializers, _creditNoteNumber_extraInitializers);
        __esDecorate(null, null, _creditAmount_decorators, { kind: "field", name: "creditAmount", static: false, private: false, access: { has: function (obj) { return "creditAmount" in obj; }, get: function (obj) { return obj.creditAmount; }, set: function (obj, value) { obj.creditAmount = value; } }, metadata: _metadata }, _creditAmount_initializers, _creditAmount_extraInitializers);
        __esDecorate(null, null, _originalInvoiceNumber_decorators, { kind: "field", name: "originalInvoiceNumber", static: false, private: false, access: { has: function (obj) { return "originalInvoiceNumber" in obj; }, get: function (obj) { return obj.originalInvoiceNumber; }, set: function (obj, value) { obj.originalInvoiceNumber = value; } }, metadata: _metadata }, _originalInvoiceNumber_initializers, _originalInvoiceNumber_extraInitializers);
        __esDecorate(null, null, _creditDate_decorators, { kind: "field", name: "creditDate", static: false, private: false, access: { has: function (obj) { return "creditDate" in obj; }, get: function (obj) { return obj.creditDate; }, set: function (obj, value) { obj.creditDate = value; } }, metadata: _metadata }, _creditDate_initializers, _creditDate_extraInitializers);
        __esDecorate(null, null, _creditNoteStatus_decorators, { kind: "field", name: "creditNoteStatus", static: false, private: false, access: { has: function (obj) { return "creditNoteStatus" in obj; }, get: function (obj) { return obj.creditNoteStatus; }, set: function (obj, value) { obj.creditNoteStatus = value; } }, metadata: _metadata }, _creditNoteStatus_initializers, _creditNoteStatus_extraInitializers);
        __esDecorate(null, null, _reconciliationDate_decorators, { kind: "field", name: "reconciliationDate", static: false, private: false, access: { has: function (obj) { return "reconciliationDate" in obj; }, get: function (obj) { return obj.reconciliationDate; }, set: function (obj, value) { obj.reconciliationDate = value; } }, metadata: _metadata }, _reconciliationDate_initializers, _reconciliationDate_extraInitializers);
        __esDecorate(null, null, _reconciliationInvoiceNumber_decorators, { kind: "field", name: "reconciliationInvoiceNumber", static: false, private: false, access: { has: function (obj) { return "reconciliationInvoiceNumber" in obj; }, get: function (obj) { return obj.reconciliationInvoiceNumber; }, set: function (obj, value) { obj.reconciliationInvoiceNumber = value; } }, metadata: _metadata }, _reconciliationInvoiceNumber_initializers, _reconciliationInvoiceNumber_extraInitializers);
        __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: function (obj) { return "orderId" in obj; }, get: function (obj) { return obj.orderId; }, set: function (obj, value) { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
        __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: function (obj) { return "order" in obj; }, get: function (obj) { return obj.order; }, set: function (obj, value) { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
        __esDecorate(null, null, _creditorNumber_decorators, { kind: "field", name: "creditorNumber", static: false, private: false, access: { has: function (obj) { return "creditorNumber" in obj; }, get: function (obj) { return obj.creditorNumber; }, set: function (obj, value) { obj.creditorNumber = value; } }, metadata: _metadata }, _creditorNumber_initializers, _creditorNumber_extraInitializers);
        __esDecorate(null, null, _customFields_decorators, { kind: "field", name: "customFields", static: false, private: false, access: { has: function (obj) { return "customFields" in obj; }, get: function (obj) { return obj.customFields; }, set: function (obj, value) { obj.customFields = value; } }, metadata: _metadata }, _customFields_initializers, _customFields_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _products_decorators, { kind: "field", name: "products", static: false, private: false, access: { has: function (obj) { return "products" in obj; }, get: function (obj) { return obj.products; }, set: function (obj, value) { obj.products = value; } }, metadata: _metadata }, _products_initializers, _products_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: function (obj) { return "notes" in obj; }, get: function (obj) { return obj.notes; }, set: function (obj, value) { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _documents_decorators, { kind: "field", name: "documents", static: false, private: false, access: { has: function (obj) { return "documents" in obj; }, get: function (obj) { return obj.documents; }, set: function (obj, value) { obj.documents = value; } }, metadata: _metadata }, _documents_initializers, _documents_extraInitializers);
        __esDecorate(null, null, _shippingLabels_decorators, { kind: "field", name: "shippingLabels", static: false, private: false, access: { has: function (obj) { return "shippingLabels" in obj; }, get: function (obj) { return obj.shippingLabels; }, set: function (obj, value) { obj.shippingLabels = value; } }, metadata: _metadata }, _shippingLabels_initializers, _shippingLabels_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SupplierReturn = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SupplierReturn = _classThis;
}();
exports.SupplierReturn = SupplierReturn;
