import { Decimal } from "@prisma/client/runtime/library";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role_id: string;
  refreshToken?: string | null;
  role?: Role;
  employee?: Employee | null;
  admin?: Admin | null;
}

export interface Role {
  id: string;
  name: string;
  users?: User[];
}

export interface Admin {
  id: string;
  user_id: string;
  user?: User;
}

export interface Employee {
  id: string;
  user_id: string;
  user?: User;
}

// For CREATE operations
export type CreateUserInput = Omit<User, "id" | "role" | "employee" | "admin" | "refreshToken">;

// For UPDATE operations
export type UpdateUserInput = Partial<CreateUserInput> & {
  currentPassword?: string;
  newPassword?: string;
};

// For API responses
export interface UserResponse extends Omit<User, "password"> {
  role?: {
    id: string;
    name: string;
  };
}