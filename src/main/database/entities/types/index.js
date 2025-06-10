"use strict";
/**
 * TypeScript type definitions and enums for TypeORM entities
 * These types ensure consistency between entity definitions and application code
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTransformer = exports.ArrayTransformer = exports.JsonTransformer = void 0;
// JSON transformer utilities
exports.JsonTransformer = {
    to: function (value) { return value ? JSON.stringify(value) : null; },
    from: function (value) { return value ? JSON.parse(value) : null; }
};
exports.ArrayTransformer = {
    to: function (value) { return value ? JSON.stringify(value) : null; },
    from: function (value) { return value ? JSON.parse(value) : []; }
};
exports.ObjectTransformer = {
    to: function (value) { return value ? JSON.stringify(value) : null; },
    from: function (value) { return value ? JSON.parse(value) : {}; }
};
