// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://erpexpress.onrender.com";

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
