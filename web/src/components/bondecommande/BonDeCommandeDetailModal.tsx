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
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { BonDeCommande } from "@/api/bon-de-commande";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { bonDeCommandeApi } from "@/api/bon-de-commande";

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
              variant="outline"
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

export const BonDeCommandeDetailModal: React.FC<
  BonDeCommandeDetailModalProps
> = ({ isOpen, onClose, bonDeCommande, onUpdate, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<
    Record<string, { stock: number; demand: number }>
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
  const { toast } = useToast();

  // Initialize edited quantities when bon de commande changes
  useEffect(() => {
    if (bonDeCommande) {
      const initialQuantities: Record<
        string,
        { stock: number; demand: number }
      > = {};
      bonDeCommande.categories.forEach((entry) => {
        if (entry.article_id) {
          initialQuantities[entry.id] = {
            stock: entry.quantite_a_stocker || 0,
            demand: entry.quantite_a_demander || 0,
          };
        }
      });
      setEditedQuantities(initialQuantities);
    }
  }, [bonDeCommande]);

  const handleQuantityChange = (
    entryId: string,
    field: "stock" | "demand",
    value: number
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
            quantite_a_stocker: quantities.stock,
            quantite_a_demander: quantities.demand,
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
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des quantités",
        variant: "destructive",
      });
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
        { stock: number; demand: number }
      > = {};
      bonDeCommande.categories.forEach((entry) => {
        if (entry.article_id) {
          initialQuantities[entry.id] = {
            stock: entry.quantite_a_stocker || 0,
            demand: entry.quantite_a_demander || 0,
          };
        }
      });
      setEditedQuantities(initialQuantities);
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
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
                  variant="outline"
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
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                  <Button
                    variant="outline"
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

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                                    Article
                                  </th>
                                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                    Collisage
                                  </th>
                                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                    Quantité à stocker
                                  </th>
                                  <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                                    Quantité à demander
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
                                      <td className="border border-gray-300 px-4 py-2">
                                        <div className="text-sm">
                                          <div className="font-medium">
                                            {article.name}
                                          </div>
                                          <div className="text-gray-500 text-xs">
                                            {article.description}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        <span className="text-sm font-medium">
                                          {article.collisage}
                                        </span>
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        {isEditing ? (
                                          <Input
                                            type="number"
                                            min="0"
                                            value={
                                              editedQuantities[entry.id]
                                                ?.stock || 0
                                            }
                                            onChange={(e) =>
                                              handleQuantityChange(
                                                entry.id,
                                                "stock",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-20 h-8 text-sm text-center"
                                          />
                                        ) : (
                                          <span className="text-sm font-medium text-green-600">
                                            {entry.quantite_a_stocker}
                                          </span>
                                        )}
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        {isEditing ? (
                                          <Input
                                            type="number"
                                            min="0"
                                            value={
                                              editedQuantities[entry.id]
                                                ?.demand || 0
                                            }
                                            onChange={(e) =>
                                              handleQuantityChange(
                                                entry.id,
                                                "demand",
                                                Number(e.target.value)
                                              )
                                            }
                                            className="w-20 h-8 text-sm text-center"
                                          />
                                        ) : (
                                          <span className="text-sm font-medium text-orange-600">
                                            {entry.quantite_a_demander}
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
