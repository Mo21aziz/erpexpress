import { ConnectPayload, RegisterPayload } from "../../../backend/types/auth";
import api from "./axios";
import axios from "axios";
import { buildApiUrl } from "./config";

const connect = async (payload: ConnectPayload) => {
  console.log("Sending auth request:", payload);
  // Use the configured api instance with proper base URL
  const response = await api.post("/auth/connect", payload);
  console.log("Auth response:", response.data);
  // Backend returns { message, code, data } but we need just the data
  return response.data.data;
};

const register = async (payload: RegisterPayload) => {
  const response = await api.post(`/auth/register`, payload);
  return response.data;
};

const refresh = async (refreshToken: string) => {
  const response = await api.post(`/auth/refresh`, { refreshToken });
  return response.data;
};

export const auth = {
  connect,
  register,
  refresh,
};
