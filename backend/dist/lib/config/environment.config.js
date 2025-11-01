"use strict";
// Environment Configuration
// This file can be used to manage environment-specific settings
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDevelopment = exports.isProduction = exports.getEnvironmentConfig = exports.getEnvVarAsNumber = exports.getEnvVar = void 0;
// Helper function to get environment variable with fallback
const getEnvVar = (key, fallback) => {
    return process.env[key] || fallback;
};
exports.getEnvVar = getEnvVar;
// Helper function to get environment variable as number with fallback
const getEnvVarAsNumber = (key, fallback) => {
    const value = process.env[key];
    return value ? parseInt(value, 10) : fallback;
};
exports.getEnvVarAsNumber = getEnvVarAsNumber;
// Get current environment configuration
const getEnvironmentConfig = () => {
    return {
        NODE_ENV: (0, exports.getEnvVar)("NODE_ENV", "development"),
        PORT: (0, exports.getEnvVarAsNumber)("PORT", 5000),
        DATABASE_URL: (0, exports.getEnvVar)("DATABASE_URL", ""),
        JWT_SECRET: (0, exports.getEnvVar)("JWT_SECRET", ""),
        CORS_ORIGINS: (0, exports.getEnvVar)("CORS_ORIGINS", "").split(",").filter(Boolean),
    };
};
exports.getEnvironmentConfig = getEnvironmentConfig;
// Check if we're in production
const isProduction = () => {
    return (0, exports.getEnvVar)("NODE_ENV", "development") === "production";
};
exports.isProduction = isProduction;
// Check if we're in development
const isDevelopment = () => {
    return (0, exports.getEnvVar)("NODE_ENV", "development") === "development";
};
exports.isDevelopment = isDevelopment;
