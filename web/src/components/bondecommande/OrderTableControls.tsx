import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Filter, Loader2 } from "lucide-react";
import React from "react";

interface OrderTableControlsProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  loading: boolean;
  fetchOrderData: () => void;
  availableDates: string[];
}

export const OrderTableControls: React.FC<OrderTableControlsProps> = ({
  selectedDate,
  setSelectedDate,
  selectedCategory,
  setSelectedCategory,
  loading,
  fetchOrderData,
  availableDates,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-40"
          min={availableDates[0]}
          max={availableDates[availableDates.length - 1]}
        />
      </div>
      <div className="flex items-center space-x-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes les catégories</option>
          <option value="legumes">Légumes</option>
          <option value="divere">Divere</option>
        </select>
        <Button
          className="bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700"
          disabled={!selectedDate || loading}
          onClick={fetchOrderData}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Filter className="h-4 w-4 mr-2" />
          )}
          {loading ? "Chargement..." : "Filtrer"}
        </Button>
      </div>
    </div>
  );
};
