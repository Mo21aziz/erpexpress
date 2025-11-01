"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cors_config_1 = require("./lib/config/cors.config");
const cors_config_2 = require("./lib/config/cors.config");
const connect_1 = __importDefault(require("./api/auth/connect"));
const cat_management_1 = __importDefault(require("./api/category/cat.management"));
const article_management_1 = __importDefault(require("./api/category/article.management"));
const order_management_1 = __importDefault(require("./api/orders/order.management"));
const bon_de_commande_management_1 = __importDefault(require("./api/bon-de-commande.management"));
let userRouter;
let roleRouter;
// Load optional routers (CommonJS compatible)
try {
    const userRouterModule = require("./api/users-managements/user.router");
    userRouter = userRouterModule.default;
}
catch (error) { }
try {
    const roleRouterModule = require("./api/users-managements/role.router");
    roleRouter = roleRouterModule.default;
}
catch (error) { }
const app = (0, express_1.default)();
const PORT = 5000;
// Enable CORS
app.use((0, cors_1.default)(cors_config_1.corsConfig));
// Add security headers and logging
app.use((req, res, next) => {
    // Log incoming requests for debugging
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || "No origin"}`);
    // Special logging for auth requests
    if (req.path.includes("/auth/connect")) {
        console.log("AUTH CONNECT REQUEST:", {
            method: req.method,
            path: req.path,
            headers: req.headers,
            body: req.body,
        });
    }
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Max-Age", "86400");
        res.status(200).end();
        return;
    }
    // Add security headers
    res.header("X-Content-Type-Options", "nosniff");
    res.header("X-Frame-Options", "DENY");
    res.header("X-XSS-Protection", "1; mode=block");
    next();
});
app.use(express_1.default.json());
app.get("/api", (req, res) => {
    res.json({
        message: "Hello from Express with TypeScript!",
        status: "success",
    });
});
app.get("/test", (req, res) => {
    res.json({ message: "Server is working!" });
});
// Debug endpoint to check users
app.get("/api/debug/users", async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require("@prisma/client")));
        const prisma = new PrismaClient();
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        await prisma.$disconnect();
        res.json({ users });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users", details: error });
    }
});
// Debug endpoint to check roles
app.get("/api/debug/roles", async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require("@prisma/client")));
        const prisma = new PrismaClient();
        const roles = await prisma.role.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        await prisma.$disconnect();
        res.json({ roles });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch roles", details: error });
    }
});
// Setup endpoint to create default role and test user
app.post("/api/debug/setup", async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require("@prisma/client")));
        const prisma = new PrismaClient();
        // Create default role if it doesn't exist
        let defaultRole = await prisma.role.findFirst({
            where: { name: "USER" },
        });
        if (!defaultRole) {
            defaultRole = await prisma.role.create({
                data: { name: "USER" },
            });
        }
        // Create test user if it doesn't exist
        let testUser = await prisma.user.findFirst({
            where: { email: "test@example.com" },
        });
        if (!testUser) {
            const bcrypt = await Promise.resolve().then(() => __importStar(require("bcrypt")));
            const hashedPassword = await bcrypt.hash("password123", 10);
            testUser = await prisma.user.create({
                data: {
                    username: "testuser",
                    email: "test@example.com",
                    password: hashedPassword,
                    role_id: defaultRole.id,
                },
            });
        }
        await prisma.$disconnect();
        res.json({
            message: "Setup completed",
            defaultRole,
            testUser: {
                id: testUser.id,
                username: testUser.username,
                email: testUser.email,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to setup", details: error });
    }
});
// Seed roles endpoint
app.post("/api/debug/seed-roles", async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require("@prisma/client")));
        const prisma = new PrismaClient();
        const roles = [
            { name: "Responsible" },
            { name: "Admin" },
            { name: "Employee" },
            { name: "Gerant" },
        ];
        const createdRoles = [];
        for (const role of roles) {
            const createdRole = await prisma.role.upsert({
                where: { name: role.name },
                update: {},
                create: { name: role.name },
            });
            createdRoles.push(createdRole);
        }
        await prisma.$disconnect();
        res.json({
            message: "Roles seeded successfully",
            roles: createdRoles,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to seed roles", details: error });
    }
});
// CORS test endpoint
app.get("/api/cors-test", (req, res) => {
    const allowedOrigins = (0, cors_config_2.getAllowedOrigins)();
    res.json({
        message: "CORS is working!",
        timestamp: new Date().toISOString(),
        origin: req.headers.origin,
        method: req.method,
        allowedOrigins: allowedOrigins,
        isOriginAllowed: req.headers.origin
            ? allowedOrigins.includes(req.headers.origin)
            : "No origin",
        headers: req.headers,
    });
});
// CORS debug endpoint - shows current CORS configuration
app.get("/api/cors-debug", (req, res) => {
    const allowedOrigins = (0, cors_config_2.getAllowedOrigins)();
    res.json({
        message: "CORS Configuration Debug",
        timestamp: new Date().toISOString(),
        currentOrigin: req.headers.origin,
        allowedOrigins: allowedOrigins,
        isOriginAllowed: req.headers.origin
            ? allowedOrigins.includes(req.headers.origin)
            : "No origin",
        environment: process.env.NODE_ENV || "development",
        corsOriginsEnv: process.env.CORS_ORIGINS || "Not set",
    });
});
app.use("/api/auth", connect_1.default);
app.use("/api/category", cat_management_1.default);
app.use("/api/articles", article_management_1.default);
app.use("/api/orders", order_management_1.default);
app.use("/api/bon-de-commande", bon_de_commande_management_1.default);
const isExpressRouter = (router) => router &&
    typeof router === "function" &&
    router.stack &&
    Array.isArray(router.stack);
if (isExpressRouter(userRouter)) {
    app.use("/api/users", userRouter);
}
if (isExpressRouter(roleRouter)) {
    app.use("/api/roles", roleRouter);
}
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        method: req.method,
        url: req.originalUrl,
    });
});
app.use((err, req, res, next) => {
    res.status(500).json({ error: "Something went wrong!" });
});
app.listen(PORT);
