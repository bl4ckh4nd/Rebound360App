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
exports.ShippingLabel = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var SupplierReturn_1 = require("../core/SupplierReturn");
var ShippingTracking_1 = require("./ShippingTracking");
var ShippingLabel = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('shipping_labels'), (0, typeorm_1.Index)(['returnId']), (0, typeorm_1.Index)(['shipmentNumber']), (0, typeorm_1.Index)(['trackingNumber'])];
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
    var _shipmentNumber_decorators;
    var _shipmentNumber_initializers = [];
    var _shipmentNumber_extraInitializers = [];
    var _trackingNumber_decorators;
    var _trackingNumber_initializers = [];
    var _trackingNumber_extraInitializers = [];
    var _routingCode_decorators;
    var _routingCode_initializers = [];
    var _routingCode_extraInitializers = [];
    var _labelData_decorators;
    var _labelData_initializers = [];
    var _labelData_extraInitializers = [];
    var _labelFilename_decorators;
    var _labelFilename_initializers = [];
    var _labelFilename_extraInitializers = [];
    var _shipperName_decorators;
    var _shipperName_initializers = [];
    var _shipperName_extraInitializers = [];
    var _shipperAddress_decorators;
    var _shipperAddress_initializers = [];
    var _shipperAddress_extraInitializers = [];
    var _shipperCity_decorators;
    var _shipperCity_initializers = [];
    var _shipperCity_extraInitializers = [];
    var _shipperPostalCode_decorators;
    var _shipperPostalCode_initializers = [];
    var _shipperPostalCode_extraInitializers = [];
    var _shipperCountry_decorators;
    var _shipperCountry_initializers = [];
    var _shipperCountry_extraInitializers = [];
    var _shipperPhone_decorators;
    var _shipperPhone_initializers = [];
    var _shipperPhone_extraInitializers = [];
    var _shipperEmail_decorators;
    var _shipperEmail_initializers = [];
    var _shipperEmail_extraInitializers = [];
    var _consigneeName_decorators;
    var _consigneeName_initializers = [];
    var _consigneeName_extraInitializers = [];
    var _consigneeAddress_decorators;
    var _consigneeAddress_initializers = [];
    var _consigneeAddress_extraInitializers = [];
    var _consigneeCity_decorators;
    var _consigneeCity_initializers = [];
    var _consigneeCity_extraInitializers = [];
    var _consigneePostalCode_decorators;
    var _consigneePostalCode_initializers = [];
    var _consigneePostalCode_extraInitializers = [];
    var _consigneeCountry_decorators;
    var _consigneeCountry_initializers = [];
    var _consigneeCountry_extraInitializers = [];
    var _consigneePhone_decorators;
    var _consigneePhone_initializers = [];
    var _consigneePhone_extraInitializers = [];
    var _consigneeEmail_decorators;
    var _consigneeEmail_initializers = [];
    var _consigneeEmail_extraInitializers = [];
    var _serviceType_decorators;
    var _serviceType_initializers = [];
    var _serviceType_extraInitializers = [];
    var _weight_decorators;
    var _weight_initializers = [];
    var _weight_extraInitializers = [];
    var _length_decorators;
    var _length_initializers = [];
    var _length_extraInitializers = [];
    var _width_decorators;
    var _width_initializers = [];
    var _width_extraInitializers = [];
    var _height_decorators;
    var _height_initializers = [];
    var _height_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _trackingEvents_decorators;
    var _trackingEvents_initializers = [];
    var _trackingEvents_extraInitializers = [];
    var ShippingLabel = _classThis = /** @class */ (function (_super) {
        __extends(ShippingLabel_1, _super);
        function ShippingLabel_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.returnId = __runInitializers(_this, _returnId_initializers, void 0);
            _this.return = (__runInitializers(_this, _returnId_extraInitializers), __runInitializers(_this, _return_initializers, void 0));
            _this.shipmentNumber = (__runInitializers(_this, _return_extraInitializers), __runInitializers(_this, _shipmentNumber_initializers, void 0));
            _this.trackingNumber = (__runInitializers(_this, _shipmentNumber_extraInitializers), __runInitializers(_this, _trackingNumber_initializers, void 0));
            _this.routingCode = (__runInitializers(_this, _trackingNumber_extraInitializers), __runInitializers(_this, _routingCode_initializers, void 0));
            _this.labelData = (__runInitializers(_this, _routingCode_extraInitializers), __runInitializers(_this, _labelData_initializers, void 0)); // Base64 encoded PDF
            _this.labelFilename = (__runInitializers(_this, _labelData_extraInitializers), __runInitializers(_this, _labelFilename_initializers, void 0));
            // Shipper information
            _this.shipperName = (__runInitializers(_this, _labelFilename_extraInitializers), __runInitializers(_this, _shipperName_initializers, void 0));
            _this.shipperAddress = (__runInitializers(_this, _shipperName_extraInitializers), __runInitializers(_this, _shipperAddress_initializers, void 0));
            _this.shipperCity = (__runInitializers(_this, _shipperAddress_extraInitializers), __runInitializers(_this, _shipperCity_initializers, void 0));
            _this.shipperPostalCode = (__runInitializers(_this, _shipperCity_extraInitializers), __runInitializers(_this, _shipperPostalCode_initializers, void 0));
            _this.shipperCountry = (__runInitializers(_this, _shipperPostalCode_extraInitializers), __runInitializers(_this, _shipperCountry_initializers, void 0));
            _this.shipperPhone = (__runInitializers(_this, _shipperCountry_extraInitializers), __runInitializers(_this, _shipperPhone_initializers, void 0));
            _this.shipperEmail = (__runInitializers(_this, _shipperPhone_extraInitializers), __runInitializers(_this, _shipperEmail_initializers, void 0));
            // Consignee information
            _this.consigneeName = (__runInitializers(_this, _shipperEmail_extraInitializers), __runInitializers(_this, _consigneeName_initializers, void 0));
            _this.consigneeAddress = (__runInitializers(_this, _consigneeName_extraInitializers), __runInitializers(_this, _consigneeAddress_initializers, void 0));
            _this.consigneeCity = (__runInitializers(_this, _consigneeAddress_extraInitializers), __runInitializers(_this, _consigneeCity_initializers, void 0));
            _this.consigneePostalCode = (__runInitializers(_this, _consigneeCity_extraInitializers), __runInitializers(_this, _consigneePostalCode_initializers, void 0));
            _this.consigneeCountry = (__runInitializers(_this, _consigneePostalCode_extraInitializers), __runInitializers(_this, _consigneeCountry_initializers, void 0));
            _this.consigneePhone = (__runInitializers(_this, _consigneeCountry_extraInitializers), __runInitializers(_this, _consigneePhone_initializers, void 0));
            _this.consigneeEmail = (__runInitializers(_this, _consigneePhone_extraInitializers), __runInitializers(_this, _consigneeEmail_initializers, void 0));
            // Package details
            _this.serviceType = (__runInitializers(_this, _consigneeEmail_extraInitializers), __runInitializers(_this, _serviceType_initializers, void 0));
            _this.weight = (__runInitializers(_this, _serviceType_extraInitializers), __runInitializers(_this, _weight_initializers, void 0));
            _this.length = (__runInitializers(_this, _weight_extraInitializers), __runInitializers(_this, _length_initializers, void 0));
            _this.width = (__runInitializers(_this, _length_extraInitializers), __runInitializers(_this, _width_initializers, void 0));
            _this.height = (__runInitializers(_this, _width_extraInitializers), __runInitializers(_this, _height_initializers, void 0));
            _this.status = (__runInitializers(_this, _height_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            _this.createdAt = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _createdAt_initializers, void 0));
            _this.updatedAt = (__runInitializers(_this, _createdAt_extraInitializers), __runInitializers(_this, _updatedAt_initializers, void 0));
            // Relations
            _this.trackingEvents = (__runInitializers(_this, _updatedAt_extraInitializers), __runInitializers(_this, _trackingEvents_initializers, void 0));
            __runInitializers(_this, _trackingEvents_extraInitializers);
            return _this;
        }
        return ShippingLabel_1;
    }(_classSuper));
    __setFunctionName(_classThis, "ShippingLabel");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _returnId_decorators = [(0, typeorm_1.Column)({ name: 'return_id', type: 'integer' })];
        _return_decorators = [(0, typeorm_1.ManyToOne)(function () { return SupplierReturn_1.SupplierReturn; }, function (supplierReturn) { return supplierReturn.shippingLabels; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'return_id' })];
        _shipmentNumber_decorators = [(0, typeorm_1.Column)({ name: 'shipment_number', type: 'text', unique: true })];
        _trackingNumber_decorators = [(0, typeorm_1.Column)({ name: 'tracking_number', type: 'text', nullable: true })];
        _routingCode_decorators = [(0, typeorm_1.Column)({ name: 'routing_code', type: 'text', nullable: true })];
        _labelData_decorators = [(0, typeorm_1.Column)({ name: 'label_data', type: 'text' })];
        _labelFilename_decorators = [(0, typeorm_1.Column)({ name: 'label_filename', type: 'text', nullable: true })];
        _shipperName_decorators = [(0, typeorm_1.Column)({ name: 'shipper_name', type: 'text' })];
        _shipperAddress_decorators = [(0, typeorm_1.Column)({ name: 'shipper_address', type: 'text' })];
        _shipperCity_decorators = [(0, typeorm_1.Column)({ name: 'shipper_city', type: 'text' })];
        _shipperPostalCode_decorators = [(0, typeorm_1.Column)({ name: 'shipper_postal_code', type: 'text' })];
        _shipperCountry_decorators = [(0, typeorm_1.Column)({ name: 'shipper_country', type: 'text' })];
        _shipperPhone_decorators = [(0, typeorm_1.Column)({ name: 'shipper_phone', type: 'text', nullable: true })];
        _shipperEmail_decorators = [(0, typeorm_1.Column)({ name: 'shipper_email', type: 'text', nullable: true })];
        _consigneeName_decorators = [(0, typeorm_1.Column)({ name: 'consignee_name', type: 'text' })];
        _consigneeAddress_decorators = [(0, typeorm_1.Column)({ name: 'consignee_address', type: 'text' })];
        _consigneeCity_decorators = [(0, typeorm_1.Column)({ name: 'consignee_city', type: 'text' })];
        _consigneePostalCode_decorators = [(0, typeorm_1.Column)({ name: 'consignee_postal_code', type: 'text' })];
        _consigneeCountry_decorators = [(0, typeorm_1.Column)({ name: 'consignee_country', type: 'text' })];
        _consigneePhone_decorators = [(0, typeorm_1.Column)({ name: 'consignee_phone', type: 'text', nullable: true })];
        _consigneeEmail_decorators = [(0, typeorm_1.Column)({ name: 'consignee_email', type: 'text', nullable: true })];
        _serviceType_decorators = [(0, typeorm_1.Column)({ name: 'service_type', type: 'text', default: 'V01PAK' })];
        _weight_decorators = [(0, typeorm_1.Column)({ type: 'real' })];
        _length_decorators = [(0, typeorm_1.Column)({ type: 'real', nullable: true })];
        _width_decorators = [(0, typeorm_1.Column)({ type: 'real', nullable: true })];
        _height_decorators = [(0, typeorm_1.Column)({ type: 'real', nullable: true })];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'text', default: 'created' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'datetime', default: function () { return 'CURRENT_TIMESTAMP'; } })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'datetime', default: function () { return 'CURRENT_TIMESTAMP'; } })];
        _trackingEvents_decorators = [(0, typeorm_1.OneToMany)(function () { return ShippingTracking_1.ShippingTracking; }, function (tracking) { return tracking.shippingLabel; })];
        __esDecorate(null, null, _returnId_decorators, { kind: "field", name: "returnId", static: false, private: false, access: { has: function (obj) { return "returnId" in obj; }, get: function (obj) { return obj.returnId; }, set: function (obj, value) { obj.returnId = value; } }, metadata: _metadata }, _returnId_initializers, _returnId_extraInitializers);
        __esDecorate(null, null, _return_decorators, { kind: "field", name: "return", static: false, private: false, access: { has: function (obj) { return "return" in obj; }, get: function (obj) { return obj.return; }, set: function (obj, value) { obj.return = value; } }, metadata: _metadata }, _return_initializers, _return_extraInitializers);
        __esDecorate(null, null, _shipmentNumber_decorators, { kind: "field", name: "shipmentNumber", static: false, private: false, access: { has: function (obj) { return "shipmentNumber" in obj; }, get: function (obj) { return obj.shipmentNumber; }, set: function (obj, value) { obj.shipmentNumber = value; } }, metadata: _metadata }, _shipmentNumber_initializers, _shipmentNumber_extraInitializers);
        __esDecorate(null, null, _trackingNumber_decorators, { kind: "field", name: "trackingNumber", static: false, private: false, access: { has: function (obj) { return "trackingNumber" in obj; }, get: function (obj) { return obj.trackingNumber; }, set: function (obj, value) { obj.trackingNumber = value; } }, metadata: _metadata }, _trackingNumber_initializers, _trackingNumber_extraInitializers);
        __esDecorate(null, null, _routingCode_decorators, { kind: "field", name: "routingCode", static: false, private: false, access: { has: function (obj) { return "routingCode" in obj; }, get: function (obj) { return obj.routingCode; }, set: function (obj, value) { obj.routingCode = value; } }, metadata: _metadata }, _routingCode_initializers, _routingCode_extraInitializers);
        __esDecorate(null, null, _labelData_decorators, { kind: "field", name: "labelData", static: false, private: false, access: { has: function (obj) { return "labelData" in obj; }, get: function (obj) { return obj.labelData; }, set: function (obj, value) { obj.labelData = value; } }, metadata: _metadata }, _labelData_initializers, _labelData_extraInitializers);
        __esDecorate(null, null, _labelFilename_decorators, { kind: "field", name: "labelFilename", static: false, private: false, access: { has: function (obj) { return "labelFilename" in obj; }, get: function (obj) { return obj.labelFilename; }, set: function (obj, value) { obj.labelFilename = value; } }, metadata: _metadata }, _labelFilename_initializers, _labelFilename_extraInitializers);
        __esDecorate(null, null, _shipperName_decorators, { kind: "field", name: "shipperName", static: false, private: false, access: { has: function (obj) { return "shipperName" in obj; }, get: function (obj) { return obj.shipperName; }, set: function (obj, value) { obj.shipperName = value; } }, metadata: _metadata }, _shipperName_initializers, _shipperName_extraInitializers);
        __esDecorate(null, null, _shipperAddress_decorators, { kind: "field", name: "shipperAddress", static: false, private: false, access: { has: function (obj) { return "shipperAddress" in obj; }, get: function (obj) { return obj.shipperAddress; }, set: function (obj, value) { obj.shipperAddress = value; } }, metadata: _metadata }, _shipperAddress_initializers, _shipperAddress_extraInitializers);
        __esDecorate(null, null, _shipperCity_decorators, { kind: "field", name: "shipperCity", static: false, private: false, access: { has: function (obj) { return "shipperCity" in obj; }, get: function (obj) { return obj.shipperCity; }, set: function (obj, value) { obj.shipperCity = value; } }, metadata: _metadata }, _shipperCity_initializers, _shipperCity_extraInitializers);
        __esDecorate(null, null, _shipperPostalCode_decorators, { kind: "field", name: "shipperPostalCode", static: false, private: false, access: { has: function (obj) { return "shipperPostalCode" in obj; }, get: function (obj) { return obj.shipperPostalCode; }, set: function (obj, value) { obj.shipperPostalCode = value; } }, metadata: _metadata }, _shipperPostalCode_initializers, _shipperPostalCode_extraInitializers);
        __esDecorate(null, null, _shipperCountry_decorators, { kind: "field", name: "shipperCountry", static: false, private: false, access: { has: function (obj) { return "shipperCountry" in obj; }, get: function (obj) { return obj.shipperCountry; }, set: function (obj, value) { obj.shipperCountry = value; } }, metadata: _metadata }, _shipperCountry_initializers, _shipperCountry_extraInitializers);
        __esDecorate(null, null, _shipperPhone_decorators, { kind: "field", name: "shipperPhone", static: false, private: false, access: { has: function (obj) { return "shipperPhone" in obj; }, get: function (obj) { return obj.shipperPhone; }, set: function (obj, value) { obj.shipperPhone = value; } }, metadata: _metadata }, _shipperPhone_initializers, _shipperPhone_extraInitializers);
        __esDecorate(null, null, _shipperEmail_decorators, { kind: "field", name: "shipperEmail", static: false, private: false, access: { has: function (obj) { return "shipperEmail" in obj; }, get: function (obj) { return obj.shipperEmail; }, set: function (obj, value) { obj.shipperEmail = value; } }, metadata: _metadata }, _shipperEmail_initializers, _shipperEmail_extraInitializers);
        __esDecorate(null, null, _consigneeName_decorators, { kind: "field", name: "consigneeName", static: false, private: false, access: { has: function (obj) { return "consigneeName" in obj; }, get: function (obj) { return obj.consigneeName; }, set: function (obj, value) { obj.consigneeName = value; } }, metadata: _metadata }, _consigneeName_initializers, _consigneeName_extraInitializers);
        __esDecorate(null, null, _consigneeAddress_decorators, { kind: "field", name: "consigneeAddress", static: false, private: false, access: { has: function (obj) { return "consigneeAddress" in obj; }, get: function (obj) { return obj.consigneeAddress; }, set: function (obj, value) { obj.consigneeAddress = value; } }, metadata: _metadata }, _consigneeAddress_initializers, _consigneeAddress_extraInitializers);
        __esDecorate(null, null, _consigneeCity_decorators, { kind: "field", name: "consigneeCity", static: false, private: false, access: { has: function (obj) { return "consigneeCity" in obj; }, get: function (obj) { return obj.consigneeCity; }, set: function (obj, value) { obj.consigneeCity = value; } }, metadata: _metadata }, _consigneeCity_initializers, _consigneeCity_extraInitializers);
        __esDecorate(null, null, _consigneePostalCode_decorators, { kind: "field", name: "consigneePostalCode", static: false, private: false, access: { has: function (obj) { return "consigneePostalCode" in obj; }, get: function (obj) { return obj.consigneePostalCode; }, set: function (obj, value) { obj.consigneePostalCode = value; } }, metadata: _metadata }, _consigneePostalCode_initializers, _consigneePostalCode_extraInitializers);
        __esDecorate(null, null, _consigneeCountry_decorators, { kind: "field", name: "consigneeCountry", static: false, private: false, access: { has: function (obj) { return "consigneeCountry" in obj; }, get: function (obj) { return obj.consigneeCountry; }, set: function (obj, value) { obj.consigneeCountry = value; } }, metadata: _metadata }, _consigneeCountry_initializers, _consigneeCountry_extraInitializers);
        __esDecorate(null, null, _consigneePhone_decorators, { kind: "field", name: "consigneePhone", static: false, private: false, access: { has: function (obj) { return "consigneePhone" in obj; }, get: function (obj) { return obj.consigneePhone; }, set: function (obj, value) { obj.consigneePhone = value; } }, metadata: _metadata }, _consigneePhone_initializers, _consigneePhone_extraInitializers);
        __esDecorate(null, null, _consigneeEmail_decorators, { kind: "field", name: "consigneeEmail", static: false, private: false, access: { has: function (obj) { return "consigneeEmail" in obj; }, get: function (obj) { return obj.consigneeEmail; }, set: function (obj, value) { obj.consigneeEmail = value; } }, metadata: _metadata }, _consigneeEmail_initializers, _consigneeEmail_extraInitializers);
        __esDecorate(null, null, _serviceType_decorators, { kind: "field", name: "serviceType", static: false, private: false, access: { has: function (obj) { return "serviceType" in obj; }, get: function (obj) { return obj.serviceType; }, set: function (obj, value) { obj.serviceType = value; } }, metadata: _metadata }, _serviceType_initializers, _serviceType_extraInitializers);
        __esDecorate(null, null, _weight_decorators, { kind: "field", name: "weight", static: false, private: false, access: { has: function (obj) { return "weight" in obj; }, get: function (obj) { return obj.weight; }, set: function (obj, value) { obj.weight = value; } }, metadata: _metadata }, _weight_initializers, _weight_extraInitializers);
        __esDecorate(null, null, _length_decorators, { kind: "field", name: "length", static: false, private: false, access: { has: function (obj) { return "length" in obj; }, get: function (obj) { return obj.length; }, set: function (obj, value) { obj.length = value; } }, metadata: _metadata }, _length_initializers, _length_extraInitializers);
        __esDecorate(null, null, _width_decorators, { kind: "field", name: "width", static: false, private: false, access: { has: function (obj) { return "width" in obj; }, get: function (obj) { return obj.width; }, set: function (obj, value) { obj.width = value; } }, metadata: _metadata }, _width_initializers, _width_extraInitializers);
        __esDecorate(null, null, _height_decorators, { kind: "field", name: "height", static: false, private: false, access: { has: function (obj) { return "height" in obj; }, get: function (obj) { return obj.height; }, set: function (obj, value) { obj.height = value; } }, metadata: _metadata }, _height_initializers, _height_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _trackingEvents_decorators, { kind: "field", name: "trackingEvents", static: false, private: false, access: { has: function (obj) { return "trackingEvents" in obj; }, get: function (obj) { return obj.trackingEvents; }, set: function (obj, value) { obj.trackingEvents = value; } }, metadata: _metadata }, _trackingEvents_initializers, _trackingEvents_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ShippingLabel = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ShippingLabel = _classThis;
}();
exports.ShippingLabel = ShippingLabel;
