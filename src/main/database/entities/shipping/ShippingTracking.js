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
exports.ShippingTracking = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var ShippingLabel_1 = require("./ShippingLabel");
var ShippingTracking = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('shipping_tracking'), (0, typeorm_1.Index)(['shippingLabelId']), (0, typeorm_1.Index)(['trackingNumber'])];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _classSuper = BaseEntity_1.BaseEntity;
    var _shippingLabelId_decorators;
    var _shippingLabelId_initializers = [];
    var _shippingLabelId_extraInitializers = [];
    var _shippingLabel_decorators;
    var _shippingLabel_initializers = [];
    var _shippingLabel_extraInitializers = [];
    var _trackingNumber_decorators;
    var _trackingNumber_initializers = [];
    var _trackingNumber_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _statusDescription_decorators;
    var _statusDescription_initializers = [];
    var _statusDescription_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    var _timestamp_decorators;
    var _timestamp_initializers = [];
    var _timestamp_extraInitializers = [];
    var _eventDetails_decorators;
    var _eventDetails_initializers = [];
    var _eventDetails_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var ShippingTracking = _classThis = /** @class */ (function (_super) {
        __extends(ShippingTracking_1, _super);
        function ShippingTracking_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.shippingLabelId = __runInitializers(_this, _shippingLabelId_initializers, void 0);
            _this.shippingLabel = (__runInitializers(_this, _shippingLabelId_extraInitializers), __runInitializers(_this, _shippingLabel_initializers, void 0));
            _this.trackingNumber = (__runInitializers(_this, _shippingLabel_extraInitializers), __runInitializers(_this, _trackingNumber_initializers, void 0));
            _this.status = (__runInitializers(_this, _trackingNumber_extraInitializers), __runInitializers(_this, _status_initializers, void 0));
            _this.statusDescription = (__runInitializers(_this, _status_extraInitializers), __runInitializers(_this, _statusDescription_initializers, void 0));
            _this.location = (__runInitializers(_this, _statusDescription_extraInitializers), __runInitializers(_this, _location_initializers, void 0));
            _this.timestamp = (__runInitializers(_this, _location_extraInitializers), __runInitializers(_this, _timestamp_initializers, void 0));
            _this.eventDetails = (__runInitializers(_this, _timestamp_extraInitializers), __runInitializers(_this, _eventDetails_initializers, void 0));
            _this.createdAt = (__runInitializers(_this, _eventDetails_extraInitializers), __runInitializers(_this, _createdAt_initializers, void 0));
            __runInitializers(_this, _createdAt_extraInitializers);
            return _this;
        }
        return ShippingTracking_1;
    }(_classSuper));
    __setFunctionName(_classThis, "ShippingTracking");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _shippingLabelId_decorators = [(0, typeorm_1.Column)({ name: 'shipping_label_id', type: 'integer' })];
        _shippingLabel_decorators = [(0, typeorm_1.ManyToOne)(function () { return ShippingLabel_1.ShippingLabel; }, function (label) { return label.trackingEvents; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'shipping_label_id' })];
        _trackingNumber_decorators = [(0, typeorm_1.Column)({ name: 'tracking_number', type: 'text' })];
        _status_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _statusDescription_decorators = [(0, typeorm_1.Column)({ name: 'status_description', type: 'text', nullable: true })];
        _location_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _timestamp_decorators = [(0, typeorm_1.Column)({ type: 'datetime' })];
        _eventDetails_decorators = [(0, typeorm_1.Column)({
                name: 'event_details',
                type: 'text',
                nullable: true,
                transformer: {
                    to: function (value) { return value ? JSON.stringify(value) : null; },
                    from: function (value) { return value ? JSON.parse(value) : null; }
                }
            })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'datetime', default: function () { return 'CURRENT_TIMESTAMP'; } })];
        __esDecorate(null, null, _shippingLabelId_decorators, { kind: "field", name: "shippingLabelId", static: false, private: false, access: { has: function (obj) { return "shippingLabelId" in obj; }, get: function (obj) { return obj.shippingLabelId; }, set: function (obj, value) { obj.shippingLabelId = value; } }, metadata: _metadata }, _shippingLabelId_initializers, _shippingLabelId_extraInitializers);
        __esDecorate(null, null, _shippingLabel_decorators, { kind: "field", name: "shippingLabel", static: false, private: false, access: { has: function (obj) { return "shippingLabel" in obj; }, get: function (obj) { return obj.shippingLabel; }, set: function (obj, value) { obj.shippingLabel = value; } }, metadata: _metadata }, _shippingLabel_initializers, _shippingLabel_extraInitializers);
        __esDecorate(null, null, _trackingNumber_decorators, { kind: "field", name: "trackingNumber", static: false, private: false, access: { has: function (obj) { return "trackingNumber" in obj; }, get: function (obj) { return obj.trackingNumber; }, set: function (obj, value) { obj.trackingNumber = value; } }, metadata: _metadata }, _trackingNumber_initializers, _trackingNumber_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _statusDescription_decorators, { kind: "field", name: "statusDescription", static: false, private: false, access: { has: function (obj) { return "statusDescription" in obj; }, get: function (obj) { return obj.statusDescription; }, set: function (obj, value) { obj.statusDescription = value; } }, metadata: _metadata }, _statusDescription_initializers, _statusDescription_extraInitializers);
        __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
        __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: function (obj) { return "timestamp" in obj; }, get: function (obj) { return obj.timestamp; }, set: function (obj, value) { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
        __esDecorate(null, null, _eventDetails_decorators, { kind: "field", name: "eventDetails", static: false, private: false, access: { has: function (obj) { return "eventDetails" in obj; }, get: function (obj) { return obj.eventDetails; }, set: function (obj, value) { obj.eventDetails = value; } }, metadata: _metadata }, _eventDetails_initializers, _eventDetails_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ShippingTracking = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ShippingTracking = _classThis;
}();
exports.ShippingTracking = ShippingTracking;
