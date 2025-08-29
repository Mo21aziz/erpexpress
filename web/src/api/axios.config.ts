import axios from "axios";
import { useAuthPersistStore } from "../hooks/store/useAuthPersistStore";
import { API_BASE_URL } from "./config";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from the auth store
    const token = useAuthPersistStore.getState().accessToken;

    // If token exists, add it to request header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
