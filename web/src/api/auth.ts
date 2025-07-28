import { ConnectPayload, RegisterPayload } from "../../../backend/types/auth";
import api from "./axios";
import axios from "axios";

const connect = async (payload: ConnectPayload) => {
  console.log("Sending auth request:", payload);
  // Use regular axios for auth requests to avoid token interceptor
  const response = await axios.post(
    `http://localhost:5000/api/auth/connect`,
    payload
  );
  console.log("Auth response:", response.data);
  // Backend returns { message, code, data } but we need just the data
  return response.data.data;
};

const register = async (payload: RegisterPayload) => {
  const response = await api.post(`/api/auth/register`, payload);
  return response.data;
};

const refresh = async (refreshToken: string) => {
  const response = await api.post(`/api/auth/refresh`, { refreshToken });
  return response.data;
};

export const auth = {
  connect,
  register,
  refresh,
};
