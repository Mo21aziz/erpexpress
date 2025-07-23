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
