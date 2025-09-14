// API Configuration
export const API_BASE_URL = import.meta.env.PROD
  ? "https://erpexpress-1.onrender.com/api" // Connect directly to backend
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Frontend URL for reference
export const FRONTEND_URL =
  "https://erpexpress-cngvk2cg1-medazizzarrouks-projects.vercel.app";

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
