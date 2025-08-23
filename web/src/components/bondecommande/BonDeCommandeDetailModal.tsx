import { X, Package, User, Calendar, FileText, Box } from "lucide-react";
import React, { useState, useEffect } from "react";
import { BonDeCommande } from "@/api/bon-de-commande";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BonDeCommandeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonDeCommande: BonDeCommande | null;
}

export const BonDeCommandeDetailModal: React.FC<
  BonDeCommandeDetailModalProps
> = ({ isOpen, onClose, bonDeCommande }) => {
  const [loading, setLoading] = useState(false);

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
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
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
                    bonDeCommande.status === "pending"
                      ? "secondary"
                      : bonDeCommande.status === "completed"
                      ? "default"
                      : "outline"
                  }
                  className={
                    bonDeCommande.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : bonDeCommande.status === "completed"
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
                {Object.entries(articlesByCategory).map(([categoryId, entries]) => {
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
                                    <span className="text-sm font-medium text-green-600">
                                      {entry.quantite_a_stocker}
                                    </span>
                                  </td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">
                                    <span className="text-sm font-medium text-orange-600">
                                      {entry.quantite_a_demander}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};