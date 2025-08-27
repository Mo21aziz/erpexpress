import { AxiosError } from "axios";
import api from "./axios";
import { ReactNode } from "react";

export interface BonDeCommande {
  id: string;
  code: string;
  created_at: string;
  target_date: string;
  description: string;
  status: string;
  employee_id: string;
  employee?: {
    id: string;
    user_id: string;
    user?: {
      id: string;
      username: string;
      email: string;
      role?: {
        id: string;
        name: string;
      };
    };
  };
  categories: BonDeCommandeCategory[];
}

export interface BonDeCommandeCategory {
  id: string;
  category_id: string;
  article_id?: string;
  bon_de_commande_id: string;
  quantite_a_stocker: number;
  quantite_a_demander: number;
  category: {
    id: string;
    name: string;
    description: string;
  };
  article?: {
    collisage: ReactNode;
    id: string;
    name: string;
    description: string;
    type: string; // "catering" or "sonodis"
    numero?: number;
  };
}

export interface CreateBonDeCommandeData {
  description: string;
  employee_id?: string; // Made optional since backend will auto-assign
  category_id: string;
  article_id?: string;
  quantite_a_stocker: number;
  quantite_a_demander: number;
  article_name: string;
}

export const bonDeCommandeApi = {
  // Create bon de commande
  createBonDeCommande: async (
    data: CreateBonDeCommandeData
  ): Promise<BonDeCommande> => {
    try {
      const response = await api.post("/api/bon-de-commande", data);
      return response.data;
    } catch (error) {
      console.error("Failed to create bon de commande:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to create bon de commande"
        );
      }
      throw new Error("Failed to create bon de commande");
    }
  },

  // Get all bon de commande
  getBonDeCommande: async (): Promise<BonDeCommande[]> => {
    try {
      const response = await api.get("/api/bon-de-commande");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch bon de commande:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to fetch bon de commande"
        );
      }
      throw new Error("Failed to fetch bon de commande");
    }
  },

  // Get bon de commande by ID
  getBonDeCommandeById: async (id: string): Promise<BonDeCommande> => {
    try {
      const response = await api.get(`/api/bon-de-commande/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch bon de commande ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to fetch bon de commande"
        );
      }
      throw new Error("Failed to fetch bon de commande");
    }
  },

  // Update bon de commande
  updateBonDeCommande: async (
    id: string,
    data: Partial<CreateBonDeCommandeData>
  ): Promise<BonDeCommande> => {
    try {
      const response = await api.put(`/api/bon-de-commande/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update bon de commande ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to update bon de commande"
        );
      }
      throw new Error("Failed to update bon de commande");
    }
  },

  // Update bon de commande status
  updateStatus: async (id: string, status: string): Promise<BonDeCommande> => {
    try {
      const response = await api.put(`/api/bon-de-commande/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Failed to update bon de commande status:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to update status"
        );
      }
      throw new Error("Failed to update status");
    }
  },

  // Update bon de commande category
  updateBonDeCommandeCategory: async (categoryId: string, data: {
    quantite_a_stocker?: number;
    quantite_a_demander?: number;
  }): Promise<any> => {
    try {
      const response = await api.put(`/api/bon-de-commande/category/${categoryId}`, data);
      return response.data;
    } catch (error) {
      console.error("Failed to update bon de commande category:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to update category"
        );
      }
      throw new Error("Failed to update category");
    }
  },

  // Delete bon de commande
  deleteBonDeCommande: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/bon-de-commande/${id}`);
    } catch (error) {
      console.error(`Failed to delete bon de commande ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to delete bon de commande"
        );
      }
      throw new Error("Failed to delete bon de commande");
    }
  },
};
