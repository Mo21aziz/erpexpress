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
  AlertCircle,
  Settings,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { BonDeCommande } from "@/api/bon-de-commande";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessGerantPages } from "@/utils/roleUtils";
import { categories as categoriesApi } from "@/api/categoty";
import { articles as articlesApi } from "@/api/articles";
import {
  validateBonDeCommandeCompleteness,
  validateBonDeCommandeForConfirmation,
} from "@/utils/pdfExport";
import { ConfirmationWarningModal } from "./ConfirmationWarningModal";

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

// Warning Card Component for null/zero values
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
      <Card className="w-full max-w-md flex flex-col h-[70vh]">
        {/* Fixed Header */}
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 flex-shrink-0">
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

        {/* Scrollable Body */}
        <CardContent className="flex-1 overflow-y-auto space-y-4 px-6">
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
        </CardContent>

        {/* Fixed Footer */}
        <div className="p-6 pt-0 flex justify-end space-x-2 flex-shrink-0">
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
      </Card>
    </div>
  );
};

// Missing Categories/Articles Warning Card Component
const MissingItemsWarningCard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onGoToAffectation: () => void;
  bonDeCommande: BonDeCommande;
  missingCategories: any[];
  missingArticles: any[];
}> = ({
  isOpen,
  onClose,
  onGoToAffectation,
  bonDeCommande,
  missingCategories,
  missingArticles,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg flex flex-col h-[80vh]">
        {/* Fixed Header */}
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg text-red-800">
              Attention - Catégories et Articles Manquants
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

        {/* Scrollable Body */}
        <CardContent className="flex-1 overflow-y-auto space-y-4 px-6">
          <p className="text-sm text-gray-600">
            Le bon de commande <strong>{bonDeCommande.code}</strong> ne contient
            pas toutes les catégories et articles de la base de données.
          </p>

          {missingCategories.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="font-medium text-red-800 mb-2">
                Catégories manquantes ({missingCategories.length}):
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {missingCategories.map((category) => (
                  <li key={category.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span className="font-medium">{category.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {missingArticles.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="font-medium text-red-800 mb-2">
                Articles manquants ({missingArticles.length}):
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {missingArticles.map((article) => (
                  <li key={article.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span className="font-medium">{article.name}</span>
                    <span className="text-red-600">
                      ({article.category?.name})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>

        {/* Fixed Footer */}
        <div className="p-6 pt-0 flex justify-end space-x-2 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Button>
          <Button
            variant="ghost"
            onClick={onGoToAffectation}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Aller à Affectation des Ressources
          </Button>
        </div>
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

  // State for null/zero values warning
  const [warningCard, setWarningCard] = useState<{
    isOpen: boolean;
    bonDeCommande: BonDeCommande | null;
    newStatus: string;
  }>({
    isOpen: false,
    bonDeCommande: null,
    newStatus: "",
  });

  // State for missing categories/articles warning
  const [missingItemsWarning, setMissingItemsWarning] = useState<{
    isOpen: boolean;
    bonDeCommande: BonDeCommande | null;
    newStatus: string;
    missingCategories: any[];
    missingArticles: any[];
  }>({
    isOpen: false,
    bonDeCommande: null,
    newStatus: "",
    missingCategories: [],
    missingArticles: [],
  });

  // State for comprehensive confirmation warning
  const [confirmationWarning, setConfirmationWarning] = useState<{
    isOpen: boolean;
    bonDeCommande: BonDeCommande | null;
    newStatus: string;
    missingCategories: any[];
    missingArticles: any[];
    zeroQuantityArticles: any[];
  }>({
    isOpen: false,
    bonDeCommande: null,
    newStatus: "",
    missingCategories: [],
    missingArticles: [],
    zeroQuantityArticles: [],
  });

  // State for all categories and articles
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);

  // Fetch all categories and articles for validation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, articlesData] = await Promise.all([
          categoriesApi.getCategories(),
          articlesApi.getArticles(),
        ]);
        setAllCategories(categoriesData);
        setAllArticles(articlesData);
      } catch (error) {
        console.error("Failed to fetch validation data:", error);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = (
    bonDeCommande: BonDeCommande,
    newStatus: string
  ) => {
    // If trying to confirm, check for validation issues
    if (newStatus === "confirmer") {
      const validation = validateBonDeCommandeForConfirmation(
        bonDeCommande,
        allCategories,
        allArticles
      );

      if (validation.requiresConfirmationModal) {
        // Show comprehensive confirmation warning
        setConfirmationWarning({
          isOpen: true,
          bonDeCommande,
          newStatus,
          missingCategories: validation.missingCategories,
          missingArticles: validation.missingArticles,
          zeroQuantityArticles: validation.zeroQuantityArticles,
        });
        return;
      }
    }

    // Direct status change for non-confirmation or no issues
    onStatusChange?.(bonDeCommande, newStatus);
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

  const handleConfirmWithMissingItems = () => {
    if (missingItemsWarning.bonDeCommande && missingItemsWarning.newStatus) {
      onStatusChange?.(
        missingItemsWarning.bonDeCommande,
        missingItemsWarning.newStatus
      );
      setMissingItemsWarning({
        isOpen: false,
        bonDeCommande: null,
        newStatus: "",
        missingCategories: [],
        missingArticles: [],
      });
    }
  };

  const handleCloseMissingItemsWarning = () => {
    setMissingItemsWarning({
      isOpen: false,
      bonDeCommande: null,
      newStatus: "",
      missingCategories: [],
      missingArticles: [],
    });
  };

  const handleGoToAffectation = () => {
    // Navigate to affectation des ressources page
    window.location.href = "/affectation-ressources";
  };

  const handleConfirmAnyway = async () => {
    if (confirmationWarning.bonDeCommande && confirmationWarning.newStatus) {
      try {
        await onStatusChange?.(
          confirmationWarning.bonDeCommande,
          confirmationWarning.newStatus
        );
        setConfirmationWarning({
          isOpen: false,
          bonDeCommande: null,
          newStatus: "",
          missingCategories: [],
          missingArticles: [],
          zeroQuantityArticles: [],
        });
      } catch (error) {
        console.error("Error confirming bon de commande:", error);
      }
    }
  };

  const handleCloseConfirmationWarning = () => {
    setConfirmationWarning({
      isOpen: false,
      bonDeCommande: null,
      newStatus: "",
      missingCategories: [],
      missingArticles: [],
      zeroQuantityArticles: [],
    });
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
    const roleName = user?.role?.name;

    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Aucun bon de commande trouvé
        </h3>
        <p className="text-gray-500">
          {roleName === "Gerant"
            ? "Aucun bon de commande de vos employés assignés dans les dernières 48 heures"
            : "Aucun bon de commande n'a été crée"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 48-hour notice for Gerant only */}
      {user && user.role && user.role.name === "Gerant" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Vous ne voyez que les bons de commande
              des dernières 48 heures (de vos employés assignés).
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                Code du bon de commande
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

      {/* Warning Card for null/zero values */}
      <WarningCard
        isOpen={warningCard.isOpen}
        onClose={handleCloseWarning}
        onConfirm={handleConfirmWithWarning}
        bonDeCommande={warningCard.bonDeCommande!}
      />

      {/* Missing Items Warning Card */}
      <MissingItemsWarningCard
        isOpen={missingItemsWarning.isOpen}
        onClose={handleCloseMissingItemsWarning}
        onGoToAffectation={handleGoToAffectation}
        bonDeCommande={missingItemsWarning.bonDeCommande!}
        missingCategories={missingItemsWarning.missingCategories}
        missingArticles={missingItemsWarning.missingArticles}
      />

      {/* Comprehensive Confirmation Warning Modal */}
      <ConfirmationWarningModal
        isOpen={confirmationWarning.isOpen}
        onClose={handleCloseConfirmationWarning}
        onConfirmAnyway={handleConfirmAnyway}
        bonDeCommande={confirmationWarning.bonDeCommande!}
        missingCategories={confirmationWarning.missingCategories}
        missingArticles={confirmationWarning.missingArticles}
        zeroQuantityArticles={confirmationWarning.zeroQuantityArticles}
      />
    </>
  );
};
