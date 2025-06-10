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
exports.ReturnDocument = void 0;
var typeorm_1 = require("typeorm");
var BaseEntity_1 = require("../base/BaseEntity");
var SupplierReturn_1 = require("./SupplierReturn");
var ReturnDocument = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('return_documents')];
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
    var _fileName_decorators;
    var _fileName_initializers = [];
    var _fileName_extraInitializers = [];
    var _fileType_decorators;
    var _fileType_initializers = [];
    var _fileType_extraInitializers = [];
    var _fileSize_decorators;
    var _fileSize_initializers = [];
    var _fileSize_extraInitializers = [];
    var _filePath_decorators;
    var _filePath_initializers = [];
    var _filePath_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _thumbnailPath_decorators;
    var _thumbnailPath_initializers = [];
    var _thumbnailPath_extraInitializers = [];
    var _uploadDate_decorators;
    var _uploadDate_initializers = [];
    var _uploadDate_extraInitializers = [];
    var ReturnDocument = _classThis = /** @class */ (function (_super) {
        __extends(ReturnDocument_1, _super);
        function ReturnDocument_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.returnId = __runInitializers(_this, _returnId_initializers, void 0);
            _this.return = (__runInitializers(_this, _returnId_extraInitializers), __runInitializers(_this, _return_initializers, void 0));
            _this.fileName = (__runInitializers(_this, _return_extraInitializers), __runInitializers(_this, _fileName_initializers, void 0));
            _this.fileType = (__runInitializers(_this, _fileName_extraInitializers), __runInitializers(_this, _fileType_initializers, void 0));
            _this.fileSize = (__runInitializers(_this, _fileType_extraInitializers), __runInitializers(_this, _fileSize_initializers, void 0));
            _this.filePath = (__runInitializers(_this, _fileSize_extraInitializers), __runInitializers(_this, _filePath_initializers, void 0));
            _this.description = (__runInitializers(_this, _filePath_extraInitializers), __runInitializers(_this, _description_initializers, void 0));
            _this.thumbnailPath = (__runInitializers(_this, _description_extraInitializers), __runInitializers(_this, _thumbnailPath_initializers, void 0));
            _this.uploadDate = (__runInitializers(_this, _thumbnailPath_extraInitializers), __runInitializers(_this, _uploadDate_initializers, void 0));
            __runInitializers(_this, _uploadDate_extraInitializers);
            return _this;
        }
        return ReturnDocument_1;
    }(_classSuper));
    __setFunctionName(_classThis, "ReturnDocument");
    (function () {
        var _a;
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _returnId_decorators = [(0, typeorm_1.Column)({ name: 'returnId', type: 'integer' })];
        _return_decorators = [(0, typeorm_1.ManyToOne)(function () { return SupplierReturn_1.SupplierReturn; }, function (supplierReturn) { return supplierReturn.documents; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'returnId' })];
        _fileName_decorators = [(0, typeorm_1.Column)({ name: 'fileName', type: 'text' })];
        _fileType_decorators = [(0, typeorm_1.Column)({ name: 'fileType', type: 'text' })];
        _fileSize_decorators = [(0, typeorm_1.Column)({ name: 'fileSize', type: 'integer' })];
        _filePath_decorators = [(0, typeorm_1.Column)({ name: 'filePath', type: 'text' })];
        _description_decorators = [(0, typeorm_1.Column)({ type: 'text', nullable: true })];
        _thumbnailPath_decorators = [(0, typeorm_1.Column)({ name: 'thumbnailPath', type: 'text', nullable: true })];
        _uploadDate_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'uploadDate', type: 'datetime', default: function () { return 'CURRENT_TIMESTAMP'; } })];
        __esDecorate(null, null, _returnId_decorators, { kind: "field", name: "returnId", static: false, private: false, access: { has: function (obj) { return "returnId" in obj; }, get: function (obj) { return obj.returnId; }, set: function (obj, value) { obj.returnId = value; } }, metadata: _metadata }, _returnId_initializers, _returnId_extraInitializers);
        __esDecorate(null, null, _return_decorators, { kind: "field", name: "return", static: false, private: false, access: { has: function (obj) { return "return" in obj; }, get: function (obj) { return obj.return; }, set: function (obj, value) { obj.return = value; } }, metadata: _metadata }, _return_initializers, _return_extraInitializers);
        __esDecorate(null, null, _fileName_decorators, { kind: "field", name: "fileName", static: false, private: false, access: { has: function (obj) { return "fileName" in obj; }, get: function (obj) { return obj.fileName; }, set: function (obj, value) { obj.fileName = value; } }, metadata: _metadata }, _fileName_initializers, _fileName_extraInitializers);
        __esDecorate(null, null, _fileType_decorators, { kind: "field", name: "fileType", static: false, private: false, access: { has: function (obj) { return "fileType" in obj; }, get: function (obj) { return obj.fileType; }, set: function (obj, value) { obj.fileType = value; } }, metadata: _metadata }, _fileType_initializers, _fileType_extraInitializers);
        __esDecorate(null, null, _fileSize_decorators, { kind: "field", name: "fileSize", static: false, private: false, access: { has: function (obj) { return "fileSize" in obj; }, get: function (obj) { return obj.fileSize; }, set: function (obj, value) { obj.fileSize = value; } }, metadata: _metadata }, _fileSize_initializers, _fileSize_extraInitializers);
        __esDecorate(null, null, _filePath_decorators, { kind: "field", name: "filePath", static: false, private: false, access: { has: function (obj) { return "filePath" in obj; }, get: function (obj) { return obj.filePath; }, set: function (obj, value) { obj.filePath = value; } }, metadata: _metadata }, _filePath_initializers, _filePath_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _thumbnailPath_decorators, { kind: "field", name: "thumbnailPath", static: false, private: false, access: { has: function (obj) { return "thumbnailPath" in obj; }, get: function (obj) { return obj.thumbnailPath; }, set: function (obj, value) { obj.thumbnailPath = value; } }, metadata: _metadata }, _thumbnailPath_initializers, _thumbnailPath_extraInitializers);
        __esDecorate(null, null, _uploadDate_decorators, { kind: "field", name: "uploadDate", static: false, private: false, access: { has: function (obj) { return "uploadDate" in obj; }, get: function (obj) { return obj.uploadDate; }, set: function (obj, value) { obj.uploadDate = value; } }, metadata: _metadata }, _uploadDate_initializers, _uploadDate_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReturnDocument = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReturnDocument = _classThis;
}();
exports.ReturnDocument = ReturnDocument;
