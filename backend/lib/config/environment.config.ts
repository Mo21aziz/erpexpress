// Environment Configuration
// This file can be used to manage environment-specific settings

export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGINS: string[];
}

// Helper function to get environment variable with fallback
export const getEnvVar = (key: string, fallback: string): string => {
  return process.env[key] || fallback;
};

// Helper function to get environment variable as number with fallback
export const getEnvVarAsNumber = (key: string, fallback: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : fallback;
};

// Get current environment configuration
export const getEnvironmentConfig = (): Partial<EnvironmentConfig> => {
  return {
    NODE_ENV: getEnvVar("NODE_ENV", "development"),
    PORT: getEnvVarAsNumber("PORT", 5000),
    DATABASE_URL: getEnvVar("DATABASE_URL", ""),
    JWT_SECRET: getEnvVar("JWT_SECRET", ""),
    CORS_ORIGINS: getEnvVar("CORS_ORIGINS", "").split(",").filter(Boolean),
  };
};

// Check if we're in production
export const isProduction = (): boolean => {
  return getEnvVar("NODE_ENV", "development") === "production";
};

// Check if we're in development
export const isDevelopment = (): boolean => {
  return getEnvVar("NODE_ENV", "development") === "development";
};
