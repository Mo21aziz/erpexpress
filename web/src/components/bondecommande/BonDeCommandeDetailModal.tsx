import {
  X,
  Package,
  User,
  Calendar,
  FileText,
  Box,
  Save,
  Edit,
  Check,
  X as XIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { BonDeCommande } from "@/api/bon-de-commande";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { bonDeCommandeApi } from "@/api/bon-de-commande";
import { categories as categoriesApi } from "@/api/categoty";
import { articles as articlesApi } from "@/api/articles";
import {
  validateBonDeCommandeCompleteness,
  validateBonDeCommandeForConfirmation,
} from "@/utils/pdfExport";
import { ConfirmationWarningModal } from "./ConfirmationWarningModal";

// Utility function to validate decimal input - very permissive for typing
const isValidDecimalInput = (value: string): boolean => {
  if (value === "") return true;

  // Allow any input that contains only digits, commas, dots, and spaces
  // This allows the user to type freely while preventing letters and special characters
  const isValid = /^[0-9.,\s]*$/.test(value);
  console.log(`Validating "${value}": ${isValid}`);
  return isValid;
};

// Utility function to parse decimal input
const parseDecimalInput = (value: string): number | null => {
  if (value === "") return null;

  // Clean the input: remove spaces and handle multiple separators
  let cleanValue = value.trim();

  // If there are multiple dots or commas, keep only the first one
  const dotIndex = cleanValue.indexOf(".");
  const commaIndex = cleanValue.indexOf(",");

  if (dotIndex !== -1 && commaIndex !== -1) {
    // If both exist, keep the first one
    if (dotIndex < commaIndex) {
      cleanValue =
        cleanValue.substring(0, commaIndex) +
        cleanValue.substring(commaIndex + 1);
    } else {
      cleanValue =
        cleanValue.substring(0, dotIndex) + cleanValue.substring(dotIndex + 1);
    }
  }

  // Handle trailing separators - if it ends with . or , and has digits before, treat as valid
  if (cleanValue.endsWith(".") || cleanValue.endsWith(",")) {
    const withoutSeparator = cleanValue.slice(0, -1);
    if (withoutSeparator && /^[0-9]+$/.test(withoutSeparator)) {
      // This is a valid number with trailing separator (e.g., "5." or "5,")
      cleanValue = withoutSeparator;
    }
  }

  // Replace comma with dot for parsing
  const numericString = cleanValue.replace(",", ".");
  const numericValue = parseFloat(numericString);

  return isNaN(numericValue) ? null : numericValue;
};

interface BonDeCommandeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonDeCommande: BonDeCommande | null;
  onUpdate?: (updatedBonDeCommande: BonDeCommande) => void;
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

// Confirmed Bon De Commande Warning Card Component
const ConfirmedWarningCard: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg text-red-800">
              Bon de commande confirmé
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
            Ce bon de commande a été confirmé et ne peut plus être modifié.
          </p>
          <p className="text-sm text-gray-600">
            Les quantités des articles ne peuvent pas être mises à jour une fois
            le bon de commande confirmé.
          </p>
          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Compris
            </Button>
          </div>
        </CardContent>
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

export const BonDeCommandeDetailModal: React.FC<
  BonDeCommandeDetailModalProps
> = ({ isOpen, onClose, bonDeCommande, onUpdate, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<
    Record<string, { stock: number | null; demand: number | null }>
  >({});
  const [displayValues, setDisplayValues] = useState<
    Record<string, { stock: string; demand: string }>
  >({});
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

  // State for confirmed bon de commande warning
  const [confirmedWarning, setConfirmedWarning] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });

  // State for all categories and articles
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);

  const { toast } = useToast();

  // Initialize edited quantities when bon de commande changes
  useEffect(() => {
    if (bonDeCommande) {
      const initialQuantities: Record<
        string,
        { stock: number | null; demand: number | null }
      > = {};
      const initialDisplayValues: Record<
        string,
        { stock: string; demand: string }
      > = {};
      bonDeCommande.categories.forEach((entry) => {
        if (entry.article_id) {
          initialQuantities[entry.id] = {
            stock: entry.quantite_a_stocker ?? null,
            demand: entry.quantite_a_demander ?? null,
          };
          initialDisplayValues[entry.id] = {
            stock: entry.quantite_a_stocker?.toString() ?? "",
            demand: entry.quantite_a_demander?.toString() ?? "",
          };
        }
      });
      setEditedQuantities(initialQuantities);
      setDisplayValues(initialDisplayValues);
    }
  }, [bonDeCommande]);

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

  const handleQuantityChange = (
    entryId: string,
    field: "stock" | "demand",
    value: number | null
  ) => {
    setEditedQuantities((prev) => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        [field]: value,
      },
    }));
  };

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

  const handleCloseConfirmedWarning = () => {
    setConfirmedWarning({ isOpen: false });
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

  const handleSave = async () => {
    if (!bonDeCommande) return;

    setLoading(true);
    try {
      // Update each category entry with new quantities
      const updatePromises = Object.entries(editedQuantities).map(
        ([entryId, quantities]) => {
          const entry = bonDeCommande.categories.find(
            (cat) => cat.id === entryId
          );
          if (!entry) return Promise.resolve();

          return bonDeCommandeApi.updateBonDeCommandeCategory(entryId, {
            quantite_a_stocker:
              quantities.stock === null ? undefined : quantities.stock,
            quantite_a_demander:
              quantities.demand === null ? undefined : quantities.demand,
          });
        }
      );

      await Promise.all(updatePromises);

      // Fetch updated bon de commande
      const updatedBonDeCommande = await bonDeCommandeApi.getBonDeCommandeById(
        bonDeCommande.id
      );

      if (updatedBonDeCommande && onUpdate) {
        onUpdate(updatedBonDeCommande);
      }

      setIsEditing(false);
      toast({
        title: "Succès",
        description: "Quantités mises à jour avec succès",
      });
    } catch (error: any) {
      // Check if the error is about confirmed bon de commande
      if (
        error.message &&
        error.message.includes("confirmed bon de commande")
      ) {
        setConfirmedWarning({ isOpen: true });
        setIsEditing(false);
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la mise à jour des quantités",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    if (bonDeCommande) {
      const initialQuantities: Record<
        string,
        { stock: number | null; demand: number | null }
      > = {};
      const initialDisplayValues: Record<
        string,
        { stock: string; demand: string }
      > = {};
      bonDeCommande.categories.forEach((entry) => {
        if (entry.article_id) {
          initialQuantities[entry.id] = {
            stock: entry.quantite_a_stocker ?? null,
            demand: entry.quantite_a_demander ?? null,
          };
          initialDisplayValues[entry.id] = {
            stock: entry.quantite_a_stocker?.toString() ?? "",
            demand: entry.quantite_a_demander?.toString() ?? "",
          };
        }
      });
      setEditedQuantities(initialQuantities);
      setDisplayValues(initialDisplayValues);
    }
  };

  if (!isOpen || !bonDeCommande) return null;

  // Filter only entries that have article_id (individual articles)
  const articleEntries = bonDeCommande.categories.filter(
    (entry) => entry.article_id
  );

  // Group by category for display
  const articlesByCategory: Record<string, typeof articleEntries> = {};
  articleEntries.forEach((entry) => {
    if (!articlesByCategory[entry.category_id]) {
      articlesByCategory[entry.category_id] = [];
    }
    articlesByCategory[entry.category_id].push(entry);
  });

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Détails de la bonne de commande
                </h2>
                <p className="text-gray-600">Code: {bonDeCommande.code}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onStatusChange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
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
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  {bonDeCommande.status === "en attente"
                    ? "Confirmer"
                    : "Remettre en attente"}
                </Button>
              )}
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  disabled={loading || bonDeCommande.status === "confirmer"}
                  title={
                    bonDeCommande.status === "confirmer"
                      ? "Impossible de modifier un bon de commande confirmé"
                      : "Modifier les quantités"
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Confirmed Status Banner */}
            {bonDeCommande.status === "confirmer" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">
                      Bon de commande confirmé
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Ce bon de commande a été confirmé et ne peut plus être
                      modifié.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* General Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Description:</span>
                  <span className="text-gray-700">
                    {bonDeCommande.description}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Date pour le:</span>
                  <span className="text-gray-700">
                    {new Date(bonDeCommande.target_date).toLocaleDateString(
                      "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Date de création:</span>
                  <span className="text-gray-700">
                    {new Date(bonDeCommande.created_at).toLocaleDateString(
                      "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Utilisateur:</span>
                  <span className="text-gray-700">
                    {bonDeCommande.employee?.user?.username || "Utilisateur"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-medium">Statut:</span>
                  <Badge
                    variant={
                      bonDeCommande.status === "en attente"
                        ? "secondary"
                        : bonDeCommande.status === "confirmer"
                        ? "default"
                        : "outline"
                    }
                    className={
                      bonDeCommande.status === "en attente"
                        ? "bg-yellow-100 text-yellow-800"
                        : bonDeCommande.status === "confirmer"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {bonDeCommande.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Articles with Stock and Demand */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Articles en stock et demandés
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Chargement des articles...</p>
                </div>
              ) : articleEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun article associé</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(articlesByCategory).map(
                    ([categoryId, entries]) => {
                      const category = entries[0]?.category;
                      return (
                        <div
                          key={categoryId}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-2 mb-4">
                            <Package className="h-5 w-5 text-blue-600" />
                            <h4 className="text-lg font-semibold text-gray-900">
                              {category?.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {category?.description}
                          </p>

                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left font-semibold w-[40%] sm:w-auto">
                                    Article
                                  </th>
                                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center font-semibold w-16 sm:w-24">
                                    Collisage
                                  </th>
                                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                    stock
                                  </th>
                                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                    demande
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {entries.map((entry) => {
                                  const article = entry.article;
                                  if (!article) return null;

                                  return (
                                    <tr
                                      key={entry.id}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="border border-gray-300 px-2 sm:px-4 py-2 align-top">
                                        <div className="text-sm">
                                          <div
                                            className="font-medium max-w-[120px] sm:max-w-none truncate"
                                            title={article.name}
                                          >
                                            {article.name}
                                          </div>
                                          <div className="hidden sm:block text-gray-500 text-xs">
                                            {article.description}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center w-16 sm:w-24">
                                        <span className="text-sm font-medium">
                                          {article.collisage}
                                        </span>
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        {isEditing ? (
                                          <Input
                                            type="text"
                                            inputMode="decimal"
                                            value={
                                              displayValues[entry.id]?.stock ??
                                              ""
                                            }
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              console.log(
                                                "Stock input value:",
                                                value
                                              );

                                              // Always update the display value
                                              setDisplayValues((prev) => ({
                                                ...prev,
                                                [entry.id]: {
                                                  ...prev[entry.id],
                                                  stock: value,
                                                },
                                              }));

                                              // Validate decimal input
                                              if (isValidDecimalInput(value)) {
                                                console.log(
                                                  "Stock input is valid"
                                                );
                                                const numericValue =
                                                  parseDecimalInput(value);
                                                console.log(
                                                  "Stock parsed value:",
                                                  numericValue
                                                );
                                                handleQuantityChange(
                                                  entry.id,
                                                  "stock",
                                                  numericValue
                                                );
                                              } else {
                                                console.log(
                                                  "Stock input is invalid"
                                                );
                                                // Don't update the parsed value if invalid
                                              }
                                            }}
                                            className="w-16 h-8 text-xs"
                                            placeholder=""
                                            disabled={
                                              bonDeCommande.status ===
                                              "confirmer"
                                            }
                                          />
                                        ) : (
                                          <span className="text-sm font-medium text-green-600">
                                            {entry.quantite_a_stocker?.toString() ??
                                              ""}
                                          </span>
                                        )}
                                      </td>

                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        {isEditing ? (
                                          <Input
                                            type="text"
                                            inputMode="decimal"
                                            value={
                                              displayValues[entry.id]?.demand ??
                                              ""
                                            }
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              console.log(
                                                "Demand input value:",
                                                value
                                              );

                                              // Always update the display value
                                              setDisplayValues((prev) => ({
                                                ...prev,
                                                [entry.id]: {
                                                  ...prev[entry.id],
                                                  demand: value,
                                                },
                                              }));

                                              // Validate decimal input
                                              if (isValidDecimalInput(value)) {
                                                console.log(
                                                  "Demand input is valid"
                                                );
                                                const numericValue =
                                                  parseDecimalInput(value);
                                                console.log(
                                                  "Demand parsed value:",
                                                  numericValue
                                                );
                                                handleQuantityChange(
                                                  entry.id,
                                                  "demand",
                                                  numericValue
                                                );
                                              } else {
                                                console.log(
                                                  "Demand input is invalid"
                                                );
                                                // Don't update the parsed value if invalid
                                              }
                                            }}
                                            className="w-16 h-8 text-xs"
                                            placeholder=""
                                            disabled={
                                              bonDeCommande.status ===
                                              "confirmer"
                                            }
                                          />
                                        ) : (
                                          <span className="text-sm font-medium text-orange-600">
                                            {entry.quantite_a_demander?.toString() ??
                                              ""}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Card for null/zero values */}
      <WarningCard
        isOpen={warningCard.isOpen}
        onClose={handleCloseWarning}
        onConfirm={handleConfirmWithWarning}
        bonDeCommande={warningCard.bonDeCommande!}
      />

      <MissingItemsWarningCard
        isOpen={missingItemsWarning.isOpen}
        onClose={handleCloseMissingItemsWarning}
        onGoToAffectation={handleGoToAffectation}
        bonDeCommande={missingItemsWarning.bonDeCommande!}
        missingCategories={missingItemsWarning.missingCategories}
        missingArticles={missingItemsWarning.missingArticles}
      />

      <ConfirmedWarningCard
        isOpen={confirmedWarning.isOpen}
        onClose={handleCloseConfirmedWarning}
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
