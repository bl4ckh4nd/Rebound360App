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
exports.RequisitionItem = void 0;
var typeorm_1 = require("typeorm");
var TimestampEntity_1 = require("../base/TimestampEntity");
var Requisition_1 = require("./Requisition");
var RequisitionItem = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('requisition_items')];
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
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    var _unitPrice_decorators;
    var _unitPrice_initializers = [];
    var _unitPrice_extraInitializers = [];
    var _unit_decorators;
    var _unit_initializers = [];
    var _unit_extraInitializers = [];
    var _supplierId_decorators;
    var _supplierId_initializers = [];
    var _supplierId_extraInitializers = [];
    var _supplierName_decorators;
    var _supplierName_initializers = [];
    var _supplierName_extraInitializers = [];
    var _catalogItemId_decorators;
    var _catalogItemId_initializers = [];
    var _catalogItemId_extraInitializers = [];
    var _sku_decorators;
    var _sku_initializers = [];
    var _sku_extraInitializers = [];
    var _notes_decorators;
    var _notes_initializers = [];
    var _notes_extraInitializers = [];
    var _estimatedDelivery_decorators;
    var _estimatedDelivery_initializers = [];
    var _estimatedDelivery_extraInitializers = [];
    var RequisitionItem = _classThis = /** @class */ (function (_super) {
        __extends(RequisitionItem_1, _super);
        function RequisitionItem_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.id = __runInitializers(_this, _id_initializers, void 0);
            _this.requisitionId = (__runInitializers(_this, _id_extraInitializers), __runInitializers(_this, _requisitionId_initializers, void 0));
            _this.requisition = (__runInitializers(_this, _requisitionId_extraInitializers), __runInitializers(_this, _requisition_initializers, void 0));
            _this.description = (__runInitializers(_this, _requisition_extraInitializers), __runInitializers(_this, _description_initializers, void 0));
            _this.quantity = (__runInitializers(_this, _description_extraInitializers), __runInitializers(_this, _quantity_initializers, void 0));
            _this.unitPrice = (__runInitializers(_this, _quantity_extraInitializers), __runInitializers(_this, _unitPrice_initializers, void 0));
            _this.unit = (__runInitializers(_this, _unitPrice_extraInitializers), __runInitializers(_this, _unit_initializers, void 0));
            _this.supplierId = (__runInitializers(_this, _unit_extraInitializers), __runInitializers(_this, _supplierId_initializers, void 0));
            _this.supplierName = (__runInitializers(_this, _supplierId_extraInitializers), __runInitializers(_this, _supplierName_initializers, void 0));
            _this.catalogItemId = (__runInitializers(_this, _supplierName_extraInitializers), __runInitializers(_this, _catalogItemId_initializers, void 0));
            _this.sku = (__runInitializers(_this, _catalogItemId_extraInitializers), __runInitializers(_this, _sku_initializers, void 0));
            _this.notes = (__runInitializers(_this, _sku_extraInitializers), __runInitializers(_this, _notes_initializers, void 0));
            _this.estimatedDelivery = (__runInitializers(_this, _notes_extraInitializers), __runInitializers(_this, _estimatedDelivery_initializers, void 0));
            __runInitializers(_this, _estimatedDelivery_extraInitializers);
            return _this;
        }
        return RequisitionItem_1;
    }(_classSuper));
    __setFunctionName(_classThis, "RequisitionItem");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryColumn)({ type: 'text' })];
        _requisitionId_decorators = [(0, typeorm_1.Column)({ name: 'requisition_id', type: 'text' })];
        _requisition_decorators = [(0, typeorm_1.ManyToOne)(function () { return Requisition_1.Requisition; }, function (requisition) { return requisition.items; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'requisition_id' })];
        _description_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _quantity_decorators = [(0, typeorm_1.Column)({ type: 'integer' })];
        _unitPrice_decorators = [(0, typeorm_1.Column)({ name: 'unit_price', type: 'real' })];
        _unit_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _supplierId_decorators = [(0, typeorm_1.Column)({ name: 'supplier_id', type: 'text', nullable: true })];
        _supplierName_decorators = [(0, typeorm_1.Column)({ name: 'supplier_name', type: 'text', nullable: true })];
        _catalogItemId_decorators = [(0, typeorm_1.Column)({ name: 'catalog_item_id', type: 'text', nullable: true })];
        _sku_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _notes_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _estimatedDelivery_decorators = [(0, typeorm_1.Column)({ name: 'estimated_delivery', type: 'text', nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _requisitionId_decorators, { kind: "field", name: "requisitionId", static: false, private: false, access: { has: function (obj) { return "requisitionId" in obj; }, get: function (obj) { return obj.requisitionId; }, set: function (obj, value) { obj.requisitionId = value; } }, metadata: _metadata }, _requisitionId_initializers, _requisitionId_extraInitializers);
        __esDecorate(null, null, _requisition_decorators, { kind: "field", name: "requisition", static: false, private: false, access: { has: function (obj) { return "requisition" in obj; }, get: function (obj) { return obj.requisition; }, set: function (obj, value) { obj.requisition = value; } }, metadata: _metadata }, _requisition_initializers, _requisition_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
        __esDecorate(null, null, _unitPrice_decorators, { kind: "field", name: "unitPrice", static: false, private: false, access: { has: function (obj) { return "unitPrice" in obj; }, get: function (obj) { return obj.unitPrice; }, set: function (obj, value) { obj.unitPrice = value; } }, metadata: _metadata }, _unitPrice_initializers, _unitPrice_extraInitializers);
        __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: function (obj) { return "unit" in obj; }, get: function (obj) { return obj.unit; }, set: function (obj, value) { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
        __esDecorate(null, null, _supplierId_decorators, { kind: "field", name: "supplierId", static: false, private: false, access: { has: function (obj) { return "supplierId" in obj; }, get: function (obj) { return obj.supplierId; }, set: function (obj, value) { obj.supplierId = value; } }, metadata: _metadata }, _supplierId_initializers, _supplierId_extraInitializers);
        __esDecorate(null, null, _supplierName_decorators, { kind: "field", name: "supplierName", static: false, private: false, access: { has: function (obj) { return "supplierName" in obj; }, get: function (obj) { return obj.supplierName; }, set: function (obj, value) { obj.supplierName = value; } }, metadata: _metadata }, _supplierName_initializers, _supplierName_extraInitializers);
        __esDecorate(null, null, _catalogItemId_decorators, { kind: "field", name: "catalogItemId", static: false, private: false, access: { has: function (obj) { return "catalogItemId" in obj; }, get: function (obj) { return obj.catalogItemId; }, set: function (obj, value) { obj.catalogItemId = value; } }, metadata: _metadata }, _catalogItemId_initializers, _catalogItemId_extraInitializers);
        __esDecorate(null, null, _sku_decorators, { kind: "field", name: "sku", static: false, private: false, access: { has: function (obj) { return "sku" in obj; }, get: function (obj) { return obj.sku; }, set: function (obj, value) { obj.sku = value; } }, metadata: _metadata }, _sku_initializers, _sku_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: function (obj) { return "notes" in obj; }, get: function (obj) { return obj.notes; }, set: function (obj, value) { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _estimatedDelivery_decorators, { kind: "field", name: "estimatedDelivery", static: false, private: false, access: { has: function (obj) { return "estimatedDelivery" in obj; }, get: function (obj) { return obj.estimatedDelivery; }, set: function (obj, value) { obj.estimatedDelivery = value; } }, metadata: _metadata }, _estimatedDelivery_initializers, _estimatedDelivery_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RequisitionItem = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RequisitionItem = _classThis;
}();
exports.RequisitionItem = RequisitionItem;
