import { useState, useEffect, useCallback } from "react";
import { bonDeCommandeApi, BonDeCommande } from "@/api/bon-de-commande";

export function useOrderData() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [orderData, setOrderData] = useState<BonDeCommande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Load available dates on mount
  useEffect(() => {
    const loadAvailableDates = async () => {
      try {
        // For now, we'll generate dates for the next 30 days
        const dates = [];
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString().split("T")[0]);
        }
        setAvailableDates(dates);
      } catch (err) {
        setError("Failed to load available dates");
      }
    };
    loadAvailableDates();
  }, []);

  const fetchOrderData = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await bonDeCommandeApi.getBonDeCommande();
      // Filter by selected date and category
      const filteredData = data.filter((order) => {
        const orderDate = new Date(order.created_at)
          .toISOString()
          .split("T")[0];
        const dateMatch = orderDate === selectedDate;
        const categoryMatch =
          selectedCategory === "all" ||
          order.categories.some((cat) => cat.category_id === selectedCategory);
        return dateMatch && categoryMatch;
      });
      setOrderData(filteredData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load order data");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedCategory]);

  return {
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    orderData,
    setOrderData,
    loading,
    error,
    availableDates,
    fetchOrderData,
  };
}
