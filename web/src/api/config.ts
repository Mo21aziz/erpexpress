// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://erpexpress-1.onrender.com/api";

// Frontend URL for reference
export const FRONTEND_URL =
  "https://erpexpress-x7fh-nh02khwlx-medazizzarrouks-projects.vercel.app";

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
