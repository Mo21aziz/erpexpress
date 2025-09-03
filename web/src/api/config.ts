// API Configuration
export const API_BASE_URL = import.meta.env.PROD
  ? "/api" // Use Vercel proxy in production
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Frontend URL for reference
export const FRONTEND_URL =
  "https://erpexpress-cngvk2cg1-medazizzarrouks-projects.vercel.app";

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
