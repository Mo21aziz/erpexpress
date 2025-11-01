"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const auth_util_1 = require("../lib/utils/auth.util");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }
    try {
        const decoded = (0, auth_util_1.validateToken)(token);
        if (!decoded) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        // Add user information to the request object
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            roleId: decoded.roleId,
        };
        next();
    }
    catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};
exports.authenticateToken = authenticateToken;
