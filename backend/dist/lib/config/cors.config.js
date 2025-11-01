"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = exports.getAllowedOrigins = void 0;
const environment_config_1 = require("./environment.config");
// Define allowed origins for different environments
const getAllowedOrigins = () => {
    const envConfig = (0, environment_config_1.getEnvironmentConfig)();
    // If CORS_ORIGINS environment variable is set, use it
    if (envConfig.CORS_ORIGINS && envConfig.CORS_ORIGINS.length > 0) {
        return envConfig.CORS_ORIGINS;
    }
    // Default origins for development and production
    return [
        // Development origins
        "http://localhost:5173", // Vite dev server
        "http://localhost:3000", // React dev server
        "http://localhost:4173", // Vite preview
        "http://localhost:5000", // Backend dev server
        // Production origins
        'https://commande.catering-concept.com',
        'https://www.commande.catering-concept.com', // Vercel preview
    ];
};
exports.getAllowedOrigins = getAllowedOrigins;
// CORS configuration
exports.corsConfig = {
    origin: (origin, callback) => {
        const allowedOrigins = (0, exports.getAllowedOrigins)();
        const normalize = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const originNormalized = origin ? normalize(origin) : "";
        // Allow Vercel preview URLs for this project (erpexpress-x7fh-*)
        const vercelPreviewPattern = /^https?:\/\/erpexpress-[a-z0-9-]+\.vercel\.app$/;
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        // Check if the origin is allowed (exact or normalized match)
        if ((origin && allowedOrigins.includes(origin)) ||
            (origin && allowedOrigins.map(normalize).includes(originNormalized)) ||
            (origin && vercelPreviewPattern.test(origin))) {
            return callback(null, true);
        }
        // Log blocked origins for debugging
        console.log(`CORS blocked origin: ${origin}`);
        console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
        return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    maxAge: 86400, // 24 hours
};
