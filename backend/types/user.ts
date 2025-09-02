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
  gerant_assignments?: GerantEmployeeAssignment[];
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
  gerant_assignments?: GerantEmployeeAssignment[];
}

export interface GerantEmployeeAssignment {
  id: string;
  gerant_id: string;
  employee_id: string;
  created_at: Date;
  gerant?: User;
  employee?: Employee;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role_id: string; // Keep required in the DB input
  assigned_employee_ids?: string[]; // For Gerant role - list of employee IDs to assign
}

// For UPDATE operations
export type UpdateUserInput = Partial<CreateUserInput> & {
  currentPassword?: string;
  newPassword?: string;
  refreshToken?: string;
  assigned_employee_ids?: string[]; // For Gerant role - list of employee IDs to assign
};

export interface UserWithRole extends Omit<User, "role"> {
  role: Role; // Make role required when included
}

// For API responses
export interface UserResponse extends Omit<User, "password"> {
  role?: {
    id: string;
    name: string;
  };
}
