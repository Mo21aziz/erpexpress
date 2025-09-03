import { User, Role, UserWithRole } from "@/types/database";
import api from "./axios";

// Get all users with their roles
const getUsers = async (): Promise<UserWithRole[]> => {
  const response = await api.get("/users");
  return response.data;
};

// Get all users (for Gerant assignment)
const getEmployees = async (): Promise<any[]> => {
  const response = await api.get("/users/employees");
  return response.data;
};

// Get Gerant's assigned employees
const getGerantAssignedEmployees = async (gerantId: string): Promise<any[]> => {
  const response = await api.get(`/users/gerant/${gerantId}/employees`);
  return response.data;
};

// Get a single user by ID
const getUser = async (id: string): Promise<User & { role: Role }> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Create a new user
const createUser = async (
  userData: Partial<User> & { assigned_employee_ids?: string[] }
): Promise<User> => {
  const response = await api.post("/users", userData);
  return response.data;
};

// Update a user
const updateUser = async (
  id: string,
  userData: Partial<User> & { assigned_employee_ids?: string[] }
): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

// Delete a user
const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const users = {
  getUsers,
  getEmployees,
  getGerantAssignedEmployees,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
