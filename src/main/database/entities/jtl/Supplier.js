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
exports.Supplier = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var SupplierOrder_1 = require("./SupplierOrder");
var Supplier = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('suppliers')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = BaseEntity_1.BaseEntity;
    var _jtlId_decorators;
    var _jtlId_initializers = [];
    var _jtlId_extraInitializers = [];
    var _supplierNumber_decorators;
    var _supplierNumber_initializers = [];
    var _supplierNumber_extraInitializers = [];
    var _companyName_decorators;
    var _companyName_initializers = [];
    var _companyName_extraInitializers = [];
    var _companyAddition_decorators;
    var _companyAddition_initializers = [];
    var _companyAddition_extraInitializers = [];
    var _contact_decorators;
    var _contact_initializers = [];
    var _contact_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _phoneDirect_decorators;
    var _phoneDirect_initializers = [];
    var _phoneDirect_extraInitializers = [];
    var _fax_decorators;
    var _fax_initializers = [];
    var _fax_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _city_decorators;
    var _city_initializers = [];
    var _city_extraInitializers = [];
    var _country_decorators;
    var _country_initializers = [];
    var _country_extraInitializers = [];
    var _postalCode_decorators;
    var _postalCode_initializers = [];
    var _postalCode_extraInitializers = [];
    var _street_decorators;
    var _street_initializers = [];
    var _street_extraInitializers = [];
    var _customerNumber_decorators;
    var _customerNumber_initializers = [];
    var _customerNumber_extraInitializers = [];
    var _notes_decorators;
    var _notes_initializers = [];
    var _notes_extraInitializers = [];
    var _lastSynced_decorators;
    var _lastSynced_initializers = [];
    var _lastSynced_extraInitializers = [];
    var _orders_decorators;
    var _orders_initializers = [];
    var _orders_extraInitializers = [];
    var Supplier = _classThis = /** @class */ (function (_super) {
        __extends(Supplier_1, _super);
        function Supplier_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.jtlId = __runInitializers(_this, _jtlId_initializers, void 0);
            _this.supplierNumber = (__runInitializers(_this, _jtlId_extraInitializers), __runInitializers(_this, _supplierNumber_initializers, void 0));
            _this.companyName = (__runInitializers(_this, _supplierNumber_extraInitializers), __runInitializers(_this, _companyName_initializers, void 0));
            _this.companyAddition = (__runInitializers(_this, _companyName_extraInitializers), __runInitializers(_this, _companyAddition_initializers, void 0));
            _this.contact = (__runInitializers(_this, _companyAddition_extraInitializers), __runInitializers(_this, _contact_initializers, void 0));
            _this.phone = (__runInitializers(_this, _contact_extraInitializers), __runInitializers(_this, _phone_initializers, void 0));
            _this.phoneDirect = (__runInitializers(_this, _phone_extraInitializers), __runInitializers(_this, _phoneDirect_initializers, void 0));
            _this.fax = (__runInitializers(_this, _phoneDirect_extraInitializers), __runInitializers(_this, _fax_initializers, void 0));
            _this.email = (__runInitializers(_this, _fax_extraInitializers), __runInitializers(_this, _email_initializers, void 0));
            _this.city = (__runInitializers(_this, _email_extraInitializers), __runInitializers(_this, _city_initializers, void 0));
            _this.country = (__runInitializers(_this, _city_extraInitializers), __runInitializers(_this, _country_initializers, void 0));
            _this.postalCode = (__runInitializers(_this, _country_extraInitializers), __runInitializers(_this, _postalCode_initializers, void 0));
            _this.street = (__runInitializers(_this, _postalCode_extraInitializers), __runInitializers(_this, _street_initializers, void 0));
            _this.customerNumber = (__runInitializers(_this, _street_extraInitializers), __runInitializers(_this, _customerNumber_initializers, void 0));
            _this.notes = (__runInitializers(_this, _customerNumber_extraInitializers), __runInitializers(_this, _notes_initializers, void 0));
            _this.lastSynced = (__runInitializers(_this, _notes_extraInitializers), __runInitializers(_this, _lastSynced_initializers, void 0));
            // Relations
            _this.orders = (__runInitializers(_this, _lastSynced_extraInitializers), __runInitializers(_this, _orders_initializers, void 0));
            __runInitializers(_this, _orders_extraInitializers);
            return _this;
        }
        return Supplier_1;
    }(_classSuper));
    __setFunctionName(_classThis, "Supplier");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _jtlId_decorators = [(0, typeorm_1.Column)({ name: 'jtl_id', type: 'integer', nullable: true, unique: true }), (0, typeorm_1.Index)()];
        _supplierNumber_decorators = [(0, typeorm_1.Column)({ name: 'supplier_number', type: 'text', nullable: true })];
        _companyName_decorators = [(0, typeorm_1.Column)({ name: 'company_name', type: 'text', nullable: true })];
        _companyAddition_decorators = [(0, typeorm_1.Column)({ name: 'company_addition', type: 'text', nullable: true })];
        _contact_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _phone_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _phoneDirect_decorators = [(0, typeorm_1.Column)({ name: 'phone_direct', type: 'text', nullable: true })];
        _fax_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _email_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _city_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _country_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _postalCode_decorators = [(0, typeorm_1.Column)({ name: 'postal_code', type: 'text', nullable: true })];
        _street_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _customerNumber_decorators = [(0, typeorm_1.Column)({ name: 'customer_number', type: 'text', nullable: true })];
        _notes_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _lastSynced_decorators = [(0, typeorm_1.Column)({ name: 'last_synced', type: 'datetime', nullable: true })];
        _orders_decorators = [(0, typeorm_1.OneToMany)(function () { return SupplierOrder_1.SupplierOrder; }, function (order) { return order.supplier; })];
        __esDecorate(null, null, _jtlId_decorators, { kind: "field", name: "jtlId", static: false, private: false, access: { has: function (obj) { return "jtlId" in obj; }, get: function (obj) { return obj.jtlId; }, set: function (obj, value) { obj.jtlId = value; } }, metadata: _metadata }, _jtlId_initializers, _jtlId_extraInitializers);
        __esDecorate(null, null, _supplierNumber_decorators, { kind: "field", name: "supplierNumber", static: false, private: false, access: { has: function (obj) { return "supplierNumber" in obj; }, get: function (obj) { return obj.supplierNumber; }, set: function (obj, value) { obj.supplierNumber = value; } }, metadata: _metadata }, _supplierNumber_initializers, _supplierNumber_extraInitializers);
        __esDecorate(null, null, _companyName_decorators, { kind: "field", name: "companyName", static: false, private: false, access: { has: function (obj) { return "companyName" in obj; }, get: function (obj) { return obj.companyName; }, set: function (obj, value) { obj.companyName = value; } }, metadata: _metadata }, _companyName_initializers, _companyName_extraInitializers);
        __esDecorate(null, null, _companyAddition_decorators, { kind: "field", name: "companyAddition", static: false, private: false, access: { has: function (obj) { return "companyAddition" in obj; }, get: function (obj) { return obj.companyAddition; }, set: function (obj, value) { obj.companyAddition = value; } }, metadata: _metadata }, _companyAddition_initializers, _companyAddition_extraInitializers);
        __esDecorate(null, null, _contact_decorators, { kind: "field", name: "contact", static: false, private: false, access: { has: function (obj) { return "contact" in obj; }, get: function (obj) { return obj.contact; }, set: function (obj, value) { obj.contact = value; } }, metadata: _metadata }, _contact_initializers, _contact_extraInitializers);
        __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
        __esDecorate(null, null, _phoneDirect_decorators, { kind: "field", name: "phoneDirect", static: false, private: false, access: { has: function (obj) { return "phoneDirect" in obj; }, get: function (obj) { return obj.phoneDirect; }, set: function (obj, value) { obj.phoneDirect = value; } }, metadata: _metadata }, _phoneDirect_initializers, _phoneDirect_extraInitializers);
        __esDecorate(null, null, _fax_decorators, { kind: "field", name: "fax", static: false, private: false, access: { has: function (obj) { return "fax" in obj; }, get: function (obj) { return obj.fax; }, set: function (obj, value) { obj.fax = value; } }, metadata: _metadata }, _fax_initializers, _fax_extraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: function (obj) { return "city" in obj; }, get: function (obj) { return obj.city; }, set: function (obj, value) { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
        __esDecorate(null, null, _country_decorators, { kind: "field", name: "country", static: false, private: false, access: { has: function (obj) { return "country" in obj; }, get: function (obj) { return obj.country; }, set: function (obj, value) { obj.country = value; } }, metadata: _metadata }, _country_initializers, _country_extraInitializers);
        __esDecorate(null, null, _postalCode_decorators, { kind: "field", name: "postalCode", static: false, private: false, access: { has: function (obj) { return "postalCode" in obj; }, get: function (obj) { return obj.postalCode; }, set: function (obj, value) { obj.postalCode = value; } }, metadata: _metadata }, _postalCode_initializers, _postalCode_extraInitializers);
        __esDecorate(null, null, _street_decorators, { kind: "field", name: "street", static: false, private: false, access: { has: function (obj) { return "street" in obj; }, get: function (obj) { return obj.street; }, set: function (obj, value) { obj.street = value; } }, metadata: _metadata }, _street_initializers, _street_extraInitializers);
        __esDecorate(null, null, _customerNumber_decorators, { kind: "field", name: "customerNumber", static: false, private: false, access: { has: function (obj) { return "customerNumber" in obj; }, get: function (obj) { return obj.customerNumber; }, set: function (obj, value) { obj.customerNumber = value; } }, metadata: _metadata }, _customerNumber_initializers, _customerNumber_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: function (obj) { return "notes" in obj; }, get: function (obj) { return obj.notes; }, set: function (obj, value) { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _lastSynced_decorators, { kind: "field", name: "lastSynced", static: false, private: false, access: { has: function (obj) { return "lastSynced" in obj; }, get: function (obj) { return obj.lastSynced; }, set: function (obj, value) { obj.lastSynced = value; } }, metadata: _metadata }, _lastSynced_initializers, _lastSynced_extraInitializers);
        __esDecorate(null, null, _orders_decorators, { kind: "field", name: "orders", static: false, private: false, access: { has: function (obj) { return "orders" in obj; }, get: function (obj) { return obj.orders; }, set: function (obj, value) { obj.orders = value; } }, metadata: _metadata }, _orders_initializers, _orders_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Supplier = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Supplier = _classThis;
}();
exports.Supplier = Supplier;
