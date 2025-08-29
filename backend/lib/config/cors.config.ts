import { CorsOptions } from "cors";
import { getEnvironmentConfig } from "./environment.config";

// Define allowed origins for different environments
export const getAllowedOrigins = (): string[] => {
  const envConfig = getEnvironmentConfig();

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
    "https://erpexpress.onrender.com", // Production backend
    "https://erpexpress-x7fh.vercel.app", // Production frontend on Vercel
    // Add any other production frontend domains here
  ];
};

// CORS configuration
export const corsConfig: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin is allowed
    if (allowedOrigins.includes(origin)) {
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
