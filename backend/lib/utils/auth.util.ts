// lib/utils/auth.util.ts
import jwt from "jsonwebtoken";
import AppConfig from "../config/app.config.ts";

export const validateToken = (token: string): any => {
  try {
    return jwt.verify(token, AppConfig.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
