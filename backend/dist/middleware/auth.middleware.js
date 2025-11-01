import { validateToken } from "../lib/utils/auth.util";
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }
    try {
        const decoded = validateToken(token);
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
