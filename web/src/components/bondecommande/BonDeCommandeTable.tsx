import {
  Calendar,
  Loader2,
  User,
  Eye,
  FileDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { BonDeCommande } from "@/api/bon-de-commande";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessGerantPages } from "@/utils/roleUtils";

interface BonDeCommandeTableProps {
  bonDeCommandes: BonDeCommande[];
  loading: boolean;
  onBonDeCommandeClick: (bonDeCommande: BonDeCommande) => void;
  onExportPDF?: (bonDeCommande: BonDeCommande) => void;
  onStatusChange?: (bonDeCommande: BonDeCommande, newStatus: string) => void;
}

// Utility function to check for null or zero values in bon de commande
const hasNullValues = (bonDeCommande: BonDeCommande): boolean => {
  return bonDeCommande.categories.some((category) => {
    return (
      category.quantite_a_stocker === null ||
      category.quantite_a_stocker === undefined ||
      category.quantite_a_stocker === 0 ||
      category.quantite_a_demander === null ||
      category.quantite_a_demander === undefined ||
      category.quantite_a_demander === 0
    );
  });
};

// Warning Card Component
const WarningCard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bonDeCommande: BonDeCommande;
}> = ({ isOpen, onClose, onConfirm, bonDeCommande }) => {
  if (!isOpen) return null;

  const nullCategories = bonDeCommande.categories.filter((category) => {
    return (
      category.quantite_a_stocker === null ||
      category.quantite_a_stocker === undefined ||
      category.quantite_a_stocker === 0 ||
      category.quantite_a_demander === null ||
      category.quantite_a_demander === undefined ||
      category.quantite_a_demander === 0
    );
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-800">
              Attention - Valeurs Null ou Zéro Détectées
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Le bon de commande <strong>{bonDeCommande.code}</strong> contient
            des valeurs null ou zéro dans les catégories suivantes :
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <ul className="text-sm text-yellow-800 space-y-1">
              {nullCategories.map((category) => (
                <li key={category.id} className="flex items-center space-x-2">
                  <span>•</span>
                  <span className="font-medium">
                    {category.article?.name || category.category.name}
                  </span>
                  <span className="text-yellow-600">
                    (Stock: {category.quantite_a_stocker ?? "null"}, Demande:{" "}
                    {category.quantite_a_demander ?? "null"})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            Voulez-vous vraiment confirmer ce bon de commande malgré les valeurs
            null ou zéro ?
          </p>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Confirmer quand même
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const BonDeCommandeTable: React.FC<BonDeCommandeTableProps> = ({
  bonDeCommandes,
  loading,
  onBonDeCommandeClick,
  onExportPDF,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const canChangeStatus =
    user && user.role ? canAccessGerantPages(user.role.name) : false;
  const [warningCard, setWarningCard] = useState<{
    isOpen: boolean;
    bonDeCommande: BonDeCommande | null;
    newStatus: string;
  }>({
    isOpen: false,
    bonDeCommande: null,
    newStatus: "",
  });

  const handleStatusChange = (
    bonDeCommande: BonDeCommande,
    newStatus: string
  ) => {
    // If trying to confirm and there are null values, show warning
    if (newStatus === "confirmer" && hasNullValues(bonDeCommande)) {
      setWarningCard({
        isOpen: true,
        bonDeCommande,
        newStatus,
      });
    } else {
      // Direct status change for non-confirmation or no null values
      onStatusChange?.(bonDeCommande, newStatus);
    }
  };

  const handleConfirmWithWarning = () => {
    if (warningCard.bonDeCommande && warningCard.newStatus) {
      onStatusChange?.(warningCard.bonDeCommande, warningCard.newStatus);
      setWarningCard({ isOpen: false, bonDeCommande: null, newStatus: "" });
    }
  };

  const handleCloseWarning = () => {
    setWarningCard({ isOpen: false, bonDeCommande: null, newStatus: "" });
  };

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
    <>
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
                Statut
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
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bonDeCommande.status === "en attente"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {bonDeCommande.status === "en attente" ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {bonDeCommande.status}
                  </span>
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
                    {onStatusChange && canChangeStatus && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newStatus =
                            bonDeCommande.status === "en attente"
                              ? "confirmer"
                              : "en attente";
                          handleStatusChange(bonDeCommande, newStatus);
                        }}
                        className={
                          bonDeCommande.status === "en attente"
                            ? "text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                            : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        }
                        title={
                          bonDeCommande.status === "en attente"
                            ? "Confirmer le bon de commande"
                            : "Remettre en attente"
                        }
                      >
                        {bonDeCommande.status === "en attente" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Warning Card */}
      <WarningCard
        isOpen={warningCard.isOpen}
        onClose={handleCloseWarning}
        onConfirm={handleConfirmWithWarning}
        bonDeCommande={warningCard.bonDeCommande!}
      />
    </>
  );
};
