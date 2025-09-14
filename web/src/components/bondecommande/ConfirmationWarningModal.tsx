import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Package, AlertCircle, Settings } from "lucide-react";
import { BonDeCommande } from "@/api/bon-de-commande";

interface ConfirmationWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAnyway: () => void;
  bonDeCommande: BonDeCommande | null;
  missingCategories: any[];
  missingArticles: any[];
  zeroQuantityArticles: any[];
}

export const ConfirmationWarningModal: React.FC<
  ConfirmationWarningModalProps
> = ({
  isOpen,
  onClose,
  onConfirmAnyway,
  bonDeCommande,
  missingCategories,
  missingArticles,
  zeroQuantityArticles,
}) => {
  if (!isOpen || !bonDeCommande) return null;

  const hasMissingCategories = missingCategories.length > 0;
  const hasMissingArticles = missingArticles.length > 0;
  const hasZeroQuantityArticles = zeroQuantityArticles.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <CardHeader className="flex flex-row items-center space-y-0 pb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-xl text-orange-800">
              Attention - Confirmation du bon de commande
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        {/* Scrollable Body */}
        <CardContent className="flex-1 overflow-y-auto space-y-6 px-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800 font-medium">
              Le bon de commande <strong>{bonDeCommande.code}</strong> présente
              des éléments qui nécessitent votre attention avant confirmation :
            </p>
          </div>

          {/* Missing Categories Section */}
          {hasMissingCategories && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-800">
                  Catégories manquantes ({missingCategories.length})
                </h4>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Les catégories suivantes ne sont pas présentes dans ce bon de
                commande :
              </p>
              <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {missingCategories.map((category) => (
                  <li key={category.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span className="font-medium">{category.name}</span>
                    {category.description && (
                      <span className="text-red-600 text-xs">
                        - {category.description}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Articles Section */}
          {hasMissingArticles && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-800">
                  Articles manquants ({missingArticles.length})
                </h4>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Les articles suivants ne sont pas présents dans ce bon de
                commande :
              </p>
              <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {missingArticles.map((article) => (
                  <li key={article.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span className="font-medium">{article.name}</span>
                    <span className="text-red-600 text-xs">
                      ({article.category?.name})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Zero Quantity Articles Section */}
          {hasZeroQuantityArticles && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Package className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">
                  Articles avec quantité zéro ({zeroQuantityArticles.length})
                </h4>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Les articles suivants ont une quantité de stock ou de demande
                égale à zéro :
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                {zeroQuantityArticles.map((article) => (
                  <li key={article.id} className="flex items-center space-x-2">
                    <span>•</span>
                    <span className="font-medium">
                      {article.article?.name || article.category?.name}
                    </span>
                    <span className="text-yellow-600 text-xs">
                      (Stock: {article.quantite_a_stocker ?? "null"}, Demande:{" "}
                      {article.quantite_a_demander ?? "null"})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Que se passera-t-il si vous confirmez ?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {hasMissingCategories && (
                <li>
                  • Les catégories manquantes seront ajoutées avec des quantités
                  à zéro
                </li>
              )}
              {hasMissingArticles && (
                <li>
                  • Les articles manquants seront ajoutés avec des quantités à
                  zéro
                </li>
              )}
              {hasZeroQuantityArticles && (
                <li>
                  • Les articles avec quantité zéro seront conservés avec leurs
                  valeurs actuelles
                </li>
              )}
              <li>
                • Le bon de commande sera confirmé avec l'ensemble complet des
                données
              </li>
            </ul>
          </div>
        </CardContent>

        {/* Fixed Footer */}
        <div className="p-6 pt-0 flex justify-between items-center flex-shrink-0 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => {
              window.location.href = "/affectation-ressources";
            }}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Aller à Affectation des Ressources
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirmAnyway}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium"
            >
              Confirmer quand même
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
