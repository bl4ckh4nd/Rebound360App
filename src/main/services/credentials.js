"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEncryptionKey = getEncryptionKey;
exports.getEncryptionSalt = getEncryptionSalt;
exports.setEncryptionKey = setEncryptionKey;
exports.setEncryptionSalt = setEncryptionSalt;
exports.getDHLClientId = getDHLClientId;
exports.getDHLClientSecret = getDHLClientSecret;
exports.setDHLCredentials = setDHLCredentials;
exports.deleteDHLCredentials = deleteDHLCredentials;
exports.migrateCredentialsFromEnv = migrateCredentialsFromEnv;
var keytar_1 = require("keytar");
var crypto_1 = require("crypto");
var SERVICE_NAME = 'JTLSupplierReturn';
var ACCOUNT_KEY = 'encryption-key';
var ACCOUNT_SALT = 'encryption-salt';
var DHL_CLIENT_ID_KEY = 'dhl-client-id';
var DHL_CLIENT_SECRET_KEY = 'dhl-client-secret';
function getEncryptionKey() {
    return __awaiter(this, void 0, void 0, function () {
        var key;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, keytar_1.default.getPassword(SERVICE_NAME, ACCOUNT_KEY)];
                case 1:
                    key = _a.sent();
                    console.log('[Credentials] Encryption key exists:', Boolean(key));
                    if (!!key) return [3 /*break*/, 3];
                    key = crypto_1.default.randomBytes(32).toString('hex');
                    console.log('[Credentials] Generated new encryption key');
                    return [4 /*yield*/, setEncryptionKey(key)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (key.length !== 64) {
                        throw new Error('Invalid encryption key length');
                    }
                    return [2 /*return*/, key];
            }
        });
    });
}
function getEncryptionSalt() {
    return __awaiter(this, void 0, void 0, function () {
        var salt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, keytar_1.default.getPassword(SERVICE_NAME, ACCOUNT_SALT)];
                case 1:
                    salt = (_a.sent()) || '';
                    if (!!salt) return [3 /*break*/, 3];
                    // Generate new 16-byte salt if none exists
                    salt = crypto_1.default.randomBytes(16).toString('hex');
                    return [4 /*yield*/, setEncryptionSalt(salt)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, salt];
            }
        });
    });
}
function setEncryptionKey(key) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, keytar_1.default.setPassword(SERVICE_NAME, ACCOUNT_KEY, key)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function setEncryptionSalt(salt) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, keytar_1.default.setPassword(SERVICE_NAME, ACCOUNT_SALT, salt)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// DHL API credentials management
function getDHLClientId() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, keytar_1.default.getPassword(SERVICE_NAME, DHL_CLIENT_ID_KEY)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function getDHLClientSecret() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, keytar_1.default.getPassword(SERVICE_NAME, DHL_CLIENT_SECRET_KEY)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function setDHLCredentials(clientId, clientSecret) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, keytar_1.default.setPassword(SERVICE_NAME, DHL_CLIENT_ID_KEY, clientId)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, keytar_1.default.setPassword(SERVICE_NAME, DHL_CLIENT_SECRET_KEY, clientSecret)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function deleteDHLCredentials() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, keytar_1.default.deletePassword(SERVICE_NAME, DHL_CLIENT_ID_KEY)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, keytar_1.default.deletePassword(SERVICE_NAME, DHL_CLIENT_SECRET_KEY)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Migration function for existing installations
function migrateCredentialsFromEnv() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
