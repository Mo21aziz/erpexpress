import { User, Role, UserWithRole } from "@/types/database";
import api from "./axios";

// Get all users with their roles
const getUsers = async (): Promise<UserWithRole[]> => {
  const response = await api.get("/api/users");
  return response.data;
};

// Get a single user by ID
const getUser = async (id: string): Promise<User & { role: Role }> => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};

// Create a new user
const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await api.post("/api/users", userData);
  return response.data;
};

// Update a user
const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<User> => {
  const response = await api.put(`/api/users/${id}`, userData);
  return response.data;
};

// Delete a user
const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/users/${id}`);
};

export const users = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
