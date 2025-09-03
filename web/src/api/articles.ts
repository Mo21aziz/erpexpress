import { Article } from "@/types/database";
import { AxiosError } from "axios";
import api from "./axios";

export const articles = {
  // Get all articles
  getArticles: async (): Promise<Article[]> => {
    try {
      const response = await api.get("/articles");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to fetch articles"
        );
      }
      throw new Error("Failed to fetch articles");
    }
  },

  // Get articles by category
  getArticlesByCategory: async (categoryId: string): Promise<Article[]> => {
    try {
      const response = await api.get(`/articles/by-category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch articles for category ${categoryId}:`,
        error
      );
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to fetch articles"
        );
      }
      throw new Error("Failed to fetch articles");
    }
  },

  // Get single article by ID
  getArticle: async (id: string): Promise<Article> => {
    try {
      const response = await api.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch article ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to fetch article"
        );
      }
      throw new Error("Failed to fetch article");
    }
  },

  // Create new article
  createArticle: async (articleData: {
    name: string;
    description: string;
    price: number;
    collisage: string;
    type: string;
    numero?: number;
    category_id: string;
  }): Promise<Article> => {
    try {
      const response = await api.post("/articles", articleData);
      return response.data;
    } catch (error) {
      console.error("Failed to create article:", error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to create article"
        );
      }
      throw new Error("Failed to create article");
    }
  },

  // Update article
  updateArticle: async (
    id: string,
    articleData: {
      name: string;
      description: string;
      price: number;
      collisage: string;
      type: string;
      numero?: number;
      category_id: string;
      quantite_a_stocker?: any;
      quantite_a_demander?: any;
    }
  ): Promise<Article> => {
    try {
      const response = await api.put(`/articles/${id}`, articleData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update article ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to update article"
        );
      }
      throw new Error("Failed to update article");
    }
  },

  // Delete article
  deleteArticle: async (id: string): Promise<void> => {
    try {
      await api.delete(`/articles/${id}`);
    } catch (error) {
      console.error(`Failed to delete article ${id}:`, error);
      if (error instanceof AxiosError) {
        throw new Error(
          error.response?.data?.error || "Failed to delete article"
        );
      }
      throw new Error("Failed to delete article");
    }
  },
};
