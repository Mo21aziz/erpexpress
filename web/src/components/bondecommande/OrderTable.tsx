import { Calendar, Loader2 } from "lucide-react";
import React from "react";
import { BonDeCommande } from "@/api/bon-de-commande";

interface OrderTableProps {
  orderData: BonDeCommande[];
  loading: boolean;
  selectedDate: string;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orderData,
  loading,
  selectedDate,
}) => {
  if (!selectedDate) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Sélectionnez une date
        </h3>
        <p className="text-gray-500">
          Choisissez une date ci-dessus pour afficher le tableau des commandes
        </p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 mr-2 animate-spin text-gray-500" />
        <span>Chargement des données...</span>
      </div>
    );
  }
  if (orderData.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Aucune commande trouvée
        </h3>
        <p className="text-gray-500">
          Aucune bon de commande n'a été trouvée pour cette date
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
              Nom de l'article
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
              Description
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
              Catégorie
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
              Quantité à stocker
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
              Quantité à demander
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
              Statut
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
              Date de création
            </th>
          </tr>
        </thead>
        <tbody>
          {orderData.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                <div className="text-sm">
                  <div className="font-medium">
                    {order.description.includes("pour ")
                      ? order.description.split("pour ")[1]?.split(" - ")[0] ||
                        "N/A"
                      : "N/A"}
                  </div>
                  <div className="text-gray-500 text-xs">ID: {order.id}</div>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="text-sm">
                  <div className="font-medium">{order.description}</div>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {order.categories[0]?.category.name || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {order.categories[0]?.quantite_a_stocker || 0}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {order.categories[0]?.quantite_a_demander || 0}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {new Date(order.created_at).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
