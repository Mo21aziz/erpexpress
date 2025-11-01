"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = void 0;
// lib/utils/auth.util.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = __importDefault(require("../config/app.config"));
const validateToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, app_config_1.default.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.validateToken = validateToken;
