"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const container_1 = __importDefault(require("../../lib/container"));
const app_config_1 = __importDefault(require("../../lib/config/app.config"));
const router = express_1.default.Router();
router.post("/connect", async (req, res) => {
    console.log("=== AUTH CONNECT ROUTE HIT ===");
    console.log("Request method:", req.method);
    console.log("Request body:", req.body);
    console.log("Request headers:", req.headers);
    const authService = container_1.default.AuthService;
    try {
        const { username, password } = req.body;
        console.log("Connect route received:", {
            username,
            password: password ? "***" : "missing",
        });
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "Username and password are required" });
        }
        const data = await authService.connect({ username, password });
        res.status(200).json({ message: "Connection successful", code: 200, data });
    }
    catch (error) {
        console.error("Connect error:", error);
        res.status(401).json({ error: error.message, code: 401 });
    }
});
router.post("/register", async (req, res) => {
    const authService = container_1.default.AuthService;
    try {
        const { username, email, password, role_id } = req.body;
        console.log("Register route received:", { username, email, role_id });
        if (!username || !email || !password) {
            return res
                .status(400)
                .json({ error: "Username, email and password are required" });
        }
        const user = await authService.register({
            username,
            email,
            password,
            role_id,
        });
        res
            .status(201)
            .json({ message: "User registered successfully", code: 201, data: user });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(400).json({ error: error.message, code: 400 });
    }
});
router.post("/refresh", async (req, res) => {
    const authService = container_1.default.AuthService;
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }
        // Decode the refresh token to get user ID
        const decoded = jsonwebtoken_1.default.verify(refreshToken, app_config_1.default.JWT_SECRET);
        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }
        const tokens = await authService.refreshToken(decoded.sub, refreshToken);
        res.status(200).json(tokens);
    }
    catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({ error: "Invalid refresh token" });
    }
});
exports.default = router;
