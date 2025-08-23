import { Calendar, Loader2, User, Eye, FileDown } from "lucide-react";
import React from "react";
import { BonDeCommande } from "@/api/bon-de-commande";
import { Button } from "@/components/ui/button";

interface BonDeCommandeTableProps {
  bonDeCommandes: BonDeCommande[];
  loading: boolean;
  onBonDeCommandeClick: (bonDeCommande: BonDeCommande) => void;
  onExportPDF?: (bonDeCommande: BonDeCommande) => void;
}

export const BonDeCommandeTable: React.FC<BonDeCommandeTableProps> = ({
  bonDeCommandes,
  loading,
  onBonDeCommandeClick,
  onExportPDF,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 mr-2 animate-spin text-gray-500" />
        <span>Chargement des données...</span>
      </div>
    );
  }

  if (bonDeCommandes.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Aucune bonne de commande trouvée
        </h3>
        <p className="text-gray-500">
          Aucune bonne de commande n'a été créée pour le moment
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
              Code de bonne de commande
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
              Date pour le
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
              Créé le
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
              Utilisateur
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bonDeCommandes.map((bonDeCommande) => (
            <tr
              key={bonDeCommande.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onBonDeCommandeClick(bonDeCommande)}
            >
              <td className="border border-gray-300 px-4 py-2">
                <div className="text-sm">
                  <div className="font-medium text-blue-600">
                    {bonDeCommande.code}
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm">
                    {new Date(bonDeCommande.target_date).toLocaleDateString(
                      "fr-FR"
                    )}
                  </span>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm">
                    {new Date(bonDeCommande.created_at).toLocaleDateString(
                      "fr-FR",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex items-center justify-center">
                  <User className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm">
                    {bonDeCommande.employee?.user?.username || "Utilisateur"}
                  </span>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBonDeCommandeClick(bonDeCommande);
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {onExportPDF && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportPDF(bonDeCommande);
                      }}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50"
                      title="Exporter PDF"
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
