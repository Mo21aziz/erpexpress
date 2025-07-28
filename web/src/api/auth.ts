import { ConnectPayload, RegisterPayload } from "../../../backend/types/auth";
import axios from "axios";

const connect = async (payload: ConnectPayload) => {
  const response = await axios.post(`/api/auth/connect`, payload);
  return response.data;
};

const register = async (payload: RegisterPayload) => {
  const response = await axios.post(`/api/auth/register`, payload);
  return response.data;
};

export const auth = {
  connect,
  register,
};
