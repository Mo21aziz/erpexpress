import { Category } from "@/types/database";
import { AxiosError } from "axios";
import api from "./axios";

export const categories = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get("/api/category");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to fetch categories"
        );
      }
      throw new Error("Failed to fetch categories");
    }
  },

  // Get single category by ID
  getCategory: async (id: string): Promise<Category> => {
    try {
      const response = await api.get(`/api/category/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to fetch category"
        );
      }
      throw new Error("Failed to fetch category");
    }
  },

  // Create new category
  createCategory: async (categoryData: {
    name: string;
    description: string;
  }): Promise<Category> => {
    try {
      const response = await api.post("/api/category/add", categoryData);
      return response.data;
    } catch (error) {
      console.error("Failed to create category:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to create category"
        );
      }
      throw new Error("Failed to create category");
    }
  },

  // Update category
  updateCategory: async (
    id: string,
    categoryData: { name: string; description: string }
  ): Promise<Category> => {
    try {
      const response = await api.put(`/api/category/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to update category"
        );
      }
      throw new Error("Failed to update category");
    }
  },

  // Delete category
  deleteCategory: async (
    id: string,
    cascade: boolean = false
  ): Promise<void> => {
    try {
      const url = cascade
        ? `/api/category/${id}?cascade=true`
        : `/api/category/${id}`;
      await api.delete(url);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to delete category"
        );
      }
      throw new Error("Failed to delete category");
    }
  },
};
