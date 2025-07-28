import { Employee, Admin } from "./user";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role_id: string;
  role?: Role;
  employee?: Employee | null;
  admin?: Admin | null;
}

export interface Role {
  id: string;
  name: string;
  users?: User[];
}

export interface ConnectPayload {
  username: string;
  password: string;
}

export interface ConnectResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role_id?: string; // Make it optional in the payload
}
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role_id: string;
  };
  accessToken: string;
  refreshToken: string;
}
