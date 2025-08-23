import { Request, Response, NextFunction } from "express";
import { validateToken } from "../lib/utils/auth.util";

// Extend the Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roleId: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
