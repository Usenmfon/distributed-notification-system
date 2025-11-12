"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = createResponse;
exports.createErrorResponse = createErrorResponse;
function createResponse(message, data, meta) {
    return {
        success: true,
        message,
        data,
        meta,
    };
}
function createErrorResponse(message, error) {
    return {
        success: false,
        message,
        error,
    };
}
//# sourceMappingURL=response.interface.js.map