import axios from "./axios.config";

export interface OrderItem {
  id: string;
  packaging: string;
  article: string;
  stock: number;
  demand: number;
  delivery: number;
  category: string;
}

export interface OrderData {
  date: string;
  title: string;
  items: OrderItem[];
}

export const ordersApi = {
  // Get orders by date
  getOrdersByDate: async (
    date: string,
    category?: string
  ): Promise<OrderData> => {
    const params = category && category !== "all" ? { category } : {};
    const response = await axios.get(`/orders/by-date/${date}`, { params });
    return response.data;
  },

  // Get available dates
  getAvailableDates: async (): Promise<string[]> => {
    const response = await axios.get("/orders/dates");
    return response.data;
  },

  // Update order item
  updateOrderItem: async (
    id: string,
    data: { stock?: number; demand?: number; delivery?: number }
  ) => {
    const response = await axios.put(`/orders/item/${id}`, data);
    return response.data;
  },
};
