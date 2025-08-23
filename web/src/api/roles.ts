import { Role } from "@/types/database";
import { AxiosError } from "axios";
import api from "./axios";

export const roles = {
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
    try {
      const response = await api.get("/api/roles");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Failed to fetch roles");
      }
      throw new Error("Failed to fetch roles");
    }
  },

  // Get single role by ID
  getRole: async (id: string): Promise<Role> => {
    try {
      const response = await api.get(`/api/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch role ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Failed to fetch role");
      }
      throw new Error("Failed to fetch role");
    }
  },

  // Create new role
  createRole: async (roleData: { name: string }): Promise<Role> => {
    try {
      const response = await api.post("/api/roles", roleData);
      return response.data;
    } catch (error) {
      console.error("Failed to create role:", error);
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Failed to create role");
      }
      throw new Error("Failed to create role");
    }
  },

  // Update role
  updateRole: async (id: string, roleData: { name: string }): Promise<Role> => {
    try {
      const response = await api.put(`/api/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update role ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Failed to update role");
      }
      throw new Error("Failed to update role");
    }
  },

  // Delete role
  deleteRole: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/roles/${id}`);
    } catch (error) {
      console.error(`Failed to delete role ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.error || "Failed to delete role");
      }
      throw new Error("Failed to delete role");
    }
  },
};
