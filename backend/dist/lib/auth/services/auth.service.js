"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const hash_util_1 = require("../../utils/hash.util");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app_config_1 = __importDefault(require("../../config/app.config"));
class AuthService {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async generateTokens(user) {
        if (!user.role) {
            throw new Error("User role not found");
        }
        const payload = {
            sub: user.id,
            email: user.email,
            roleId: user.role_id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60, // 3 hours
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, app_config_1.default.JWT_SECRET);
        const refreshToken = jsonwebtoken_1.default.sign(payload, app_config_1.default.JWT_SECRET);
        return { accessToken, refreshToken };
    }
    async saveRefreshToken(userId, refreshToken) {
        const hashedToken = await bcrypt_1.default.hash(refreshToken, 10);
        await this.userService.updateUser(userId, { refreshToken: hashedToken });
    }
    async connect(payload) {
        console.log("AuthService.connect called with payload:", payload);
        const user = await this.userService.getUserByCondition({
            filter: `username||$eq||${payload.username}`,
        });
        console.log("User found:", user);
        if (!user) {
            throw new Error("nom d'utilisateur incorrect");
        }
        if (!user.password) {
            throw new Error("mot de passe incorrect");
        }
        const isMatch = await (0, hash_util_1.comparePasswords)(payload.password, user.password);
        if (!isMatch) {
            throw new Error("mot de passe incorrect");
        }
        const userWithRole = await this.userService.getUserWithRole(user.id);
        if (!userWithRole) {
            throw new Error("User not found");
        }
        console.log("User with role:", userWithRole);
        console.log("User role:", userWithRole.role);
        const { accessToken, refreshToken } = await this.generateTokens(userWithRole);
        await this.saveRefreshToken(user.id, refreshToken);
        const response = {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role_id: user.role_id,
                role: userWithRole.role
                    ? {
                        id: userWithRole.role.id,
                        name: userWithRole.role.name,
                    }
                    : undefined,
            },
            accessToken,
            refreshToken,
        };
        console.log("Auth response:", response);
        return response;
    }
    async register(payload) {
        const existingUser = await this.userService.getUserByCondition({
            filter: `(username||$eq||${payload.username};email||$eq||${payload.email})`,
        });
        if (existingUser) {
            throw new Error("Username or email already taken");
        }
        // Set default role if not provided
        const role_id = payload.role_id || (await this.userService.getDefaultRole());
        return this.userService.createUser({
            ...payload,
            role_id,
        });
    }
    async refreshToken(userId, refreshToken) {
        const user = await this.userService.getUserById(userId);
        if (!user || !user.refreshToken) {
            throw new Error("Invalid refresh token");
        }
        const isValid = await bcrypt_1.default.compare(refreshToken, user.refreshToken);
        if (!isValid) {
            throw new Error("Invalid refresh token");
        }
        const userWithRole = await this.userService.getUserWithRole(userId);
        if (!userWithRole) {
            throw new Error("User not found");
        }
        const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(userWithRole);
        await this.saveRefreshToken(userId, newRefreshToken);
        return { accessToken, refreshToken: newRefreshToken };
    }
}
exports.AuthService = AuthService;
